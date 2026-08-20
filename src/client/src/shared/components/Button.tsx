import React from 'react';
import { cn } from '../utils/cn';
import { KeyboardHint } from './KeyboardHint';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'neon' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  shortcut?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      shortcut,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        'bg-white text-neutral-950 hover:bg-slate-100 active:bg-slate-200 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] border border-white transition-all duration-200',
      neon:
        'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white hover:brightness-110 font-semibold shadow-glow-sm hover:shadow-glow-md border border-violet-400/40 transition-all duration-200',
      secondary:
        'bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.12] text-slate-200 border border-white/10 backdrop-blur-md font-medium transition-all duration-200',
      outline:
        'bg-transparent text-slate-300 hover:text-white hover:bg-white/5 border border-white/15 font-medium transition-all duration-200',
      ghost:
        'bg-transparent text-slate-400 hover:text-white hover:bg-white/5 font-medium transition-all duration-200',
      destructive:
        'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 font-medium transition-all duration-200',
    };

    const sizes = {
      sm: 'text-xs h-7 px-2.5 gap-1.5 rounded-lg',
      md: 'text-sm h-9 px-4 gap-2 rounded-lg',
      lg: 'text-base h-11 px-5 gap-2.5 rounded-xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-40 disabled:pointer-events-none cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {rightIcon}
        {shortcut && <KeyboardHint shortcut={shortcut} className="ml-1" />}
      </button>
    );
  }
);

Button.displayName = 'Button';
