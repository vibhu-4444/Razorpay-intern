import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="relative flex items-center w-full">
      {icon && (
        <span className="material-symbols-outlined absolute left-2.5 text-[18px] text-outline pointer-events-none">
          {icon}
        </span>
      )}
      <input
        className={`w-full h-9 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline text-xs border border-outline-variant/40 shadow-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
          icon ? 'pl-8 pr-3' : 'px-3'
        } ${className}`}
        {...props}
      />
    </div>
  );
};

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
  icon?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="relative inline-flex items-center">
      {icon && (
        <span className="material-symbols-outlined absolute left-2.5 text-[16px] text-outline pointer-events-none">
          {icon}
        </span>
      )}
      <select
        className={`appearance-none h-9 pl-3 pr-8 rounded-lg bg-surface-container-lowest text-on-surface text-xs border border-outline-variant/40 shadow-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-surface-container-low transition-colors ${
          icon ? 'pl-8' : ''
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined absolute right-2 text-[16px] pointer-events-none text-outline">
        expand_more
      </span>
    </div>
  );
};

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex items-center gap-space-sm overflow-x-auto border-b border-surface-container pb-px">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative pb-3 px-2 flex items-center gap-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              isActive
                ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium ${
                  isActive
                    ? 'bg-primary-fixed text-on-primary-fixed'
                    : 'bg-surface-container text-on-secondary-container'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
