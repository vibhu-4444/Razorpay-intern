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
  | 'OPEN'
  | 'DETECTED'
  | 'ANALYZING'
  | 'DIAGNOSED'
  | 'READY'
  | 'ELIGIBLE'
  | 'APPROVED'
  | 'EXECUTING'
  | 'RECOVERED'
  | 'FAILED'
  | 'ESCALATED'
  | 'NEEDS_REVIEW'
  | 'BLOCKED'
  | 'CLOSED';

// Hinglish Architectural Note:
// Bounded state machine transitions: Har state mutation random nahi ho sakti.
// Jaise EXECUTING se direct OPEN nahi ja sakte, sirf RECOVERED ya FAILED/ESCALATED ho sakta hai.
export const VALID_RECOVERY_TRANSITIONS: Record<RecoveryStatus, RecoveryStatus[]> = {
  OPEN: ['ANALYZING', 'DETECTED', 'CLOSED'],
  DETECTED: ['ANALYZING', 'OPEN', 'DIAGNOSED', 'CLOSED'],
  ANALYZING: ['READY', 'DIAGNOSED', 'ELIGIBLE', 'ESCALATED', 'BLOCKED'],
  DIAGNOSED: ['READY', 'ANALYZING', 'ELIGIBLE', 'APPROVED', 'ESCALATED', 'NEEDS_REVIEW', 'BLOCKED'],
  ELIGIBLE: ['READY', 'APPROVED', 'EXECUTING', 'ESCALATED', 'NEEDS_REVIEW', 'BLOCKED'],
  APPROVED: ['EXECUTING', 'READY', 'ESCALATED', 'NEEDS_REVIEW', 'BLOCKED'],
  READY: ['EXECUTING', 'ESCALATED', 'BLOCKED', 'NEEDS_REVIEW'],
  EXECUTING: ['RECOVERED', 'FAILED', 'ESCALATED', 'BLOCKED'],
  RECOVERED: ['CLOSED'],
  FAILED: ['READY', 'EXECUTING', 'ESCALATED', 'CLOSED'],
  BLOCKED: ['CLOSED', 'ESCALATED', 'READY'],
  ESCALATED: ['READY', 'EXECUTING', 'CLOSED', 'BLOCKED'],
  NEEDS_REVIEW: ['READY', 'EXECUTING', 'CLOSED', 'BLOCKED', 'ESCALATED'],
  CLOSED: [],
};

export function canTransitionCase(from: RecoveryStatus, to: RecoveryStatus): boolean {
  if (from === to) return true;
  return VALID_RECOVERY_TRANSITIONS[from]?.includes(to) ?? false;
}

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
