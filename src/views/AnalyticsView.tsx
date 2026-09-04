import React, { useState } from 'react';
import { PageHeader, MetricCard } from '../design-system';
import { PLATFORM_KPIS, DAILY_PERFORMANCE_30D } from '../data/historical-stats';

export const AnalyticsView: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<'7D' | '30D' | '90D'>('30D');

  return (
    <div className="flex flex-col space-y-space-lg">
      <PageHeader
        title="Recovery Analytics"
        subtitle="Measure deterministic recovery performance, autonomous intervention efficacy, and ledger revenue impact."
      >
        <div className="flex items-center bg-surface-container-low px-1 py-1 rounded-xl shadow-xs border border-outline-variant/30">
          {(['7D', '30D', '90D'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRange(r)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedRange === r
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* 5 KPI Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-base">
        <MetricCard
          label="Revenue at Risk"
          value="₹8,42,500"
          delta={{ text: '+12.4%', isPositive: false, subtext: 'vs prev 30d' }}
          icon="shield_with_heart"
          footerText="317 failed billing events"
        />
        <MetricCard
          label="Revenue Recovered"
          value="₹4,72,350"
          delta={{ text: '68.4%', isPositive: true, subtext: 'captured' }}
          icon="price_check"
          footerText="Settled via direct routing"
        />
        <MetricCard
          label="Recovery Rate"
          value="68.4%"
          delta={{ text: '+4.2%', isPositive: true, subtext: 'vs benchmark' }}
          icon="insights"
          footerText="Autonomous pipeline"
        />
        <MetricCard
          label="Mean Latency"
          value="3.4h"
          delta={{ text: '-1.8h', isPositive: true, subtext: 'faster' }}
          icon="timer"
          footerText="Average settlement speed"
        />
        <MetricCard
          label="Resilience Index"
          value="99.8%"
          delta={{ text: 'Stable', isPositive: true, subtext: 'ISO 8583' }}
          icon="verified_user"
          footerText="Multi-rail redundancy"
        />
      </div>

      {/* Recovery Efficiency Curve & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <div className="lg:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/30 shadow-xs">
          <div className="flex items-center justify-between mb-space-base">
            <div>
              <h2 className="text-base font-semibold text-on-surface">Loss Prevention & Recovery Velocity</h2>
              <p className="text-xs text-on-surface-variant">Cumulative revenue reclaimed over active billing cycle</p>
            </div>
            <span className="text-xs font-mono text-outline">v2.4-telemetry</span>
          </div>

          <div className="relative w-full aspect-[21/9] min-h-[240px] flex flex-col justify-end">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 200">
              <line stroke="#EFF4FF" strokeWidth="1" x1="0" x2="600" y1="40" y2="40" />
              <line stroke="#EFF4FF" strokeWidth="1" x1="0" x2="600" y1="100" y2="100" />
              <line stroke="#EFF4FF" strokeWidth="1" x1="0" x2="600" y1="160" y2="160" />
              <path d="M 0,160 Q 150,140 300,100 T 600,40 L 600,200 L 0,200 Z" fill="#EEF2FF" opacity="0.6" />
              <path d="M 0,160 Q 150,140 300,100 T 600,40" fill="none" stroke="#2563EB" strokeWidth="3" />
            </svg>
            <div className="flex justify-between text-xs font-mono text-secondary pt-2">
              {DAILY_PERFORMANCE_30D.map(p => (
                <span key={p.date}>{p.label}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-on-surface mb-1">Method Efficiency Breakdown</h3>
            <p className="text-xs text-on-surface-variant mb-4">Autonomous success rate across payment rails</p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-on-surface">Card Network Auto-Retry</span>
                  <span className="font-mono font-bold text-primary">82.4%</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '82.4%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-on-surface">Smart Dunning & Reminder</span>
                  <span className="font-mono font-bold text-tertiary">71.2%</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-tertiary h-full rounded-full" style={{ width: '71.2%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-on-surface">Fallback Gateway Switch</span>
                  <span className="font-mono font-bold text-emerald-600">88.5%</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '88.5%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-on-surface">WhatsApp Mandate Update</span>
                  <span className="font-mono font-bold text-amber-600">64.0%</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: '64.0%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-container text-xs text-outline">
            Total Ingested Volume: <strong className="text-on-surface font-mono">₹{PLATFORM_KPIS.revenueAtRiskINR.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
