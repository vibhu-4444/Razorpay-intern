/**
 * REVIVE End-to-End Integration Tests: Recovery Workflow
 * 
 * Verifies the 5 mission-critical lifecycle scenarios:
 * 1. Successful autonomous recovery (Ingest -> AI Diagnose -> Policy Pass -> Provider Execute -> Settled -> Audit)
 * 2. Policy-blocked execution (Attempt limit reached -> Zero provider dispatch -> Audit blocked)
 * 3. Low confidence guard (< 60% -> Human review required -> No autonomous dispatch)
 * 4. Provider timeout safe failure (Network timeout -> UNKNOWN_PROVIDER_STATE -> Duplicate suppressed -> Escalated)
 * 5. Idempotent duplicate replay (Exact same key -> Cached result returned -> Duplicate dispatch suppressed)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RecoveryService } from '../../src/services/recovery-service';
import { SimulatorProvider } from '../../src/providers/simulator-provider';
import { PolicyEngine } from '../../src/policy-engine/evaluator';
import { AIAdvisor } from '../../src/ai';
import { AuditService } from '../../src/services/audit-service';
import { RecoveryCase } from '../../src/domain/recovery-case';
import { Payment } from '../../src/domain/payment';
import { Customer } from '../../src/domain/customer';

describe('REVIVE End-to-End Recovery Workflow Integration', () => {
  let policyEngine: PolicyEngine;
  let aiAdvisor: AIAdvisor;
  let provider: SimulatorProvider;
  let auditService: AuditService;
  let recoveryService: RecoveryService;

  const mockCustomer: Customer = {
    id: 'cust_int_01',
    name: 'Bharat Fintech Solutions',
    email: 'ops@bharatfintech.in',
    phoneMasked: '+91 ••••• ••210',
    tier: 'ENTERPRISE',
    metrics: {
      historicalClearedCount: 28,
      historicalFailedCount: 1,
      successRatePercentage: 96.5,
      accountTenureMonths: 14,
      avgTransactionAmount: 48000,
      recentRecoveryEvent: false,
      hasActiveDispute: false,
    },
    createdAt: new Date(Date.now() - 365 * 86400000).toISOString(),
  };

  const createMockCase = (id: string, overrides: {
    amount?: number;
    failureCategory?: string;
    attemptCount?: number;
  } = {}): RecoveryCase => {
    const payment: Payment = {
      id: `pay_${id}`,
      merchantId: 'merch_01',
      customerId: mockCustomer.id,
      amount: overrides.amount ?? 45000,
      currency: 'INR',
      status: 'FAILED',
      method: {
        type: 'NETBANKING',
        network: 'HDFC',
        last4: '4091',
        tokenized: true,
      },
      failure: {
        code: 'BANK_TIMEOUT_504',
        category: (overrides.failureCategory as any) ?? 'NETWORK_TIMEOUT',
        description: 'Issuer switch timeout during transaction clearance',
        failedAt: new Date(Date.now() - 60000).toISOString(),
        gatewayRrn: `rrn_${id}`,
      },
      attemptCount: overrides.attemptCount ?? 1,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 60000).toISOString(),
    };

    return {
      id,
      paymentId: payment.id,
      payment,
      customer: mockCustomer,
      status: 'OPEN',
      riskLevel: 'LOW',
      amountAtRisk: payment.amount,
      amountRecoverable: payment.amount,
      amountSettled: 0,
      timelineEvents: [],
      auditTrail: [],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 60000).toISOString(),
    };
  };

  beforeEach(() => {
    policyEngine = new PolicyEngine();
    aiAdvisor = new AIAdvisor();
    provider = new SimulatorProvider();
    auditService = new AuditService();

    recoveryService = new RecoveryService(
      policyEngine,
      aiAdvisor,
      provider,
      auditService,
      [
        createMockCase('CASE-INT-01', { amount: 50000, failureCategory: 'NETWORK_TIMEOUT', attemptCount: 1 }),
        createMockCase('CASE-INT-02', { amount: 25000, failureCategory: 'BANK_DECLINE', attemptCount: 3 }),
        createMockCase('CASE-INT-03', { amount: 15000, failureCategory: 'TECHNICAL_ERROR', attemptCount: 1 }),
      ]
    );
  });

  // =========================================================================
  // SCENARIO 1: Successful Autonomous Recovery
  // =========================================================================
  it('Scenario 1: executes successful recovery, updates ledger, increments KPIs, and records immutable audit trail', async () => {
    // Initial KPI baseline
    const initialKpis = recoveryService.getOverviewKPIs();
    expect(initialKpis.revenueRecovered).toBe(0);
    expect(initialKpis.revenueAtRisk).toBe(90000); // 50k + 25k + 15k

    // Ensure provider will succeed
    recoveryService.setProviderScenarioMode('FORCE_SUCCESS');

    // Execute recovery
    const result = await recoveryService.executeRecovery('CASE-INT-01', 'idmp_scenario_1_success');

    // Invariants
    expect(result.success).toBe(true);
    expect(result.policyAllowed).toBe(true);
    expect(result.updatedCase.status).toBe('RECOVERED');
    expect(result.updatedCase.amountSettled).toBe(50000);
    expect(result.updatedCase.payment.status).toBe('CAPTURED');

    // Live KPIs update dynamically
    const updatedKpis = recoveryService.getOverviewKPIs();
    expect(updatedKpis.revenueRecovered).toBe(50000);
    expect(updatedKpis.revenueAtRisk).toBe(40000); // 25k + 15k
    expect(updatedKpis.recoveryRatePercentage).toBeGreaterThan(0);

    // Audit trail verification
    const auditEvents = auditService.getEventsByCase('CASE-INT-01');
    expect(auditEvents.length).toBeGreaterThanOrEqual(2);
    const policyPassEvent = auditEvents.find(e => e.result === 'POLICY_PASS_6/6');
    const gatewayCaptureEvent = auditEvents.find(e => e.actor === 'PAYMENT_GATEWAY');
    expect(policyPassEvent).toBeDefined();
    expect(gatewayCaptureEvent).toBeDefined();
    expect(gatewayCaptureEvent?.action).toContain('Captured settlement funds');
  });

  // =========================================================================
  // SCENARIO 2: Policy Blocked (Retry Limit Exceeded)
  // =========================================================================
  it('Scenario 2: halts execution when deterministic retry ceiling is breached, preventing provider call', async () => {
    // CASE-INT-02 has attemptCount: 3 (exceeds max 3 attempts)
    const result = await recoveryService.executeRecovery('CASE-INT-02', 'idmp_scenario_2_blocked');

    expect(result.success).toBe(false);
    expect(result.policyAllowed).toBe(false);
    expect(result.updatedCase.status).toBe('BLOCKED');
    expect(result.policyDecision.blockingReason).toContain('Max Retries');

    // Provider was NEVER dispatched - payment remains in failure state
    const paymentInProvider = await provider.getPayment('pay_CASE-INT-02');
    expect(paymentInProvider?.status).toBe('FAILED');

    // Audit trail documents the block
    const auditEvents = auditService.getEventsByCase('CASE-INT-02');
    const blockedEvent = auditEvents.find(e => e.result === 'POLICY_BLOCKED');
    expect(blockedEvent).toBeDefined();
    expect(blockedEvent?.actor).toBe('POLICY_ARBITER');
  });

  // =========================================================================
  // SCENARIO 3: Low Confidence AI Guard (< 60%)
  // =========================================================================
  it('Scenario 3: routes low-confidence diagnosis to human review, preventing automated execution', async () => {
    // Create an advisor that returns confidence < 60%
    const lowConfidenceAdvisor = {
      generateRecommendation: () => ({
        prescribedAction: 'RETRY_PAYMENT' as const,
        channel: 'SECONDARY_ROUTE',
        synthesizedRationale: 'Ambiguous telemetry signals; low certainty.',
        modelConfidencePercentage: 48, // BELOW 60% THRESHOLD
        recommendedCooldownSeconds: 60,
        maxCooldownSeconds: 120,
      }),
      diagnoseFailure: () => ({} as any),
    };

    const lowConfidenceService = new RecoveryService(
      policyEngine,
      lowConfidenceAdvisor as any,
      provider,
      auditService,
      [createMockCase('CASE-INT-LOW-CONF', { amount: 30000, attemptCount: 1 })]
    );

    const result = await lowConfidenceService.executeRecovery('CASE-INT-LOW-CONF');

    // Invariant: Low confidence MUST block automated execution and route to human review
    expect(result.success).toBe(false);
    expect(result.policyAllowed).toBe(false);
    expect(result.updatedCase.status).toBe('NEEDS_REVIEW');
    expect(result.policyDecision.blockingReason).toContain('AI confidence');

    // Verify exception queue count increments
    const kpis = lowConfidenceService.getOverviewKPIs();
    expect(kpis.needsReviewCount).toBeGreaterThanOrEqual(1);
  });

  // =========================================================================
  // SCENARIO 4: Provider Timeout (Safe Failure Mode)
  // =========================================================================
  it('Scenario 4: handles provider timeout by escalating to UNKNOWN_PROVIDER_STATE and suppressing duplicate retries', async () => {
    // Force gateway switch timeout
    recoveryService.setProviderScenarioMode('FORCE_TIMEOUT');

    const result = await recoveryService.executeRecovery('CASE-INT-01', 'idmp_scenario_4_timeout');

    expect(result.success).toBe(false);
    expect(result.policyAllowed).toBe(true); // Policy permitted the attempt
    expect(result.providerResult?.statusCode).toBe('TIMEOUT');
    expect(result.updatedCase.status).toBe('ESCALATED'); // Must not be FAILED or CAPTURED

    // Safe Failure Verification: Case is flagged with UNKNOWN_PROVIDER_STATE
    const auditEvents = auditService.getEventsByCase('CASE-INT-01');
    const timeoutAudit = auditEvents.find(e => e.result === 'UNKNOWN_PROVIDER_STATE');
    expect(timeoutAudit).toBeDefined();
    expect(timeoutAudit?.payloadSummary).toContain('halting blind re-dispatch');

    // KPI verifies provider timeout count
    const kpis = recoveryService.getOverviewKPIs();
    expect(kpis.providerTimeoutCount).toBeGreaterThanOrEqual(1);
  });

  // =========================================================================
  // SCENARIO 5: Duplicate Execution Replay (Idempotency)
  // =========================================================================
  it('Scenario 5: returns cached execution result on duplicate idempotency key without secondary dispatch', async () => {
    recoveryService.setProviderScenarioMode('FORCE_SUCCESS');
    const duplicateKey = 'idmp_key_locked_for_case_01';

    // Execution 1: Normal dispatch
    const res1 = await recoveryService.executeRecovery('CASE-INT-01', duplicateKey);
    expect(res1.success).toBe(true);
    expect(res1.updatedCase.status).toBe('RECOVERED');

    // Execution 2: Same idempotency key replayed
    const res2 = await recoveryService.executeRecovery('CASE-INT-01', duplicateKey);

    // Invariant: Idempotent replay returns same result without re-executing
    expect(res2.success).toBe(true);
    expect(res2.providerResult?.gatewayReferenceNumber).toBe(res1.providerResult?.gatewayReferenceNumber);

    // Audit trail confirms duplicate execution was intercepted and served from cache
    const auditEvents = auditService.getEventsByCase('CASE-INT-01');
    const replayAudit = auditEvents.find(e => e.result === 'IDEMPOTENT_REPLAY');
    expect(replayAudit).toBeDefined();
    expect(replayAudit?.actor).toBe('IDEMPOTENCY_ARBITER');
  });
});
