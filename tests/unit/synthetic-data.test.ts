import { describe, it, expect } from 'vitest';
import { generateSyntheticDataset } from '../../src/data/synthetic/generator';
import { validateDataset } from '../../src/data/synthetic/validator';
import { SYNTHETIC_DATASET_V1, DEFAULT_CORPUS_VALIDATION_REPORT } from '../../src/data/synthetic/default-corpus';

describe('REVIVE Synthetic Data Engine', () => {
  it('generates at least 500 validated synthetic recovery cases with balanced archetypes', () => {
    const dataset = generateSyntheticDataset({ count: 500, seed: 12345 });
    expect(dataset.cases.length).toBe(500);
    expect(dataset.summary.totalRecords).toBe(500);
    expect(dataset.summary.totalRevenueAtRiskINR).toBeGreaterThan(0);
    expect(dataset.summary.totalRecoverableRevenueINR).toBeGreaterThan(0);

    // Verify 16 archetypes are represented
    const archetypes = Object.keys(dataset.summary.scenarioDistribution);
    expect(archetypes.length).toBe(16);
    archetypes.forEach((a) => {
      expect(dataset.summary.scenarioDistribution[a as any]).toBeGreaterThan(0);
    });
  });

  it('validates canonical corpus with zero critical errors and 100% schema compliance', () => {
    expect(DEFAULT_CORPUS_VALIDATION_REPORT.isValid).toBe(true);
    expect(DEFAULT_CORPUS_VALIDATION_REPORT.criticalErrorsCount).toBe(0);
    expect(DEFAULT_CORPUS_VALIDATION_REPORT.integrityMetrics.uniqueIdsPercentage).toBe(100);
    expect(DEFAULT_CORPUS_VALIDATION_REPORT.integrityMetrics.positiveAmountsPercentage).toBe(100);
    expect(DEFAULT_CORPUS_VALIDATION_REPORT.integrityMetrics.schemaConformityPercentage).toBe(100);
    expect(DEFAULT_CORPUS_VALIDATION_REPORT.integrityMetrics.groundTruthConsistencyPercentage).toBe(100);
  });

  it('enforces deterministic ground-truth separation from AI output', () => {
    const dataset = SYNTHETIC_DATASET_V1;

    // Check timeout archetype ground truth
    const timeoutCases = dataset.cases.filter(c => c.scenarioArchetype === 'NETWORK_TIMEOUT');
    expect(timeoutCases.length).toBeGreaterThan(0);
    timeoutCases.forEach(c => {
      expect(c.groundTruth.expectedRecoveryOutcome).toBe('ESCALATED');
      expect(c.groundTruth.expectedPolicyOutcome).toBe('NEEDS_REVIEW');
      expect(c.groundTruth.expectedSafetyRuleViolated).toBe('POL_INV_07_TIMEOUT_UNKNOWN_STATE');
    });

    // Check duplicate event archetype ground truth
    const dupCases = dataset.cases.filter(c => c.scenarioArchetype === 'DUPLICATE_EVENT');
    expect(dupCases.length).toBeGreaterThan(0);
    dupCases.forEach(c => {
      expect(c.groundTruth.expectedPolicyOutcome).toBe('BLOCKED');
      expect(c.groundTruth.expectedSafetyRuleViolated).toBe('POL_INV_03_IDEMPOTENCY');
      expect(c.isEligibleForRecovery).toBe(false);
    });

    // Check max retries exhausted archetype ground truth
    const exhaustedCases = dataset.cases.filter(c => c.scenarioArchetype === 'EXHAUSTED_RETRIES');
    expect(exhaustedCases.length).toBeGreaterThan(0);
    exhaustedCases.forEach(c => {
      expect(c.payment.attemptCount).toBe(3);
      expect(c.groundTruth.expectedPolicyOutcome).toBe('BLOCKED');
      expect(c.groundTruth.expectedSafetyRuleViolated).toBe('POL_INV_01_MAX_RETRIES');
    });
  });

  it('detects invalid datasets with corrupted amounts or broken invariants', () => {
    const corruptDataset = generateSyntheticDataset({ count: 10, seed: 99 });
    // Intentionally corrupt a record
    corruptDataset.cases[0].payment.amount = -500;
    corruptDataset.cases[1].payment.attemptCount = 3;
    corruptDataset.cases[1].payment.maxAllowedAttempts = 3;
    corruptDataset.cases[1].groundTruth.expectedPolicyOutcome = 'ALLOWED'; // Breach!

    const report = validateDataset(corruptDataset);
    expect(report.isValid).toBe(false);
    expect(report.criticalErrorsCount).toBeGreaterThanOrEqual(2);
  });
});
