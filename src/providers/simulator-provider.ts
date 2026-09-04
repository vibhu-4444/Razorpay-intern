/**
 * REVIVE Provider: Simulator Provider
 * 
 * High-fidelity deterministic simulation provider for reproducible tests,
 * controlled benchmark evaluations, and offline demonstrations.
 */

import { Payment, PaymentStatus } from '../domain/payment';
import { PaymentProvider, RetryPaymentRequest, ProviderRetryResult } from './types';

export class SimulatorProvider implements PaymentProvider {
  public readonly id = 'SIMULATOR_SANDBOX';
  public readonly name = 'Revive High-Fidelity Simulation Provider';
  public readonly isSimulator = true;

  private paymentsStore = new Map<string, Payment>();
  private executedIdempotencyKeys = new Set<string>();

  constructor(initialPayments?: Payment[]) {
    if (initialPayments) {
      initialPayments.forEach(p => this.paymentsStore.set(p.id, p));
    }
  }

  public async getPayment(paymentId: string): Promise<Payment | null> {
    return this.paymentsStore.get(paymentId) ?? null;
  }

  public registerPayment(payment: Payment): void {
    this.paymentsStore.set(payment.id, payment);
  }

  /**
   * Executes deterministic simulated retry.
   * 
   * Hinglish Comment:
   * Simulator provider mein real money move nahi hoti, par ISO 8583 responses,
   * idempotency checks, aur auth codes exact production jaise emulate hote hain.
   * Testing aur demo ke waqt reliable behavior guaranteed rehta hai.
   */
  public async retryPayment(request: RetryPaymentRequest): Promise<ProviderRetryResult> {
    const payment = this.paymentsStore.get(request.paymentId);
    if (!payment) {
      return {
        success: false,
        gatewayReferenceNumber: `sim_${Date.now()}`,
        statusCode: 'PAYMENT_NOT_FOUND',
        rawMessage: `Payment with ID ${request.paymentId} was not found in simulator store.`,
        executionLatencyMs: 15,
      };
    }

    // Check duplicate execution on simulator level
    if (this.executedIdempotencyKeys.has(request.idempotencyKey)) {
      return {
        success: false,
        gatewayReferenceNumber: payment.failure?.gatewayRrn ?? `sim_rrn_${payment.id}`,
        statusCode: 'DUPLICATE_IDEMPOTENCY_KEY',
        rawMessage: `Execution rejected: Idempotency key ${request.idempotencyKey} has already been settled.`,
        executionLatencyMs: 8,
      };
    }

    this.executedIdempotencyKeys.add(request.idempotencyKey);

    // Simulated network latency
    const latency = 120 + Math.floor(Math.random() * 80);

    // Simulate successful recovery if payment failure was transient
    const isTransient = payment.failure?.category === 'BANK_DECLINE' || payment.failure?.category === 'GATEWAY_TIMEOUT';

    if (isTransient) {
      payment.status = 'CAPTURED';
      payment.attemptCount += 1;
      payment.updatedAt = new Date().toISOString();

      return {
        success: true,
        gatewayReferenceNumber: `rrn_sim_${Math.floor(100000000 + Math.random() * 900000000)}`,
        authCode: `AUTH_${Math.floor(100000 + Math.random() * 900000)}`,
        statusCode: 'FUNDS_CAPTURED',
        rawMessage: 'Issuing bank authorized charge code. Settlement captured into merchant account.',
        settledAmount: payment.amount,
        settledAt: new Date().toISOString(),
        executionLatencyMs: latency,
      };
    } else {
      payment.attemptCount += 1;
      payment.updatedAt = new Date().toISOString();

      return {
        success: false,
        gatewayReferenceNumber: `rrn_sim_${Math.floor(100000000 + Math.random() * 900000000)}`,
        statusCode: 'RETRY_DECLINED',
        rawMessage: `Issuer permanent decline: ${payment.failure?.description ?? 'Decline rule matched'}`,
        executionLatencyMs: latency,
      };
    }
  }

  public async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const payment = this.paymentsStore.get(paymentId);
    return payment ? payment.status : 'FAILED';
  }
}
