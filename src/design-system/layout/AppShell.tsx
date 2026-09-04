import React from 'react';
import { Sidebar, NavRoute } from './Sidebar';
import { TopBar } from './TopBar';

interface AppShellProps {
  currentRoute: NavRoute;
  currentViewTitle: string;
  onRouteChange: (route: NavRoute) => void;
  exceptionCount?: number;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentRoute,
  currentViewTitle,
  onRouteChange,
  exceptionCount = 12,
  children,
}) => {
  return (
    <div className="min-h-screen bg-surface flex text-on-surface">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onRouteChange={onRouteChange}
        exceptionCount={exceptionCount}
      />

      {/* Main Content Area */}
      <div className="pl-64 flex flex-col min-h-screen w-full">
        {/* Fixed TopBar */}
        <TopBar
          currentViewTitle={currentViewTitle}
          onSearchClick={() => onRouteChange('recovery-cases')}
        />

        {/* Dynamic Page Container */}
        <main className="w-full pt-16 flex-1 bg-surface">
          <div className="w-full max-w-[1440px] mx-auto p-space-base sm:p-space-lg lg:p-space-xl">
            <div className="flex flex-col w-full space-y-space-lg">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
