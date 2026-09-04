import { describe, it, expect } from 'vitest';
import { SimulatorProvider } from '../../src/providers/simulator-provider';
import { Payment } from '../../src/domain/payment';

describe('REVIVE Provider Abstraction & Simulator', () => {
  const testPayment: Payment = {
    id: 'pay_sim_test_1',
    merchantId: 'merch_01',
    customerId: 'cust_01',
    amount: 4999,
    currency: 'INR',
    status: 'FAILED',
    method: {
      type: 'card',
      maskedIdentifier: '•••• 4012',
      tokenized: true,
    },
    failure: {
      code: 'E05_ISSUER_TIMEOUT',
      category: 'BANK_DECLINE',
      description: 'Transient decline',
      failedAt: new Date().toISOString(),
      retryable: true,
    },
    attemptCount: 1,
    maxAllowedAttempts: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('correctly simulates transient retry and updates payment status to CAPTURED', async () => {
    const simulator = new SimulatorProvider([testPayment]);

    const result = await simulator.retryPayment({
      paymentId: testPayment.id,
      idempotencyKey: 'idmp_sim_001',
      merchantId: testPayment.merchantId,
      policyCheckToken: 'tok_valid_policy',
    });

    expect(result.success).toBe(true);
    expect(result.statusCode).toBe('FUNDS_CAPTURED');
    expect(result.authCode).toMatch(/^AUTH_/);
    expect(result.settledAmount).toBe(4999);

    const updatedPayment = await simulator.getPayment(testPayment.id);
    expect(updatedPayment?.status).toBe('CAPTURED');
    expect(updatedPayment?.attemptCount).toBe(2);
  });

  it('rejects duplicate execution on duplicate idempotency key', async () => {
    const simulator = new SimulatorProvider([testPayment]);

    // First attempt succeeds
    const res1 = await simulator.retryPayment({
      paymentId: testPayment.id,
      idempotencyKey: 'idmp_duplicate_test',
      merchantId: testPayment.merchantId,
      policyCheckToken: 'tok_valid_policy',
    });
    expect(res1.success).toBe(true);

    // Duplicate attempt with exact same key fails
    const res2 = await simulator.retryPayment({
      paymentId: testPayment.id,
      idempotencyKey: 'idmp_duplicate_test',
      merchantId: testPayment.merchantId,
      policyCheckToken: 'tok_valid_policy',
    });
    expect(res2.success).toBe(false);
    expect(res2.statusCode).toBe('DUPLICATE_IDEMPOTENCY_KEY');
  });
});
