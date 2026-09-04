/**
 * REVIVE Deterministic Policy Engine: Rules & Invariants
 * 
 * Mathematical and business invariants that cannot be altered or bypassed by AI models.
 */

import { Payment } from '../domain/payment';
import { Customer } from '../domain/customer';
import { RecoveryAction } from '../domain/recovery-action';
import { InvariantCheckResult } from '../domain/policy';

export interface PolicyEvaluationContext {
  payment: Payment;
  customer: Customer;
  action: RecoveryAction;
  recentAttemptsInWindow: number;     // Past 24h attempts for this customer
  secondsSinceLastFailure: number;
  seenIdempotencyKeys: Set<string>;
}

export const POLICY_RULES = {
  MAX_RETRIES: 3,
  MIN_COOLDOWN_SECONDS: 30,
  MAX_DAILY_CUSTOMER_INTERVENTIONS: 5,
  MAX_AUTONOMOUS_AMOUNT_INR: 50000,
};

/**
 * Check 1: Max Attempt Count Limit
 */
export function checkMaxRetryLimit(ctx: PolicyEvaluationContext): InvariantCheckResult {
  const passed = ctx.payment.attemptCount < POLICY_RULES.MAX_RETRIES;
  return {
    ruleId: 'POL_INV_01',
    ruleName: 'Max Retries Ceiling Gate',
    category: 'RETRY_LIMIT',
    passed,
    expected: `< ${POLICY_RULES.MAX_RETRIES} attempts (current max: ${ctx.payment.maxAllowedAttempts})`,
    actual: `Attempt #${ctx.payment.attemptCount}`,
    details: passed 
      ? `Within permitted retry budget (${ctx.payment.attemptCount}/${POLICY_RULES.MAX_RETRIES})`
      : `Exceeded maximum retry limit of ${POLICY_RULES.MAX_RETRIES}. Hard block enforced to protect payment rails.`
  };
}

/**
 * Check 2: Cooldown Timing Gate
 */
export function checkCooldownTiming(ctx: PolicyEvaluationContext): InvariantCheckResult {
  const recommendedCooldown = ctx.action.parameters.recommendedCooldownSeconds ?? POLICY_RULES.MIN_COOLDOWN_SECONDS;
  const passed = ctx.secondsSinceLastFailure >= recommendedCooldown;
  return {
    ruleId: 'POL_INV_02',
    ruleName: 'Issuer Cooldown Window Gate',
    category: 'COOLDOWN_TIMING',
    passed,
    expected: `>= ${recommendedCooldown}s backoff elapsed`,
    actual: `${ctx.secondsSinceLastFailure}s elapsed`,
    details: passed
      ? `Sufficient cooldown elapsed (${ctx.secondsSinceLastFailure}s >= ${recommendedCooldown}s) to prevent bank-side throttling.`
      : `Cooldown window active (${ctx.secondsSinceLastFailure}s < ${recommendedCooldown}s). Must delay execution.`
  };
}

/**
 * Check 3: Customer Velocity & Dunning Fatigue Limit
 */
export function checkCustomerVelocity(ctx: PolicyEvaluationContext): InvariantCheckResult {
  const passed = ctx.recentAttemptsInWindow < POLICY_RULES.MAX_DAILY_CUSTOMER_INTERVENTIONS;
  return {
    ruleId: 'POL_INV_03',
    ruleName: 'Customer Velocity Protection Gate',
    category: 'CUSTOMER_VELOCITY',
    passed,
    expected: `< ${POLICY_RULES.MAX_DAILY_CUSTOMER_INTERVENTIONS} interventions / 24h`,
    actual: `${ctx.recentAttemptsInWindow} interventions logged`,
    details: passed
      ? `Customer velocity within safe limits (${ctx.recentAttemptsInWindow}/${POLICY_RULES.MAX_DAILY_CUSTOMER_INTERVENTIONS})`
      : `Customer intervention cap reached. Preventing dunning fatigue and cardholder harassment.`
  };
}

/**
 * Check 4: Amount Risk Cap & Tier Authorization
 */
export function checkAmountRiskCap(ctx: PolicyEvaluationContext): InvariantCheckResult {
  // Enterprise customers get higher threshold; standard has 50k cap
  const cap = ctx.customer.tier === 'ENTERPRISE' ? 100000 : POLICY_RULES.MAX_AUTONOMOUS_AMOUNT_INR;
  const passed = ctx.payment.amount <= cap;
  return {
    ruleId: 'POL_INV_04',
    ruleName: 'Autonomous Value Risk Gate',
    category: 'AMOUNT_RISK_CAP',
    passed,
    expected: `<= ₹${cap.toLocaleString('en-IN')}`,
    actual: `₹${ctx.payment.amount.toLocaleString('en-IN')}`,
    details: passed
      ? `Amount ₹${ctx.payment.amount.toLocaleString('en-IN')} is within autonomous authorization limit for ${ctx.customer.tier} tier.`
      : `Amount ₹${ctx.payment.amount.toLocaleString('en-IN')} exceeds autonomous threshold of ₹${cap.toLocaleString('en-IN')}. Requires human review.`
  };
}

/**
 * Check 5: Dispute & Fraud Integrity Gate
 */
export function checkFraudDisputeGate(ctx: PolicyEvaluationContext): InvariantCheckResult {
  const passed = !ctx.customer.metrics.hasActiveDispute;
  return {
    ruleId: 'POL_INV_05',
    ruleName: 'Fraud & Chargeback Dispute Gate',
    category: 'FRAUD_GATE',
    passed,
    expected: 'Zero active disputes or chargeback alerts',
    actual: ctx.customer.metrics.hasActiveDispute ? 'Active dispute detected' : 'Clean dispute record',
    details: passed
      ? 'No active chargebacks or card fraud warnings found on account ledger.'
      : 'Active dispute on account. Automatic recovery is blocked to prevent compounding chargeback penalties.'
  };
}

/**
 * Check 6: Idempotency Key Gate
 */
export function checkIdempotencyGate(ctx: PolicyEvaluationContext): InvariantCheckResult {
  const key = ctx.action.parameters.idempotencyKey;
  const keyPresent = Boolean(key && key.trim().length > 0);
  const notDuplicated = keyPresent && !ctx.seenIdempotencyKeys.has(key);
  const passed = keyPresent && notDuplicated;
  return {
    ruleId: 'POL_INV_06',
    ruleName: 'Idempotency Integrity Gate',
    category: 'IDEMPOTENCY_INTEGRITY',
    passed,
    expected: 'Unique, uncommitted idempotency key',
    actual: key ? `Key: ${key.slice(0, 14)}...` : 'Key missing',
    details: passed
      ? 'Idempotency key verified; guarantees single execution across distributed webhooks.'
      : 'Duplicate or missing idempotency key. Execution rejected to prevent double-charging.'
  };
}
