import { useState } from 'react';
import { GeneratedPlan } from '../types';
import { IntegrationBadge } from '@/features/integrations/components/IntegrationBadge';
import { Button } from '@/shared/components/Button';
import { Copy, Check, Bookmark, RotateCcw, Download, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { MarkdownRenderer } from '@/shared/components/MarkdownRenderer';
import { buildPlanSections } from '../utils/planSections';

interface TechnicalPlanDocumentProps {
  plan: GeneratedPlan;
  onSaveBuild: () => void;
  onStartOver: () => void;
  isSaved?: boolean;
  activeSectionId?: string;
  onSelectSection?: (id: string) => void;
}

export function TechnicalPlanDocument({
  plan,
  onSaveBuild,
  onStartOver,
  isSaved = false,
  activeSectionId,
  onSelectSection,
}: TechnicalPlanDocumentProps) {
  const [copied, setCopied] = useState(false);
  const sections = plan.sections?.length ? plan.sections : buildPlanSections(plan.rawContent);
  const currentSectionIndex = Math.max(
    0,
    sections.findIndex((section) => section.id === activeSectionId)
  );
  const currentSection = sections[currentSectionIndex] ?? sections[0];
  const canGoPrevious = currentSectionIndex > 0;
  const canGoNext = currentSectionIndex < sections.length - 1;

  const selectSection = (index: number) => {
    const targetSection = sections[index];
    if (!targetSection) return;
    onSelectSection?.(targetSection.id);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(plan.rawContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${plan.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-build-plan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full bg-[#0E101B]/80 rounded-2xl border border-white/15 backdrop-blur-2xl shadow-[0_0_60px_-10px_rgba(0,0,0,0.8)] p-6 sm:p-10 space-y-12">
      {/* Document Header */}
      <div className="border-b border-white/[0.08] pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] text-violet-300 bg-violet-950/60 border border-violet-500/30 px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              <Sparkles className="w-3 h-3 text-violet-400" />
              AI Model Response • Created {plan.createdAt}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              {plan.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2.5 max-w-2xl leading-relaxed">
              {plan.summary}
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyMarkdown}
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJson}
              leftIcon={<Download className="w-3.5 h-3.5 text-slate-400" />}
            >
              Export
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onSaveBuild}
              leftIcon={<Bookmark className="w-3.5 h-3.5 text-violet-600" />}
            >
              {isSaved ? 'Saved' : 'Save Build'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onStartOver}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-400" />}
            >
              Start Over
            </Button>
          </div>
        </div>

        {/* Integration Chips */}
        {plan.integrations.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/[0.06]">
            <span className="font-mono text-[10px] uppercase font-bold text-slate-400 mr-1">
              Active Context:
            </span>
            {plan.integrations.map((id) => (
              <IntegrationBadge key={id} id={id} />
            ))}
          </div>
        )}
      </div>

      {currentSection && (
        <section id={currentSection.id} className="space-y-5 scroll-mt-28">
          <div className="flex flex-col gap-3 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Page {currentSectionIndex + 1} / {sections.length}
              </span>
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-violet-400 transition-all"
                  style={{ width: `${((currentSectionIndex + 1) / sections.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectSection(currentSectionIndex - 1)}
                disabled={!canGoPrevious}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5 text-slate-400" />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectSection(currentSectionIndex + 1)}
                disabled={!canGoNext}
                rightIcon={<ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">
            <span className="text-violet-300 bg-violet-950/80 border border-violet-500/30 px-1.5 py-0.5 rounded">
              {currentSection.number}
            </span>
            {currentSection.title}
          </div>
          <div className="bg-white/[0.03] p-6 rounded-xl border border-white/10">
            {currentSection.content ? (
              <MarkdownRenderer content={currentSection.content} />
            ) : (
              <p className="text-sm text-slate-500">No content was generated for this section.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
