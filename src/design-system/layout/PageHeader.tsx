import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  showTestModeBadge?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  children,
  showTestModeBadge = true,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-sm">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-on-surface-variant mt-1">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-space-sm self-start sm:self-auto flex-wrap">
        {showTestModeBadge && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-800 text-xs font-mono font-medium border border-amber-300 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            TEST MODE
          </span>
        )}
        {children}
      </div>
    </div>
  );
};
