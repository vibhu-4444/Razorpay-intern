/**
 * REVIVE AI Evaluation Pipeline: Types & Metrics Schema
 * 
 * Defines comprehensive schemas for benchmarking AI accuracy,
 * multi-class confusion matrices, error taxonomy, and critical safety bounds.
 * 
 * Hinglish Architecture Note:
 * Safety metrics mein "unsafeActionRate" sabse critical metric hai:
 * Yeh measure karta hai ki kitne percent AI recommendations deterministic policy
 * rules todte agar policy engine unhe block na karta. Razorpay Buildathon mein
 * yeh prove karega ki AI recommendation layer unbounded nahi hai.
 */

import { ScenarioArchetype } from '../../data/synthetic/types';
import { RecoveryActionType } from '../../domain/recovery-action';

export type EvaluationErrorCategory =
  | 'INCORRECT_DIAGNOSIS'
  | 'INCORRECT_RECOMMENDATION'
  | 'UNSAFE_ACTION_PREVENTED'
  | 'POLICY_CONFLICT'
  | 'CONFIDENTLY_WRONG';

export interface EvaluationCaseResult {
  caseId: string;
  scenarioArchetype: ScenarioArchetype;
  amount: number;
  customerTier: string;
  // Diagnosis benchmark
  predictedFailureCategory: string;
  groundTruthFailureCategory: string;
  diagnosisCorrect: boolean;
  diagnosisConfidence: number; // 0.0 - 1.0
  isConfidentlyWrong: boolean; // confidence >= 0.80 but diagnosis incorrect
  // Recommendation benchmark
  predictedAction: RecoveryActionType;
  groundTruthAction: RecoveryActionType;
  recommendationCorrect: boolean;
  // Policy arbitration benchmark
  policyOutcome: 'ALLOWED' | 'BLOCKED' | 'NEEDS_REVIEW';
  groundTruthPolicyOutcome: 'ALLOWED' | 'BLOCKED' | 'NEEDS_REVIEW';
  policyMatched: boolean;
  // Critical safety analysis
  isUnsafeRecommendation: boolean; // True if AI proposed an action that breached invariant
  unsafeRulePrevented?: string;
  // Execution outcome
  simulatedRecoveryOutcome: 'RECOVERED' | 'FAILED' | 'ESCALATED' | 'BLOCKED';
  groundTruthRecoveryOutcome: 'RECOVERED' | 'FAILED' | 'ESCALATED' | 'BLOCKED';
  outcomeMatched: boolean;
  // Diagnostic metadata
  errorCategories: EvaluationErrorCategory[];
  reasoningSnippet: string;
  inferenceLatencyMs: number;
}

export interface ClassMetric {
  category: string;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  support: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface ConfusionMatrixData {
  categories: string[];
  matrix: number[][]; // matrix[actualIdx][predictedIdx]
  classMetrics: Record<string, ClassMetric>;
}

export interface SafetyMetrics {
  totalUnsafeRecommendationsPrevented: number;
  unsafeActionRatePercentage: number; // e.g. 12.4% of AI proposals were unsafe and intercepted
  policyBlockRatePercentage: number;
  humanReviewEscalationRatePercentage: number;
  idempotencyDuplicatePreventionCount: number;
}

export interface AIMetrics {
  totalEvaluated: number;
  diagnosisAccuracyPercentage: number;
  recommendationAccuracyPercentage: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  confidentlyWrongCount: number;
  lowConfidenceCount: number;
  avgInferenceLatencyMs: number;
}

export interface BusinessMetrics {
  totalRevenueAtRiskINR: number;
  totalRecoverableRevenueINR: number;
  totalRecoveredRevenueINR: number;
  recoveryRatePercentage: number;
  preventedLossINR: number;
}

export interface EvaluationRun {
  runId: string;
  datasetId: string;
  datasetVersion: string;
  evaluatedAt: string;
  totalCases: number;
  aiMetrics: AIMetrics;
  safetyMetrics: SafetyMetrics;
  businessMetrics: BusinessMetrics;
  confusionMatrix: ConfusionMatrixData;
  caseResults: EvaluationCaseResult[];
  errorCases: EvaluationCaseResult[];
}
