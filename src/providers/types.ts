/**
 * REVIVE Provider Abstraction: Types
 * 
 * Clean interface isolating core payment recovery logic from specific gateways.
 * Supports Razorpay testnet and deterministic Simulator.
 */

import { Payment, PaymentStatus } from '../domain/payment';

export interface RetryPaymentRequest {
  paymentId: string;
  idempotencyKey: string;
  targetChannel?: string;
  policyCheckToken: string;       // Proof of policy engine approval
  merchantId: string;
}

export interface ProviderRetryResult {
  success: boolean;
  gatewayReferenceNumber: string; // Gateway RRN / Payment ID
  authCode?: string;              // Issuer auth code on success (e.g. AUTH_0091382)
  statusCode: string;             // e.g. "SUCCESS_200", "GATEWAY_TIMEOUT", "DECLINED"
  rawMessage: string;
  settledAmount?: number;
  settledAt?: string;
  executionLatencyMs: number;
}

export interface PaymentProvider {
  readonly id: string;
  readonly name: string;
  readonly isSimulator: boolean;

  getPayment(paymentId: string): Promise<Payment | null>;
  retryPayment(request: RetryPaymentRequest): Promise<ProviderRetryResult>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
}

// Hinglish Architectural Note:
// Yahan Provider interface ko policyCheckToken mandatory kiya gaya hai.
// Isse yeh enforce hota hai ki bina valid deterministic policy approval ke,
// koi bhi component direct provider.retryPayment() call na kar sake.
