import React, { useState } from 'react';
import { PageHeader, MetricCard, PipelineStepper } from '../design-system';
import { PLATFORM_KPIS, DAILY_PERFORMANCE_30D } from '../data/historical-stats';
import { RecoveryCase } from '../domain/recovery-case';

interface OverviewViewProps {
  cases: RecoveryCase[];
  onSelectCase: (id: string) => void;
  onNavigateExceptions: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  cases,
  onSelectCase,
  onNavigateExceptions,
}) => {
  const [selectedRange, setSelectedRange] = useState<'7D' | '30D' | '90D'>('30D');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCases = cases.filter(c => 
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.payment.failure?.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-space-lg">
      {/* Page Header */}
      <PageHeader
        title="Revenue Recovery"
        subtitle="Monitor at-risk revenue, recovery performance, and active interventions."
      >
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-container-lowest text-on-surface text-xs font-medium border border-outline-variant/40 shadow-xs hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">tune</span>
          <span>Filter View</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary-container text-on-primary-container text-xs font-medium shadow-xs hover:bg-primary transition-colors">
          <span className="material-symbols-outlined text-[16px]">file_download</span>
          <span>Export Ledger</span>
        </button>
      </PageHeader>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-base">
        <MetricCard
          label="Revenue at Risk"
          value="₹8,42,500"
          delta={{ text: '+12.4%', isPositive: false, subtext: 'vs previous period' }}
          icon="trending_down"
          iconColorClass="text-error"
        />
        <MetricCard
          label="Recoverable Revenue"
          value="₹6,91,200"
          delta={{ text: '81.9%', isPositive: true, subtext: 'of at-risk revenue' }}
          icon="auto_fix_high"
          iconColorClass="text-primary"
        />
        <MetricCard
          label="Revenue Recovered"
          value="₹4,72,350"
          delta={{ text: '68.4%', isPositive: true, subtext: 'recovery rate' }}
          icon="check_circle"
          iconColorClass="text-emerald-600"
        />
        <MetricCard
          label="Active Interventions"
          value="37"
          delta={{ text: '12', isPositive: false, subtext: 'require review' }}
          icon="pending_actions"
          iconColorClass="text-amber-600"
          onClick={onNavigateExceptions}
        />
      </div>

      {/* Performance & Alerts Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Chart Container (8 cols) */}
        <div className="lg:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md mb-space-lg">
            <div>
              <h2 className="text-base font-semibold text-on-surface">Recovery Performance</h2>
              <p className="text-xs text-on-surface-variant">Daily volume of at-risk transactions against automated recoveries.</p>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container-low p-1 rounded-md self-start sm:self-auto">
              {(['7D', '30D', '90D'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={`px-2.5 py-1 text-xs rounded transition-colors ${
                    selectedRange === range
                      ? 'bg-surface-container-lowest font-semibold text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Chart */}
          <div className="relative w-full aspect-[21/9] min-h-[260px] flex flex-col justify-end">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 240">
              <defs>
                <linearGradient id="recoveredGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="atRiskGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Horizontal Grid lines */}
              <line stroke="#EFF4FF" strokeWidth="1" x1="0" x2="700" y1="20" y2="20" />
              <line stroke="#EFF4FF" strokeWidth="1" x1="0" x2="700" y1="80" y2="80" />
              <line stroke="#EFF4FF" strokeWidth="1" x1="0" x2="700" y1="140" y2="140" />
              <line stroke="#EFF4FF" strokeWidth="1" x1="0" x2="700" y1="200" y2="200" />
              {/* At-risk curve & area */}
              <path d="M 0,160 Q 70,120 140,140 T 280,100 T 420,130 T 560,70 T 700,90 L 700,220 L 0,220 Z" fill="url(#atRiskGrad)" />
              <path d="M 0,160 Q 70,120 140,140 T 280,100 T 420,130 T 560,70 T 700,90" fill="none" stroke="#94A3B8" strokeDasharray="4 4" strokeWidth="2" />
              {/* Recovered curve & area */}
              <path d="M 0,195 Q 70,165 140,175 T 280,145 T 420,160 T 560,110 T 700,125 L 700,220 L 0,220 Z" fill="url(#recoveredGrad)" />
              <path d="M 0,195 Q 70,165 140,175 T 280,145 T 420,160 T 560,110 T 700,125" fill="none" stroke="#2563EB" strokeWidth="2.5" />
              {/* Active Marker at Oct 24 */}
              <line stroke="#2563EB" strokeDasharray="2 2" strokeWidth="1.5" x1="560" x2="560" y1="20" y2="220" />
              <circle cx="560" cy="70" fill="#FFFFFF" r="4.5" stroke="#64748B" strokeWidth="2" />
              <circle cx="560" cy="110" fill="#2563EB" r="5" stroke="#FFFFFF" strokeWidth="2" />
            </svg>

            {/* Floating Tooltip Box */}
            <div className="absolute top-2 right-12 sm:right-28 bg-inverse-surface text-inverse-on-surface p-2.5 rounded shadow-lg pointer-events-none z-10 font-mono text-[11px] leading-tight space-y-1">
              <div className="text-surface-variant font-semibold">Oct 24, 2024</div>
              <div className="flex items-center justify-between gap-3 text-white">
                <span className="text-slate-300">At Risk:</span>
                <span className="font-bold">₹32,400</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-emerald-300">
                <span>Recovered:</span>
                <span className="font-bold">₹24,800</span>
              </div>
              <div className="pt-0.5 text-[10px] text-primary-fixed">Efficiency: 76.5%</div>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between items-center pt-2 font-mono text-xs text-secondary">
              {DAILY_PERFORMANCE_30D.map((p) => (
                <span key={p.date} className={p.label === 'Oct 24' ? 'font-semibold text-primary' : ''}>
                  {p.label}
                </span>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-space-lg pt-space-md mt-space-sm border-t border-surface-container">
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-secondary"></span>
              <span className="text-xs text-on-surface-variant">At-Risk Invoices</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 rounded-full bg-primary-container"></span>
              <span className="text-xs text-on-surface-variant">Autonomous Recovered</span>
            </div>
            <div className="ml-auto text-xs text-outline">
              Mean recovery latency: <strong className="text-on-surface">{PLATFORM_KPIS.meanRecoveryLatencyHours} hours</strong>
            </div>
          </div>
        </div>

        {/* Operational Attention Required (4 cols) */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-base">
              <div>
                <h2 className="text-base font-semibold text-on-surface">Attention Required</h2>
                <p className="text-xs text-on-surface-variant">Actionable queue triggers</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-error-container text-on-error-container">
                3 Categories
              </span>
            </div>

            <div className="space-y-space-sm">
              {/* Item 1 */}
              <div
                onClick={onNavigateExceptions}
                className="p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group cursor-pointer border border-outline-variant/20"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Needs Review
                  </span>
                  <span className="text-amber-700 text-xs font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                    Review Queue →
                  </span>
                </div>
                <div className="text-sm font-semibold text-on-surface">12 cases require review</div>
                <p className="text-xs text-on-surface-variant mt-0.5">High-value enterprise accounts with manual intervention guardrails.</p>
              </div>

              {/* Item 2 */}
              <div
                onClick={onNavigateExceptions}
                className="p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group cursor-pointer border border-outline-variant/20"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    Policy Blocked
                  </span>
                  <span className="text-rose-700 text-xs font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                    Inspect Rules →
                  </span>
                </div>
                <div className="text-sm font-semibold text-on-surface">27 interventions blocked</div>
                <p className="text-xs text-on-surface-variant mt-0.5">Daily attempt frequency or user opt-out thresholds reached.</p>
              </div>

              {/* Item 3 */}
              <div
                onClick={onNavigateExceptions}
                className="p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group cursor-pointer border border-outline-variant/20"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-container-highest text-secondary">
                    Gateway Timeout
                  </span>
                  <span className="text-secondary text-xs font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                    Check Telemetry →
                  </span>
                </div>
                <div className="text-sm font-semibold text-on-surface">8 provider failures</div>
                <p className="text-xs text-on-surface-variant mt-0.5">HDFC network latency spike detected across recurring UPI rails.</p>
              </div>
            </div>
          </div>

          <div className="mt-space-base pt-space-sm border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
            <span>Automated triage active</span>
            <span onClick={onNavigateExceptions} className="text-primary font-medium hover:underline cursor-pointer">
              Configure Guardrails
            </span>
          </div>
        </div>
      </div>

      {/* Recovery Pipeline Stepper Flow */}
      <PipelineStepper />

      {/* Recent Recovery Activity Table Section */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-space-base flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border-b border-surface-container">
          <div className="flex items-center gap-space-sm">
            <h2 className="text-sm font-semibold text-on-surface">Recent Recovery Activity</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Feed
            </span>
          </div>

          <div className="flex items-center gap-space-sm">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-outline">
                filter_list
              </span>
              <input
                type="text"
                placeholder="Filter by case, client or error..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-md bg-surface-container-low text-xs text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary w-64 border border-outline-variant/30 transition-all"
              />
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="p-1.5 rounded hover:bg-surface-container-low text-on-surface-variant transition-colors"
              title="Refresh Feed"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>
          </div>
        </div>

        {/* Data Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-secondary text-xs uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-space-base">Case ID</th>
                <th className="py-2.5 px-space-base">Customer</th>
                <th className="py-2.5 px-space-base text-right">Amount</th>
                <th className="py-2.5 px-space-base">Failure Reason</th>
                <th className="py-2.5 px-space-base">Autonomous Action</th>
                <th className="py-2.5 px-space-base">Status</th>
                <th className="py-2.5 px-space-base text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-xs text-on-surface">
              {filteredCases.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectCase(c.id)}
                  className="hover:bg-surface-container-low/60 transition-colors group cursor-pointer"
                >
                  <td className="py-3 px-space-base font-mono font-medium text-primary group-hover:underline">
                    {c.id}
                  </td>
                  <td className="py-3 px-space-base font-medium">
                    {c.customer.name}
                  </td>
                  <td className="py-3 px-space-base text-right font-mono font-semibold">
                    ₹{c.amountAtRisk.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-space-base text-on-surface-variant flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      c.payment.failure?.category === 'BANK_DECLINE' ? 'bg-rose-500' :
                      c.payment.failure?.category === 'INSUFFICIENT_FUNDS' ? 'bg-amber-500' : 'bg-slate-400'
                    }`} />
                    {c.payment.failure?.description ?? 'Decline'}
                  </td>
                  <td className="py-3 px-space-base">
                    <span className="inline-flex items-center gap-1 text-on-surface-variant font-medium">
                      <span className="material-symbols-outlined text-[14px] text-primary">
                        {c.recommendedAction?.type === 'RETRY_PAYMENT' ? 'schedule' : 'bolt'}
                      </span>
                      {c.recommendedAction?.type === 'RETRY_PAYMENT' ? 'Retry (cooldown)' : 'Smart Dunning'}
                    </span>
                  </td>
                  <td className="py-3 px-space-base">
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
                  <td className="py-3 px-space-base text-right font-mono text-secondary">
                    {c.id === 'RP-10482' ? '2m ago' : '8m ago'}
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
