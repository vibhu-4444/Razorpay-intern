import React from 'react';
import { RecoveryStatus } from '../../domain/recovery-case';

export interface StatusBadgeProps {
  status: RecoveryStatus | 'TEST_MODE' | 'SIMULATION' | 'PASS' | 'BLOCKED';
  size?: 'sm' | 'md';
  pulseDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  pulseDot,
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  switch (status) {
    case 'RECOVERED':
    case 'PASS':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 ${sizeClasses}`}>
          {pulseDot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          Recovered
        </span>
      );

    case 'EXECUTING':
    case 'DIAGNOSED':
    case 'ELIGIBLE':
    case 'APPROVED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-blue-50 text-blue-800 border border-blue-200 ${sizeClasses}`}>
          {pulseDot && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
          In Progress
        </span>
      );

    case 'NEEDS_REVIEW':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-amber-50 text-amber-800 border border-amber-300 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Needs Review
        </span>
      );

    case 'BLOCKED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-rose-50 text-rose-800 border border-rose-300 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Blocked
        </span>
      );

    case 'FAILED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-red-50 text-red-800 border border-red-300 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Failed
        </span>
      );

    case 'TEST_MODE':
    case 'SIMULATION':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded font-mono font-medium bg-surface-container-high text-on-secondary-container border border-outline-variant/50 ${sizeClasses}`}>
          {status}
        </span>
      );

    case 'DETECTED':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-surface-container-low text-secondary border border-outline-variant/40 ${sizeClasses}`}>
          Detected
        </span>
      );
  }
};
