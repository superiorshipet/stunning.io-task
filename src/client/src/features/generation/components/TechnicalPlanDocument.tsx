import { useState } from 'react';
import { GeneratedPlan } from '../types';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { IntegrationBadge } from '@/features/integrations/components/IntegrationBadge';
import { Button } from '@/shared/components/Button';
import { Copy, Check, Bookmark, RotateCcw, Download, Terminal, Layers, Sparkles } from 'lucide-react';

interface TechnicalPlanDocumentProps {
  plan: GeneratedPlan;
  onSaveBuild: () => void;
  onStartOver: () => void;
  isSaved?: boolean;
}

export function TechnicalPlanDocument({
  plan,
  onSaveBuild,
  onStartOver,
  isSaved = false,
}: TechnicalPlanDocumentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = () => {
    const md = `# ${plan.title}\n\n## Overview\n${plan.overview}\n\n## Stack\n${plan.stack.map((s) => `- **${s.layer}**: ${s.technology} (${s.reason})`).join('\n')}\n\n## Implementation\n${plan.implementationSteps.map((i) => `${i.step}. **${i.title}** - ${i.detail} [${i.estimatedHours}]`).join('\n')}`;
    navigator.clipboard.writeText(md);
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
              Technical Architecture Artifact • Created {plan.createdAt}
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

      {/* Section 01: Overview */}
      <section id="overview" className="space-y-4 scroll-mt-28">
        <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">
          <span className="text-violet-300 bg-violet-950/80 border border-violet-500/30 px-1.5 py-0.5 rounded">01</span>
          Overview & Product Strategy
        </div>
        <div className="text-sm sm:text-base text-slate-200 leading-relaxed bg-white/[0.03] p-6 rounded-xl border border-white/10">
          {plan.overview}
        </div>
      </section>

      {/* Section 02: Architecture */}
      <section id="architecture" className="space-y-4 scroll-mt-28">
        <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">
          <span className="text-violet-300 bg-violet-950/80 border border-violet-500/30 px-1.5 py-0.5 rounded">02</span>
          Architecture Topology
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          {plan.architecture.description}
        </p>
        <ArchitectureDiagram integrations={plan.integrations} framework={plan.framework} />
      </section>

      {/* Section 03: Tech Stack */}
      <section id="stack" className="space-y-4 scroll-mt-28">
        <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">
          <span className="text-violet-300 bg-violet-950/80 border border-violet-500/30 px-1.5 py-0.5 rounded">03</span>
          Selected Stack
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-mono text-xs">
          {plan.stack.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-violet-500/40 transition-colors">
              <span className="text-[10px] text-violet-400 uppercase block font-bold">
                {item.layer}
              </span>
              <span className="font-bold text-white text-sm mt-1 block">
                {item.technology}
              </span>
              <p className="text-slate-300 font-sans text-xs mt-2 leading-relaxed">
                {item.reason}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 04: Integrations Details */}
      <section id="integrations" className="space-y-4 scroll-mt-28">
        <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">
          <span className="text-violet-300 bg-violet-950/80 border border-violet-500/30 px-1.5 py-0.5 rounded">04</span>
          Integration Connectors & Strategy
        </div>
        <div className="space-y-3 font-mono text-xs">
          {plan.integrationDetails.map((item, idx) => (
            <div key={idx} className="p-5 rounded-xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-2 mb-2.5">
                <IntegrationBadge id={item.id} name={item.name} size="sm" />
                <span className="text-slate-400 text-[10px]">Direct API / Webhook Protocol</span>
              </div>
              <p className="text-slate-200 font-sans text-xs sm:text-sm leading-relaxed">
                {item.strategy}
              </p>
              {item.webhooks && item.webhooks.length > 0 && (
                <div className="mt-3.5 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-violet-400 font-bold uppercase">Webhooks:</span>
                  {item.webhooks.map((w, wIdx) => (
                    <span key={wIdx} className="bg-white/5 border border-white/10 px-2.5 py-0.5 rounded text-[11px] text-slate-300">
                      {w}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Section 05: Implementation */}
      <section id="implementation" className="space-y-4 scroll-mt-28">
        <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">
          <span className="text-violet-300 bg-violet-950/80 border border-violet-500/30 px-1.5 py-0.5 rounded">05</span>
          Implementation Roadmap
        </div>
        <div className="space-y-2.5">
          {plan.implementationSteps.map((step) => (
            <div key={step.step} className="flex items-start gap-3.5 p-4 rounded-xl border border-white/10 bg-white/[0.03] font-mono text-xs">
              <span className="w-7 h-7 rounded-lg bg-violet-950/80 border border-violet-500/40 text-violet-300 font-bold flex items-center justify-center shrink-0 text-xs shadow-glow-sm">
                {step.step}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-white text-sm">
                    {step.title}
                  </span>
                  <span className="text-[10px] text-violet-300 bg-violet-950/60 border border-violet-500/30 px-2 py-0.5 rounded">
                    Est: {step.estimatedHours}
                  </span>
                </div>
                <p className="text-slate-300 font-sans text-xs sm:text-sm mt-1.5 leading-relaxed">
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 06: Risks */}
      <section id="risks" className="space-y-4 scroll-mt-28">
        <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">
          <span className="text-violet-300 bg-violet-950/80 border border-violet-500/30 px-1.5 py-0.5 rounded">06</span>
          Engineering Risks & Mitigations
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          {plan.risks.map((risk, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white font-mono text-xs">{risk.risk}</span>
                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                  risk.severity === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                  risk.severity === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {risk.severity}
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                <strong className="text-slate-100">Mitigation:</strong> {risk.mitigation}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Generated Code Files */}
      {plan.files.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-white/[0.08]">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-violet-400 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-violet-400" />
            Scaffolded Application Files ({plan.files.length})
          </div>
          <div className="space-y-3.5">
            {plan.files.map((file, fIdx) => (
              <div key={fIdx} className="rounded-xl border border-white/15 overflow-hidden font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.05] border-b border-white/10 text-slate-200">
                  <span className="flex items-center gap-2 font-medium">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    {file.path}
                  </span>
                  <span className="text-[10px] uppercase text-violet-400 font-semibold">{file.language}</span>
                </div>
                <pre className="p-5 bg-[#07080E] text-slate-200 overflow-x-auto text-[11px] leading-relaxed">
                  <code>{file.content}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
