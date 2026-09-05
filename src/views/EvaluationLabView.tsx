/**
 * REVIVE View: Evaluation Lab (Empirical Model Benchmarking)
 * 
 * High-precision evaluation workbench benchmarking AI model accuracy, recommendation correctness,
 * multi-class confusion matrix, and critical safety bounds (Unsafe Action Rate).
 * 
 * Stitch UI Compliant: Blue/White light theme, Inter font, tabular numbers, dense engineering layout.
 */

import React, { useState, useEffect } from 'react';
import { SYNTHETIC_DATASET_V1 } from '../data/synthetic';
import { defaultEvaluationEngine } from '../ai/evaluation/evaluation-engine';
import { EvaluationRun, EvaluationCaseResult, EvaluationErrorCategory } from '../ai/evaluation/evaluation-types';

export const EvaluationLabView: React.FC = () => {
  const [activeRun, setActiveRun] = useState<EvaluationRun | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedErrorCategory, setSelectedErrorCategory] = useState<string>('ALL');
  const [selectedCaseModal, setSelectedCaseModal] = useState<EvaluationCaseResult | null>(null);

  // Initial evaluation run on mount
  useEffect(() => {
    runEvaluation();
  }, []);

  const runEvaluation = async () => {
    setIsRunning(true);
    try {
      const run = await defaultEvaluationEngine.evaluateDataset(SYNTHETIC_DATASET_V1);
      setActiveRun(run);
    } finally {
      setIsRunning(false);
    }
  };

  const filteredErrorCases = activeRun
    ? activeRun.errorCases.filter((c) => {
        if (selectedErrorCategory === 'ALL') return true;
        return c.errorCategories.includes(selectedErrorCategory as EvaluationErrorCategory);
      })
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/50 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-2xl">science</span>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">AI Evaluation Lab</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              500 SYNTHETIC CASES
            </span>
          </div>
          <p className="text-sm text-on-surface-variant max-w-3xl">
            Mathematical benchmark measuring failure diagnosis accuracy, recommendation validity,
            and safety bounds against independent ground-truth annotations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runEvaluation}
            disabled={isRunning}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            {isRunning ? 'Evaluating 500 Cases...' : 'Run Live Benchmark (500 Cases)'}
          </button>
        </div>
      </div>

      {activeRun && (
        <>
          {/* Primary Metric Scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Diagnosis Accuracy */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm">
              <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
                <span>Diagnosis Accuracy</span>
                <span className="material-symbols-outlined text-[18px] text-primary">target</span>
              </div>
              <div className="text-2xl font-bold font-mono text-on-surface mt-2">
                {activeRun.aiMetrics.diagnosisAccuracyPercentage}%
              </div>
              <div className="text-[11px] text-on-surface-variant mt-1">
                Macro F1: <span className="font-mono font-semibold">{activeRun.aiMetrics.macroF1}</span> (P: {activeRun.aiMetrics.macroPrecision}, R: {activeRun.aiMetrics.macroRecall})
              </div>
            </div>

            {/* Recommendation Correctness */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm">
              <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
                <span>Recommendation Accuracy</span>
                <span className="material-symbols-outlined text-[18px] text-indigo-600">psychology</span>
              </div>
              <div className="text-2xl font-bold font-mono text-indigo-600 mt-2">
                {activeRun.aiMetrics.recommendationAccuracyPercentage}%
              </div>
              <div className="text-[11px] text-on-surface-variant mt-1">
                Confidently Wrong: <span className="font-mono font-semibold text-rose-600">{activeRun.aiMetrics.confidentlyWrongCount} cases</span>
              </div>
            </div>

            {/* Critical Safety: Unsafe Action Rate */}
            <div className="bg-gradient-to-br from-rose-500/10 via-surface-container-lowest to-surface-container-lowest p-4 rounded-xl border border-rose-300 shadow-sm">
              <div className="flex items-center justify-between text-xs text-rose-900 font-bold">
                <span>Unsafe Action Rate (Safety Metric)</span>
                <span className="material-symbols-outlined text-[18px] text-rose-600">shield</span>
              </div>
              <div className="text-2xl font-bold font-mono text-rose-700 mt-2">
                {activeRun.safetyMetrics.unsafeActionRatePercentage}%
              </div>
              <div className="text-[11px] text-rose-800 mt-1 font-medium">
                {activeRun.safetyMetrics.totalUnsafeRecommendationsPrevented} unsafe actions intercepted by Policy Engine
              </div>
            </div>

            {/* Recovered Revenue Yield */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm">
              <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
                <span>Recovered Revenue Yield</span>
                <span className="material-symbols-outlined text-[18px] text-emerald-600">payments</span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-2">
                ₹{activeRun.businessMetrics.totalRecoveredRevenueINR.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-on-surface-variant mt-1">
                Yield Rate: <span className="font-mono font-semibold">{activeRun.businessMetrics.recoveryRatePercentage}%</span> of recoverable revenue
              </div>
            </div>
          </div>

          {/* Safety Protection Callout Banner */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl flex items-start gap-3 text-xs text-emerald-900 shadow-sm">
            <span className="material-symbols-outlined text-emerald-700 text-xl shrink-0 mt-0.5">verified_user</span>
            <div>
              <div className="font-bold text-sm text-emerald-950 mb-0.5">
                Deterministic Policy Arbiter Guaranteed Zero Unbounded Actions
              </div>
              <p className="leading-relaxed">
                Out of 500 cases, the AI recommendation engine proposed <strong>{activeRun.safetyMetrics.totalUnsafeRecommendationsPrevented} actions ({activeRun.safetyMetrics.unsafeActionRatePercentage}%)</strong> that would have violated safety invariants (e.g. attempting payment retry on attempt 3/3 or while customer dispute was active).
                The deterministic Policy Engine successfully intercepted <strong>100%</strong> of these proposals, preventing an estimated <strong>₹{activeRun.businessMetrics.preventedLossINR.toLocaleString('en-IN')}</strong> in illegal or duplicate debit liability.
              </p>
            </div>
          </div>

          {/* Multi-Class Confusion Matrix */}
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">grid_on</span>
                  Multi-Class Failure Diagnosis Confusion Matrix
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Horizontal rows indicate Ground Truth failure category; vertical columns represent AI Model Prediction.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold bg-surface-container px-2.5 py-1 rounded text-on-surface-variant">
                500 Samples Evaluated
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-[11px] font-semibold border-b border-outline-variant/40">
                    <th className="p-2 text-left">Actual \ Predicted</th>
                    {activeRun.confusionMatrix.categories.map((cat) => (
                      <th key={cat} className="p-2 font-mono" title={cat}>
                        {cat.replace(/_/g, ' ').slice(0, 10)}
                      </th>
                    ))}
                    <th className="p-2 font-mono text-right">Precision</th>
                    <th className="p-2 font-mono text-right">Recall</th>
                    <th className="p-2 font-mono text-right">F1</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 font-mono">
                  {activeRun.confusionMatrix.categories.map((actualCat, rIdx) => {
                    const metrics = activeRun.confusionMatrix.classMetrics[actualCat];
                    return (
                      <tr key={actualCat} className="hover:bg-surface-container-low/50">
                        <td className="p-2 font-sans font-medium text-left text-on-surface text-[11px]">
                          {actualCat.replace(/_/g, ' ')}
                        </td>
                        {activeRun.confusionMatrix.categories.map((predCat, cIdx) => {
                          const count = activeRun.confusionMatrix.matrix[rIdx][cIdx];
                          const isDiagonal = rIdx === cIdx;
                          return (
                            <td
                              key={predCat}
                              className={`p-2 font-semibold ${
                                isDiagonal
                                  ? count > 0 ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-on-surface'
                                  : count > 0 ? 'bg-rose-50 text-rose-700' : 'text-outline-variant/60'
                              }`}
                            >
                              {count}
                            </td>
                          );
                        })}
                        <td className="p-2 text-right text-on-surface-variant">{metrics?.precision ?? 0}</td>
                        <td className="p-2 text-right text-on-surface-variant">{metrics?.recall ?? 0}</td>
                        <td className="p-2 text-right font-bold text-primary">{metrics?.f1 ?? 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Error Taxonomy & Detailed Inspection */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-600">troubleshoot</span>
                  Error Analysis & Edge Cases ({activeRun.errorCases.length} Cases Flagged)
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Detailed inspection of model failure modes, unsafe recommendations intercepted, and confidently wrong predictions.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'ALL', label: 'All Errors' },
                  { id: 'UNSAFE_ACTION_PREVENTED', label: 'Unsafe Prevented' },
                  { id: 'CONFIDENTLY_WRONG', label: 'Confidently Wrong' },
                  { id: 'INCORRECT_DIAGNOSIS', label: 'Wrong Diagnosis' },
                  { id: 'POLICY_CONFLICT', label: 'Policy Conflict' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setSelectedErrorCategory(pill.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedErrorCategory === pill.id
                        ? 'bg-primary text-white font-semibold'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto max-h-[460px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low text-on-surface-variant font-medium sticky top-0 z-10 border-b border-outline-variant/30">
                  <tr>
                    <th className="px-4 py-3 font-mono">Case ID</th>
                    <th className="px-4 py-3">Error Tags</th>
                    <th className="px-4 py-3">Predicted Diagnosis</th>
                    <th className="px-4 py-3">Ground Truth</th>
                    <th className="px-4 py-3 font-mono">Confidence</th>
                    <th className="px-4 py-3">AI Proposed Action</th>
                    <th className="px-4 py-3">Policy Gate</th>
                    <th className="px-4 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {filteredErrorCases.slice(0, 50).map((c) => (
                    <tr key={c.caseId} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-bold text-primary">{c.caseId}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {c.errorCategories.map((cat) => (
                            <span
                              key={cat}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                cat === 'UNSAFE_ACTION_PREVENTED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : cat === 'CONFIDENTLY_WRONG'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-surface-container text-on-surface-variant'
                              }`}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-on-surface">
                        {c.predictedFailureCategory}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-on-surface-variant">
                        {c.groundTruthFailureCategory}
                      </td>
                      <td className="px-4 py-2.5 font-mono">
                        <span className={`font-semibold ${c.diagnosisConfidence >= 0.8 ? 'text-amber-700' : 'text-on-surface'}`}>
                          {Math.round(c.diagnosisConfidence * 100)}%
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-on-surface">
                        {c.predictedAction}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          c.policyOutcome === 'BLOCKED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : c.policyOutcome === 'NEEDS_REVIEW'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {c.policyOutcome}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => setSelectedCaseModal(c)}
                          className="px-2 py-1 bg-surface-container hover:bg-surface-container-high rounded text-[11px] font-medium text-primary"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredErrorCases.length > 50 && (
              <div className="p-3 text-center text-xs text-on-surface-variant bg-surface-container-low border-t border-outline-variant/30">
                Displaying first 50 of {filteredErrorCases.length} error cases.
              </div>
            )}
          </div>

          {/* Modal for error drilldown */}
          {selectedCaseModal && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
              <div className="bg-surface-container-lowest max-w-lg w-full rounded-xl border border-outline-variant/50 shadow-2xl p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                  <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">assessment</span>
                    Case Evaluation Audit: {selectedCaseModal.caseId}
                  </h4>
                  <button onClick={() => setSelectedCaseModal(null)} className="p-1 hover:bg-surface-container rounded">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-surface-container-low rounded-lg space-y-1">
                    <div className="font-semibold text-on-surface">Diagnosis Comparison:</div>
                    <div>Predicted: <span className="font-mono font-bold text-primary">{selectedCaseModal.predictedFailureCategory}</span></div>
                    <div>Ground Truth: <span className="font-mono font-bold text-on-surface">{selectedCaseModal.groundTruthFailureCategory}</span></div>
                    <div>Confidence: <span className="font-mono font-bold">{Math.round(selectedCaseModal.diagnosisConfidence * 100)}%</span></div>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-lg space-y-1">
                    <div className="font-semibold text-on-surface">Recommendation & Safety Check:</div>
                    <div>AI Action: <span className="font-mono font-bold">{selectedCaseModal.predictedAction}</span></div>
                    <div>Ground Truth Action: <span className="font-mono font-bold">{selectedCaseModal.groundTruthAction}</span></div>
                    <div>Unsafe Recommendation: <span className="font-bold text-rose-600">{selectedCaseModal.isUnsafeRecommendation ? 'YES (Breached Rule)' : 'NO'}</span></div>
                    {selectedCaseModal.unsafeRulePrevented && (
                      <div className="text-rose-700 font-mono">Rule Prevented: {selectedCaseModal.unsafeRulePrevented}</div>
                    )}
                  </div>

                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-900">
                    <div className="font-semibold mb-1">Reasoning Telemetry:</div>
                    <p className="text-[11px]">{selectedCaseModal.reasoningSnippet}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedCaseModal(null)}
                    className="px-4 py-1.5 bg-primary text-white font-medium rounded-lg text-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
