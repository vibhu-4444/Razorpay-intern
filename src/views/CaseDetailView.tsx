import React from 'react';
import { RecoveryCase } from '../domain/recovery-case';
import { AuditTrailTable } from '../design-system/domain-ui/AuditTrailTable';

interface CaseDetailViewProps {
  recoveryCase: RecoveryCase;
  onBack: () => void;
  onOpenDecisionCenter: (caseId: string) => void;
}

export const CaseDetailView: React.FC<CaseDetailViewProps> = ({
  recoveryCase,
  onBack,
  onOpenDecisionCenter,
}) => {
  const { payment, customer, diagnosis, recommendedAction } = recoveryCase;

  return (
    <div className="flex flex-col space-y-space-lg">
      {/* Back button & dossier bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Cases Ledger</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-container text-on-secondary-container">
            Audit Lock #{recoveryCase.id.replace('RP-', '')}
          </span>
          <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant/30 shadow-xs text-xs text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[15px]">print</span>
            <span>Export Dossier</span>
          </button>
        </div>
      </div>

      {/* Case Operational Banner Card */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-outline-variant/30 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
        <div className="flex items-start gap-space-md">
          <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[28px]">account_balance</span>
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-space-sm flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
                Case {recoveryCase.id}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container text-on-secondary-container">
                {customer.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-container-high text-primary">
                {customer.tier} Tier
              </span>
            </div>
            <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-error">error</span>
              <span>Initial Trigger: <strong className="text-on-surface">{payment.failure?.description ?? 'Decline'}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-space-lg self-end lg:self-center">
          {/* Amount Block */}
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">Settled Amount</span>
            <span className="text-2xl sm:text-3xl font-bold text-on-surface font-mono">
              ₹{recoveryCase.amountAtRisk.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="h-10 w-px bg-surface-container-high hidden sm:block"></div>

          {/* Status & Confidence */}
          <div className="flex items-center gap-space-md">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-on-surface-variant">Outcome State</span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                recoveryCase.status === 'RECOVERED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' :
                recoveryCase.status === 'BLOCKED' ? 'bg-rose-50 text-rose-800 border border-rose-300' :
                'bg-blue-50 text-blue-800 border border-blue-300'
              }`}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                <span>{recoveryCase.status}</span>
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-on-surface-variant">Model Confidence</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-tertiary-fixed text-on-tertiary-fixed">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                <span>{diagnosis?.confidencePercentage ?? 86}% High</span>
              </span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => onOpenDecisionCenter(recoveryCase.id)}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all shadow-xs text-xs font-semibold shrink-0"
          >
            <span>View Recovery Decision</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Main Investigation Grid: 8-col Left / 4-col Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN: 8 Cols */}
        <div className="xl:col-span-8 flex flex-col gap-space-lg">
          {/* 1. Payment Telemetry Summary Grid */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-outline-variant/30 shadow-xs">
            <div className="flex items-center justify-between pb-space-sm mb-space-base bg-surface-container-low/40 rounded-lg p-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">dataset</span>
                <h2 className="text-sm font-semibold text-on-surface">Payment Telemetry Summary</h2>
              </div>
              <span className="font-mono text-[11px] text-outline font-medium">INGEST_NODE: BLR-01-RP</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
              <div className="p-space-base rounded-lg bg-surface-container-low flex flex-col gap-1">
                <span className="text-[11px] text-on-surface-variant font-medium">Payment Method</span>
                <span className="font-mono font-bold text-on-surface text-xs mt-0.5">
                  {payment.method.network ?? 'Card'} {payment.method.type}
                </span>
                <span className="font-mono text-[11px] text-on-surface-variant">{payment.method.maskedIdentifier}</span>
              </div>

              <div className="p-space-base rounded-lg bg-surface-container-low flex flex-col gap-1">
                <span className="text-[11px] text-on-surface-variant font-medium">First Decline</span>
                <div className="flex items-center gap-1 mt-0.5 font-mono font-bold text-on-surface text-xs">
                  <span className="material-symbols-outlined text-[14px] text-error">schedule</span>
                  <span>14:03:19 IST</span>
                </div>
                <span className="text-[11px] text-on-surface-variant">24 Oct 2024</span>
              </div>

              <div className="p-space-base rounded-lg bg-surface-container-low flex flex-col gap-1">
                <span className="text-[11px] text-on-surface-variant font-medium">Gateway RRN Ref</span>
                <span className="font-mono font-bold text-on-surface text-xs mt-0.5 truncate" title={payment.id}>
                  {payment.id}
                </span>
                <span className="text-[11px] text-primary flex items-center gap-0.5 cursor-pointer">
                  <span className="material-symbols-outlined text-[12px]">content_copy</span> Copy Hash
                </span>
              </div>

              <div className="p-space-base rounded-lg bg-surface-container-low flex flex-col gap-1">
                <span className="text-[11px] text-on-surface-variant font-medium">Recovery Latency</span>
                <div className="flex items-center gap-1 mt-0.5 font-mono font-bold text-on-surface text-xs">
                  <span className="material-symbols-outlined text-[14px] text-primary">timer</span>
                  <span>1m 54s Total</span>
                </div>
                <span className="text-[11px] text-on-surface-variant">Settled at 14:05:12</span>
              </div>
            </div>
          </div>

          {/* 2. Autonomous Resolution Timeline */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-outline-variant/30 shadow-xs">
            <div className="flex items-center justify-between pb-space-base mb-space-base border-b border-surface-container">
              <div>
                <h2 className="text-base font-semibold text-on-surface">Autonomous Resolution Timeline</h2>
                <p className="text-xs text-on-surface-variant">Chronological execution events from failure ingestion to final gateway settlement.</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-surface-container-low text-on-secondary-container font-mono font-medium">
                {recoveryCase.timelineEvents.length} Events Traceable
              </span>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-container-highest">
              {recoveryCase.timelineEvents.map((event) => (
                <div key={event.id} className="relative group">
                  <div className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-xs flex items-center justify-center ${
                    event.stepNumber === 4 ? 'bg-secondary-container text-on-secondary-fixed' :
                    event.stepNumber === 5 ? 'bg-surface-container-lowest text-primary border border-primary/20' :
                    event.stepNumber === 7 ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40'
                  }`}>
                    <span className="material-symbols-outlined text-[14px] sm:text-[16px]">
                      {event.icon}
                    </span>
                  </div>
                  <div className={`rounded-lg p-space-base border ${
                    event.highlight ? 'bg-surface-container-low/60 border-primary/20' : 'bg-surface border-outline-variant/20'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-on-surface">{event.title}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container text-on-secondary-container font-medium">
                          {event.category}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-on-surface-variant font-medium">
                        {event.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Audit Trail Table */}
          <AuditTrailTable events={recoveryCase.auditTrail} />
        </div>

        {/* RIGHT COLUMN: 4 Cols */}
        <div className="xl:col-span-4 flex flex-col gap-space-lg">
          {/* 1. Failure Diagnosis (Explainability Engine) */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-outline-variant/30 shadow-xs flex flex-col gap-space-base">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                <h3 className="text-sm font-semibold text-on-surface">Failure Diagnosis</h3>
              </div>
              <span className="font-mono text-[10px] font-bold text-on-secondary-container bg-surface-container-high px-2 py-0.5 rounded">
                EXPLAINABILITY
              </span>
            </div>

            <div className="p-space-base rounded-lg bg-surface-container-low flex flex-col gap-1">
              <span className="text-[11px] text-on-surface-variant">Inferred Root Cause</span>
              <span className="text-sm font-semibold text-on-surface">
                {diagnosis?.inferredRootCause ?? 'Temporary bank decline'}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${diagnosis?.confidencePercentage ?? 91}%` }} />
                </div>
                <span className="font-mono text-xs font-bold text-primary">
                  {diagnosis?.confidencePercentage ?? 91}% Confidence
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Telemetry Signals
              </span>
              <ul className="mt-space-sm space-y-2.5">
                {(diagnosis?.signals ?? []).map((sig) => (
                  <li key={sig.id} className="flex items-start gap-2 text-xs text-on-surface">
                    <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span>
                      <strong>{sig.label}:</strong> {sig.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 2. Customer Payment Health Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-outline-variant/30 shadow-xs flex flex-col gap-space-base">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">badge</span>
                <h3 className="text-sm font-semibold text-on-surface">Customer Context</h3>
              </div>
              <span className="font-mono text-xs text-outline">{customer.id}</span>
            </div>

            <p className="text-xs text-on-surface-variant">
              Aggregated payment history strictly constrained to non-sensitive ledger statistics.
            </p>

            <div className="grid grid-cols-2 gap-space-sm pt-1">
              <div className="p-space-base rounded-lg bg-surface border border-outline-variant/20">
                <span className="text-[11px] text-on-surface-variant block">Historical Cleared</span>
                <span className="text-xl font-bold text-on-surface font-mono">{customer.metrics.historicalClearedCount}</span>
                <span className="text-[11px] text-primary font-medium block mt-0.5">{customer.metrics.successRatePercentage}% success</span>
              </div>
              <div className="p-space-base rounded-lg bg-surface border border-outline-variant/20">
                <span className="text-[11px] text-on-surface-variant block">Historical Failed</span>
                <span className="text-xl font-bold text-error font-mono">{customer.metrics.historicalFailedCount}</span>
                <span className="text-[11px] text-on-surface-variant block mt-0.5">Non-structural</span>
              </div>
              <div className="p-space-base rounded-lg bg-surface border border-outline-variant/20">
                <span className="text-[11px] text-on-surface-variant block">Account Tenure</span>
                <span className="text-xl font-bold text-on-surface font-mono">{customer.metrics.accountTenureMonths} Mo</span>
                <span className="text-[11px] text-on-surface-variant block mt-0.5">Active customer</span>
              </div>
              <div className="p-space-base rounded-lg bg-surface border border-outline-variant/20">
                <span className="text-[11px] text-on-surface-variant block">Avg Transaction</span>
                <span className="text-xl font-bold text-on-surface font-mono">₹{customer.metrics.avgTransactionAmount.toLocaleString('en-IN')}</span>
                <span className="text-[11px] text-on-surface-variant block mt-0.5">Recurring cycle</span>
              </div>
            </div>
          </div>

          {/* 3. Execution Blueprint Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-outline-variant/30 shadow-xs flex flex-col gap-space-base">
            <div className="flex items-center justify-between">
              <span className="text-xs text-primary uppercase tracking-wider font-bold">Policy & Optimization</span>
              <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-on-surface">Execution Blueprint</h3>
              <p className="text-xs text-on-surface-variant mt-1">Autonomous orchestration logic executed according to pre-authorized merchant rules.</p>
            </div>
            <div className="space-y-2 py-space-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface text-xs">
                <span className="text-on-surface-variant">Recoverable Value</span>
                <span className="font-mono font-bold text-on-surface">₹{recoveryCase.amountAtRisk.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface text-xs">
                <span className="text-on-surface-variant">Calculated Likelihood</span>
                <span className="font-mono font-semibold text-primary">{diagnosis?.expectedRecoveryPercentage ?? 86}% High</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface text-xs">
                <span className="text-on-surface-variant">Prescribed Delay</span>
                <span className="font-mono font-medium text-on-surface">Cooldown 40s (Cap 60s)</span>
              </div>
            </div>

            <button
              onClick={() => onOpenDecisionCenter(recoveryCase.id)}
              className="w-full py-2.5 px-space-base rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-primary-container transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <span>Open Decision Center & Policy Checks</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
