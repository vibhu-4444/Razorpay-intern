/**
 * REVIVE Domain Model: Recovery Case
 * 
 * Central operational dossier connecting the initial failure telemetry,
 * AI advisory diagnosis, deterministic policy arbiter check, and recovery execution ledger.
 */

import { Payment } from './payment';
import { Customer } from './customer';
import { RecoveryAction } from './recovery-action';
import { PolicyDecision } from './policy';
import { AuditEvent } from './audit';

export type RecoveryStatus = 
  | 'DETECTED'
  | 'DIAGNOSED'
  | 'ELIGIBLE'
  | 'APPROVED'
  | 'EXECUTED'
  | 'RECOVERED'
  | 'BLOCKED'
  | 'NEEDS_REVIEW'
  | 'FAILED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TelemetrySignal {
  id: string;
  label: string;
  detail: string;
  healthy: boolean;
}

export interface FailureDiagnosis {
  inferredRootCause: string;
  confidencePercentage: number;
  expectedRecoveryPercentage: number;
  signals: TelemetrySignal[];
  weightVector: string;
  inferenceLatencyMs: number;
  diagnosedAt: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  category: string;
  timestamp: string;
  description: string;
  icon: string;
  stepNumber: number;
  highlight?: boolean;
}

export interface RecoveryCase {
  id: string;                         // e.g. "RP-10482"
  paymentId: string;
  payment: Payment;
  customer: Customer;
  status: RecoveryStatus;
  riskLevel: RiskLevel;
  diagnosis?: FailureDiagnosis;
  recommendedAction?: RecoveryAction;
  policyDecision?: PolicyDecision;
  amountAtRisk: number;
  amountRecoverable: number;
  amountSettled: number;
  timelineEvents: TimelineEvent[];
  auditTrail: AuditEvent[];
  createdAt: string;
  updatedAt: string;
}

// Hinglish Architectural Note:
// RecoveryCase ek aggregate root hai jo Payment, Customer, AI Diagnosis, Policy Decision,
// aur Audit Trail ko bind karta hai. Frontend kabhi fragmented data fetch nahi karta;
// single aggregate model se deterministic verification aur consistent rendering ensure hoti hai.
