import { cn } from '../utils/cn';

interface StatusIndicatorProps {
  status: 'healthy' | 'draft' | 'building' | 'succeeded' | 'failed' | 'queued' | 'active' | 'pending';
  label?: string;
  className?: string;
  pulse?: boolean;
}

export function StatusIndicator({ status, label, className, pulse }: StatusIndicatorProps) {
  const styles = {
    healthy: 'bg-emerald-500',
    succeeded: 'bg-emerald-500',
    active: 'bg-indigo-600',
    building: 'bg-amber-500',
    queued: 'bg-neutral-400',
    pending: 'bg-neutral-300',
    draft: 'bg-neutral-400',
    failed: 'bg-rose-500',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 font-mono text-xs text-neutral-600', className)}>
      <span className="relative flex h-2 w-2">
        {(pulse || status === 'building' || status === 'active') && (
          <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', styles[status])} />
        )}
        <span className={cn('relative inline-flex rounded-full h-2 w-2', styles[status])} />
      </span>
      {label && <span className="capitalize">{label}</span>}
    </span>
  );
}
