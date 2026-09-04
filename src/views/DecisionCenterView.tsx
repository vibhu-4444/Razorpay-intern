import React, { useState } from 'react';
import { RecoveryCase } from '../domain/recovery-case';
import { RecoveryService, ExecuteRecoveryResult } from '../services/recovery-service';

interface DecisionCenterViewProps {
  recoveryCase: RecoveryCase;
  recoveryService: RecoveryService;
  onBack: () => void;
  onCaseUpdated: (updatedCase: RecoveryCase) => void;
}

export const DecisionCenterView: React.FC<DecisionCenterViewProps> = ({
  recoveryCase,
  recoveryService,
  onBack,
  onCaseUpdated,
}) => {
  const [activeSimulationState, setActiveSimulationState] = useState<'A' | 'B'>('A');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecuteRecoveryResult | null>(null);

  // State A = Authorized normal case; State B = Simulating policy blocked state
  const isStateA = activeSimulationState === 'A';

  const policyChecks = isStateA
    ? [
        {
          id: 'POL_INV_01',
          name: 'Max Retries Ceiling Gate',
          passed: true,
          expected: '< 3 attempts',
          actual: 'Attempt #1',
          details: 'Within permitted retry budget (1/3)',
        },
        {
          id: 'POL_INV_02',
          name: 'Issuer Cooldown Window Gate',
          passed: true,
          expected: '>= 40s backoff elapsed',
          actual: '42s elapsed',
          details: 'Cooldown complete. Bank switch clear.',
        },
        {
          id: 'POL_INV_03',
          name: 'Customer Velocity Protection Gate',
          passed: true,
          expected: '< 5 interventions / 24h',
          actual: '1 intervention logged',
          details: 'Healthy customer communication rate.',
        },
        {
          id: 'POL_INV_04',
          name: 'Autonomous Value Risk Gate',
          passed: true,
          expected: '<= ₹1,00,000 (Enterprise Tier)',
          actual: '₹4,999',
          details: 'Within autonomous clearing threshold.',
        },
        {
          id: 'POL_INV_05',
          name: 'Fraud & Chargeback Dispute Gate',
          passed: true,
          expected: 'Zero active disputes',
          actual: 'Clean dispute record',
          details: 'No risk alerts flagged on account ledger.',
        },
        {
          id: 'POL_INV_06',
          name: 'Idempotency Integrity Gate',
          passed: true,
          expected: 'Unique uncommitted key',
          actual: 'Key: idmp_991fa02...',
          details: 'Idempotency token verified against double-charge filter.',
        },
      ]
    : [
        {
          id: 'POL_INV_01',
          name: 'Max Retries Ceiling Gate',
          passed: false,
          expected: '< 3 attempts',
          actual: 'Attempt #3',
          details: 'Maximum retry ceiling of 3 reached. Hard block enforced to protect payment rails.',
        },
        {
          id: 'POL_INV_02',
          name: 'Issuer Cooldown Window Gate',
          passed: true,
          expected: '>= 40s backoff elapsed',
          actual: '48s elapsed',
          details: 'Cooldown complete.',
        },
        {
          id: 'POL_INV_03',
          name: 'Customer Velocity Protection Gate',
          passed: true,
          expected: '< 5 interventions / 24h',
          actual: '1 intervention logged',
          details: 'Healthy volume.',
        },
        {
          id: 'POL_INV_04',
          name: 'Autonomous Value Risk Gate',
          passed: true,
          expected: '<= ₹1,00,000',
          actual: '₹4,999',
          details: 'Within threshold.',
        },
        {
          id: 'POL_INV_05',
          name: 'Fraud & Chargeback Dispute Gate',
          passed: false,
          expected: 'Zero active disputes',
          actual: 'Active chargeback dispute',
          details: 'Chargeback dispute filed by cardholder. Autonomous execution prohibited.',
        },
        {
          id: 'POL_INV_06',
          name: 'Idempotency Integrity Gate',
          passed: true,
          expected: 'Unique uncommitted key',
          actual: 'Key: idmp_991fa02...',
          details: 'Token verified.',
        },
      ];

  const passedCount = policyChecks.filter(c => c.passed).length;
  const totalCount = policyChecks.length;
  const isAuthorized = passedCount === totalCount;

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionResult(null);

    try {
      if (!isStateA) {
        // Demonstrate policy blocked response
        setTimeout(() => {
          setExecutionResult({
            success: false,
            policyAllowed: false,
            policyDecision: {
              allowed: false,
              requiresHumanReview: true,
              checksPassed: 4,
              totalChecks: 6,
              evaluatedAt: new Date().toISOString(),
              evaluatedBy: 'REVIVE_POLICY_KERNEL_v2.4',
              policySetVersion: 'POL-REV-2024-Q4.active',
              blockingReason: 'Retry Ceiling Reached (3/3) | Active Chargeback Dispute',
              ruleResults: [],
            },
            updatedCase: {
              ...recoveryCase,
              status: 'BLOCKED',
            },
            message: 'Execution BLOCKED: Max Retries Ceiling reached and active chargeback dispute detected.',
          });
          setIsExecuting(false);
        }, 300);
        return;
      }

      const result = await recoveryService.executeRecovery(recoveryCase.id);
      setExecutionResult(result);
      onCaseUpdated(result.updatedCase);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown execution error';
      // eslint-disable-next-line no-console
      console.error(err);
      setExecutionResult({
        success: false,
        policyAllowed: false,
        policyDecision: {
          allowed: false,
          requiresHumanReview: true,
          checksPassed: 0,
          totalChecks: 6,
          evaluatedAt: new Date().toISOString(),
          evaluatedBy: 'REVIVE_POLICY_KERNEL_v2.4',
          policySetVersion: 'POL-REV-2024-Q4.active',
          ruleResults: [],
        },
        updatedCase: recoveryCase,
        message: errorMessage,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-space-lg">
      {/* Top Dossier Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Case {recoveryCase.id}</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant/30 shadow-xs font-mono">
            AMOUNT: <strong className="text-primary">₹{recoveryCase.amountAtRisk.toLocaleString('en-IN')}.00</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
            MERCHANT: <strong className="text-on-surface">{recoveryCase.customer.name}</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-surface-container-high text-on-secondary-container font-mono">
            {recoveryCase.customer.tier}
          </span>
        </div>
      </div>

      {/* Header & State Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-base">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
            Recovery Decision Center
          </h1>
          <p className="text-xs text-on-surface-variant max-w-2xl">
            Review the recommended intervention and its deterministic authorization status. Execution requires strict adherence to mathematical invariant gates.
          </p>
        </div>

        {/* Interactive Simulation Switcher */}
        <div className="inline-flex p-1 bg-surface-container rounded-lg shadow-inner self-start lg:self-auto">
          <button
            onClick={() => {
              setActiveSimulationState('A');
              setExecutionResult(null);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              isStateA
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-primary-container" />
            <span>State A: Authorized Case (Active)</span>
          </button>
          <button
            onClick={() => {
              setActiveSimulationState('B');
              setExecutionResult(null);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              !isStateA
                ? 'bg-surface-container-lowest text-error font-semibold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-error" />
            <span>State B: Blocked by Policy</span>
          </button>
        </div>
      </div>

      {/* Architectural Guardrail Banner */}
      <div className="p-space-base rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-space-base">
        <div className="flex items-center gap-space-md">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[20px]">shield_with_heart</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface">Architectural Safety Boundary Active</p>
            <p className="text-xs text-on-surface-variant">The AI advisory model produces statistical recommendations only. The deterministic policy engine retains absolute sovereign control over execution triggers.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-outline shrink-0">
          <span>GATEWAY: RAZORPAY_SANDBOX</span>
          <span>•</span>
          <span>IDEMPOTENCY: <code className="text-on-surface">idmp_991fa02</code></span>
        </div>
      </div>

      {/* Bento Grid: AI Recommendation (5 cols) vs Deterministic Policy Authorization (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* LEFT: AI Recommendation Card (Advisory Layer) */}
        <section className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-lg border border-outline-variant/30 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-space-base">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[20px]">auto_awesome</span>
                <span className="text-sm font-semibold text-on-surface">AI Recommendation</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded font-mono text-[11px] font-semibold bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                ADVISORY ONLY
              </span>
            </div>

            {/* Prescribed Action */}
            <div className="p-space-base rounded-lg bg-surface-container-low border border-outline-variant/20">
              <p className="text-[11px] text-outline uppercase tracking-wider mb-1 font-semibold">Prescribed Action</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">Retry Payment</span>
                <span className="text-xs px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-medium">
                  Smart Gateway Switch
                </span>
              </div>
            </div>

            {/* Gauges */}
            <div className="grid grid-cols-2 gap-space-sm pt-1">
              <div className="p-space-sm rounded-lg bg-surface border border-outline-variant/20 flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline text-xs">
                  <span>Model Confidence</span>
                  <span className="material-symbols-outlined text-[16px] text-tertiary">psychology</span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-xl font-bold text-on-surface font-mono">91%</span>
                  <span className="text-[11px] text-outline">L2 Tensor</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-tertiary h-full rounded-full" style={{ width: '91%' }} />
                </div>
              </div>

              <div className="p-space-sm rounded-lg bg-surface border border-outline-variant/20 flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline text-xs">
                  <span>Expected Recovery</span>
                  <span className="material-symbols-outlined text-[16px] text-primary">query_stats</span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-xl font-bold text-on-surface font-mono">86%</span>
                  <span className="text-[11px] text-outline font-mono">p=0.864</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '86%' }} />
                </div>
              </div>
            </div>

            {/* Inference Rationale */}
            <div className="space-y-1.5 pt-1">
              <p className="text-xs font-semibold text-on-surface">Synthesized Inference Rationale</p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                The failure pattern correlates directly with transient bank-side decline (<code className="font-mono text-[11px] text-on-surface px-1 py-0.5 rounded bg-surface-container">E05_ISSUER_TIMEOUT</code>). Acme Labs possesses an unblemished 98.4% 12-month fulfillment record across 7 recent settlements, with zero active retry locks.
              </p>
            </div>
          </div>

          {/* Footer Telemetry */}
          <div className="pt-space-md mt-space-md bg-surface-container-low -mx-space-lg -mb-space-lg p-space-base flex items-center justify-between font-mono text-[11px] text-outline border-t border-surface-container">
            <span>WEIGHT_VECTOR: <strong className="text-on-surface">w_acme_tier1</strong></span>
            <span>LATENCY: <strong className="text-on-surface">142ms</strong></span>
          </div>
        </section>

        {/* RIGHT: Invariant Policy Gatekeeper Card (Deterministic Layer) */}
        <section className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-lg border border-outline-variant/30 shadow-xs flex flex-col justify-between relative">
          <div className="space-y-space-base">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
                <div>
                  <h2 className="text-sm font-semibold text-on-surface">Deterministic Policy Authorization</h2>
                  <p className="text-[11px] text-on-surface-variant">Sovereign programmatic invariants required for execution</p>
                </div>
              </div>

              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isAuthorized
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-300'
              }`}>
                <span className="material-symbols-outlined text-[14px]">
                  {isAuthorized ? 'verified' : 'block'}
                </span>
                <span>{isAuthorized ? `POLICY_PASS_${passedCount}/${totalCount}` : `BLOCKED_${passedCount}/${totalCount}`}</span>
              </span>
            </div>

            {/* Checklist of 6 Invariant Gates */}
            <div className="space-y-2">
              {policyChecks.map((check) => (
                <div
                  key={check.id}
                  className={`p-2.5 rounded-lg border flex items-start justify-between gap-3 text-xs transition-colors ${
                    check.passed
                      ? 'bg-surface-container-low/40 border-outline-variant/20'
                      : 'bg-rose-50/70 border-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 ${
                      check.passed ? 'text-emerald-600' : 'text-error'
                    }`}>
                      {check.passed ? 'check_circle' : 'cancel'}
                    </span>
                    <div>
                      <div className="font-semibold text-on-surface">{check.name}</div>
                      <div className="text-on-surface-variant text-[11px] mt-0.5">{check.details}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono text-[11px]">
                    <div className={check.passed ? 'text-emerald-700 font-medium' : 'text-error font-bold'}>
                      {check.actual}
                    </div>
                    <div className="text-outline text-[10px]">{check.expected}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Execution Result Banner if run */}
            {executionResult && (
              <div className={`p-space-base rounded-lg border text-xs ${
                executionResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  <span className="material-symbols-outlined text-[18px]">
                    {executionResult.success ? 'task_alt' : 'error'}
                  </span>
                  <span>{executionResult.success ? 'Execution Authorized & Settled' : 'Execution Blocked by Guardrail'}</span>
                </div>
                <p className="text-xs leading-relaxed">{executionResult.message}</p>
                {executionResult.providerResult && (
                  <div className="mt-2 font-mono text-[11px] text-slate-700">
                    RRN: {executionResult.providerResult.gatewayReferenceNumber} | Latency: {executionResult.providerResult.executionLatencyMs}ms
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Trigger */}
          <div className="pt-space-base mt-space-base border-t border-surface-container flex items-center justify-between">
            <div className="text-xs text-on-surface-variant">
              <span>Policy Kernel: <code className="font-mono text-on-surface">v2.4-deterministic</code></span>
            </div>

            <button
              onClick={handleExecute}
              disabled={isExecuting || (!isAuthorized && !isStateA)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition-all ${
                isAuthorized
                  ? 'bg-primary text-on-primary hover:bg-primary-container active:scale-95'
                  : 'bg-surface-container text-outline cursor-not-allowed'
              }`}
            >
              {isExecuting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating & Executing...</span>
                </>
              ) : isAuthorized ? (
                <>
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>Authorize & Dispatch Recovery</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">shield</span>
                  <span>Execution Blocked by Policy</span>
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
