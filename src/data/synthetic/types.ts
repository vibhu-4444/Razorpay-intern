/**
 * REVIVE Synthetic Data Engine: Types & Taxonomy
 * 
 * Defines schemas for realistic synthetic payment recovery scenarios,
 * deterministic ground-truth labels, and dataset quality metadata.
 * 
 * Hinglish Architecture Note:
 * Ground truth labels deterministic scenario definitions se aate hain.
 * AI ko ground truth generate karne nahi dete, warna evaluation circular ban jayega.
 */

import { Payment, PaymentFailureCategory } from '../../domain/payment';
import { Customer, CustomerTier } from '../../domain/customer';
import { RecoveryActionType } from '../../domain/recovery-action';

export type ScenarioArchetype =
  | 'INSUFFICIENT_FUNDS'
  | 'BANK_DECLINE'
  | 'EXPIRED_PAYMENT_METHOD'
  | 'NETWORK_TIMEOUT'
  | 'PROVIDER_ERROR'
  | 'DUPLICATE_EVENT'
  | 'REPEATED_FAILURE'
  | 'HIGH_VALUE_CUSTOMER'
  | 'LOW_VALUE_CUSTOMER'
  | 'ALREADY_RECOVERED'
  | 'EXHAUSTED_RETRIES'
  | 'LOW_AI_CONFIDENCE'
  | 'POLICY_BLOCKED'
  | 'AMBIGUOUS_PAYMENT_STATE'
  | 'SUCCESSFUL_RECOVERY'
  | 'UNSUCCESSFUL_RECOVERY';

export interface GroundTruthSpec {
  failureTypeGroundTruth: PaymentFailureCategory;
  rootCauseGroundTruth: string;
  recommendedActionGroundTruth: RecoveryActionType;
  expectedPolicyOutcome: 'ALLOWED' | 'BLOCKED' | 'NEEDS_REVIEW';
  expectedRecoveryOutcome: 'RECOVERED' | 'FAILED' | 'ESCALATED' | 'BLOCKED';
  expectedSafetyRuleViolated?: string; // e.g. POL_INV_01, POL_INV_04, POL_INV_06
}

export interface SyntheticRecoveryCase {
  id: string; // e.g. "SYN-001"
  scenarioArchetype: ScenarioArchetype;
  payment: Payment;
  customer: Customer;
  groundTruth: GroundTruthSpec;
  isEligibleForRecovery: boolean;
  notes: string;
  createdAt: string;
}

export interface DatasetSummary {
  totalRecords: number;
  scenarioDistribution: Record<ScenarioArchetype, number>;
  failureDistribution: Record<string, number>;
  totalRevenueAtRiskINR: number;
  totalRecoverableRevenueINR: number;
  expectedRecoverableRevenueINR: number;
  eligibilityRatePercentage: number;
  tierDistribution: Record<CustomerTier, number>;
}

export interface SyntheticDataset {
  datasetId: string;
  version: string;
  generatorVersion: string;
  createdAt: string;
  cases: SyntheticRecoveryCase[];
  summary: DatasetSummary;
}
