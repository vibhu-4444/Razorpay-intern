import React, { useState } from 'react';
import { PageHeader, Tabs, TabItem } from '../design-system';
import { RecoveryCase } from '../domain/recovery-case';

interface RecoveryCasesViewProps {
  cases: RecoveryCase[];
  onSelectCase: (id: string) => void;
  onOpenDecisionCenter: (id: string) => void;
}

export const RecoveryCasesView: React.FC<RecoveryCasesViewProps> = ({
  cases,
  onSelectCase,
  onOpenDecisionCenter,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reasonFilter, setReasonFilter] = useState('ALL');

  const tabs: TabItem[] = [
    { id: 'all', label: 'All Cases', count: cases.length },
    { id: 'recoverable', label: 'Recoverable', count: cases.filter(c => c.amountRecoverable > 0).length },
    { id: 'in_recovery', label: 'In Recovery', count: cases.filter(c => c.status === 'DIAGNOSED' || c.status === 'APPROVED').length },
    { id: 'recovered', label: 'Recovered', count: cases.filter(c => c.status === 'RECOVERED').length },
    { id: 'needs_review', label: 'Needs Review', count: cases.filter(c => c.status === 'NEEDS_REVIEW' || c.status === 'BLOCKED').length },
  ];

  const filteredCases = cases.filter(c => {
    // Tab filter
    if (activeTab === 'recovered' && c.status !== 'RECOVERED') return false;
    if (activeTab === 'needs_review' && c.status !== 'NEEDS_REVIEW' && c.status !== 'BLOCKED') return false;
    if (activeTab === 'in_recovery' && c.status !== 'DIAGNOSED' && c.status !== 'APPROVED') return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = c.id.toLowerCase().includes(q) ||
                    c.customer.name.toLowerCase().includes(q) ||
                    c.paymentId.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Status filter
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;

    // Reason filter
    if (reasonFilter !== 'ALL' && c.payment.failure?.category !== reasonFilter) return false;

    return true;
  });

  return (
    <div className="flex flex-col space-y-space-lg">
      {/* Page Header */}
      <PageHeader
        title="Recovery Cases"
        subtitle="Automated pipeline resolving at-risk recurring revenue via bounded, deterministic policies."
      >
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-xs font-medium shadow-xs hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-[16px]">file_download</span>
          <span>Export Audit Log</span>
        </button>
      </PageHeader>

      {/* Recovery Telemetry Quick Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest rounded-xl p-space-base border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-outline text-xs uppercase font-semibold">
            <span>Total Recoverable Volume</span>
            <span className="material-symbols-outlined text-[18px] text-primary">currency_rupee</span>
          </div>
          <div className="mt-space-sm flex items-baseline gap-2">
            <span className="text-xl lg:text-2xl font-bold text-on-surface font-mono">₹2,58,047</span>
            <span className="text-xs text-primary font-semibold">+14.2%</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-base border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-outline text-xs uppercase font-semibold">
            <span>Avg. Autonomous Win Rate</span>
            <span className="material-symbols-outlined text-[18px] text-tertiary">autorenew</span>
          </div>
          <div className="mt-space-sm flex items-baseline gap-2">
            <span className="text-xl lg:text-2xl font-bold text-on-surface font-mono">78.4%</span>
            <span className="text-xs text-on-surface-variant">vs 61.2% manual</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-base border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-outline text-xs uppercase font-semibold">
            <span>Gateway Resilience Index</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">verified_user</span>
          </div>
          <div className="mt-space-sm flex items-baseline gap-2">
            <span className="text-xl lg:text-2xl font-bold text-on-surface font-mono">99.8%</span>
            <span className="text-xs text-outline">HDFC / Razorpay</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-base border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-outline text-xs uppercase font-semibold">
            <span>Open Interventions</span>
            <span className="material-symbols-outlined text-[18px] text-error">notification_important</span>
          </div>
          <div className="mt-space-sm flex items-baseline gap-2">
            <span className="text-xl lg:text-2xl font-bold text-error font-mono">12</span>
            <span className="text-xs text-on-error-container font-semibold bg-error-container/60 px-1.5 py-0.5 rounded">Action Req</span>
          </div>
        </div>
      </div>

      {/* Primary Workspace Canvas Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs overflow-hidden flex flex-col">
        {/* View Switcher Tabs */}
        <div className="px-space-lg pt-space-md bg-surface-container-lowest">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Filter Control Sub-bar */}
        <div className="p-space-base bg-surface-container-low/40 border-b border-surface-container flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex flex-wrap items-center gap-space-sm flex-1 min-w-[280px]">
            {/* Search */}
            <div className="relative min-w-[240px] flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-2 text-[18px] text-outline">
                search
              </span>
              <input
                type="text"
                placeholder="Search case ID, customer, RRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-9 pr-3 rounded-lg bg-surface-container-lowest text-xs text-on-surface placeholder:text-outline border border-outline-variant/40 shadow-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg bg-surface-container-lowest text-xs text-on-surface border border-outline-variant/40 shadow-xs cursor-pointer"
            >
              <option value="ALL">Status: All Statuses</option>
              <option value="RECOVERED">Recovered</option>
              <option value="DIAGNOSED">In Progress</option>
              <option value="NEEDS_REVIEW">Needs Review</option>
              <option value="BLOCKED">Blocked</option>
            </select>

            {/* Reason Select */}
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg bg-surface-container-lowest text-xs text-on-surface border border-outline-variant/40 shadow-xs cursor-pointer"
            >
              <option value="ALL">Failure: All Reasons</option>
              <option value="BANK_DECLINE">Bank decline</option>
              <option value="INSUFFICIENT_FUNDS">Insufficient funds</option>
              <option value="GATEWAY_TIMEOUT">Gateway timeout</option>
              <option value="CARD_EXPIRED">Card expired</option>
              <option value="VELOCITY_LIMIT">Velocity limit</option>
            </select>
          </div>

          <div className="text-xs text-outline">
            Showing <strong className="text-on-surface">{filteredCases.length}</strong> of {cases.length} cases
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-secondary text-xs uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-space-base">Case ID</th>
                <th className="py-2.5 px-space-base">Customer</th>
                <th className="py-2.5 px-space-base text-right">Amount</th>
                <th className="py-2.5 px-space-base">Failure Reason</th>
                <th className="py-2.5 px-space-base">Autonomous Action</th>
                <th className="py-2.5 px-space-base">Confidence</th>
                <th className="py-2.5 px-space-base">Status</th>
                <th className="py-2.5 px-space-base text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-xs text-on-surface">
              {filteredCases.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-surface-container-low/60 transition-colors group cursor-pointer"
                >
                  <td
                    onClick={() => onSelectCase(c.id)}
                    className="py-3 px-space-base font-mono font-medium text-primary hover:underline"
                  >
                    {c.id}
                  </td>
                  <td onClick={() => onSelectCase(c.id)} className="py-3 px-space-base">
                    <div className="font-medium text-on-surface">{c.customer.name}</div>
                    <div className="text-[11px] text-outline">{c.customer.tier}</div>
                  </td>
                  <td onClick={() => onSelectCase(c.id)} className="py-3 px-space-base text-right font-mono font-semibold">
                    ₹{c.amountAtRisk.toLocaleString('en-IN')}
                  </td>
                  <td onClick={() => onSelectCase(c.id)} className="py-3 px-space-base text-on-surface-variant">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        c.payment.failure?.category === 'BANK_DECLINE' ? 'bg-rose-500' :
                        c.payment.failure?.category === 'INSUFFICIENT_FUNDS' ? 'bg-amber-500' : 'bg-slate-400'
                      }`} />
                      <span>{c.payment.failure?.description ?? 'Decline'}</span>
                    </div>
                  </td>
                  <td onClick={() => onSelectCase(c.id)} className="py-3 px-space-base">
                    <span className="inline-flex items-center gap-1 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px] text-primary">
                        {c.recommendedAction?.type === 'RETRY_PAYMENT' ? 'schedule' : 'bolt'}
                      </span>
                      <span>{c.recommendedAction?.type === 'RETRY_PAYMENT' ? 'Retry Payment' : 'Smart Dunning'}</span>
                    </span>
                  </td>
                  <td onClick={() => onSelectCase(c.id)} className="py-3 px-space-base">
                    {c.diagnosis ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-tertiary-fixed text-on-tertiary-fixed">
                        <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                        {c.diagnosis.confidencePercentage}%
                      </span>
                    ) : (
                      <span className="text-outline text-[11px]">Pending</span>
                    )}
                  </td>
                  <td onClick={() => onSelectCase(c.id)} className="py-3 px-space-base">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      c.status === 'RECOVERED' ? 'bg-emerald-50 text-emerald-700' :
                      c.status === 'NEEDS_REVIEW' ? 'bg-amber-50 text-amber-800' :
                      c.status === 'BLOCKED' ? 'bg-rose-50 text-rose-800' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {c.status === 'RECOVERED' ? 'Recovered' :
                       c.status === 'NEEDS_REVIEW' ? 'Needs Review' :
                       c.status === 'BLOCKED' ? 'Blocked' : 'In Progress'}
                    </span>
                  </td>
                  <td className="py-3 px-space-base text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDecisionCenter(c.id);
                      }}
                      className="px-2.5 py-1 rounded bg-surface-container text-primary hover:bg-primary hover:text-on-primary text-[11px] font-semibold transition-colors shadow-2xs"
                    >
                      Decision Center →
                    </button>
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
