/**
 * REVIVE Synthetic Data: Metrics & Historical Telemetry
 * 
 * Aggregated ledger and recovery metrics matching Stitch Command Center & Analytics.
 */

export interface DailyChartPoint {
  date: string;
  label: string;
  atRiskINR: number;
  recoveredINR: number;
  efficiencyPercentage: number;
}

export const PLATFORM_KPIS = {
  revenueAtRiskINR: 842500,
  revenueAtRiskDeltaPercent: 12.4,
  recoverableRevenueINR: 691200,
  recoverablePercentage: 81.9,
  revenueRecoveredINR: 472350,
  recoveryRatePercentage: 68.4,
  activeInterventionsCount: 37,
  requiresReviewCount: 12,
  policyBlockedCount: 27,
  providerFailuresCount: 8,
  meanRecoveryLatencyHours: 3.4,
  gatewayResilienceIndex: 99.8,
  totalCasesCount: 482,
};

export const PIPELINE_FUNNEL = [
  {
    step: '01. DETECTED',
    title: 'Failed webhooks',
    count: 482,
    conversionRate: 100,
    color: 'bg-secondary',
  },
  {
    step: '02. DIAGNOSED',
    title: 'Root cause pinned',
    count: 451,
    conversionRate: 93.5,
    color: 'bg-primary-container',
  },
  {
    step: '03. ELIGIBLE',
    title: 'Within SLA limits',
    count: 317,
    conversionRate: 65.7,
    color: 'bg-primary-container',
  },
  {
    step: '04. APPROVED',
    title: 'Rule consensus',
    count: 296,
    conversionRate: 61.4,
    color: 'bg-primary-container',
  },
  {
    step: '05. EXECUTED',
    title: 'Dunning / retried',
    count: 284,
    conversionRate: 58.9,
    color: 'bg-primary-container',
  },
  {
    step: '06. RECOVERED',
    title: 'Funds settled',
    count: 189,
    conversionRate: 39.2,
    color: 'bg-emerald-600',
  },
];

export const DAILY_PERFORMANCE_30D: DailyChartPoint[] = [
  { date: '2024-10-01', label: 'Oct 01', atRiskINR: 22000, recoveredINR: 14500, efficiencyPercentage: 65.9 },
  { date: '2024-10-08', label: 'Oct 08', atRiskINR: 28500, recoveredINR: 19800, efficiencyPercentage: 69.4 },
  { date: '2024-10-15', label: 'Oct 15', atRiskINR: 24000, recoveredINR: 17200, efficiencyPercentage: 71.6 },
  { date: '2024-10-24', label: 'Oct 24', atRiskINR: 32400, recoveredINR: 24800, efficiencyPercentage: 76.5 },
  { date: '2024-10-30', label: 'Oct 30', atRiskINR: 29000, recoveredINR: 21500, efficiencyPercentage: 74.1 },
];
