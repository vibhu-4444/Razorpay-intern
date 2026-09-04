import React from 'react';

export interface FailureTypeBadgeProps {
  category?: string;
  code?: string;
}

export const FailureTypeBadge: React.FC<FailureTypeBadgeProps> = ({ category, code }) => {
  let dotColor = 'bg-slate-400';
  let label = code ?? category ?? 'Unknown';

  if (category === 'BANK_DECLINE') {
    dotColor = 'bg-rose-500';
    label = 'Bank decline';
  } else if (category === 'INSUFFICIENT_FUNDS') {
    dotColor = 'bg-amber-500';
    label = 'Insufficient funds';
  } else if (category === 'GATEWAY_TIMEOUT') {
    dotColor = 'bg-rose-500';
    label = 'Gateway timeout';
  } else if (category === 'CARD_EXPIRED') {
    dotColor = 'bg-slate-500';
    label = 'Card expired';
  } else if (category === 'VELOCITY_LIMIT') {
    dotColor = 'bg-error';
    label = 'Velocity limit';
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
};

export interface ConfidenceIndicatorProps {
  confidencePercentage: number;
  expectedRecoveryPercentage?: number;
  label?: string;
  size?: 'sm' | 'md';
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidencePercentage,
  expectedRecoveryPercentage,
}) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1 font-semibold text-tertiary">
          <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
          <span>{confidencePercentage}% Model Confidence</span>
        </span>
        {expectedRecoveryPercentage !== undefined && (
          <span className="font-mono text-primary font-medium">
            {expectedRecoveryPercentage}% Recovery Likelihood
          </span>
        )}
      </div>
      <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-tertiary h-full rounded-full transition-all duration-500"
          style={{ width: `${confidencePercentage}%` }}
        />
      </div>
    </div>
  );
};

export interface PolicyDecisionBadgeProps {
  allowed: boolean;
  checksPassed: number;
  totalChecks: number;
}

export const PolicyDecisionBadge: React.FC<PolicyDecisionBadgeProps> = ({
  allowed,
  checksPassed,
  totalChecks,
}) => {
  if (allowed) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
        <span className="material-symbols-outlined text-[14px] text-emerald-700">verified</span>
        <span>POLICY_PASS_{checksPassed}/{totalChecks}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300">
      <span className="material-symbols-outlined text-[14px] text-rose-700">block</span>
      <span>POLICY_BLOCKED_{checksPassed}/{totalChecks}</span>
    </span>
  );
};
