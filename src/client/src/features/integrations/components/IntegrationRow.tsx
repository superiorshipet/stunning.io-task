import { getIntegrationIcon } from '@/shared/icons/IntegrationIcons';
import { Integration } from '../types';
import { Check } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface IntegrationRowProps {
  integration: Integration;
  isSelected: boolean;
  isFocused: boolean;
  onToggle: () => void;
  onMouseEnter: () => void;
}

export function IntegrationRow({
  integration,
  isSelected,
  isFocused,
  onToggle,
  onMouseEnter,
}: IntegrationRowProps) {
  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={onToggle}
      onMouseEnter={onMouseEnter}
      className={cn(
        'group flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer transition-all text-xs border border-transparent',
        isFocused ? 'bg-white/[0.08] border-white/15 text-white shadow-2xs' : 'hover:bg-white/[0.04] text-slate-300',
        isSelected && 'bg-violet-950/30 border-violet-500/30'
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center border transition-all shrink-0',
            isSelected
              ? 'bg-violet-950/60 border-violet-500/50 shadow-glow-sm'
              : 'bg-white/[0.04] border-white/10 text-slate-400 group-hover:text-white'
          )}
        >
          {getIntegrationIcon(integration.id, isSelected, 'w-4 h-4')}
        </div>

        <div className="truncate">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white font-mono">
              {integration.name}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded">
              {integration.category}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">
            {integration.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-3 shrink-0">
        {isSelected ? (
          <span className="flex items-center gap-1 text-[11px] font-mono text-violet-300 font-medium bg-violet-500/20 border border-violet-500/30 px-2.5 py-0.5 rounded-md shadow-2xs">
            <Check className="w-3 h-3" />
            Selected
          </span>
        ) : (
          <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Select
          </span>
        )}
      </div>
    </div>
  );
}
