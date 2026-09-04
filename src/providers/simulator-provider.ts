/**
 * REVIVE Provider: Simulator Provider
 * 
 * High-fidelity deterministic simulation provider for reproducible tests,
 * controlled benchmark evaluations, and safe failure demonstrations.
 */

import { Payment, PaymentStatus } from '../domain/payment';
import { PaymentProvider, RetryPaymentRequest, ProviderRetryResult } from './types';

export type SimulatorOutcomeMode = 
  | 'AUTO'               // Outcome determined by failure category
  | 'FORCE_SUCCESS'
  | 'FORCE_DECLINE'
  | 'FORCE_TIMEOUT'      // Simulates network latency / gateway timeout
  | 'FORCE_PROVIDER_ERROR'
  | 'FORCE_ALREADY_RECOVERED';

export class SimulatorProvider implements PaymentProvider {
  public readonly id = 'SIMULATOR_SANDBOX';
  public readonly name = 'Revive High-Fidelity Simulation Provider';
  public readonly isSimulator = true;

  private paymentsStore = new Map<string, Payment>();
  private executedResultsByIdempotency = new Map<string, ProviderRetryResult>();
  private scenarioOverrideMode: SimulatorOutcomeMode = 'AUTO';

  constructor(initialPayments?: Payment[]) {
    if (initialPayments) {
      initialPayments.forEach(p => this.paymentsStore.set(p.id, p));
    }
  }

  public setScenarioMode(mode: SimulatorOutcomeMode): void {
    this.scenarioOverrideMode = mode;
  }

  public async getPayment(paymentId: string): Promise<Payment | null> {
    return this.paymentsStore.get(paymentId) ?? null;
  }

  public registerPayment(payment: Payment): void {
    this.paymentsStore.set(payment.id, payment);
  }

  /**
   * Executes deterministic simulated retry with idempotency cache and safe failure modes.
   * 
   * Hinglish Comment:
   * 1. Idempotency check: Agar same idempotency key dobara aati hai, toh new payment
   *    trigger nahi hota; existing cached result return hota hai (duplicate prevention).
   * 2. Timeout safe failure: Agar gateway timeout hota hai, toh payment status 'UNKNOWN'
   *    rehti hai. System blindly dubara retry nahi karta taaki customer ko do baar charge na pade.
   */
  public async retryPayment(request: RetryPaymentRequest): Promise<ProviderRetryResult> {
    // 1. Idempotency Check: Reject duplicate dispatch to prevent double charging
    if (this.executedResultsByIdempotency.has(request.idempotencyKey)) {
      return {
        success: false,
        gatewayReferenceNumber: `sim_${Date.now()}`,
        statusCode: 'DUPLICATE_IDEMPOTENCY_KEY',
        rawMessage: `Idempotency conflict: A payment retry with key '${request.idempotencyKey}' was already processed. Duplicate execution rejected.`,
        executionLatencyMs: 5,
      };
    }

    const payment = this.paymentsStore.get(request.paymentId);
    if (!payment) {
      const errorResult: ProviderRetryResult = {
        success: false,
        gatewayReferenceNumber: `sim_${Date.now()}`,
        statusCode: 'PAYMENT_NOT_FOUND',
        rawMessage: `Payment with ID ${request.paymentId} was not found in simulator store.`,
        executionLatencyMs: 15,
      };
      this.executedResultsByIdempotency.set(request.idempotencyKey, errorResult);
      return errorResult;
    }

    // 2. Already recovered check
    if (payment.status === 'CAPTURED' || payment.status === 'RECOVERED') {
      const alreadyRecoveredResult: ProviderRetryResult = {
        success: true,
        gatewayReferenceNumber: payment.failure?.gatewayRrn ?? `rrn_${payment.id}`,
        authCode: 'ALREADY_SETTLED',
        statusCode: 'ALREADY_RECOVERED',
        rawMessage: 'Payment has already been captured into merchant escrow.',
        settledAmount: payment.amount,
        settledAt: payment.updatedAt,
        executionLatencyMs: 10,
      };
      this.executedResultsByIdempotency.set(request.idempotencyKey, alreadyRecoveredResult);
      return alreadyRecoveredResult;
    }

    // 3. Evaluate outcome based on scenario mode
    const latency = 110 + Math.floor(Math.random() * 40);

    // Case: Force Timeout (Unknown Gateway State)
    if (this.scenarioOverrideMode === 'FORCE_TIMEOUT') {
      const timeoutResult: ProviderRetryResult = {
        success: false,
        gatewayReferenceNumber: `rrn_timeout_${Date.now()}`,
        statusCode: 'TIMEOUT',
        rawMessage: 'UNKNOWN_PROVIDER_STATE: Gateway switch timed out with 504 Gateway Timeout. Status unconfirmed; suppressing automated re-dispatch.',
        executionLatencyMs: 350,
      };
      this.executedResultsByIdempotency.set(request.idempotencyKey, timeoutResult);
      return timeoutResult;
    }

    // Case: Force Provider Error
    if (this.scenarioOverrideMode === 'FORCE_PROVIDER_ERROR') {
      const providerErrorResult: ProviderRetryResult = {
        success: false,
        gatewayReferenceNumber: `rrn_err_${Date.now()}`,
        statusCode: 'PROVIDER_ERROR',
        rawMessage: 'Issuer switch returned 502 Bad Gateway during clearing handshake.',
        executionLatencyMs: 180,
      };
      this.executedResultsByIdempotency.set(request.idempotencyKey, providerErrorResult);
      return providerErrorResult;
    }

    // Case: Force Decline
    if (this.scenarioOverrideMode === 'FORCE_DECLINE') {
      payment.attemptCount += 1;
      payment.updatedAt = new Date().toISOString();
      const declineResult: ProviderRetryResult = {
        success: false,
        gatewayReferenceNumber: `rrn_dec_${Date.now()}`,
        statusCode: 'DECLINED',
        rawMessage: 'Issuer hard decline (Do Not Honor - 05). Cardholder authentication rejected.',
        executionLatencyMs: latency,
      };
      this.executedResultsByIdempotency.set(request.idempotencyKey, declineResult);
      return declineResult;
    }

    // Auto Mode: Determine by failure category
    const isTransient = 
      payment.failure?.category === 'BANK_DECLINE' || 
      payment.failure?.category === 'NETWORK_TIMEOUT' ||
      payment.failure?.category === 'GATEWAY_TIMEOUT';

    if (isTransient || this.scenarioOverrideMode === 'FORCE_SUCCESS') {
      payment.status = 'CAPTURED';
      payment.attemptCount += 1;
      payment.updatedAt = new Date().toISOString();

      const successResult: ProviderRetryResult = {
        success: true,
        gatewayReferenceNumber: `rrn_sim_${Math.floor(100000000 + Math.random() * 900000000)}`,
        authCode: `AUTH_${Math.floor(100000 + Math.random() * 900000)}`,
        statusCode: 'FUNDS_CAPTURED',
        rawMessage: 'Issuing bank authorized charge code. Full funds captured into merchant escrow.',
        settledAmount: payment.amount,
        settledAt: new Date().toISOString(),
        executionLatencyMs: latency,
      };
      this.executedResultsByIdempotency.set(request.idempotencyKey, successResult);
      return successResult;
    } else {
      payment.attemptCount += 1;
      payment.updatedAt = new Date().toISOString();

      const declineResult: ProviderRetryResult = {
        success: false,
        gatewayReferenceNumber: `rrn_sim_${Math.floor(100000000 + Math.random() * 900000000)}`,
        statusCode: 'DECLINED',
        rawMessage: `Issuer permanent decline: ${payment.failure?.description ?? 'Decline rule matched'}`,
        executionLatencyMs: latency,
      };
      this.executedResultsByIdempotency.set(request.idempotencyKey, declineResult);
      return declineResult;
    }
  }

  public async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const payment = this.paymentsStore.get(paymentId);
    return payment ? payment.status : 'FAILED';
  }
}
