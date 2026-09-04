import { describe, it, expect } from 'vitest';
import { PolicyEngine } from '../../src/policy-engine/evaluator';
import { 
  checkMaxRetryLimit, 
  checkCooldownTiming, 
  checkCustomerVelocity, 
  checkAmountRiskCap, 
  checkFraudDisputeGate, 
  checkIdempotencyGate 
} from '../../src/policy-engine/rules';
import { Payment } from '../../src/domain/payment';
import { Customer } from '../../src/domain/customer';
import { RecoveryAction } from '../../src/domain/recovery-action';

describe('REVIVE Deterministic Policy Engine', () => {
  const basePayment: Payment = {
    id: 'pay_test_001',
    merchantId: 'merch_test',
    customerId: 'cust_test',
    amount: 4999,
    currency: 'INR',
    status: 'FAILED',
    method: {
      type: 'card',
      maskedIdentifier: '•••• 4012',
      tokenized: true,
    },
    attemptCount: 1,
    maxAllowedAttempts: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const baseCustomer: Customer = {
    id: 'cust_test',
    name: 'Test Labs',
    email: 'test@labs.com',
    phoneMasked: '+91 ••••• ••000',
    tier: 'ENTERPRISE',
    createdAt: new Date().toISOString(),
    metrics: {
      historicalClearedCount: 10,
      historicalFailedCount: 1,
      successRatePercentage: 90.9,
      accountTenureMonths: 12,
      avgTransactionAmount: 5000,
      recentRecoveryEvent: false,
      hasActiveDispute: false,
    },
  };

  const baseAction: RecoveryAction = {
    type: 'RETRY_PAYMENT',
    channel: 'FALLBACK_GATEWAY_SWITCH',
    suggestedAt: new Date().toISOString(),
    rationale: 'AI prescribed cooldown retry',
    parameters: {
      recommendedCooldownSeconds: 30,
      idempotencyKey: 'idmp_unique_key_001',
    },
  };

  it('RULE 1: enforces maximum retry ceiling (blocks if attemptCount >= 3)', () => {
    // Valid attempt 1 of 3
    const check1 = checkMaxRetryLimit({
      payment: { ...basePayment, attemptCount: 1 },
      customer: baseCustomer,
      action: baseAction,
      recentAttemptsInWindow: 1,
      secondsSinceLastFailure: 45,
      seenIdempotencyKeys: new Set(),
    });
    expect(check1.passed).toBe(true);

    // Blocked attempt 3 of 3 (ceiling hit)
    const checkBlocked = checkMaxRetryLimit({
      payment: { ...basePayment, attemptCount: 3 },
      customer: baseCustomer,
      action: baseAction,
      recentAttemptsInWindow: 3,
      secondsSinceLastFailure: 45,
      seenIdempotencyKeys: new Set(),
    });
    expect(checkBlocked.passed).toBe(false);
    expect(checkBlocked.category).toBe('RETRY_LIMIT');
  });

  it('RULE 2: enforces cooldown backoff timing', () => {
    const contextTooEarly = {
      payment: basePayment,
      customer: baseCustomer,
      action: baseAction,
      recentAttemptsInWindow: 1,
      secondsSinceLastFailure: 10, // less than 30s
      seenIdempotencyKeys: new Set<string>(),
    };
    const checkEarly = checkCooldownTiming(contextTooEarly);
    expect(checkEarly.passed).toBe(false);

    const contextElapsed = {
      ...contextTooEarly,
      secondsSinceLastFailure: 35, // > 30s
    };
    const checkElapsed = checkCooldownTiming(contextElapsed);
    expect(checkElapsed.passed).toBe(true);
  });

  it('RULE 5: blocks execution if customer has an active fraud or chargeback dispute', () => {
    const customerWithDispute: Customer = {
      ...baseCustomer,
      metrics: {
        ...baseCustomer.metrics,
        hasActiveDispute: true,
      },
    };

    const checkDispute = checkFraudDisputeGate({
      payment: basePayment,
      customer: customerWithDispute,
      action: baseAction,
      recentAttemptsInWindow: 1,
      secondsSinceLastFailure: 45,
      seenIdempotencyKeys: new Set(),
    });

    expect(checkDispute.passed).toBe(false);
    expect(checkDispute.category).toBe('FRAUD_GATE');
  });

  it('RULE 6: enforces idempotency and rejects duplicate execution keys', () => {
    const seenKeys = new Set(['idmp_already_used']);

    // Attempting to reuse an idempotency key
    const checkDuplicate = checkIdempotencyGate({
      payment: basePayment,
      customer: baseCustomer,
      action: {
        ...baseAction,
        parameters: { ...baseAction.parameters, idempotencyKey: 'idmp_already_used' },
      },
      recentAttemptsInWindow: 1,
      secondsSinceLastFailure: 45,
      seenIdempotencyKeys: seenKeys,
    });

    expect(checkDuplicate.passed).toBe(false);
    expect(checkDuplicate.category).toBe('IDEMPOTENCY_INTEGRITY');
  });

  it('OVERALL EVALUATOR: authorizes execution only when all 6 invariants pass', () => {
    const engine = new PolicyEngine();

    // Valid context where all pass
    const decisionAllowed = engine.evaluate({
      payment: basePayment,
      customer: baseCustomer,
      action: baseAction,
      recentAttemptsInWindow: 1,
      secondsSinceLastFailure: 45,
      seenIdempotencyKeys: new Set(),
    });

    expect(decisionAllowed.allowed).toBe(true);
    expect(decisionAllowed.checksPassed).toBe(6);
    expect(decisionAllowed.totalChecks).toBe(6);
    expect(decisionAllowed.blockingReason).toBeUndefined();

    // Violating retry ceiling
    const decisionBlocked = engine.evaluate({
      payment: { ...basePayment, attemptCount: 3 },
      customer: baseCustomer,
      action: baseAction,
      recentAttemptsInWindow: 3,
      secondsSinceLastFailure: 45,
      seenIdempotencyKeys: new Set(),
    });

    expect(decisionBlocked.allowed).toBe(false);
    expect(decisionBlocked.checksPassed).toBe(5);
    expect(decisionBlocked.blockingReason).toBeDefined();
  });
});
