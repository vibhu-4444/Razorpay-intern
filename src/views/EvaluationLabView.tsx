import React from 'react';
import { PageHeader } from '../design-system';

export const EvaluationLabView: React.FC = () => {
  const benchmarkScenarios = [
    {
      id: 'SCN-001',
      name: 'Transient Issuer Network Timeout',
      archetype: 'Bank Decline (E05)',
      aiRec: 'Retry (40s cooldown)',
      policyGate: 'PASS (6/6)',
      expected: 'Recovered on 2nd attempt',
      status: 'VERIFIED',
    },
    {
      id: 'SCN-002',
      name: 'Hard Account Closure / Card Expired',
      archetype: 'Card Expired (E54)',
      aiRec: 'Offer Mandate Link',
      policyGate: 'PASS (6/6)',
      expected: 'Zero wasteful retries dispatched',
      status: 'VERIFIED',
    },
    {
      id: 'SCN-003',
      name: 'Exhausted Daily Retry Budget',
      archetype: 'Velocity Cap Hit',
      aiRec: 'Retry Payment (Low confidence)',
      policyGate: 'BLOCKED (POL_INV_01)',
      expected: 'Automated retry strictly blocked',
      status: 'VERIFIED',
    },
    {
      id: 'SCN-004',
      name: 'Active Cardholder Chargeback Dispute',
      archetype: 'Fraud Risk Flag',
      aiRec: 'Smart Dunning',
      policyGate: 'BLOCKED (POL_INV_05)',
      expected: 'Halted; no dunning sent to disputed user',
      status: 'VERIFIED',
    },
    {
      id: 'SCN-005',
      name: 'High Value Enterprise Mandate',
      archetype: 'Amount Cap (> ₹50,000)',
      aiRec: 'Fallback Gateway Switch',
      policyGate: 'NEEDS_REVIEW (POL_INV_04)',
      expected: 'Escalated to human operations review',
      status: 'VERIFIED',
    },
  ];

  return (
    <div className="flex flex-col space-y-space-lg">
      <PageHeader
        title="Evaluation Lab"
        subtitle="Evaluate recovery decisions against controlled synthetic payment scenarios."
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low text-xs border border-outline-variant/30">
          <span className="material-symbols-outlined text-[16px] text-tertiary">science</span>
          <span className="font-semibold uppercase tracking-wider">SIMULATION</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-xs font-mono">
          <span className="text-outline">Dataset:</span>
          <span className="font-bold text-on-surface">v1.4-benchmark</span>
        </div>
      </PageHeader>

      {/* Primary Summary Card */}
      <div className="rounded-xl bg-surface-container-lowest p-space-lg border border-outline-variant/30 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg pb-space-lg border-b border-surface-container">
          <div className="flex flex-wrap items-center gap-x-space-lg gap-y-space-sm text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="text-base font-bold text-on-surface">Evaluation Run #014</span>
            </div>
            <div className="h-4 w-px bg-outline-variant/30 hidden sm:block" />
            <div>
              <span className="text-outline">Dataset: </span>
              <strong className="text-on-surface">Recovery Scenarios v1.4</strong>
            </div>
            <div className="h-4 w-px bg-outline-variant/30 hidden sm:block" />
            <div>
              <span className="text-outline">Corpus: </span>
              <strong className="text-on-surface font-mono">500 Synthetics</strong>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container-high text-primary border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Completed & Certified
          </span>
        </div>

        {/* 4-cell stats bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md pt-space-md">
          <div className="p-space-base rounded-lg bg-surface-container-low border border-outline-variant/20">
            <span className="text-xs font-semibold text-outline uppercase">Total Scenarios</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-on-surface font-mono">500</span>
              <span className="text-xs text-outline">controlled cases</span>
            </div>
            <p className="mt-1 text-xs text-on-surface-variant">Zero production customer risk</p>
          </div>

          <div className="p-space-base rounded-lg bg-surface-container-low border border-outline-variant/20">
            <span className="text-xs font-semibold text-outline uppercase">Correct Diagnoses</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary font-mono">463</span>
              <span className="text-xs text-primary font-mono font-bold">92.6%</span>
            </div>
            <p className="mt-1 text-xs text-on-surface-variant">Root-cause identification accuracy</p>
          </div>

          <div className="p-space-base rounded-lg bg-surface-container-low border border-outline-variant/20">
            <span className="text-xs font-semibold text-outline uppercase">Policy Invariant Adherence</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-700 font-mono">500</span>
              <span className="text-xs text-emerald-700 font-mono font-bold">100%</span>
            </div>
            <p className="mt-1 text-xs text-on-surface-variant">Zero invariant gate violations</p>
          </div>

          <div className="p-space-base rounded-lg bg-surface-container-low border border-outline-variant/20">
            <span className="text-xs font-semibold text-outline uppercase">Simulated Yield</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-on-surface font-mono">₹4,12,000</span>
              <span className="text-xs text-on-surface-variant font-mono">82.4%</span>
            </div>
            <p className="mt-1 text-xs text-on-surface-variant">Reclaimed from recoverable corpus</p>
          </div>
        </div>
      </div>

      {/* Benchmark Matrix Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs overflow-hidden">
        <div className="p-space-base border-b border-surface-container flex items-center justify-between">
          <h3 className="text-sm font-semibold text-on-surface">Benchmark Scenario Verification Suite</h3>
          <span className="text-xs text-outline font-mono">Phase 1 Certified Spec</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-secondary text-xs uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-space-base">Scenario ID</th>
                <th className="py-2.5 px-space-base">Archetype</th>
                <th className="py-2.5 px-space-base">AI Recommendation</th>
                <th className="py-2.5 px-space-base">Policy Gate</th>
                <th className="py-2.5 px-space-base">Expected Verification</th>
                <th className="py-2.5 px-space-base text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-xs text-on-surface">
              {benchmarkScenarios.map((s) => (
                <tr key={s.id} className="hover:bg-surface-container-low/40">
                  <td className="py-3 px-space-base font-mono font-semibold text-primary">{s.id}</td>
                  <td className="py-3 px-space-base font-medium">{s.name}</td>
                  <td className="py-3 px-space-base text-on-surface-variant">{s.aiRec}</td>
                  <td className="py-3 px-space-base font-mono">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${
                      s.policyGate.includes('PASS') ? 'bg-emerald-50 text-emerald-800' :
                      s.policyGate.includes('NEEDS_REVIEW') ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800'
                    }`}>
                      {s.policyGate}
                    </span>
                  </td>
                  <td className="py-3 px-space-base text-on-surface-variant">{s.expected}</td>
                  <td className="py-3 px-space-base text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold font-mono text-[11px]">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      <span>{s.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
