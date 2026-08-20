import { cn } from '@/shared/utils/cn';

interface NavSection {
  id: string;
  number: string;
  title: string;
}

const SECTIONS: NavSection[] = [
  { id: 'overview', number: '01', title: 'AI Response' },
];

interface DocumentNavigationProps {
  activeSection: string;
  onSelectSection: (id: string) => void;
}

export function DocumentNavigation({ activeSection, onSelectSection }: DocumentNavigationProps) {
  return (
    <nav className="sticky top-24 w-full space-y-1.5 font-mono text-xs select-none p-3 rounded-2xl bg-[#0E101B]/80 border border-white/10 backdrop-blur-xl">
      <div className="px-3 py-1 text-[10px] uppercase font-bold text-violet-400 tracking-wider">
        DOCUMENT SECTIONS
      </div>

      <div className="space-y-1">
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => onSelectSection(sec.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer border',
                isActive
                  ? 'bg-violet-950/60 border-violet-500/50 text-white font-semibold shadow-glow-sm'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <span className={cn('text-[11px] font-bold', isActive ? 'text-violet-400' : 'text-slate-500')}>
                {sec.number}
              </span>
              <span>{sec.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
