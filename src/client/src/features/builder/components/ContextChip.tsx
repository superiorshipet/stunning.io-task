import { getIntegrationIcon } from '@/shared/icons/IntegrationIcons';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface ContextChipProps {
  id: string;
  name: string;
  onRemove: () => void;
  className?: string;
}

export function ContextChip({ id, name, onRemove, className }: ContextChipProps) {
  return (
    <span
      className={cn(
        'group inline-flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-lg text-xs font-mono font-extrabold uppercase tracking-wide',
        'bg-violet-500/18 hover:bg-violet-500/24 text-white border border-violet-300/45 backdrop-blur-md shadow-glow-sm transition-all',
        className
      )}
    >
      <span className="shrink-0">{getIntegrationIcon(id, true, 'w-3.5 h-3.5')}</span>
      <span className="select-none text-white font-extrabold">{name}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="text-slate-400 hover:text-white hover:bg-white/10 rounded p-0.5 transition-colors cursor-pointer"
        aria-label={`Remove ${name}`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
