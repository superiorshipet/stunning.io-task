import { useState } from 'react';
import { GenerationStage, GeneratedPlan } from '../types';
import { GenerationTimeline } from './GenerationTimeline';
import { DocumentNavigation } from './DocumentNavigation';
import { TechnicalPlanDocument } from './TechnicalPlanDocument';
import { Button } from '@/shared/components/Button';
import { X, Sparkles, Terminal } from 'lucide-react';

interface GenerationWorkspaceProps {
  isGenerating: boolean;
  stages: GenerationStage[];
  streamedText: string;
  generatedPlan: GeneratedPlan | null;
  onCancel: () => void;
  onSaveBuild: () => void;
  onStartOver: () => void;
  isSaved?: boolean;
}

export function GenerationWorkspace({
  isGenerating,
  stages,
  streamedText,
  generatedPlan,
  onCancel,
  onSaveBuild,
  onStartOver,
  isSaved = false,
}: GenerationWorkspaceProps) {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1. Loading & Streaming state
  if (isGenerating && !generatedPlan) {
    return (
      <div className="relative w-full max-w-4xl mx-auto py-12 space-y-6 animate-in fade-in duration-300">
        {/* Atmospheric Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-mono text-xs text-violet-300 font-semibold tracking-wider">
            <Sparkles className="w-4 h-4 text-violet-400 animate-spin" />
            <span>SYNTHESIZING TECHNICAL BUILD PLAN</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel} leftIcon={<X className="w-3.5 h-3.5" />}>
            Cancel
          </Button>
        </div>

        {/* Stage Timeline */}
        <GenerationTimeline stages={stages} />

        {/* Live Stream Output Box */}
        {streamedText && (
          <div className="p-5 rounded-2xl bg-[#090A11] text-slate-200 border border-violet-500/30 font-mono text-xs shadow-glow-sm space-y-2.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/[0.08] pb-2.5">
              <span className="flex items-center gap-1.5 text-violet-300 font-semibold">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Live Architecture Stream
              </span>
              <span className="animate-pulse text-cyan-400 flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Receiving tokens
              </span>
            </div>
            <div className="max-h-52 overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-300">
              {streamedText}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Completed Plan Workspace
  if (generatedPlan) {
    return (
      <div className="w-full py-6 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sticky Navigation (3 cols) */}
          <aside className="hidden lg:block lg:col-span-3">
            <DocumentNavigation
              activeSection={activeSection}
              onSelectSection={scrollToSection}
            />
          </aside>

          {/* Right Main Document (9 cols) */}
          <main className="lg:col-span-9 w-full">
            <TechnicalPlanDocument
              plan={generatedPlan}
              onSaveBuild={onSaveBuild}
              onStartOver={onStartOver}
              isSaved={isSaved}
            />
          </main>
        </div>
      </div>
    );
  }

  return null;
}
