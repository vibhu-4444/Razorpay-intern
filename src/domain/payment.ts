/**
 * REVIVE Domain Model: Payment
 * 
 * Payment representation decoupled from individual payment aggregators (e.g. Razorpay, PayU).
 * Standardized across cards, UPI, netbanking, and e-mandate rails.
 */

export type Currency = 'INR' | 'USD' | 'EUR';

export type PaymentStatus = 
  | 'INITIATED'
  | 'PENDING'
  | 'FAILED'
  | 'RETRYING'
  | 'CAPTURED'
  | 'RECOVERED'
  | 'EXPIRED'
  | 'CANCELLED';

export type PaymentMethodType = 'card' | 'upi' | 'netbanking' | 'emandate';

export interface PaymentMethodInfo {
  type: PaymentMethodType;
  network?: 'Visa' | 'Mastercard' | 'RuPay' | 'HDFC' | 'ICICI' | 'SBI' | 'UPI';
  maskedIdentifier: string; // e.g. "•••• 4012" or "user@okaxis"
  tokenized: boolean;
  expiryMonth?: number;
  expiryYear?: number;
}

export type FailureCategory =
  | 'INSUFFICIENT_FUNDS'
  | 'BANK_DECLINE'
  | 'EXPIRED_PAYMENT_METHOD'
  | 'NETWORK_TIMEOUT'
  | 'PROVIDER_ERROR'
  | 'DUPLICATE_ATTEMPT'
  | 'UNKNOWN'
  | 'CARD_EXPIRED'
  | 'GATEWAY_TIMEOUT'
  | 'VELOCITY_LIMIT'
  | 'TECHNICAL_ERROR';

export interface PaymentFailureInfo {
  code: string;               // e.g. "E05_ISSUER_TIMEOUT", "INSUFFICIENT_FUNDS", "BANK_DECLINE"
  category: FailureCategory;
  description: string;
  gatewayRrn?: string;        // Retrieval Reference Number from bank/gateway
  failedAt: string;           // ISO timestamp
  httpStatusCode?: number;
  retryable: boolean;         // Gatekeeper heuristic hint (subject to policy approval)
}

export interface Payment {
  id: string;                 // e.g. "pay_Nxi9823kL0"
  merchantId: string;         // e.g. "merch_acme_01"
  customerId: string;         // e.g. "CUST_ACME_819"
  amount: number;             // Amount in smallest currency unit or rupee standard (INR ₹)
  currency: Currency;
  status: PaymentStatus;
  method: PaymentMethodInfo;
  failure?: PaymentFailureInfo;
  attemptCount: number;       // Current attempt index (1 = initial attempt)
  maxAllowedAttempts: number; // Hard ceiling configured for merchant
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

// Hinglish Architectural Note:
// Payment object ko immutable transaction snapshot ki tarah treat kiya jata hai.
// Jab bhi retry execute hota hai, ek naya attempt record banega aur payment status
// update hoga, par original failure history ko audit ledger mein preserve kiya jayega.
