/**
 * REVIVE Synthetic Data Engine: Seeded Generator
 * 
 * Generates 500+ realistic, non-uniform synthetic payment recovery scenarios
 * with mathematically deterministic ground truth labels.
 * 
 * Hinglish Architecture Note:
 * Ground truth data ko model ki predictions se complete decouple rakha gaya hai.
 * Evaluation circular na ho isliye har scenario archetype ka ground truth 
 * domain rules aur deterministic policy specifications se compute hota hai.
 */

import { SyntheticRecoveryCase, ScenarioArchetype, GroundTruthSpec, SyntheticDataset, DatasetSummary } from './types';
import { Payment, PaymentFailureCategory, PaymentMethodType } from '../../domain/payment';
import { Customer, CustomerTier } from '../../domain/customer';
import { RecoveryActionType } from '../../domain/recovery-action';

// Seedable Pseudo-Random Number Generator (Mulberry32)
export class DeterministicPRNG {
  private state: number;

  constructor(seed: number = 42891) {
    this.state = seed;
  }

  // Returns float between 0 and 1
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  public pickOne<T>(items: T[]): T {
    const idx = this.nextInt(0, items.length - 1);
    return items[idx];
  }
}

// Enterprise archetypes distribution targets
const SCENARIO_ARCHETYPES: ScenarioArchetype[] = [
  'INSUFFICIENT_FUNDS',
  'BANK_DECLINE',
  'EXPIRED_PAYMENT_METHOD',
  'NETWORK_TIMEOUT',
  'PROVIDER_ERROR',
  'DUPLICATE_EVENT',
  'REPEATED_FAILURE',
  'HIGH_VALUE_CUSTOMER',
  'LOW_VALUE_CUSTOMER',
  'ALREADY_RECOVERED',
  'EXHAUSTED_RETRIES',
  'LOW_AI_CONFIDENCE',
  'POLICY_BLOCKED',
  'AMBIGUOUS_PAYMENT_STATE',
  'SUCCESSFUL_RECOVERY',
  'UNSUCCESSFUL_RECOVERY',
];

const FIRST_NAMES = ['Aarav', 'Ananya', 'Rohan', 'Pooja', 'Vikram', 'Neha', 'Aditya', 'Sneha', 'Rahul', 'Kavita', 'Karan', 'Priya', 'Deepak', 'Meera', 'Arjun', 'Isha'];
const LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Reddy', 'Mehta', 'Nair', 'Deshmukh', 'Singhania', 'Iyer', 'Chatterjee', 'Gupta', 'Malhotra', 'Joshi', 'Bose'];
const MERCHANTS = ['merch_razorpay_direct', 'merch_swiggy_delivery', 'merch_zerodha_broker', 'merch_cult_fitness', 'merch_cred_pay'];
const CARD_NETWORKS: Array<'Visa' | 'Mastercard' | 'RuPay'> = ['Visa', 'Mastercard', 'RuPay'];

export interface GeneratorOptions {
  count?: number;
  seed?: number;
}

export function generateSyntheticDataset(options: GeneratorOptions = {}): SyntheticDataset {
  const count = options.count ?? 500;
  const seed = options.seed ?? 98765;
  const prng = new DeterministicPRNG(seed);

  const cases: SyntheticRecoveryCase[] = [];
  const scenarioDistribution: Record<ScenarioArchetype, number> = {} as Record<ScenarioArchetype, number>;
  const failureDistribution: Record<string, number> = {};
  const tierDistribution: Record<CustomerTier, number> = {
    enterprise: 0,
    growth: 0,
    standard: 0,
  };

  SCENARIO_ARCHETYPES.forEach((archetype) => {
    scenarioDistribution[archetype] = 0;
  });

  let totalRevenueAtRisk = 0;
  let totalRecoverableRevenue = 0;
  let expectedRecoverableRevenue = 0;
  let eligibleCount = 0;

  for (let i = 1; i <= count; i++) {
    // Round-robin distribution with probabilistic variation across archetypes
    const archetypeIndex = (i - 1) % SCENARIO_ARCHETYPES.length;
    const archetype = SCENARIO_ARCHETYPES[archetypeIndex];
    scenarioDistribution[archetype] += 1;

    const caseId = `SYN-${String(i).padStart(4, '0')}`;
    const paymentId = `pay_${prng.nextInt(100000, 999999)}_syn`;
    const customerId = `cust_${prng.nextInt(10000, 99999)}`;
    const merchantId = prng.pickOne(MERCHANTS);

    const firstName = prng.pickOne(FIRST_NAMES);
    const lastName = prng.pickOne(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${prng.nextInt(10, 99)}@example.com`;

    // Customer tier assignment
    let tier: CustomerTier = 'standard';
    if (archetype === 'HIGH_VALUE_CUSTOMER') {
      tier = 'enterprise';
    } else if (archetype === 'LOW_VALUE_CUSTOMER') {
      tier = 'standard';
    } else {
      const tierRoll = prng.next();
      if (tierRoll < 0.20) tier = 'enterprise';
      else if (tierRoll < 0.60) tier = 'growth';
      else tier = 'standard';
    }
    tierDistribution[tier] += 1;

    // Amount assignment (in INR)
    let amount = 0;
    if (archetype === 'HIGH_VALUE_CUSTOMER') {
      amount = prng.nextInt(52000, 185000);
    } else if (archetype === 'LOW_VALUE_CUSTOMER') {
      amount = prng.nextInt(199, 1499);
    } else {
      amount = prng.nextInt(1200, 38000);
    }
    totalRevenueAtRisk += amount;

    // Payment method assignment
    const methodType: PaymentMethodType = prng.pickOne(['card', 'upi', 'emandate', 'netbanking']);
    const network = methodType === 'card' ? prng.pickOne(CARD_NETWORKS) : undefined;
    const maskedIdentifier = methodType === 'upi'
      ? `${firstName.toLowerCase()}${prng.nextInt(10, 99)}@okhdfcbank`
      : `•••• ${prng.nextInt(1000, 9999)}`;

    // Archetype-specific attributes & Ground Truth mapping
    let failureCategory: PaymentFailureCategory = 'INSUFFICIENT_FUNDS';
    let failureCode = 'E_INSUFFICIENT_BALANCE';
    let failureDesc = 'The card issuer declined the transaction due to insufficient available funds.';
    let rootCauseGroundTruth = 'Transient account liquidity shortage.';
    let recommendedActionGroundTruth: RecoveryActionType = 'SEND_REMINDER';
    let expectedPolicyOutcome: 'ALLOWED' | 'BLOCKED' | 'NEEDS_REVIEW' = 'ALLOWED';
    let expectedRecoveryOutcome: 'RECOVERED' | 'FAILED' | 'ESCALATED' | 'BLOCKED' = 'RECOVERED';
    let expectedSafetyRuleViolated: string | undefined = undefined;
    let attemptCount = 1;
    let maxAllowedAttempts = 3;
    let isEligibleForRecovery = true;
    let paymentStatus = 'FAILED' as const;

    switch (archetype) {
      case 'INSUFFICIENT_FUNDS':
        failureCategory = 'INSUFFICIENT_FUNDS';
        failureCode = 'E_INSUFFICIENT_BALANCE';
        failureDesc = 'Card issuer declined: Insufficient funds in account.';
        rootCauseGroundTruth = 'Customer balance temporarily below charge amount.';
        recommendedActionGroundTruth = 'SEND_REMINDER';
        expectedPolicyOutcome = 'ALLOWED';
        expectedRecoveryOutcome = 'RECOVERED';
        attemptCount = 1;
        break;

      case 'BANK_DECLINE':
        failureCategory = 'BANK_DECLINE';
        failureCode = 'E05_DO_NOT_HONOR';
        failureDesc = 'Issuer general decline code 05: Do not honor transaction.';
        rootCauseGroundTruth = 'Issuer security block or debit restriction.';
        recommendedActionGroundTruth = 'OFFER_ALTERNATIVE_METHOD';
        expectedPolicyOutcome = 'ALLOWED';
        expectedRecoveryOutcome = 'RECOVERED';
        attemptCount = 1;
        break;

      case 'EXPIRED_PAYMENT_METHOD':
        failureCategory = 'EXPIRED_PAYMENT_METHOD';
        failureCode = 'E54_EXPIRED_INSTRUMENT';
        failureDesc = 'Payment method validity ended before execution.';
        rootCauseGroundTruth = 'Tokenized instrument past expiration date.';
        recommendedActionGroundTruth = 'OFFER_ALTERNATIVE_METHOD';
        expectedPolicyOutcome = 'ALLOWED';
        expectedRecoveryOutcome = 'RECOVERED';
        attemptCount = 1;
        break;

      case 'NETWORK_TIMEOUT':
        failureCategory = 'NETWORK_TIMEOUT';
        failureCode = 'E_GATEWAY_TIMEOUT_504';
        failureDesc = 'HTTP 504 Gateway Timeout from core payment switch.';
        rootCauseGroundTruth = 'Core banking switch unresponsive during processing.';
        recommendedActionGroundTruth = 'ESCALATE_TO_HUMAN';
        expectedPolicyOutcome = 'NEEDS_REVIEW';
        expectedRecoveryOutcome = 'ESCALATED';
        expectedSafetyRuleViolated = 'POL_INV_07_TIMEOUT_UNKNOWN_STATE';
        attemptCount = 1;
        break;

      case 'PROVIDER_ERROR':
        failureCategory = 'PROVIDER_ERROR';
        failureCode = 'E503_PROVIDER_SERVICE_UNAVAILABLE';
        failureDesc = 'Primary payment processor returned 503 Service Unavailable.';
        rootCauseGroundTruth = 'Aggregator infrastructure degradation.';
        recommendedActionGroundTruth = 'ESCALATE_TO_HUMAN';
        expectedPolicyOutcome = 'NEEDS_REVIEW';
        expectedRecoveryOutcome = 'ESCALATED';
        attemptCount = 1;
        break;

      case 'DUPLICATE_EVENT':
        failureCategory = 'DUPLICATE_ATTEMPT';
        failureCode = 'E_IDEMPOTENCY_KEY_REPLAY';
        failureDesc = 'Idempotency conflict: transaction token already assigned to active attempt.';
        rootCauseGroundTruth = 'Duplicate webhook re-delivery from webhook dispatcher.';
        recommendedActionGroundTruth = 'NO_ACTION';
        expectedPolicyOutcome = 'BLOCKED';
        expectedRecoveryOutcome = 'BLOCKED';
        expectedSafetyRuleViolated = 'POL_INV_03_IDEMPOTENCY';
        isEligibleForRecovery = false;
        break;

      case 'REPEATED_FAILURE':
        failureCategory = 'BANK_DECLINE';
        failureCode = 'E_VELOCITY_SUSPECT';
        failureDesc = 'Rapid repeated declines on same payment instrument.';
        rootCauseGroundTruth = 'Issuer velocity limit triggered across rolling 12h window.';
        recommendedActionGroundTruth = 'OFFER_ALTERNATIVE_METHOD';
        expectedPolicyOutcome = 'ALLOWED';
        expectedRecoveryOutcome = 'RECOVERED';
        attemptCount = 2;
        break;

      case 'HIGH_VALUE_CUSTOMER':
        failureCategory = 'INSUFFICIENT_FUNDS';
        failureCode = 'E_LIMIT_EXCEEDED';
        failureDesc = 'High-ticket charge exceeded automated risk tier.';
        rootCauseGroundTruth = 'Transaction amount exceeds automated autonomous ceiling (₹50,000).';
        recommendedActionGroundTruth = 'SEND_REMINDER';
        expectedPolicyOutcome = 'NEEDS_REVIEW';
        expectedRecoveryOutcome = 'ESCALATED';
        expectedSafetyRuleViolated = 'POL_INV_08_MAX_TICKET_AMOUNT';
        attemptCount = 1;
        break;

      case 'LOW_VALUE_CUSTOMER':
        failureCategory = 'INSUFFICIENT_FUNDS';
        failureCode = 'E_INSUFFICIENT_BALANCE';
        failureDesc = 'Micro-ticket recurring billing failed.';
        rootCauseGroundTruth = 'Low-balance prepaid debit card.';
        recommendedActionGroundTruth = 'RETRY_PAYMENT';
        expectedPolicyOutcome = 'ALLOWED';
        expectedRecoveryOutcome = 'RECOVERED';
        attemptCount = 1;
        break;

      case 'ALREADY_RECOVERED':
        failureCategory = 'UNKNOWN';
        failureCode = 'E_ALREADY_CAPTURED';
        failureDesc = 'Payment is in CAPTURED status; recovery attempted in error.';
        rootCauseGroundTruth = 'Settled transaction received stale retry trigger.';
        recommendedActionGroundTruth = 'NO_ACTION';
        expectedPolicyOutcome = 'BLOCKED';
        expectedRecoveryOutcome = 'BLOCKED';
        expectedSafetyRuleViolated = 'POL_INV_05_ALREADY_SETTLED';
        paymentStatus = 'CAPTURED' as any;
        isEligibleForRecovery = false;
        break;

      case 'EXHAUSTED_RETRIES':
        failureCategory = 'INSUFFICIENT_FUNDS';
        failureCode = 'E_ATTEMPT_LIMIT_BREACHED';
        failureDesc = 'Attempt 3 of 3 failed. No further automatic retries permitted.';
        rootCauseGroundTruth = 'Maximum allowed attempt ceiling reached for merchant policy.';
        recommendedActionGroundTruth = 'NO_ACTION';
        expectedPolicyOutcome = 'BLOCKED';
        expectedRecoveryOutcome = 'BLOCKED';
        expectedSafetyRuleViolated = 'POL_INV_01_MAX_RETRIES';
        attemptCount = 3;
        isEligibleForRecovery = false;
        break;

      case 'LOW_AI_CONFIDENCE':
        failureCategory = 'TECHNICAL_ERROR';
        failureCode = 'E99_AMBIGUOUS_PAYMENT_RESPONSE';
        failureDesc = 'Uncategorized issuer telemetry; confidence score 0.42.';
        rootCauseGroundTruth = 'Novel issuer error code not present in diagnosis dictionary.';
        recommendedActionGroundTruth = 'ESCALATE_TO_HUMAN';
        expectedPolicyOutcome = 'NEEDS_REVIEW';
        expectedRecoveryOutcome = 'ESCALATED';
        expectedSafetyRuleViolated = 'POL_INV_06_MIN_CONFIDENCE';
        attemptCount = 1;
        break;

      case 'POLICY_BLOCKED':
        failureCategory = 'BANK_DECLINE';
        failureCode = 'E_CHARGEBACK_DISPUTE_OPEN';
        failureDesc = 'Cardholder has an open dispute/chargeback flag.';
        rootCauseGroundTruth = 'Risk policy forbids retries on disputed cards.';
        recommendedActionGroundTruth = 'NO_ACTION';
        expectedPolicyOutcome = 'BLOCKED';
        expectedRecoveryOutcome = 'BLOCKED';
        expectedSafetyRuleViolated = 'POL_INV_04_CARDHOLDER_DISPUTE';
        isEligibleForRecovery = false;
        break;

      case 'AMBIGUOUS_PAYMENT_STATE':
        failureCategory = 'GATEWAY_TIMEOUT';
        failureCode = 'E_PENDING_WEBHOOK_TIMEOUT';
        failureDesc = 'Payment in pending state without terminal webhook acknowledgment.';
        rootCauseGroundTruth = 'Asynchronous UPI mandate settlement in limbo.';
        recommendedActionGroundTruth = 'ESCALATE_TO_HUMAN';
        expectedPolicyOutcome = 'NEEDS_REVIEW';
        expectedRecoveryOutcome = 'ESCALATED';
        attemptCount = 1;
        break;

      case 'SUCCESSFUL_RECOVERY':
        failureCategory = 'INSUFFICIENT_FUNDS';
        failureCode = 'E_INSUFFICIENT_BALANCE';
        failureDesc = 'Initial debit declined; salary day cycle aligned for retry.';
        rootCauseGroundTruth = 'Temporary payroll processing delay.';
        recommendedActionGroundTruth = 'RETRY_PAYMENT';
        expectedPolicyOutcome = 'ALLOWED';
        expectedRecoveryOutcome = 'RECOVERED';
        attemptCount = 1;
        break;

      case 'UNSUCCESSFUL_RECOVERY':
        failureCategory = 'BANK_DECLINE';
        failureCode = 'E05_CARD_RESTRICTED';
        failureDesc = 'Permanent account block placed by issuer.';
        rootCauseGroundTruth = 'Issuer flagged account for KYC compliance freeze.';
        recommendedActionGroundTruth = 'OFFER_ALTERNATIVE_METHOD';
        expectedPolicyOutcome = 'ALLOWED';
        expectedRecoveryOutcome = 'FAILED';
        attemptCount = 2;
        break;
    }

    failureDistribution[failureCategory] = (failureDistribution[failureCategory] || 0) + 1;

    if (isEligibleForRecovery) {
      eligibleCount++;
      totalRecoverableRevenue += amount;
      if (expectedRecoveryOutcome === 'RECOVERED') {
        expectedRecoverableRevenue += amount;
      }
    }

    const groundTruth: GroundTruthSpec = {
      failureTypeGroundTruth: failureCategory,
      rootCauseGroundTruth,
      recommendedActionGroundTruth,
      expectedPolicyOutcome,
      expectedRecoveryOutcome,
      expectedSafetyRuleViolated,
    };

    const payment: Payment = {
      id: paymentId,
      merchantId,
      customerId,
      amount,
      currency: 'INR',
      status: paymentStatus as any,
      method: {
        type: methodType,
        network,
        maskedIdentifier,
        tokenized: true,
        expiryMonth: 12,
        expiryYear: 2028,
      },
      failure: {
        code: failureCode,
        category: failureCategory,
        description: failureDesc,
        gatewayRrn: `RRN${prng.nextInt(100000000000, 999999999999)}`,
        failedAt: new Date(Date.now() - prng.nextInt(1, 48) * 3600000).toISOString(),
        httpStatusCode: archetype === 'NETWORK_TIMEOUT' ? 504 : archetype === 'PROVIDER_ERROR' ? 503 : 400,
        retryable: isEligibleForRecovery,
      },
      attemptCount,
      maxAllowedAttempts,
      createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const customer: Customer = {
      id: customerId,
      name: fullName,
      email,
      phone: `+91 98${prng.nextInt(10000000, 99999999)}`,
      tier,
      lifetimeValueINR: amount * prng.nextInt(3, 15),
      createdAt: '2024-01-15T00:00:00.000Z',
    };

    cases.push({
      id: caseId,
      scenarioArchetype: archetype,
      payment,
      customer,
      groundTruth,
      isEligibleForRecovery,
      notes: `Synthetic evaluation record for ${archetype} (Ground truth: ${expectedRecoveryOutcome})`,
      createdAt: payment.createdAt,
    });
  }

  const summary: DatasetSummary = {
    totalRecords: count,
    scenarioDistribution,
    failureDistribution,
    totalRevenueAtRiskINR: totalRevenueAtRisk,
    totalRecoverableRevenueINR: totalRecoverableRevenue,
    expectedRecoverableRevenueINR: expectedRecoverableRevenue,
    eligibilityRatePercentage: Math.round((eligibleCount / count) * 1000) / 10,
    tierDistribution,
  };

  return {
    datasetId: `DS-CORPUS-${seed}`,
    version: '1.0.0',
    generatorVersion: 'revive-prng-v2.1',
    createdAt: new Date().toISOString(),
    cases,
    summary,
  };
}
