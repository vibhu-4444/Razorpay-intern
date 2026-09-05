/**
 * REVIVE View: Simulation Data Studio
 * 
 * Dataset workbench for inspecting, validating, and generating realistic payment recovery scenarios.
 * Displays schema compliance, scenario distributions, and deterministic ground-truth blueprints.
 * 
 * Stitch UI Compliant: Blue/White light theme, Inter font, tabular numbers, dense engineering layout.
 */

import React, { useState } from 'react';
import {
  SYNTHETIC_DATASET_V1,
  DEFAULT_CORPUS_VALIDATION_REPORT,
  generateSyntheticDataset,
  validateDataset,
  SyntheticDataset,
  SyntheticRecoveryCase,
  ScenarioArchetype,
  ValidationReport,
} from '../data/synthetic';

export const DataStudioView: React.FC = () => {
  const [dataset, setDataset] = useState<SyntheticDataset>(SYNTHETIC_DATASET_V1);
  const [validationReport, setValidationReport] = useState<ValidationReport>(DEFAULT_CORPUS_VALIDATION_REPORT);
  const [searchQuery, setSearchQuery] = useState('');
  const [archetypeFilter, setArchetypeFilter] = useState<string>('ALL');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [selectedCase, setSelectedCase] = useState<SyntheticRecoveryCase | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Filter cases
  const filteredCases = dataset.cases.filter((c) => {
    if (archetypeFilter !== 'ALL' && c.scenarioArchetype !== archetypeFilter) return false;
    if (tierFilter !== 'ALL' && c.customer.tier !== tierFilter) return false;
    if (!searchQuery) return true;

    const q = searchQuery.toLowerCase();
    return (
      c.id.toLowerCase().includes(q) ||
      c.customer.name.toLowerCase().includes(q) ||
      c.customer.email.toLowerCase().includes(q) ||
      c.payment.failure?.code.toLowerCase().includes(q) ||
      c.payment.failure?.category.toLowerCase().includes(q)
    );
  });

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      const newSeed = Math.floor(10000 + Math.random() * 90000);
      const newDataset = generateSyntheticDataset({ count: 500, seed: newSeed });
      const report = validateDataset(newDataset);
      setDataset(newDataset);
      setValidationReport(report);
      setIsRegenerating(false);
    }, 400);
  };

  const archetypesList: ScenarioArchetype[] = [
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

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/50 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-2xl">dataset</span>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Simulation Data Studio</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              v{dataset.version}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant max-w-3xl">
            Deterministic synthetic payment recovery corpus with sovereign ground-truth annotations.
            Guarantees independent evaluation without circular model dependencies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">autorenew</span>
            {isRegenerating ? 'Generating 500 Scenarios...' : 'Regenerate Seeded Corpus'}
          </button>
        </div>
      </div>

      {/* Dataset Summary & Quality Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm">
          <div className="text-xs text-on-surface-variant font-medium">Dataset Records</div>
          <div className="text-2xl font-bold font-mono text-on-surface mt-1">
            {dataset.summary.totalRecords}
          </div>
          <div className="text-[11px] text-on-surface-variant mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-emerald-600">check_circle</span>
            16 Canonical Archetypes
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm">
          <div className="text-xs text-on-surface-variant font-medium">Revenue at Risk</div>
          <div className="text-2xl font-bold font-mono text-on-surface mt-1">
            ₹{dataset.summary.totalRevenueAtRiskINR.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-on-surface-variant mt-1">
            Eligible: ₹{dataset.summary.totalRecoverableRevenueINR.toLocaleString('en-IN')} ({dataset.summary.eligibilityRatePercentage}%)
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm">
          <div className="text-xs text-on-surface-variant font-medium">Schema Integrity</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
            {validationReport.integrityMetrics.schemaConformityPercentage.toFixed(1)}%
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            0 Critical Errors ({validationReport.totalRecordsChecked} checked)
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm">
          <div className="text-xs text-on-surface-variant font-medium">Ground Truth Consistency</div>
          <div className="text-2xl font-bold font-mono text-primary mt-1">
            {validationReport.integrityMetrics.groundTruthConsistencyPercentage.toFixed(1)}%
          </div>
          <div className="text-[11px] text-on-surface-variant mt-1">
            Deterministic rule alignment verified
          </div>
        </div>
      </div>

      {/* Scenario Archetype Breakdown Bar */}
      <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">pie_chart</span>
            Archetype Distribution (500 Synthetic Cases)
          </h3>
          <span className="text-xs font-mono text-on-surface-variant">
            Balance: ~31 cases / scenario
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {Object.entries(dataset.summary.scenarioDistribution).map(([arch, count]) => {
            const isSelected = archetypeFilter === arch;
            return (
              <button
                key={arch}
                onClick={() => setArchetypeFilter(isSelected ? 'ALL' : arch)}
                className={`p-2 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/30 text-on-surface'
                }`}
              >
                <div className="font-mono text-xs font-bold">{count}</div>
                <div className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-on-surface-variant'}`}>
                  {arch.replace(/_/g, ' ')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by ID, customer, email, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-surface-container-low rounded-lg border border-outline-variant/50 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={archetypeFilter}
            onChange={(e) => setArchetypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-surface-container-low border border-outline-variant/50 rounded-lg text-on-surface focus:outline-none font-medium"
          >
            <option value="ALL">All Archetypes (16)</option>
            {archetypesList.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-surface-container-low border border-outline-variant/50 rounded-lg text-on-surface focus:outline-none font-medium"
          >
            <option value="ALL">All Tiers</option>
            <option value="ENTERPRISE">Enterprise</option>
            <option value="GROWTH">Growth</option>
            <option value="STANDARD">Standard</option>
          </select>

          <span className="text-xs text-on-surface-variant font-mono whitespace-nowrap">
            Showing {filteredCases.length} of {dataset.cases.length}
          </span>
        </div>
      </div>

      {/* Dataset Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[520px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low border-b border-outline-variant/40 text-on-surface-variant font-medium sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-mono">Case ID</th>
                <th className="px-4 py-3">Customer & Tier</th>
                <th className="px-4 py-3 font-mono">Amount (INR)</th>
                <th className="px-4 py-3">Scenario Archetype</th>
                <th className="px-4 py-3">Ground Truth Action</th>
                <th className="px-4 py-3">Expected Policy</th>
                <th className="px-4 py-3">Expected Outcome</th>
                <th className="px-4 py-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filteredCases.slice(0, 100).map((c) => (
                <tr key={c.id} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="px-4 py-2.5 font-mono font-bold text-primary">{c.id}</td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-on-surface">{c.customer.name}</div>
                    <div className="text-[10px] text-on-surface-variant font-mono">{c.customer.tier}</div>
                  </td>
                  <td className="px-4 py-2.5 font-mono font-semibold text-on-surface">
                    ₹{c.payment.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-surface-container text-on-surface">
                      {c.scenarioArchetype}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-on-surface">
                    {c.groundTruth.recommendedActionGroundTruth}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      c.groundTruth.expectedPolicyOutcome === 'ALLOWED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : c.groundTruth.expectedPolicyOutcome === 'BLOCKED'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {c.groundTruth.expectedPolicyOutcome}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-[11px] font-semibold text-on-surface">
                      {c.groundTruth.expectedRecoveryOutcome}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => setSelectedCase(c)}
                      className="px-2 py-1 bg-surface-container hover:bg-surface-container-high rounded text-[11px] font-medium text-primary transition-colors"
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCases.length > 100 && (
          <div className="p-3 text-center text-xs text-on-surface-variant bg-surface-container-low border-t border-outline-variant/30">
            Showing first 100 of {filteredCases.length} records. Filter or search to narrow inspection.
          </div>
        )}
      </div>

      {/* Case Dossier Blueprint Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-2xl w-full rounded-2xl border border-outline-variant/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-outline-variant/40 flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                <h3 className="font-bold text-base text-on-surface">
                  Synthetic Dossier: {selectedCase.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface-container-low rounded-lg space-y-1">
                  <div className="text-on-surface-variant font-medium">Customer Profile</div>
                  <div className="font-bold text-sm text-on-surface">{selectedCase.customer.name}</div>
                  <div className="text-on-surface-variant font-mono">{selectedCase.customer.email}</div>
                  <div className="text-[10px] text-primary font-semibold font-mono uppercase">
                    Tier: {selectedCase.customer.tier}
                  </div>
                </div>

                <div className="p-3 bg-surface-container-low rounded-lg space-y-1">
                  <div className="text-on-surface-variant font-medium">Payment Context</div>
                  <div className="font-bold text-sm text-on-surface font-mono">
                    ₹{selectedCase.payment.amount.toLocaleString('en-IN')} {selectedCase.payment.currency}
                  </div>
                  <div className="text-on-surface-variant font-mono">
                    Method: {selectedCase.payment.method.type} ({selectedCase.payment.method.maskedIdentifier})
                  </div>
                  <div className="text-[10px] text-on-surface-variant">
                    Attempt: {selectedCase.payment.attemptCount} / {selectedCase.payment.maxAllowedAttempts}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                <div className="font-bold text-blue-950 flex items-center gap-1.5 text-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                  Deterministic Ground Truth Blueprint
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-blue-900">
                  <div>
                    <span className="font-semibold">Failure Root Cause:</span>{' '}
                    {selectedCase.groundTruth.rootCauseGroundTruth}
                  </div>
                  <div>
                    <span className="font-semibold">Optimal Bounded Action:</span>{' '}
                    <span className="font-mono">{selectedCase.groundTruth.recommendedActionGroundTruth}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Expected Policy Gate:</span>{' '}
                    <span className="font-mono">{selectedCase.groundTruth.expectedPolicyOutcome}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Expected Final Outcome:</span>{' '}
                    <span className="font-mono">{selectedCase.groundTruth.expectedRecoveryOutcome}</span>
                  </div>
                </div>
                {selectedCase.groundTruth.expectedSafetyRuleViolated && (
                  <div className="text-[11px] text-rose-700 font-mono font-semibold pt-1 border-t border-blue-200/60">
                    Rule Invariant Enforced: {selectedCase.groundTruth.expectedSafetyRuleViolated}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-on-surface text-xs">Raw Failure Telemetry</div>
                <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto">
                  {JSON.stringify(selectedCase.payment.failure, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-outline-variant/40 bg-surface-container-low flex justify-end">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-hover"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
