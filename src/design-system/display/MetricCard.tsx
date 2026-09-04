import React from 'react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: {
    text: string;
    isPositive?: boolean;
    subtext?: string;
  };
  icon?: string;
  iconColorClass?: string;
  footerText?: string;
  className?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  delta,
  icon,
  iconColorClass = 'text-primary',
  footerText,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-surface-container-lowest p-space-base rounded-lg border border-outline-variant/30 shadow-xs flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:border-primary/40 hover:shadow-sm' : ''
      } ${className}`}
    >
      {/* Header: Label & Icon */}
      <div className="flex items-center justify-between text-on-surface-variant mb-space-sm">
        <span className="text-xs uppercase font-semibold tracking-wider text-secondary">
          {label}
        </span>
        {icon && (
          <span className={`material-symbols-outlined text-[20px] ${iconColorClass}`}>
            {icon}
          </span>
        )}
      </div>

      {/* Main KPI */}
      <div>
        <div className="text-2xl lg:text-3xl font-bold text-on-surface font-data-mono tracking-tight">
          {value}
        </div>

        {delta && (
          <div className="text-xs text-secondary mt-1 flex items-center gap-1">
            <span
              className={`font-medium ${
                delta.isPositive === false ? 'text-error' : 'text-emerald-700'
              }`}
            >
              {delta.text}
            </span>
            {delta.subtext && (
              <span className="text-outline">{delta.subtext}</span>
            )}
          </div>
        )}
      </div>

      {/* Optional Card Footer */}
      {footerText && (
        <div className="mt-3 pt-2 border-t border-surface-container-low text-[11px] text-on-surface-variant">
          {footerText}
        </div>
      )}
    </div>
  );
};
