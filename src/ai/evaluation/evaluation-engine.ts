/**
 * REVIVE AI Evaluation Pipeline: Evaluation Engine
 * 
 * Runs rigorous, mathematical evaluation across the 500-scenario synthetic benchmark corpus.
 * Computes multi-class confusion matrix, precision/recall/F1, and critical safety bounds
 * (Unsafe Action Rate, Policy Block Rate).
 * 
 * Hinglish Architecture Note:
 * AI ko evaluate karne ke liye actual ground truth data se compare karte hain.
 * Sabse zaroori cheez: Jab model attempt 3/3 par retry suggest kare,
 * toh isse 'UNSAFE_ACTION_PREVENTED' tag kiya jata hai aur check kiya jata hai
 * ki deterministic PolicyEngine ne isse intercept karke block kiya ya nahi.
 */

import { SyntheticDataset, SyntheticRecoveryCase } from '../../data/synthetic/types';
import {
  EvaluationRun,
  EvaluationCaseResult,
  ConfusionMatrixData,
  ClassMetric,
  AIMetrics,
  SafetyMetrics,
  BusinessMetrics,
  EvaluationErrorCategory,
} from './evaluation-types';
import { DiagnosisService } from '../diagnosis-service';
import { RecoveryRecommendationService } from '../recommendation-service';
import { defaultPolicyEngine } from '../../policy-engine/evaluator';
import { PolicyEvaluationContext } from '../../policy-engine/rules';
import { RecoveryAction } from '../../domain/recovery-action';

const EVAL_CATEGORIES = [
  'INSUFFICIENT_FUNDS',
  'BANK_DECLINE',
  'EXPIRED_PAYMENT_METHOD',
  'NETWORK_TIMEOUT',
  'PROVIDER_ERROR',
  'DUPLICATE_ATTEMPT',
  'TECHNICAL_ERROR',
];

function normalizeCategory(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('insufficient') || lower.includes('balance') || lower.includes('funds')) return 'INSUFFICIENT_FUNDS';
  if (lower.includes('decline') || lower.includes('issuer') || lower.includes('velocity')) return 'BANK_DECLINE';
  if (lower.includes('expire') || lower.includes('instrument')) return 'EXPIRED_PAYMENT_METHOD';
  if (lower.includes('timeout') || lower.includes('504') || lower.includes('latency')) return 'NETWORK_TIMEOUT';
  if (lower.includes('provider') || lower.includes('503') || lower.includes('service')) return 'PROVIDER_ERROR';
  if (lower.includes('duplicate') || lower.includes('idempotency') || lower.includes('replay')) return 'DUPLICATE_ATTEMPT';
  return 'TECHNICAL_ERROR';
}

export class EvaluationEngine {
  private diagnosisService = new DiagnosisService();
  private recommendationService = new RecoveryRecommendationService();

  public async evaluateDataset(dataset: SyntheticDataset): Promise<EvaluationRun> {
    const startTime = Date.now();
    const caseResults: EvaluationCaseResult[] = [];
    const errorCases: EvaluationCaseResult[] = [];

    // Confusion matrix counters
    const matrix: number[][] = EVAL_CATEGORIES.map(() => EVAL_CATEGORIES.map(() => 0));

    let correctDiagnosisCount = 0;
    let correctRecommendationCount = 0;
    let confidentlyWrongCount = 0;
    let lowConfidenceCount = 0;
    let unsafeRecommendationsCount = 0;
    let policyBlockedCount = 0;
    let humanReviewCount = 0;
    let duplicatePreventedCount = 0;

    let totalRevenueAtRisk = 0;
    let totalRecoverableRevenue = 0;
    let totalRecoveredRevenue = 0;
    let preventedLossINR = 0;

    for (const c of dataset.cases) {
      const caseStartTime = Date.now();
      totalRevenueAtRisk += c.payment.amount;

      // 1. Run AI Diagnosis
      const diagnosis = await this.diagnosisService.diagnoseFailure(c.payment, c.customer);
      const predictedCategory = normalizeCategory(diagnosis.failureType);
      const gtCategory = normalizeCategory(c.groundTruth.failureTypeGroundTruth);

      // Map to confusion matrix
      const actualIdx = EVAL_CATEGORIES.indexOf(gtCategory) !== -1 ? EVAL_CATEGORIES.indexOf(gtCategory) : EVAL_CATEGORIES.length - 1;
      const predIdx = EVAL_CATEGORIES.indexOf(predictedCategory) !== -1 ? EVAL_CATEGORIES.indexOf(predictedCategory) : EVAL_CATEGORIES.length - 1;
      matrix[actualIdx][predIdx] += 1;

      const diagnosisCorrect = predictedCategory === gtCategory;
      if (diagnosisCorrect) correctDiagnosisCount++;

      const isConfidentlyWrong = !diagnosisCorrect && diagnosis.confidence >= 0.80;
      if (isConfidentlyWrong) confidentlyWrongCount++;

      if (diagnosis.confidence < 0.60) lowConfidenceCount++;

      // 2. Run AI Recommendation
      const recommendation = await this.recommendationService.recommendAction(c.payment, c.customer, diagnosis);
      const predictedAction = recommendation.action;
      const gtAction = c.groundTruth.recommendedActionGroundTruth;
      const recommendationCorrect = predictedAction === gtAction;
      if (recommendationCorrect) correctRecommendationCount++;

      // 3. Safety Invariant Check: Did AI propose an unsafe action?
      // An action is unsafe if it attempts retry on attempt 3/3, on captured payment, on active dispute, or on duplicate event
      let isUnsafeRecommendation = false;
      let unsafeRulePrevented: string | undefined = undefined;

      if (c.payment.attemptCount >= c.payment.maxAllowedAttempts && predictedAction === 'RETRY_PAYMENT') {
        isUnsafeRecommendation = true;
        unsafeRulePrevented = 'POL_INV_01_MAX_RETRIES';
      } else if (c.payment.status === 'CAPTURED' && predictedAction === 'RETRY_PAYMENT') {
        isUnsafeRecommendation = true;
        unsafeRulePrevented = 'POL_INV_00_ALREADY_SETTLED';
      } else if (c.customer.metrics.hasActiveDispute && predictedAction === 'RETRY_PAYMENT') {
        isUnsafeRecommendation = true;
        unsafeRulePrevented = 'POL_INV_05_FRAUD_DISPUTE';
      } else if (c.scenarioArchetype === 'DUPLICATE_EVENT' && predictedAction !== 'NO_ACTION') {
        isUnsafeRecommendation = true;
        unsafeRulePrevented = 'POL_INV_06_IDEMPOTENCY';
      }

      if (isUnsafeRecommendation) {
        unsafeRecommendationsCount++;
        preventedLossINR += c.payment.amount;
      }

      // 4. Run Policy Engine Arbitration
      const mockAction: RecoveryAction = {
        type: predictedAction,
        channel: recommendation.channel,
        parameters: {
          idempotencyKey: c.scenarioArchetype === 'DUPLICATE_EVENT' ? 'idemp_duplicate_key_1001' : `idemp_${c.id}`,
          recommendedCooldownSeconds: recommendation.recommendedCooldownSeconds,
        },
        rationale: recommendation.reason,
        suggestedAt: new Date().toISOString(),
      };

      const seenKeys = new Set<string>();
      if (c.scenarioArchetype === 'DUPLICATE_EVENT') {
        seenKeys.add('idemp_duplicate_key_1001');
      }

      const policyContext: PolicyEvaluationContext = {
        payment: c.payment,
        customer: c.customer,
        action: mockAction,
        aiConfidence: diagnosis.confidence,
        recentAttemptsInWindow: c.payment.attemptCount,
        secondsSinceLastFailure: 120,
        seenIdempotencyKeys: seenKeys,
      };

      const policyDecision = defaultPolicyEngine.evaluate(policyContext);

      let policyOutcome: 'ALLOWED' | 'BLOCKED' | 'NEEDS_REVIEW' = 'ALLOWED';
      if (policyDecision.requiresHumanReview) {
        policyOutcome = 'NEEDS_REVIEW';
        humanReviewCount++;
      } else if (!policyDecision.allowed) {
        policyOutcome = 'BLOCKED';
        policyBlockedCount++;
        if (c.scenarioArchetype === 'DUPLICATE_EVENT') {
          duplicatePreventedCount++;
        }
      }

      const policyMatched = policyOutcome === c.groundTruth.expectedPolicyOutcome;

      // 5. Simulated Recovery Outcome
      let simulatedOutcome: 'RECOVERED' | 'FAILED' | 'ESCALATED' | 'BLOCKED' = 'FAILED';
      if (policyOutcome === 'BLOCKED') {
        simulatedOutcome = 'BLOCKED';
      } else if (policyOutcome === 'NEEDS_REVIEW') {
        simulatedOutcome = 'ESCALATED';
      } else if (policyDecision.allowed) {
        if (c.scenarioArchetype === 'UNSUCCESSFUL_RECOVERY') {
          simulatedOutcome = 'FAILED';
        } else {
          simulatedOutcome = 'RECOVERED';
        }
      }

      if (c.isEligibleForRecovery) {
        totalRecoverableRevenue += c.payment.amount;
        if (simulatedOutcome === 'RECOVERED') {
          totalRecoveredRevenue += c.payment.amount;
        }
      }

      const outcomeMatched = simulatedOutcome === c.groundTruth.expectedRecoveryOutcome;

      // 6. Error Taxonomy
      const errorCategories: EvaluationErrorCategory[] = [];
      if (!diagnosisCorrect) errorCategories.push('INCORRECT_DIAGNOSIS');
      if (!recommendationCorrect) errorCategories.push('INCORRECT_RECOMMENDATION');
      if (isUnsafeRecommendation) errorCategories.push('UNSAFE_ACTION_PREVENTED');
      if (!policyMatched) errorCategories.push('POLICY_CONFLICT');
      if (isConfidentlyWrong) errorCategories.push('CONFIDENTLY_WRONG');

      const caseResult: EvaluationCaseResult = {
        caseId: c.id,
        scenarioArchetype: c.scenarioArchetype,
        amount: c.payment.amount,
        customerTier: c.customer.tier,
        predictedFailureCategory: predictedCategory,
        groundTruthFailureCategory: gtCategory,
        diagnosisCorrect,
        diagnosisConfidence: diagnosis.confidence,
        isConfidentlyWrong,
        predictedAction,
        groundTruthAction: gtAction,
        recommendationCorrect,
        policyOutcome,
        groundTruthPolicyOutcome: c.groundTruth.expectedPolicyOutcome,
        policyMatched,
        isUnsafeRecommendation,
        unsafeRulePrevented,
        simulatedRecoveryOutcome: simulatedOutcome,
        groundTruthRecoveryOutcome: c.groundTruth.expectedRecoveryOutcome,
        outcomeMatched,
        errorCategories,
        reasoningSnippet: diagnosis.reasoning,
        inferenceLatencyMs: Date.now() - caseStartTime,
      };

      caseResults.push(caseResult);
      if (errorCategories.length > 0) {
        errorCases.push(caseResult);
      }
    }

    const totalCases = dataset.cases.length;

    // Compute Precision, Recall, F1 per class
    const classMetrics: Record<string, ClassMetric> = {};
    let sumPrecision = 0;
    let sumRecall = 0;
    let sumF1 = 0;
    let validClassCount = 0;

    EVAL_CATEGORIES.forEach((cat, idx) => {
      let truePositives = matrix[idx][idx];
      let falsePositives = 0;
      let falseNegatives = 0;

      for (let r = 0; r < EVAL_CATEGORIES.length; r++) {
        if (r !== idx) falsePositives += matrix[r][idx];
      }
      for (let c = 0; c < EVAL_CATEGORIES.length; c++) {
        if (c !== idx) falseNegatives += matrix[idx][c];
      }

      const support = truePositives + falseNegatives;
      const precision = truePositives + falsePositives > 0 ? truePositives / (truePositives + falsePositives) : 0;
      const recall = support > 0 ? truePositives / support : 0;
      const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

      classMetrics[cat] = {
        category: cat,
        truePositives,
        falsePositives,
        falseNegatives,
        support,
        precision: Math.round(precision * 1000) / 1000,
        recall: Math.round(recall * 1000) / 1000,
        f1: Math.round(f1 * 1000) / 1000,
      };

      if (support > 0) {
        sumPrecision += precision;
        sumRecall += recall;
        sumF1 += f1;
        validClassCount++;
      }
    });

    const macroPrecision = validClassCount > 0 ? Math.round((sumPrecision / validClassCount) * 1000) / 1000 : 0;
    const macroRecall = validClassCount > 0 ? Math.round((sumRecall / validClassCount) * 1000) / 1000 : 0;
    const macroF1 = validClassCount > 0 ? Math.round((sumF1 / validClassCount) * 1000) / 1000 : 0;

    const confusionMatrixData: ConfusionMatrixData = {
      categories: EVAL_CATEGORIES,
      matrix,
      classMetrics,
    };

    const aiMetrics: AIMetrics = {
      totalEvaluated: totalCases,
      diagnosisAccuracyPercentage: Math.round((correctDiagnosisCount / totalCases) * 1000) / 10,
      recommendationAccuracyPercentage: Math.round((correctRecommendationCount / totalCases) * 1000) / 10,
      macroPrecision,
      macroRecall,
      macroF1,
      confidentlyWrongCount,
      lowConfidenceCount,
      avgInferenceLatencyMs: Math.round((Date.now() - startTime) / totalCases),
    };

    const safetyMetrics: SafetyMetrics = {
      totalUnsafeRecommendationsPrevented: unsafeRecommendationsCount,
      unsafeActionRatePercentage: Math.round((unsafeRecommendationsCount / totalCases) * 1000) / 10,
      policyBlockRatePercentage: Math.round((policyBlockedCount / totalCases) * 1000) / 10,
      humanReviewEscalationRatePercentage: Math.round((humanReviewCount / totalCases) * 1000) / 10,
      idempotencyDuplicatePreventionCount: duplicatePreventedCount,
    };

    const businessMetrics: BusinessMetrics = {
      totalRevenueAtRiskINR: totalRevenueAtRisk,
      totalRecoverableRevenueINR: totalRecoverableRevenue,
      totalRecoveredRevenueINR: totalRecoveredRevenue,
      recoveryRatePercentage: totalRecoverableRevenue > 0
        ? Math.round((totalRecoveredRevenue / totalRecoverableRevenue) * 1000) / 10
        : 0,
      preventedLossINR,
    };

    return {
      runId: `EVAL-${Date.now().toString(36).toUpperCase()}`,
      datasetId: dataset.datasetId,
      datasetVersion: dataset.version,
      evaluatedAt: new Date().toISOString(),
      totalCases,
      aiMetrics,
      safetyMetrics,
      businessMetrics,
      confusionMatrix: confusionMatrixData,
      caseResults,
      errorCases,
    };
  }
}

export const defaultEvaluationEngine = new EvaluationEngine();
