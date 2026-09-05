import { describe, it, expect } from 'vitest';
import { generateSyntheticDataset } from '../../src/data/synthetic/generator';
import { defaultEvaluationEngine } from '../../src/ai/evaluation/evaluation-engine';

describe('REVIVE AI Evaluation Pipeline & Metrics', () => {
  it('computes mathematically sound accuracy, precision, recall, and F1 scores', async () => {
    // Generate a 50-case benchmark batch
    const testDataset = generateSyntheticDataset({ count: 50, seed: 444 });
    const run = await defaultEvaluationEngine.evaluateDataset(testDataset);

    expect(run.totalCases).toBe(50);
    expect(run.aiMetrics.diagnosisAccuracyPercentage).toBeGreaterThanOrEqual(0);
    expect(run.aiMetrics.diagnosisAccuracyPercentage).toBeLessThanOrEqual(100);
    expect(run.aiMetrics.macroPrecision).toBeGreaterThanOrEqual(0);
    expect(run.aiMetrics.macroPrecision).toBeLessThanOrEqual(1);
    expect(run.aiMetrics.macroRecall).toBeGreaterThanOrEqual(0);
    expect(run.aiMetrics.macroRecall).toBeLessThanOrEqual(1);
    expect(run.aiMetrics.macroF1).toBeGreaterThanOrEqual(0);
    expect(run.aiMetrics.macroF1).toBeLessThanOrEqual(1);
  });

  it('accurately calculates Unsafe Action Rate and verifies deterministic policy interception', async () => {
    const testDataset = generateSyntheticDataset({ count: 100, seed: 777 });
    const run = await defaultEvaluationEngine.evaluateDataset(testDataset);

    expect(run.safetyMetrics.unsafeActionRatePercentage).toBeGreaterThanOrEqual(0);
    expect(run.safetyMetrics.totalUnsafeRecommendationsPrevented).toBeGreaterThanOrEqual(0);

    // Verify mathematical formula: unsafeActionRatePercentage == (totalUnsafe / totalCases) * 100
    const expectedRate = Math.round((run.safetyMetrics.totalUnsafeRecommendationsPrevented / run.totalCases) * 1000) / 10;
    expect(run.safetyMetrics.unsafeActionRatePercentage).toBe(expectedRate);

    // Every case flagged as unsafe must have isUnsafeRecommendation = true
    const unsafeCases = run.caseResults.filter(c => c.isUnsafeRecommendation);
    expect(unsafeCases.length).toBe(run.safetyMetrics.totalUnsafeRecommendationsPrevented);
    unsafeCases.forEach(c => {
      expect(c.policyOutcome).toBe('BLOCKED');
      expect(c.errorCategories).toContain('UNSAFE_ACTION_PREVENTED');
    });
  });

  it('generates well-formed confusion matrix matching total evaluated cases', async () => {
    const testDataset = generateSyntheticDataset({ count: 40, seed: 888 });
    const run = await defaultEvaluationEngine.evaluateDataset(testDataset);

    const cm = run.confusionMatrix;
    expect(cm.categories.length).toBeGreaterThan(0);
    expect(cm.matrix.length).toBe(cm.categories.length);

    let totalMatrixSum = 0;
    for (let r = 0; r < cm.matrix.length; r++) {
      for (let c = 0; c < cm.matrix[r].length; c++) {
        totalMatrixSum += cm.matrix[r][c];
      }
    }
    expect(totalMatrixSum).toBe(40);
  });
});
