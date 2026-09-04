import React from 'react';

export type NavRoute = 
  | 'overview'
  | 'recovery-cases'
  | 'case-detail'
  | 'decision-center'
  | 'exceptions'
  | 'analytics'
  | 'evaluation-lab'
  | 'settings';

interface SidebarProps {
  currentRoute: NavRoute;
  onRouteChange: (route: NavRoute) => void;
  exceptionCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onRouteChange,
  exceptionCount = 12,
}) => {
  const navItems: Array<{
    id: NavRoute;
    label: string;
    icon: string;
    badge?: number;
    badgeVariant?: 'error' | 'primary';
  }> = [
    { id: 'overview', label: 'Overview', icon: 'grid_view' },
    { id: 'recovery-cases', label: 'Recovery Cases', icon: 'inbox' },
    { id: 'exceptions', label: 'Exceptions', icon: 'error_outline', badge: exceptionCount, badgeVariant: 'error' },
    { id: 'analytics', label: 'Analytics', icon: 'trending_up' },
    { id: 'evaluation-lab', label: 'Evaluation Lab', icon: 'science' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest border-r border-outline-variant/40 z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="h-16 px-space-base flex items-center gap-space-sm border-b border-outline-variant/30">
          <svg className="h-8 w-8 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#1E40AF"/>
            <path d="M9 16C9 12.134 12.134 9 16 9C19.1259 9 21.7828 11.0505 22.6842 13.9M23 16C23 19.866 19.866 23 16 23C12.8741 23 10.2172 20.9495 9.31579 18.1" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M23 10V14.2H18.8M9 22V17.8H13.2" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="flex items-center gap-space-xs">
            <span className="font-bold text-lg tracking-tight text-on-surface">REVIVE</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-surface-container-high text-primary border border-primary/20">
              OPERATIONS
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-space-sm py-space-base space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentRoute === item.id || (item.id === 'recovery-cases' && (currentRoute === 'case-detail' || currentRoute === 'decision-center'));
            return (
              <button
                key={item.id}
                onClick={() => onRouteChange(item.id)}
                className={`w-full flex items-center justify-between px-space-base py-2 rounded-lg transition-colors text-sm ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-medium shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-space-md">
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-error-container text-on-error-container">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-space-base border-t border-outline-variant/30 bg-surface-container-lowest flex flex-col gap-space-sm">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-on-surface-variant">Systems Operational</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-container-high text-on-secondary-container border border-outline-variant/50">
            TEST MODE
          </span>
          <span className="text-xs text-on-surface-variant font-mono">v2.4-ops</span>
        </div>

        <div className="pt-1">
          <p className="text-xs text-on-surface-variant truncate" title="Razorpay Direct Merchant (sandbox)">
            Razorpay Direct Merchant <span className="text-outline">(sandbox)</span>
          </p>
        </div>
      </div>
    </aside>
  );
};
