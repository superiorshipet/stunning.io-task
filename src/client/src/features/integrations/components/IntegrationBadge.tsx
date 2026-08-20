import { getIntegrationIcon } from '@/shared/icons/IntegrationIcons';
import { cn } from '@/shared/utils/cn';

interface IntegrationBadgeProps {
  id: string;
  name?: string;
  colored?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function IntegrationBadge({
  id,
  name,
  colored = true,
  size = 'sm',
  className,
}: IntegrationBadgeProps) {
  const icon = getIntegrationIcon(id, colored, size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-slate-200 bg-white/[0.06] border border-white/10 rounded-md shadow-2xs select-none',
        size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      {icon}
      <span>{name || id}</span>
    </span>
  );
}
