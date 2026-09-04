import React from 'react';

interface TopBarProps {
  currentViewTitle: string;
  onSearchClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentViewTitle,
  onSearchClick,
}) => {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 z-40 flex items-center justify-between px-space-xl">
      {/* Breadcrumbs & View Indicator */}
      <div className="flex items-center gap-space-base">
        <svg className="h-6 w-6 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="#1E40AF"/>
          <path d="M9 16C9 12.134 12.134 9 16 9C19.1259 9 21.7828 11.0505 22.6842 13.9M23 16C23 19.866 19.866 23 16 23C12.8741 23 10.2172 20.9495 9.31579 18.1" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M23 10V14.2H18.8M9 22V17.8H13.2" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="h-4 w-px bg-outline-variant/40" />
        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
          <span className="text-outline">Operations</span>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface font-semibold capitalize">
            {currentViewTitle}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-space-md">
        {/* Timezone IST */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-[15px]">schedule</span>
          <span>UTC+05:30 (IST)</span>
        </div>

        {/* Search Bar / Trigger */}
        <div
          onClick={onSearchClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">search</span>
          <span className="text-xs">Search cases</span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-container-lowest border border-outline-variant/50 text-outline shadow-xs">
            ⌘K
          </kbd>
        </div>

        {/* Simulation Mode Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/40 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
          <span>Simulation Active</span>
        </div>

        {/* Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-semibold text-xs shadow-xs">
          <span className="material-symbols-outlined text-[18px]">person</span>
        </div>
      </div>
    </header>
  );
};
