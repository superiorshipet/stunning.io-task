import { GenerationStage } from '../types';
import { StageItem } from './StageItem';

interface GenerationTimelineProps {
  stages: GenerationStage[];
}

export function GenerationTimeline({ stages }: GenerationTimelineProps) {
  return (
    <div className="w-full space-y-2 p-4 bg-[#0E101B]/80 rounded-2xl border border-white/15 backdrop-blur-xl shadow-glow-sm">
      <div className="px-2 py-1 flex items-center justify-between border-b border-white/[0.08] mb-2">
        <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-violet-400">
          EXECUTION PIPELINE
        </span>
        <span className="font-mono text-[10px] text-slate-400">
          5 Synthesis Stages
        </span>
      </div>

      <div className="space-y-1.5">
        {stages.map((stage) => (
          <StageItem key={stage.id} stage={stage} />
        ))}
      </div>
    </div>
  );
}
