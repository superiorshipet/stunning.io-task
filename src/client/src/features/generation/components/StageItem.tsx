import { Check } from 'lucide-react';
import { GenerationStage } from '../types';
import { cn } from '@/shared/utils/cn';

interface StageItemProps {
  stage: GenerationStage;
}

export function StageItem({ stage }: StageItemProps) {
  const { number, name, status } = stage;

  return (
    <div
      className={cn(
        'flex items-center justify-between py-2.5 px-3.5 rounded-xl font-mono text-xs transition-all duration-200 border',
        status === 'active' && 'bg-violet-950/50 border-violet-500/40 text-white font-medium shadow-glow-sm',
        status === 'completed' && 'text-slate-300 bg-white/[0.03] border-white/5',
        status === 'pending' && 'text-slate-500 border-transparent opacity-50'
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn(
          'text-[11px] font-semibold',
          status === 'active' ? 'text-violet-400' : 'text-slate-500'
        )}>
          {number}
        </span>
        <span className={cn(status === 'active' && 'text-white font-semibold tracking-wide')}>
          {name}
        </span>
      </div>

      <div className="shrink-0 flex items-center justify-center w-5 h-5">
        {status === 'completed' && (
          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-2xs">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </span>
        )}
        {status === 'active' && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500 shadow-glow-sm" />
          </span>
        )}
        {status === 'pending' && (
          <span className="w-2 h-2 rounded-full border border-slate-600" />
        )}
      </div>
    </div>
  );
}
