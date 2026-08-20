import { cn } from '../utils/cn';

interface KeyboardHintProps {
  shortcut: string;
  className?: string;
}

export function KeyboardHint({ shortcut, className }: KeyboardHintProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center font-mono text-[10px] font-medium tracking-tight',
        'text-slate-400 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 shadow-2xs',
        className
      )}
    >
      {shortcut}
    </kbd>
  );
}
