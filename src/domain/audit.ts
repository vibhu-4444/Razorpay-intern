/**
 * REVIVE Domain Model: Audit Ledger
 * 
 * Immutable event trail capturing the full causality chain:
 * Ingest -> AI Diagnosis -> Policy Arbiter -> Execution Dispatch -> Gateway Settlement
 */

export type AuditActor = 
  | 'SYSTEM_WEBHOOK'
  | 'AI_MODEL_ENGINE'
  | 'POLICY_ARBITER'
  | 'PAYMENT_GATEWAY'
  | 'HUMAN_OPERATOR';

export interface AuditEvent {
  id: string;                       // e.g. "evt_99182a"
  caseId: string;                   // e.g. "RP-10482"
  paymentId: string;                // e.g. "pay_Nxi9823kL0"
  actor: AuditActor;
  action: string;                   // e.g. "Validated Merchant SLA: Retries allowed <= 3/day"
  result: string;                   // e.g. "POLICY_PASS_6/6" or "FUNDS_CAPTURED"
  payloadSummary: string;
  timestamp: string;                // e.g. "14:03:21.018 IST"
  hash: string;                     // SHA256 cryptographic signature representation
}

// Hinglish Architectural Note:
// Audit ledger immutable hai. Har financial action aur policy decision ko
// sequence mein record kiya jata hai taaki dispute ya regulatory audit ke waqt
// poora causality chain mathematically prove kiya ja sake.
