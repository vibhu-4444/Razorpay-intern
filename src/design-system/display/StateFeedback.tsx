import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'inbox',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-xl border border-outline-variant/30 text-center">
      <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-outline mb-3">
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
      <h3 className="text-base font-semibold text-on-surface mb-1">{title}</h3>
      <p className="text-sm text-on-surface-variant max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-medium shadow-xs hover:bg-primary/90 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading operational telemetry...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-xl border border-outline-variant/30 text-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
      <p className="text-sm font-medium text-on-surface-variant">{message}</p>
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Telemetry Error',
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-red-50/50 rounded-xl border border-red-200 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-error mb-3">
        <span className="material-symbols-outlined text-[24px]">error_outline</span>
      </div>
      <h3 className="text-base font-semibold text-error mb-1">{title}</h3>
      <p className="text-sm text-on-surface-variant max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3.5 py-1.5 rounded-lg bg-error text-on-error text-xs font-medium shadow-xs hover:bg-error/90 transition-colors"
        >
          Retry Request
        </button>
      )}
    </div>
  );
};
