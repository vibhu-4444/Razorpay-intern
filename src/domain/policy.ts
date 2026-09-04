/**
 * REVIVE Domain Model: Deterministic Policy
 * 
 * Programmatic invariants that determine whether an action is permitted to execute.
 * AI can suggest, but Policy Engine decides.
 */

export type PolicyCategory = 
  | 'RETRY_LIMIT'
  | 'COOLDOWN_TIMING'
  | 'CUSTOMER_VELOCITY'
  | 'AMOUNT_RISK_CAP'
  | 'FRAUD_GATE'
  | 'IDEMPOTENCY_INTEGRITY';

export interface InvariantCheckResult {
  ruleId: string;
  ruleName: string;
  category: PolicyCategory;
  passed: boolean;
  expected: string;
  actual: string;
  details: string;
}

export interface PolicyDecision {
  allowed: boolean;                  // Programmatic authorization gate
  requiresHumanReview: boolean;      // Route to Exceptions Queue if flagged
  checksPassed: number;              // e.g. 6
  totalChecks: number;               // e.g. 6
  ruleResults: InvariantCheckResult[];
  blockingReason?: string;
  evaluatedAt: string;               // ISO Timestamp
  evaluatedBy: string;               // e.g. "REVIVE_POLICY_KERNEL_v2"
  policySetVersion: string;          // e.g. "POL-REV-2024-Q4.active"
}

// Hinglish Architectural Note:
// PolicyDecision mein mathematical invariant checks ka full breakdown rehta hai.
// Agar 6 checks mein se ek bhi fail hota hai (e.g. daily retry limit hit ho gayi),
// toh allowed = false ho jayega aur reason deterministic hoga, koi probabilistic guess nahi.
