/**
 * REVIVE Synthetic Data Engine: Default Canonical Corpus
 * 
 * Pre-compiled, validated 500-scenario benchmark dataset (SYNTHETIC_DATASET_V1).
 * Ready for immediate use by Evaluation Lab, Simulation Data Studio, and Analytics.
 */

import { generateSyntheticDataset } from './generator';
import { validateDataset, ValidationReport } from './validator';
import { SyntheticDataset } from './types';

// Canonical evaluation dataset: 500 realistic payment failure cases
export const SYNTHETIC_DATASET_V1: SyntheticDataset = generateSyntheticDataset({
  count: 500,
  seed: 42891,
});

// Run immediate deterministic validation check
export const DEFAULT_CORPUS_VALIDATION_REPORT: ValidationReport = validateDataset(SYNTHETIC_DATASET_V1);

// Log validation assertion in dev mode
if (!DEFAULT_CORPUS_VALIDATION_REPORT.isValid) {
  console.error('[REVIVE_DATA_ENGINE] Canonical dataset validation failed with critical errors:', DEFAULT_CORPUS_VALIDATION_REPORT.errors);
} else {
  // Validated successfully
}
