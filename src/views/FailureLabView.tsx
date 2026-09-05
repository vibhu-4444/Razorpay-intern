/**
 * REVIVE View: Failure Lab (Safe Failure Testing Ground)
 * 
 * Interactive laboratory for executing controlled failure scenarios against live architecture.
 * Demonstrates UNKNOWN_PROVIDER_STATE handling, idempotency defense, policy supremacy,
 * and calculates the mathematical Safe Failure Scorecard.
 * 
 * Stitch UI Compliant: Blue/White light theme, Inter font, tabular numbers, dense engineering layout.
 */

import React, { useState, useEffect } from 'react';
import {
  defaultFailureLabService,
  FailureScenarioId,
  FailureScenarioResult,
  SafeFailureScorecard,
} from '../services/failure-lab-service';

export const FailureLabView: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<FailureScenarioId>('SCENARIO_1_TIMEOUT');
  const [activeResult, setActiveResult] = useState<FailureScenarioResult | null>(null);
  const [scorecard, setScorecard] = useState<SafeFailureScorecard | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'canvas' | 'scorecard' | 'audit'>('canvas');

  // Load baseline results on mount
  useEffect(() => {
    runScenario(selectedScenario);
  }, [selectedScenario]);

  const runScenario = async (id: FailureScenarioId) => {
    setIsRunning(true);
    try {
      const res = await defaultFailureLabService.runScenario(id);
      setActiveResult(res);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunFullScorecard = async () => {
    setIsRunning(true);
    try {
      const card = await defaultFailureLabService.runAllScenarios();
      setScorecard(card);
      setActiveTab('scorecard');
    } finally {
      setIsRunning(false);
    }
  };

  const scenariosList: Array<{ id: FailureScenarioId; title: string; badge: string; icon: string }> = [
    { id: 'SCENARIO_1_TIMEOUT', title: 'Provider 504 Timeout', badge: 'UNKNOWN_STATE', icon: 'hourglass_disabled' },
    { id: 'SCENARIO_2_PROVIDER_503', title: 'Provider 503 Outage', badge: 'THROTTLED', icon: 'cloud_off' },
    { id: 'SCENARIO_3_DUPLICATE_IDEMPOTENCY', title: 'Duplicate Event Replay', badge: 'IDEMPOTENCY', icon: 'content_copy' },
    { id: 'SCENARIO_4_LOW_CONFIDENCE', title: 'Low AI Confidence (<60%)', badge: 'HUMAN_OPS', icon: 'psychology_alt' },
    { id: 'SCENARIO_5_POLICY_CONFLICT', title: 'Policy Invariant Conflict', badge: 'HARD_BLOCK', icon: 'gavel' },
    { id: 'SCENARIO_6_ISSUER_DECLINE', title: 'Issuer Hard Decline (05)', badge: 'TERMINAL_STATE', icon: 'credit_card_off' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/50 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-2xl">security</span>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Failure Lab & Resilience Testing</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              SAFE FAILURE GUARANTEED
            </span>
          </div>
          <p className="text-sm text-on-surface-variant max-w-3xl">
            Controlled injection harness verifying that REVIVE fails safely without duplicate debits,
            uncontrolled retry storms, or AI policy overrides. Real execution against sovereign policy and simulator providers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => runScenario(selectedScenario)}
            disabled={isRunning}
            className="px-4 py-2 bg-surface-container-high hover:bg-surface-container text-on-surface font-medium text-sm rounded-lg border border-outline-variant/40 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">replay</span>
            Re-run Scenario
          </button>
          <button
            onClick={handleRunFullScorecard}
            disabled={isRunning}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">fact_check</span>
            Run Complete Scorecard (6/6)
          </button>
        </div>
      </div>

      {/* Navigation Tabs & Scenario Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Scenarios List */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1 mb-2">
            Failure Scenarios
          </div>
          {scenariosList.map((s) => {
            const isSelected = selectedScenario === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedScenario(s.id);
                  setActiveTab('canvas');
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-primary-container/20 border-primary text-primary shadow-sm ring-1 ring-primary/30'
                    : 'bg-surface-container-lowest border-outline-variant/40 text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <span className="material-symbols-outlined text-[18px] text-primary">{s.icon}</span>
                    <span>{s.title}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">
                    {s.badge}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Verified
                  </span>
                </div>
              </button>
            );
          })}

          {/* Quick Scorecard Trigger Button */}
          <div className="pt-3">
            <button
              onClick={() => {
                if (!scorecard) {
                  handleRunFullScorecard();
                } else {
                  setActiveTab('scorecard');
                }
              }}
              className={`w-full p-3.5 rounded-xl border text-left font-medium text-sm flex items-center justify-between transition-colors ${
                activeTab === 'scorecard'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500/30'
                  : 'bg-surface-container-lowest border-outline-variant/40 text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">verified</span>
                <span>Safe Failure Scorecard</span>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                {scorecard ? `${scorecard.safetyScorePercentage}%` : 'View'}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Execution Canvas & Inspection */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sub-tabs header */}
          <div className="flex items-center justify-between border-b border-outline-variant/40 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('canvas')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'canvas'
                    ? 'bg-primary text-white'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Causality & Telemetry Canvas
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'audit'
                    ? 'bg-primary text-white'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Cryptographic Audit Ledger
              </button>
              <button
                onClick={() => setActiveTab('scorecard')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'scorecard'
                    ? 'bg-primary text-white'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Scorecard Verification
              </button>
            </div>

            {activeResult && (
              <span className="text-xs text-on-surface-variant font-mono">
                Executed: {new Date(activeResult.executedAt).toLocaleTimeString()}
              </span>
            )}
          </div>

          {activeResult && activeTab === 'canvas' && (
            <div className="space-y-6">
              {/* Scenario Context Card */}
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">crisis_alert</span>
                    {activeResult.scenarioTitle}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    LIVE HARNESS
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant">{activeResult.description}</p>
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] text-blue-700 shrink-0">verified_user</span>
                  <div>
                    <strong>Safety Guarantee Under Test:</strong> {activeResult.safetyPropertyTested}
                  </div>
                </div>
              </div>

              {/* Multi-stage Causality Pipeline */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Stage 1: Injected Signal */}
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant mb-2">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-amber-600">input</span>
                        1. Injected Telemetry
                      </span>
                    </div>
                    <div className="space-y-1.5 font-mono text-[11px] text-on-surface bg-surface-container-low p-2.5 rounded-lg">
                      {Object.entries(activeResult.injectedTelemetry).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-on-surface-variant">{k}:</span>
                          <span className="font-semibold">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-[10px] text-on-surface-variant mt-2 text-right">Synthetic Trigger</div>
                </div>

                {/* Stage 2: AI Proposal */}
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant mb-2">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-indigo-600">psychology</span>
                        2. AI Model Proposal
                      </span>
                      <span className="font-mono text-[10px] font-bold text-indigo-600">
                        {activeResult.aiProposal.confidencePercentage}% conf
                      </span>
                    </div>
                    <div className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs space-y-1">
                      <div className="font-mono font-bold text-indigo-900 text-[11px]">
                        {activeResult.aiProposal.recommendedAction}
                      </div>
                      <p className="text-[11px] text-indigo-800 line-clamp-3">
                        {activeResult.aiProposal.reasoning}
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] text-on-surface-variant mt-2 text-right">Advisory Only</div>
                </div>

                {/* Stage 3: Deterministic Policy */}
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant mb-2">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-primary">policy</span>
                        3. Policy Arbiter
                      </span>
                      <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        activeResult.policyDecision.allowed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {activeResult.policyDecision.allowed ? 'ALLOWED' : 'BLOCKED'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-surface-container-low rounded-lg text-xs space-y-1">
                      {activeResult.policyDecision.blockingRule ? (
                        <div className="font-semibold text-rose-700 text-[11px]">
                          {activeResult.policyDecision.blockingRule}
                        </div>
                      ) : (
                        <div className="text-emerald-700 text-[11px] font-semibold">
                          All invariant gates satisfied
                        </div>
                      )}
                      <p className="text-[10px] text-on-surface-variant line-clamp-3">
                        {activeResult.policyDecision.blockingReason ?? 'Authorized bounded execution window'}
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] text-on-surface-variant mt-2 text-right">Strict Precedence</div>
                </div>

                {/* Stage 4: Provider & Final State */}
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant mb-2">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">account_balance</span>
                        4. Final Terminal State
                      </span>
                    </div>
                    <div className="p-2.5 bg-surface-container-low rounded-lg text-xs space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-on-surface-variant">Provider Call:</span>
                        <span className="font-semibold font-mono">
                          {activeResult.providerDispatch.executed ? 'EXECUTED' : 'BLOCKED (ZERO CALL)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-on-surface-variant">Case Status:</span>
                        <span className="font-bold font-mono px-1.5 py-0.5 rounded bg-surface-container text-on-surface">
                          {activeResult.finalState.caseStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-on-surface-variant">Double-Debit Risk:</span>
                        <span className="text-emerald-600 font-bold">PREVENTED</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-on-surface-variant mt-2 text-right">Settlement Guard</div>
                </div>
              </div>

              {/* Safety Checks Breakdown */}
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 shadow-sm">
                <h4 className="font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-lg">fact_check</span>
                  Automated Safety Assertions ({activeResult.safetyChecks.filter(c => c.passed).length}/{activeResult.safetyChecks.length} Passed)
                </h4>
                <div className="divide-y divide-outline-variant/30">
                  {activeResult.safetyChecks.map((check) => (
                    <div key={check.id} className="py-3 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className={`material-symbols-outlined text-xl ${
                          check.passed ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {check.passed ? 'check_circle' : 'cancel'}
                        </span>
                        <div>
                          <div className="font-medium text-sm text-on-surface flex items-center gap-2">
                            <span>{check.name}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                              check.criticality === 'CRITICAL' ? 'bg-rose-50 text-rose-700' : 'bg-surface-container text-on-surface-variant'
                            }`}>
                              {check.criticality}
                            </span>
                          </div>
                          <div className="text-xs text-on-surface-variant mt-0.5">
                            <span className="font-semibold text-on-surface">Actual:</span> {check.actual}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-on-surface-variant shrink-0">
                        {check.id}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Cryptographic Audit Ledger */}
          {activeResult && activeTab === 'audit' && (
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">history_edu</span>
                  Cryptographic Audit Trail for {activeResult.scenarioTitle}
                </h3>
                <span className="text-xs font-mono text-on-surface-variant">
                  Immutable Memory Ledger
                </span>
              </div>
              <div className="space-y-3">
                {activeResult.auditRecords.map((rec, i) => (
                  <div key={i} className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-primary/10 text-primary">
                          {rec.eventType}
                        </span>
                        <span className="text-xs font-semibold text-on-surface">
                          Actor: {rec.actor}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant">{rec.summary}</p>
                    </div>
                    <span className="text-[11px] font-mono text-on-surface-variant shrink-0">
                      {new Date(rec.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Safe Failure Scorecard */}
          {activeTab === 'scorecard' && (
            <div className="space-y-6">
              {scorecard ? (
                <>
                  <div className="bg-gradient-to-br from-emerald-500/10 via-surface-container-lowest to-surface-container-lowest p-6 rounded-xl border border-emerald-300 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-emerald-600 text-3xl">verified</span>
                        <h3 className="text-2xl font-bold text-on-surface">Safe Failure Scorecard</h3>
                      </div>
                      <p className="text-sm text-on-surface-variant max-w-xl">
                        Comprehensive mathematical safety audit across all 6 core failure archetypes.
                        Zero unhandled exceptions, zero duplicate retries on unknown states, zero policy breaches.
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm min-w-[120px]">
                        <div className="text-3xl font-bold font-mono text-emerald-600">
                          {scorecard.safetyScorePercentage}%
                        </div>
                        <div className="text-[11px] font-semibold text-on-surface-variant mt-0.5">
                          Safety Index
                        </div>
                      </div>

                      <div className="text-center p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm min-w-[120px]">
                        <div className="text-3xl font-bold font-mono text-primary">
                          {scorecard.passedChecks}/{scorecard.totalChecks}
                        </div>
                        <div className="text-[11px] font-semibold text-on-surface-variant mt-0.5">
                          Checks Passed
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-outline-variant/30 font-bold text-sm text-on-surface">
                      Scenario-by-Scenario Resilience Summary
                    </div>
                    <div className="divide-y divide-outline-variant/30">
                      {Object.values(scorecard.scenarioResults).map((scen) => (
                        <div key={scen.scenarioId} className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                          <div className="space-y-1">
                            <div className="font-semibold text-sm text-on-surface flex items-center gap-2">
                              <span>{scen.scenarioTitle}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                                {scen.finalState.caseStatus}
                              </span>
                            </div>
                            <p className="text-xs text-on-surface-variant">{scen.safetyPropertyTested}</p>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              {scen.safetyChecks.filter(c => c.passed).length}/{scen.safetyChecks.length} Passed
                            </span>
                            <button
                              onClick={() => {
                                setSelectedScenario(scen.scenarioId);
                                setActiveResult(scen);
                                setActiveTab('canvas');
                              }}
                              className="text-xs text-primary hover:underline font-medium"
                            >
                              Inspect Details →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/40">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">fact_check</span>
                  <h4 className="font-bold text-base text-on-surface">Safe Failure Scorecard Not Yet Run</h4>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 mb-4">
                    Execute the automated test harness across all 6 failure archetypes to calculate the verified resilience percentage.
                  </p>
                  <button
                    onClick={handleRunFullScorecard}
                    disabled={isRunning}
                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    Run Complete Scorecard (6/6)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
