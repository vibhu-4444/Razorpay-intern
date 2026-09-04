import React, { useState } from 'react';
import { PageHeader } from '../design-system';
import { RecoveryCase } from '../domain/recovery-case';

interface ExceptionsViewProps {
  cases: RecoveryCase[];
  onSelectCase: (id: string) => void;
  onOpenDecisionCenter: (id: string) => void;
}

export const ExceptionsView: React.FC<ExceptionsViewProps> = ({
  cases,
  onSelectCase,
  onOpenDecisionCenter,
}) => {
  const exceptionCases = cases.filter(
    c => c.status === 'NEEDS_REVIEW' || c.status === 'BLOCKED' || c.riskLevel === 'HIGH'
  );

  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    exceptionCases[0]?.id ?? 'RP-10480'
  );

  const activeCase = cases.find(c => c.id === selectedCaseId) ?? exceptionCases[0] ?? cases[0];

  return (
    <div className="flex flex-col space-y-space-lg">
      {/* Page Header */}
      <PageHeader
        title="Exceptions & Human Review"
        subtitle="High-stakes transactions, policy violations, and low-confidence autonomous decisions requiring manual clearance."
      >
        <button className="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-xs font-medium shadow-xs hover:bg-surface-container-low transition-all flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">tune</span>
          <span>Escalation Rules</span>
        </button>
        <button className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-medium shadow-xs hover:bg-primary-container transition-all flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          <span>Re-evaluate All</span>
        </button>
      </PageHeader>

      {/* 4 Stat Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Needs Review */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-base border border-outline-variant/30 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                Needs Review
              </span>
              <div className="text-2xl font-bold text-on-surface font-mono mt-1">12</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-secondary-container/40 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">assignment_late</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded text-[11px] bg-secondary-container text-on-secondary-container font-medium">
              Action Required
            </span>
            <span className="text-xs text-on-surface-variant">Manual clearance pending</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary" />
        </div>

        {/* Policy Blocked */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-base border border-outline-variant/30 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                Policy Blocked
              </span>
              <div className="text-2xl font-bold text-error font-mono mt-1">27</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-error-container text-on-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">shield_lock</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded text-[11px] bg-error-container text-on-error-container font-medium">
              Hard Safety Limit
            </span>
            <span className="text-xs text-on-surface-variant">Max retry ceilings hit</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-error" />
        </div>

        {/* Low Confidence */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-base border border-outline-variant/30 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                Low Confidence
              </span>
              <div className="text-2xl font-bold text-tertiary font-mono mt-1">8</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">psychology_alt</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded text-[11px] bg-tertiary-fixed text-on-tertiary-fixed-variant font-medium">
              &lt; 60% Confidence
            </span>
            <span className="text-xs text-on-surface-variant">Ambiguous telemetry</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-tertiary" />
        </div>

        {/* Provider Failure */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-base border border-outline-variant/30 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                Provider Failure
              </span>
              <div className="text-2xl font-bold text-secondary font-mono mt-1">5</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded text-[11px] bg-surface-container text-on-surface-variant font-medium">
              Gateway Timeout
            </span>
            <span className="text-xs text-on-surface-variant">Razorpay nodes</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-outline" />
        </div>
      </div>

      {/* Split Review Workspace: Left Queue (7 cols) / Right Triage Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Queue Table */}
        <section className="lg:col-span-7 flex flex-col gap-space-sm bg-surface-container-lowest p-space-base rounded-xl border border-outline-variant/30 shadow-xs">
          <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
            <div className="relative flex-1 max-w-xs">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-outline">
                search
              </span>
              <input
                type="text"
                placeholder="Filter exceptions..."
                className="w-full h-8 pl-8 pr-3 rounded-lg bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <span className="text-xs text-outline font-mono">
              {exceptionCases.length} items in triage queue
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-secondary text-xs uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-xs text-on-surface">
                {exceptionCases.map((c) => {
                  const isSelected = c.id === selectedCaseId;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-surface-container-high/60 font-medium'
                          : 'hover:bg-surface-container-low/60'
                      }`}
                    >
                      <td className="py-3 px-3 font-mono text-primary font-semibold">
                        {c.id}
                      </td>
                      <td className="py-3 px-3">
                        <div>{c.customer.name}</div>
                        <div className="text-[11px] text-outline">{c.customer.tier}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold">
                        ₹{c.amountAtRisk.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-on-surface-variant">
                        {c.payment.failure?.description ?? 'Manual triage'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                          c.status === 'BLOCKED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Triage & Action Panel */}
        {activeCase && (
          <section className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/30 shadow-xs flex flex-col gap-space-base">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <div>
                <span className="text-[11px] text-outline font-mono">SELECTED EXCEPTION</span>
                <h3 className="text-base font-bold text-on-surface">Case {activeCase.id}</h3>
              </div>
              <button
                onClick={() => onOpenDecisionCenter(activeCase.id)}
                className="px-2.5 py-1 rounded bg-surface-container text-primary text-xs font-semibold hover:bg-primary hover:text-on-primary transition-colors"
              >
                Decision Center →
              </button>
            </div>

            {/* Account & Reason Summary */}
            <div className="p-space-base rounded-lg bg-surface-container-low flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">Merchant Account</span>
                <span className="text-xs font-bold text-on-surface">{activeCase.customer.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">Invoice Value</span>
                <span className="text-sm font-bold font-mono text-primary">₹{activeCase.amountAtRisk.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">Failure Diagnostic</span>
                <span className="text-xs text-error font-medium">{activeCase.payment.failure?.description}</span>
              </div>
            </div>

            {/* Policy Blocker Explanation */}
            <div className="p-space-base rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <div className="font-semibold flex items-center gap-1.5 mb-1 text-amber-800">
                <span className="material-symbols-outlined text-[16px]">gavel</span>
                <span>Deterministic Invariant Flag</span>
              </div>
              <p>
                {activeCase.policyDecision?.blockingReason ?? 'Manual intervention policy rule triggered for this tier. Requires authorized operator clearance to bypass or reschedule.'}
              </p>
            </div>

            {/* Triage Decision Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => onOpenDecisionCenter(activeCase.id)}
                className="w-full py-2 px-3 rounded-lg bg-primary text-on-primary text-xs font-semibold shadow-xs hover:bg-primary-container transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Inspect Guardrails & Clear</span>
              </button>
              <button
                onClick={() => onSelectCase(activeCase.id)}
                className="w-full py-2 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-xs font-medium hover:bg-surface-container-low transition-colors"
              >
                View Full Forensic Dossier
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
