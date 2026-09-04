import React, { useState } from 'react';
import { RecoveryCase } from '../domain/recovery-case';
import { RecoveryService, ExecuteRecoveryResult } from '../services/recovery-service';

export type SimulationScenario = 
  | 'AUTHORIZED'
  | 'FORCE_TIMEOUT'
  | 'POLICY_BLOCKED'
  | 'LOW_CONFIDENCE';

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
  const [activeScenario, setActiveScenario] = useState<SimulationScenario>('AUTHORIZED');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecuteRecoveryResult | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const isAuthorizedScenario = activeScenario === 'AUTHORIZED' || activeScenario === 'FORCE_TIMEOUT';

  // Dynamic policy check cards tailored to the active simulation scenario
  const policyChecks = [
    {
      id: 'POL_INV_00',
      name: 'Payment State Validity Gate',
      passed: true,
      expected: 'Status: FAILED / PENDING',
      actual: `Status: ${recoveryCase.payment.status}`,
      details: 'Payment state eligible for re-clearance. Not previously captured.',
    },
    {
      id: 'POL_INV_01',
      name: 'Max Retries Ceiling Gate',
      passed: activeScenario !== 'POLICY_BLOCKED',
      expected: '< 3 attempts',
      actual: activeScenario === 'POLICY_BLOCKED' ? 'Attempt #3' : `Attempt #${recoveryCase.payment.attemptCount || 1}`,
      details: activeScenario === 'POLICY_BLOCKED'
        ? 'Maximum retry ceiling of 3 reached. Hard block enforced to protect merchant rails.'
        : `Within permitted retry budget (${recoveryCase.payment.attemptCount || 1}/3).`,
    },
    {
      id: 'POL_INV_02',
      name: 'Issuer Cooldown Window Gate',
      passed: true,
      expected: '>= 40s backoff elapsed',
      actual: '48s elapsed',
      details: 'Issuer cooldown window complete. Bank switch clear for re-attempt.',
    },
    {
      id: 'POL_INV_03',
      name: 'Customer Velocity Protection Gate',
      passed: true,
      expected: '< 5 interventions / 24h',
      actual: '1 intervention logged',
      details: 'Customer notification rate within healthy limits.',
    },
    {
      id: 'POL_INV_04',
      name: 'Autonomous Value Risk Gate',
      passed: true,
      expected: `<= ₹1,00,000 (${recoveryCase.customer.tier} Tier)`,
      actual: `₹${recoveryCase.amountAtRisk.toLocaleString('en-IN')}`,
      details: 'Amount is within autonomous clearance risk budget.',
    },
    {
      id: 'POL_INV_05',
      name: 'Fraud & Chargeback Dispute Gate',
      passed: true,
      expected: 'Zero active disputes',
      actual: 'Clean dispute record',
      details: 'No risk alerts flagged on customer account ledger.',
    },
    {
      id: 'POL_INV_06',
      name: 'Idempotency Integrity Gate',
      passed: true,
      expected: 'Unique uncommitted key',
      actual: 'Key: idmp_991fa02...',
      details: 'Idempotency token verified against double-charge replay filter.',
    },
    {
      id: 'POL_INV_07',
      name: 'Minimum AI Confidence Gate',
      passed: activeScenario !== 'LOW_CONFIDENCE',
      expected: '>= 60% confidence',
      actual: activeScenario === 'LOW_CONFIDENCE' ? '48% confidence' : '91% confidence',
      details: activeScenario === 'LOW_CONFIDENCE'
        ? 'Model confidence (48%) is below 60% threshold. Automated execution halted; human review required.'
        : 'AI model confidence meets minimum threshold for autonomous clearance.',
    },
  ];

  const passedCount = policyChecks.filter(c => c.passed).length;
  const totalCount = policyChecks.length;
  const isAuthorized = passedCount === totalCount;

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    setCurrentStep(1);

    try {
      // Step 1: Policy validation animation
      await new Promise(r => setTimeout(r, 200));
      setCurrentStep(2);

      if (activeScenario === 'POLICY_BLOCKED') {
        const blockedResult: ExecuteRecoveryResult = {
          success: false,
          policyAllowed: false,
          policyDecision: {
            allowed: false,
            requiresHumanReview: false,
            checksPassed: 7,
            totalChecks: 8,
            evaluatedAt: new Date().toISOString(),
            evaluatedBy: 'REVIVE_POLICY_KERNEL_v2.4',
            policySetVersion: 'POL-REV-2024-Q4.active',
            blockingRule: 'Max Retries Ceiling Gate',
            blockingReason: 'POL_INV_01: Maximum retry ceiling of 3 reached. Hard block enforced to protect payment rails.',
            ruleResults: [],
          },
          updatedCase: {
            ...recoveryCase,
            status: 'BLOCKED',
          },
          message: 'Execution BLOCKED: Maximum retry ceiling (3) reached. Provider dispatch halted.',
        };
        setExecutionResult(blockedResult);
        onCaseUpdated(blockedResult.updatedCase);
        setIsExecuting(false);
        setCurrentStep(0);
        return;
      }

      if (activeScenario === 'LOW_CONFIDENCE') {
        const lowConfResult: ExecuteRecoveryResult = {
          success: false,
          policyAllowed: false,
          policyDecision: {
            allowed: false,
            requiresHumanReview: true,
            checksPassed: 7,
            totalChecks: 8,
            evaluatedAt: new Date().toISOString(),
            evaluatedBy: 'REVIVE_POLICY_KERNEL_v2.4',
            policySetVersion: 'POL-REV-2024-Q4.active',
            blockingRule: 'Minimum AI Confidence Gate',
            blockingReason: 'AI confidence is too low (48% < 60%). Automated execution requires human clearance.',
            ruleResults: [],
          },
          updatedCase: {
            ...recoveryCase,
            status: 'NEEDS_REVIEW',
          },
          message: 'Execution ROUTED TO REVIEW: AI confidence below 60%. Escalated to Operations Review.',
        };
        setExecutionResult(lowConfResult);
        onCaseUpdated(lowConfResult.updatedCase);
        setIsExecuting(false);
        setCurrentStep(0);
        return;
      }

      // Step 2 & 3: Configure provider mode and execute
      await new Promise(r => setTimeout(r, 200));
      setCurrentStep(3);

      if (activeScenario === 'FORCE_TIMEOUT') {
        recoveryService.setProviderScenarioMode('FORCE_TIMEOUT');
      } else {
        recoveryService.setProviderScenarioMode('FORCE_SUCCESS');
      }

      // Execute via application recovery service
      const result = await recoveryService.executeRecovery(recoveryCase.id);

      // Step 4: Ledger settlement
      setCurrentStep(4);
      await new Promise(r => setTimeout(r, 150));

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
          totalChecks: 8,
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
      setCurrentStep(0);
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

      {/* Header & Scenario Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-base">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
            Recovery Decision Center
          </h1>
          <p className="text-xs text-on-surface-variant max-w-2xl">
            Inspect autonomous recovery proposal, deterministic invariant verification, and trigger bounded provider execution.
          </p>
        </div>

        {/* Multi-Scenario Demonstration Switcher */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-surface-container rounded-lg shadow-inner self-start lg:self-auto">
          <button
            onClick={() => {
              setActiveScenario('AUTHORIZED');
              setExecutionResult(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeScenario === 'AUTHORIZED'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Authorized (Normal)</span>
          </button>

          <button
            onClick={() => {
              setActiveScenario('FORCE_TIMEOUT');
              setExecutionResult(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeScenario === 'FORCE_TIMEOUT'
                ? 'bg-surface-container-lowest text-amber-600 shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Gateway Timeout (Safe Failure)</span>
          </button>

          <button
            onClick={() => {
              setActiveScenario('POLICY_BLOCKED');
              setExecutionResult(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeScenario === 'POLICY_BLOCKED'
                ? 'bg-surface-container-lowest text-error shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-error" />
            <span>Policy Blocked</span>
          </button>

          <button
            onClick={() => {
              setActiveScenario('LOW_CONFIDENCE');
              setExecutionResult(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeScenario === 'LOW_CONFIDENCE'
                ? 'bg-surface-container-lowest text-tertiary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-tertiary" />
            <span>Low Confidence (&lt;60%)</span>
          </button>
        </div>
      </div>

      {/* Architectural Safety Boundary Banner */}
      <div className="p-space-base rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-space-base">
        <div className="flex items-center gap-space-md">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[20px]">shield_with_heart</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface">Architectural Safety Boundary Active</p>
            <p className="text-xs text-on-surface-variant">The AI advisory model produces statistical proposals only. The deterministic policy engine holds absolute sovereign control over provider execution triggers.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-outline shrink-0">
          <span>RAILS: SIMULATOR_SANDBOX</span>
          <span>•</span>
          <span>IDEMPOTENCY: <code className="text-on-surface">idmp_{recoveryCase.id.toLowerCase()}_active</code></span>
        </div>
      </div>

      {/* Execution Stepper Progress (when executing) */}
      {isExecuting && (
        <div className="p-space-base rounded-xl bg-surface-container-lowest border border-primary/30 shadow-xs">
          <div className="text-xs font-semibold text-on-surface mb-2 flex items-center justify-between">
            <span>Autonomous Execution Trace</span>
            <span className="font-mono text-primary animate-pulse">Step {currentStep}/4</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs font-mono">
            <div className={`p-2 rounded border ${currentStep >= 1 ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' : 'bg-surface-container-low text-slate-400'}`}>
              1. Policy Invariants
            </div>
            <div className={`p-2 rounded border ${currentStep >= 2 ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' : 'bg-surface-container-low text-slate-400'}`}>
              2. Idempotency Lock
            </div>
            <div className={`p-2 rounded border ${currentStep >= 3 ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' : 'bg-surface-container-low text-slate-400'}`}>
              3. Gateway Dispatch
            </div>
            <div className={`p-2 rounded border ${currentStep >= 4 ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-surface-container-low text-slate-400'}`}>
              4. Ledger Settlement
            </div>
          </div>
        </div>
      )}

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
                <span className="text-lg font-bold text-primary">
                  {recoveryCase.recommendedAction?.type === 'RETRY_PAYMENT' ? 'Retry Payment' : 'Smart Dunning Sequence'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-medium">
                  {recoveryCase.recommendedAction?.channel ?? 'Fallback Gateway'}
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
                  <span className="text-xl font-bold text-on-surface font-mono">
                    {activeScenario === 'LOW_CONFIDENCE' ? '48%' : `${recoveryCase.diagnosis?.confidencePercentage ?? 91}%`}
                  </span>
                  <span className="text-[11px] text-outline">
                    {activeScenario === 'LOW_CONFIDENCE' ? 'Low' : 'L2 Tensor'}
                  </span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${activeScenario === 'LOW_CONFIDENCE' ? 'bg-amber-500' : 'bg-tertiary'}`}
                    style={{ width: activeScenario === 'LOW_CONFIDENCE' ? '48%' : `${recoveryCase.diagnosis?.confidencePercentage ?? 91}%` }}
                  />
                </div>
              </div>

              <div className="p-space-sm rounded-lg bg-surface border border-outline-variant/20 flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline text-xs">
                  <span>Expected Recovery</span>
                  <span className="material-symbols-outlined text-[16px] text-primary">query_stats</span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-xl font-bold text-on-surface font-mono">
                    {activeScenario === 'LOW_CONFIDENCE' ? '35%' : `${recoveryCase.diagnosis?.expectedRecoveryPercentage ?? 86}%`}
                  </span>
                  <span className="text-[11px] text-outline font-mono">p=0.864</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: activeScenario === 'LOW_CONFIDENCE' ? '35%' : `${recoveryCase.diagnosis?.expectedRecoveryPercentage ?? 86}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Inference Rationale */}
            <div className="space-y-1.5 pt-1">
              <p className="text-xs font-semibold text-on-surface">Synthesized Inference Rationale</p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {recoveryCase.recommendedAction?.rationale ?? 
                  `The failure pattern correlates with transient bank-side decline (${recoveryCase.payment.failure?.code ?? 'E05_ISSUER_TIMEOUT'}). Customer exhibits an unblemished record with zero active retry locks.`}
              </p>
            </div>
          </div>

          {/* Footer Telemetry */}
          <div className="pt-space-md mt-space-md bg-surface-container-low -mx-space-lg -mb-space-lg p-space-base flex items-center justify-between font-mono text-[11px] text-outline border-t border-surface-container">
            <span>WEIGHT_VECTOR: <strong className="text-on-surface">{recoveryCase.diagnosis?.weightVector ?? 'w_acme_tier1'}</strong></span>
            <span>LATENCY: <strong className="text-on-surface">{recoveryCase.diagnosis?.inferenceLatencyMs ?? 142}ms</strong></span>
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

            {/* Checklist of Invariant Gates */}
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
                  : executionResult.updatedCase.status === 'ESCALATED'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  <span className="material-symbols-outlined text-[18px]">
                    {executionResult.success ? 'task_alt' : executionResult.updatedCase.status === 'ESCALATED' ? 'warning' : 'error'}
                  </span>
                  <span>
                    {executionResult.success
                      ? 'Execution Authorized & Settled'
                      : executionResult.updatedCase.status === 'ESCALATED'
                      ? 'Safe Failure Mode Triggered (Escalated to Human Review)'
                      : 'Execution Blocked by Guardrail'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed">{executionResult.message}</p>
                {executionResult.providerResult && (
                  <div className="mt-2 font-mono text-[11px] text-slate-700 flex items-center justify-between border-t border-current/10 pt-1.5">
                    <span>RRN: {executionResult.providerResult.gatewayReferenceNumber}</span>
                    <span>Status: {executionResult.providerResult.statusCode}</span>
                    <span>Latency: {executionResult.providerResult.executionLatencyMs}ms</span>
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
              disabled={isExecuting}
              className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition-all ${
                isAuthorizedScenario
                  ? 'bg-primary text-on-primary hover:bg-primary-container active:scale-95'
                  : 'bg-rose-600 text-white hover:bg-rose-700'
              }`}
            >
              {isExecuting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating & Executing...</span>
                </>
              ) : isAuthorizedScenario ? (
                <>
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>Authorize & Dispatch Recovery</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">security</span>
                  <span>Test Guardrail Rejection</span>
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
