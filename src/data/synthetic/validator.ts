/**
 * REVIVE Synthetic Data Engine: Dataset Validator
 * 
 * Verifies dataset integrity, schema conformity, positive monetary bounds,
 * and mathematical consistency of ground truth invariants.
 * 
 * Hinglish Architecture Note:
 * Dataset validator ensure karta hai ki synthetic evaluation data corrupted na ho.
 * Agar attempt count 3/3 hai aur ground truth 'ALLOWED' bole, toh ye validation fail hoga,
 * kyunki core business logic se contradict karne wala dataset evaluation ko invalid bana deta hai.
 */

import { SyntheticDataset } from './types';

export interface ValidationError {
  caseId: string;
  field: string;
  issue: string;
  severity: 'CRITICAL' | 'WARNING';
}

export interface ValidationReport {
  isValid: boolean;
  totalRecordsChecked: number;
  criticalErrorsCount: number;
  warningsCount: number;
  errors: ValidationError[];
  integrityMetrics: {
    uniqueIdsPercentage: number;
    positiveAmountsPercentage: number;
    schemaConformityPercentage: number;
    groundTruthConsistencyPercentage: number;
  };
  validatedAt: string;
}

export function validateDataset(dataset: SyntheticDataset): ValidationReport {
  const errors: ValidationError[] = [];
  const seenCaseIds = new Set<string>();
  const seenPaymentIds = new Set<string>();

  let uniqueIdCount = 0;
  let positiveAmountCount = 0;
  let schemaConformityCount = 0;
  let groundTruthConsistencyCount = 0;

  const total = dataset.cases.length;

  for (const c of dataset.cases) {
    let hasGroundTruthError = false;

    // 1. Unique ID check
    if (!c.id || seenCaseIds.has(c.id)) {
      errors.push({
        caseId: c.id || 'MISSING_ID',
        field: 'id',
        issue: `Duplicate or missing case identifier: ${c.id}`,
        severity: 'CRITICAL',
      });
    } else {
      seenCaseIds.add(c.id);
      uniqueIdCount++;
    }

    if (seenPaymentIds.has(c.payment.id)) {
      errors.push({
        caseId: c.id,
        field: 'payment.id',
        issue: `Duplicate payment identifier: ${c.payment.id}`,
        severity: 'CRITICAL',
      });
    } else {
      seenPaymentIds.add(c.payment.id);
    }

    // 2. Positive Amount check
    if (typeof c.payment.amount !== 'number' || c.payment.amount <= 0 || isNaN(c.payment.amount)) {
      errors.push({
        caseId: c.id,
        field: 'payment.amount',
        issue: `Invalid transaction amount: ${c.payment.amount}. Must be strictly positive number.`,
        severity: 'CRITICAL',
      });
    } else {
      positiveAmountCount++;
    }

    // 3. Schema Completeness check
    if (!c.payment.currency || !c.payment.method || !c.payment.failure || !c.customer) {
      errors.push({
        caseId: c.id,
        field: 'schema',
        issue: 'Incomplete nested payment or customer schema.',
        severity: 'CRITICAL',
      });
    } else {
      schemaConformityCount++;
    }

    // 4. Ground Truth Invariant Consistency
    const gt = c.groundTruth;
    if (!gt.failureTypeGroundTruth || !gt.recommendedActionGroundTruth || !gt.expectedPolicyOutcome || !gt.expectedRecoveryOutcome) {
      errors.push({
        caseId: c.id,
        field: 'groundTruth',
        issue: 'Ground truth specification missing mandatory outcome fields.',
        severity: 'CRITICAL',
      });
      hasGroundTruthError = true;
    }

    // Check specific logical invariants
    if (c.payment.attemptCount >= c.payment.maxAllowedAttempts && gt.expectedPolicyOutcome === 'ALLOWED') {
      errors.push({
        caseId: c.id,
        field: 'groundTruth.expectedPolicyOutcome',
        issue: `Invariant breach: Attempt count (${c.payment.attemptCount}) is at ceiling (${c.payment.maxAllowedAttempts}) but expectedPolicyOutcome is ALLOWED. Must be BLOCKED.`,
        severity: 'CRITICAL',
      });
      hasGroundTruthError = true;
    }

    if (c.scenarioArchetype === 'NETWORK_TIMEOUT' && gt.expectedRecoveryOutcome !== 'ESCALATED') {
      errors.push({
        caseId: c.id,
        field: 'groundTruth.expectedRecoveryOutcome',
        issue: `Timeout archetype must result in ESCALATED outcome to prevent double debit, but got ${gt.expectedRecoveryOutcome}.`,
        severity: 'CRITICAL',
      });
      hasGroundTruthError = true;
    }

    if (c.scenarioArchetype === 'DUPLICATE_EVENT' && gt.expectedPolicyOutcome !== 'BLOCKED') {
      errors.push({
        caseId: c.id,
        field: 'groundTruth.expectedPolicyOutcome',
        issue: `Duplicate event archetype must be BLOCKED by idempotency policy, but got ${gt.expectedPolicyOutcome}.`,
        severity: 'CRITICAL',
      });
      hasGroundTruthError = true;
    }

    if (!hasGroundTruthError) {
      groundTruthConsistencyCount++;
    }
  }

  const criticalErrorsCount = errors.filter(e => e.severity === 'CRITICAL').length;
  const warningsCount = errors.filter(e => e.severity === 'WARNING').length;

  return {
    isValid: criticalErrorsCount === 0,
    totalRecordsChecked: total,
    criticalErrorsCount,
    warningsCount,
    errors,
    integrityMetrics: {
      uniqueIdsPercentage: total > 0 ? (uniqueIdCount / total) * 100 : 0,
      positiveAmountsPercentage: total > 0 ? (positiveAmountCount / total) * 100 : 0,
      schemaConformityPercentage: total > 0 ? (schemaConformityCount / total) * 100 : 0,
      groundTruthConsistencyPercentage: total > 0 ? (groundTruthConsistencyCount / total) * 100 : 0,
    },
    validatedAt: new Date().toISOString(),
  };
}
