import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-8 px-2.5 text-xs',
    md: 'h-9 px-3.5 text-xs font-medium',
    lg: 'h-10 px-4 text-sm font-medium',
  }[size];

  const variantClasses = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container active:bg-primary shadow-xs border border-transparent',
    secondary: 'bg-surface-container-lowest text-on-surface border border-outline-variant/40 hover:bg-surface-container-low shadow-xs',
    ghost: 'bg-transparent text-secondary hover:bg-surface-container-low hover:text-on-surface',
    destructive: 'bg-error text-on-error hover:bg-error/90 shadow-xs border border-transparent',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="material-symbols-outlined text-[16px]">{icon}</span>
          )}
          <span>{children}</span>
          {icon && iconPosition === 'right' && (
            <span className="material-symbols-outlined text-[16px]">{icon}</span>
          )}
        </>
      )}
    </button>
  );
};
