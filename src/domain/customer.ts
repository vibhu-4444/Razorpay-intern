/**
 * REVIVE Domain Model: Customer Context
 * 
 * Aggregated customer payment behavior strictly constrained to non-sensitive ledger statistics.
 */

export type CustomerTier = 'ENTERPRISE' | 'GROWTH' | 'STANDARD';

export interface CustomerPaymentMetrics {
  historicalClearedCount: number;
  historicalFailedCount: number;
  successRatePercentage: number;
  accountTenureMonths: number;
  avgTransactionAmount: number;
  recentRecoveryEvent: boolean;
  lastRecoveryDate?: string;
  hasActiveDispute: boolean;
}

export interface Customer {
  id: string;                      // e.g. "CUST_ACME_819"
  name: string;                    // e.g. "Acme Labs Pvt Ltd"
  email: string;
  phoneMasked: string;             // e.g. "+91 ••••• ••891"
  tier: CustomerTier;
  metrics: CustomerPaymentMetrics;
  createdAt: string;
}

// Hinglish Architectural Note:
// Customer data mein kabhi sensitive payment instruments ya PII store nahi hoti.
// Sirf non-sensitive ledger telemetry aur behavioral metrics (jaise 7 successful payments,
// 0 default record) rakhe jate hain, jo AI failure analysis aur policy checks ke liye zaroori hain.
