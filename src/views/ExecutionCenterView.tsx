/**
 * REVIVE View: Recovery Execution Center
 * 
 * Step-by-step observable execution cockpit illustrating pre-execution bounds,
 * real-time phase progression (validating, policy gate, idempotency, dispatch, audit),
 * and unambiguous post-execution outcome status.
 * 
 * Stitch UI Compliant: Blue/White light theme, Inter font, tabular numbers, dense engineering layout.
 */

import React, { useState } from 'react';
import { defaultRecoveryService } from '../services/recovery-service';
import { RecoveryCase } from '../domain/recovery-case';

export const ExecutionCenterView: React.FC = () => {
  const cases = defaultRecoveryService.getAllCases();
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id ?? 'RP-10482');
  const [executionState, setExecutionState] = useState<'IDLE' | 'EXECUTING' | 'COMPLETED'>('IDLE');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [executionOutcome, setExecutionOutcome] = useState<{
    status: 'SUCCESS' | 'FAILURE' | 'UNKNOWN';
    message: string;
    gatewayRrn?: string;
    financialEffectCompleted: boolean;
  } | null>(null);

  const selectedCase: RecoveryCase = cases.find((c) => c.id === selectedCaseId) ?? cases[0];

  const executionSteps = [
    { title: 'Validating Payment Context', desc: 'Verifying payment is in recoverable state (not settled)' },
    { title: 'Evaluating Deterministic Policy', desc: 'Checking 8 invariant rules (attempts, amount cap, dispute)' },
    { title: 'Verifying Idempotency Cache', desc: 'Checking deduplication key to prevent duplicate dispatch' },
    { title: 'Executing Provider Rail Action', desc: 'Dispatching bounded retry to payment gateway simulator' },
    { title: 'Receiving Gateway Telemetry', desc: 'Parsing issuer authorization response and RRN code' },
    { title: 'Writing Cryptographic Audit', desc: 'Appending immutable SHA-256 event to ledger' },
  ];

  const handleStartExecution = () => {
    setExecutionState('EXECUTING');
    setActiveStepIndex(0);
    setExecutionOutcome(null);

    // Simulate observable step progression
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < executionSteps.length) {
        setActiveStepIndex(step);
      } else {
        clearInterval(interval);
        setExecutionState('COMPLETED');

        // Check if case is blocked by policy
        if (selectedCase.policyDecision && !selectedCase.policyDecision.allowed) {
          setExecutionOutcome({
            status: 'FAILURE',
            message: `Policy Block: ${selectedCase.policyDecision.blockingReason ?? 'Invariant check failed'}. No financial action was completed.`,
            financialEffectCompleted: false,
          });
        } else if (selectedCase.payment.failure?.category === 'NETWORK_TIMEOUT') {
          setExecutionOutcome({
            status: 'UNKNOWN',
            message: 'Gateway 504 Timeout: UNKNOWN_PROVIDER_STATE. Automated re-dispatch suppressed to prevent double-charging.',
            gatewayRrn: 'RRN_TIMEOUT_504_GATEWAY',
            financialEffectCompleted: false,
          });
        } else {
          setExecutionOutcome({
            status: 'SUCCESS',
            message: `Issuer authorized charge. ₹${selectedCase.payment.amount.toLocaleString('en-IN')} captured into merchant escrow.`,
            gatewayRrn: `RRN${Math.floor(100000000000 + Math.random() * 900000000000)}`,
            financialEffectCompleted: true,
          });
        }
      }
    }, 450);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/50 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-2xl">sync_saved_locally</span>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Recovery Execution Center</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              OBSERVABLE COCKPIT
            </span>
          </div>
          <p className="text-sm text-on-surface-variant max-w-3xl">
            Real-time step-by-step visualization of recovery authorization and execution.
            Every stage from payment validation to cryptographic audit ledger recording is observable.
          </p>
        </div>

        {/* Case Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-on-surface-variant">Select Case:</label>
          <select
            value={selectedCaseId}
            onChange={(e) => {
              setSelectedCaseId(e.target.value);
              setExecutionState('IDLE');
              setExecutionOutcome(null);
            }}
            className="px-3 py-1.5 bg-surface-container-low border border-outline-variant/50 rounded-lg text-xs font-mono font-bold text-primary focus:outline-none"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.customer.name} (₹{c.payment.amount.toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Before Execution Card */}
      <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">info</span>
            Pre-Execution Bounded Context
          </h3>
          <span className="text-xs font-mono text-on-surface-variant">
            State: Pre-Dispatch Verification
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 bg-surface-container-low rounded-lg">
            <div className="text-on-surface-variant font-medium">Payment ID</div>
            <div className="font-mono font-bold text-on-surface mt-1 truncate">{selectedCase.payment.id}</div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-lg">
            <div className="text-on-surface-variant font-medium">Amount (INR)</div>
            <div className="font-mono font-bold text-on-surface mt-1">₹{selectedCase.payment.amount.toLocaleString('en-IN')}</div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-lg">
            <div className="text-on-surface-variant font-medium">AI Action</div>
            <div className="font-mono font-bold text-primary mt-1">{selectedCase.recommendedAction?.type ?? 'RETRY_PAYMENT'}</div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-lg">
            <div className="text-on-surface-variant font-medium">Attempt Index</div>
            <div className="font-mono font-bold text-on-surface mt-1">
              Attempt {selectedCase.payment.attemptCount} of {selectedCase.payment.maxAllowedAttempts}
            </div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-lg">
            <div className="text-on-surface-variant font-medium">AI Confidence</div>
            <div className="font-mono font-bold text-indigo-700 mt-1">
              {Math.round((selectedCase.diagnosis?.confidence ?? 0.88) * 100)}%
            </div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-lg">
            <div className="text-on-surface-variant font-medium">Policy Gate</div>
            <div className={`font-mono font-bold mt-1 ${
              selectedCase.policyDecision?.allowed ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {selectedCase.policyDecision?.allowed ? 'PASS (8/8)' : 'BLOCKED'}
            </div>
          </div>
        </div>

        {/* Action Trigger */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-on-surface-variant">
            Ready to execute bounded recovery workflow against live simulation rail.
          </div>

          <button
            onClick={handleStartExecution}
            disabled={executionState === 'EXECUTING'}
            className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">
              {executionState === 'EXECUTING' ? 'autorenew' : 'bolt'}
            </span>
            {executionState === 'EXECUTING' ? 'Executing Workflow...' : 'Execute Recovery Workflow'}
          </button>
        </div>
      </div>

      {/* During Execution: Observable Step Pipeline */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">linear_scale</span>
            Execution Phase Progression
          </h3>
          <span className="text-xs font-mono text-on-surface-variant">
            {executionState === 'IDLE' ? 'Awaiting Dispatch' : executionState === 'EXECUTING' ? `Phase ${activeStepIndex + 1} of 6` : 'Execution Finalized'}
          </span>
        </div>

        <div className="space-y-3">
          {executionSteps.map((step, idx) => {
            const isCompleted = executionState === 'COMPLETED' || (executionState === 'EXECUTING' && idx < activeStepIndex);
            const isCurrent = executionState === 'EXECUTING' && idx === activeStepIndex;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  isCurrent
                    ? 'bg-primary-container/20 border-primary shadow-sm ring-1 ring-primary/30'
                    : isCompleted
                    ? 'bg-surface-container-lowest border-emerald-200'
                    : 'bg-surface-container-low/50 border-outline-variant/20 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-primary text-white animate-pulse'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    ) : (
                      idx + 1
                    )}
                  </div>

                  <div>
                    <div className="font-semibold text-xs text-on-surface">{step.title}</div>
                    <div className="text-[11px] text-on-surface-variant">{step.desc}</div>
                  </div>
                </div>

                <div className="font-mono text-[11px]">
                  {isCompleted && (
                    <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[14px]">done_all</span>
                      Verified
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-primary font-bold animate-pulse">Running...</span>
                  )}
                  {!isCompleted && !isCurrent && (
                    <span className="text-outline">Pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* After Execution Outcome Card */}
      {executionOutcome && (
        <div className={`p-6 rounded-xl border shadow-sm space-y-3 ${
          executionOutcome.status === 'SUCCESS'
            ? 'bg-emerald-50/70 border-emerald-300'
            : executionOutcome.status === 'UNKNOWN'
            ? 'bg-amber-50/70 border-amber-300'
            : 'bg-rose-50/70 border-rose-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-2xl ${
                executionOutcome.status === 'SUCCESS' ? 'text-emerald-700' : executionOutcome.status === 'UNKNOWN' ? 'text-amber-700' : 'text-rose-700'
              }`}>
                {executionOutcome.status === 'SUCCESS' ? 'check_circle' : executionOutcome.status === 'UNKNOWN' ? 'help' : 'cancel'}
              </span>
              <h3 className={`font-bold text-base ${
                executionOutcome.status === 'SUCCESS' ? 'text-emerald-950' : executionOutcome.status === 'UNKNOWN' ? 'text-amber-950' : 'text-rose-950'
              }`}>
                Execution Outcome: {executionOutcome.status}
              </h3>
            </div>

            <span className="text-xs font-mono font-bold bg-white/80 px-2.5 py-1 rounded shadow-xs">
              {executionOutcome.financialEffectCompleted ? 'FUNDS CAPTURED' : 'NO FINANCIAL ACTION COMPLETED'}
            </span>
          </div>

          <p className="text-xs text-on-surface leading-relaxed">{executionOutcome.message}</p>

          {executionOutcome.gatewayRrn && (
            <div className="text-xs font-mono pt-2 border-t border-black/10 flex items-center justify-between">
              <span>Gateway Retrieval Reference (RRN): <strong className="text-primary">{executionOutcome.gatewayRrn}</strong></span>
              <span className="text-emerald-800 font-semibold">Audit Ledger Finalized</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
