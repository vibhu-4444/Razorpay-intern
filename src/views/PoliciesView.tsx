/**
 * REVIVE View: Policies & Guardrails
 * 
 * Configures and explains the 8 deterministic invariant rules governing autonomous execution.
 * Demonstrates strict precedence hierarchy and provides a live policy verdict simulator.
 * 
 * Stitch UI Compliant: Blue/White light theme, Inter font, tabular numbers, dense engineering layout.
 */

import React, { useState } from 'react';
import { defaultPolicyEngine } from '../policy-engine/evaluator';
import { PolicyEvaluationContext, POLICY_RULES } from '../policy-engine/rules';
import { Payment } from '../domain/payment';
import { Customer } from '../domain/customer';
import { RecoveryAction } from '../domain/recovery-action';

export const PoliciesView: React.FC = () => {
  // Live simulation interactive controls
  const [testAmount, setTestAmount] = useState<number>(14500);
  const [testAttemptCount, setTestAttemptCount] = useState<number>(1);
  const [testConfidence, setTestConfidence] = useState<number>(0.85);
  const [testHasDispute, setTestHasDispute] = useState<boolean>(false);
  const [testPaymentStatus, setTestPaymentStatus] = useState<'FAILED' | 'CAPTURED'>('FAILED');
  const [testIsDuplicateKey, setTestIsDuplicateKey] = useState<boolean>(false);

  // Evaluate live policy verdict
  const testPayment: Payment = {
    id: 'pay_test_policy_01',
    merchantId: 'merch_test',
    customerId: 'cust_test',
    amount: testAmount,
    currency: 'INR',
    status: testPaymentStatus,
    method: { type: 'card', maskedIdentifier: '•••• 1234', tokenized: true },
    attemptCount: testAttemptCount,
    maxAllowedAttempts: POLICY_RULES.MAX_RETRIES,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const testCustomer: Customer = {
    id: 'cust_test',
    name: 'Test Customer',
    email: 'test@example.com',
    phoneMasked: '+91 ••••• ••111',
    tier: 'ENTERPRISE',
    metrics: {
      historicalClearedCount: 10,
      historicalFailedCount: 1,
      successRatePercentage: 90,
      accountTenureMonths: 12,
      avgTransactionAmount: testAmount,
      recentRecoveryEvent: false,
      hasActiveDispute: testHasDispute,
    },
    createdAt: new Date().toISOString(),
  };

  const testAction: RecoveryAction = {
    type: 'RETRY_PAYMENT',
    channel: 'GATEWAY_ROUTED_RETRY',
    parameters: { idempotencyKey: testIsDuplicateKey ? 'idemp_duplicate_test' : 'idemp_unique_test' },
    rationale: 'Test evaluation action',
    suggestedAt: new Date().toISOString(),
  };

  const seenKeys = new Set<string>();
  if (testIsDuplicateKey) {
    seenKeys.add('idemp_duplicate_test');
  }

  const evalContext: PolicyEvaluationContext = {
    payment: testPayment,
    customer: testCustomer,
    action: testAction,
    aiConfidence: testConfidence,
    recentAttemptsInWindow: testAttemptCount,
    secondsSinceLastFailure: 120,
    seenIdempotencyKeys: seenKeys,
  };

  const decision = defaultPolicyEngine.evaluate(evalContext);

  const rulesInventory = [
    {
      id: 'POL_INV_00',
      name: 'Payment State Validity Gate',
      precedence: 1,
      category: 'IDEMPOTENCY_INTEGRITY',
      action: 'HARD BLOCK',
      desc: 'Halts recovery if payment is already CAPTURED, CANCELLED, or in non-recoverable state to prevent double-charging.',
    },
    {
      id: 'POL_INV_06',
      name: 'Idempotency Key Integrity',
      precedence: 2,
      category: 'IDEMPOTENCY_INTEGRITY',
      action: 'HARD BLOCK',
      desc: 'Requires a unique, cryptographically sound idempotency token. Replayed keys are intercepted before provider dispatch.',
    },
    {
      id: 'POL_INV_05',
      name: 'Fraud & Chargeback Dispute Gate',
      precedence: 3,
      category: 'FINANCIAL_SAFETY',
      action: 'HARD BLOCK',
      desc: 'Forbids autonomous retries on cards with active cardholder disputes or chargeback alerts.',
    },
    {
      id: 'POL_INV_01',
      name: 'Max Retries Limit (Ceiling: 3)',
      precedence: 4,
      category: 'CUSTOMER_PROTECTION',
      action: 'HARD BLOCK',
      desc: 'Prevents card network spamming. Enforces hard maximum ceiling of 3 attempts per invoice cycle.',
    },
    {
      id: 'POL_INV_02',
      name: 'Cooldown Timing Gate (Min: 30s)',
      precedence: 5,
      category: 'NETWORK_COMPLIANCE',
      action: 'SOFT ROUTE',
      desc: 'Mandates exponential backoff delay before issuing secondary payment attempts to allow issuer clearing.',
    },
    {
      id: 'POL_INV_04',
      name: 'Amount Risk Ceiling (Max: ₹50,000)',
      precedence: 6,
      category: 'FINANCIAL_SAFETY',
      action: 'SOFT ROUTE',
      desc: 'High-ticket charges exceeding ₹50,000 require human operations review before funds movement.',
    },
    {
      id: 'POL_INV_07',
      name: 'AI Confidence Threshold (Min: 60%)',
      precedence: 7,
      category: 'AI_SAFETY',
      action: 'SOFT ROUTE',
      desc: 'AI recommendations with confidence score below 0.60 are rejected from autonomous execution and routed to triage.',
    },
    {
      id: 'POL_INV_03',
      name: 'Customer Velocity Limit (Max: 5/24h)',
      precedence: 8,
      category: 'CUSTOMER_PROTECTION',
      action: 'SOFT ROUTE',
      desc: 'Limits total cumulative recovery touches across all customer billing accounts within a rolling 24-hour window.',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/50 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-2xl">gavel</span>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Policies & Guardrails</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              DETERMINISTIC SUPREMACY
            </span>
          </div>
          <p className="text-sm text-on-surface-variant max-w-3xl">
            Mathematical and legal constraints enforced in strict precedence order.
            AI recommendations are advisory only; the policy kernel holds absolute authority over execution.
          </p>
        </div>

        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 font-mono">
          Kernel: <span className="font-bold">REVIVE_POLICY_KERNEL_v2.4</span>
        </div>
      </div>

      {/* Precedence Hierarchy Diagram Banner */}
      <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm">
        <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
          Strict Policy Precedence Hierarchy
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-bold">
            1. State Validity
          </span>
          <span className="text-outline">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-bold">
            2. Idempotency Key
          </span>
          <span className="text-outline">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-bold">
            3. Fraud / Dispute
          </span>
          <span className="text-outline">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold">
            4. Max Retries (3)
          </span>
          <span className="text-outline">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold">
            5. Amount Cap (₹50k)
          </span>
          <span className="text-outline">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold">
            6. AI Confidence (≥60%)
          </span>
        </div>
      </div>

      {/* Interactive Policy Verdict Simulator */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <div>
            <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">science</span>
              Live Policy Verdict Sandbox
            </h3>
            <p className="text-xs text-on-surface-variant">
              Tweak parameters to test how the deterministic policy kernel arbitrates against incoming proposals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
              decision.allowed
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : decision.requiresHumanReview
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}>
              VERDICT: {decision.allowed ? 'AUTHORIZED' : decision.requiresHumanReview ? 'ESCALATED' : 'BLOCKED'}
            </span>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block text-on-surface-variant font-medium mb-1">Amount (INR)</label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant/50 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="block text-on-surface-variant font-medium mb-1">Attempt Count</label>
            <select
              value={testAttemptCount}
              onChange={(e) => setTestAttemptCount(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant/50 rounded-lg font-mono"
            >
              <option value={1}>1 (First Retry)</option>
              <option value={2}>2 (Second Retry)</option>
              <option value={3}>3 (Ceiling Breach)</option>
            </select>
          </div>

          <div>
            <label className="block text-on-surface-variant font-medium mb-1">AI Confidence</label>
            <select
              value={testConfidence}
              onChange={(e) => setTestConfidence(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant/50 rounded-lg font-mono"
            >
              <option value={0.92}>92% (High)</option>
              <option value={0.75}>75% (Adequate)</option>
              <option value={0.48}>48% (Low &lt;60%)</option>
            </select>
          </div>

          <div>
            <label className="block text-on-surface-variant font-medium mb-1">Payment Status</label>
            <select
              value={testPaymentStatus}
              onChange={(e) => setTestPaymentStatus(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant/50 rounded-lg font-mono"
            >
              <option value="FAILED">FAILED (Eligible)</option>
              <option value="CAPTURED">CAPTURED (Settled)</option>
            </select>
          </div>

          <div>
            <label className="block text-on-surface-variant font-medium mb-1">Customer Dispute</label>
            <select
              value={testHasDispute ? 'YES' : 'NO'}
              onChange={(e) => setTestHasDispute(e.target.value === 'YES')}
              className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant/50 rounded-lg font-mono"
            >
              <option value="NO">No Active Dispute</option>
              <option value="YES">Active Dispute Flag</option>
            </select>
          </div>

          <div>
            <label className="block text-on-surface-variant font-medium mb-1">Idempotency Token</label>
            <select
              value={testIsDuplicateKey ? 'DUP' : 'UNIQ'}
              onChange={(e) => setTestIsDuplicateKey(e.target.value === 'DUP')}
              className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant/50 rounded-lg font-mono"
            >
              <option value="UNIQ">Unique Token</option>
              <option value="DUP">Replayed Token</option>
            </select>
          </div>
        </div>

        {/* Verdict Explanation Bar */}
        <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <span className="font-semibold text-on-surface">Kernel Explanation: </span>
            <span className="text-on-surface-variant">
              {decision.blockingReason ?? 'All 8 deterministic invariant checks passed. Autonomous bounded action approved.'}
            </span>
          </div>
          <span className="font-mono text-[11px] text-on-surface-variant shrink-0">
            Checks Passed: {decision.checksPassed}/{decision.totalChecks}
          </span>
        </div>
      </div>

      {/* Policy Rules Inventory */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 font-bold text-sm text-on-surface">
          Active Invariant Rules Inventory (8 Rules Enforced)
        </div>
        <div className="divide-y divide-outline-variant/30">
          {rulesInventory.map((r) => (
            <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-low transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">{r.id}</span>
                  <span className="font-semibold text-sm text-on-surface">{r.name}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    r.action === 'HARD BLOCK' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-800'
                  }`}>
                    {r.action}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">{r.desc}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] font-mono px-2 py-1 rounded bg-surface-container text-on-surface-variant">
                  Priority: #{r.precedence}
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
