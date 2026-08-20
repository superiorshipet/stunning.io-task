import { useState } from 'react';
import { HeroSection } from '../components/HeroSection';
import { PromptComposer } from '../components/PromptComposer';
import { GenerationWorkspace } from '@/features/generation/components/GenerationWorkspace';
import { useGenerationStream } from '@/features/generation/hooks/useGenerationStream';
import { SaveBuildAuthModal } from '@/features/auth/components/SaveBuildAuthModal';
import { useAuth } from '@/features/auth/context/AuthContext';
import { apiFetch } from '@/shared/api/client';
import { Cpu, Zap, Shield, Sparkles, Terminal, Layers } from 'lucide-react';

export function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>(['stripe', 'slack']);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { isAuthenticated } = useAuth();
  const {
    stages,
    isGenerating,
    streamedText,
    generatedPlan,
    startGeneration,
    cancel,
  } = useGenerationStream();

  const handleToggleIntegration = (id: string) => {
    setSelectedIntegrations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRunBuild = () => {
    if (!prompt.trim()) return;
    setIsSaved(false);
    startGeneration(prompt, selectedIntegrations);
  };

  const handleSaveBuild = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!generatedPlan) return;

    try {
      await apiFetch('/api/v1/apps', {
        method: 'POST',
        body: JSON.stringify({
          name: generatedPlan.title,
          description: generatedPlan.summary,
          template: 'saas',
          framework: 'nextjs',
          settingsJson: JSON.stringify({
            integrations: generatedPlan.integrations,
            plan: generatedPlan,
          }),
        }),
      });
      setIsSaved(true);
    } catch {
      const savedBuilds = JSON.parse(localStorage.getItem('stunning_saved_builds') || '[]');
      savedBuilds.unshift({
        id: 'build_' + Date.now(),
        name: generatedPlan.title,
        description: generatedPlan.summary,
        integrations: generatedPlan.integrations,
        createdAt: new Date().toISOString(),
        plan: generatedPlan,
      });
      localStorage.setItem('stunning_saved_builds', JSON.stringify(savedBuilds));
      setIsSaved(true);
    }
  };

  const handleStartOver = () => {
    setPrompt('');
    setIsSaved(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.location.reload();
  };

  const isWorkspaceMode = isGenerating || !!generatedPlan;

  return (
    <div className="relative flex-1 w-full px-6 sm:px-10 lg:px-16 py-8 flex flex-col justify-between">
      {/* Background Cosmic Ambient Lights & Orbit Ring */}
      <div className="absolute top-10 right-1/4 w-[800px] h-[800px] bg-violet-600/15 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-48 left-10 w-[600px] h-[600px] bg-indigo-600/12 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute -top-20 right-10 w-[800px] h-[800px] orbit-ring border-white/5 opacity-50 -z-10" />

      {!isWorkspaceMode ? (
        <div className="space-y-8 animate-in fade-in duration-300 w-full">
          {/* Hero Section */}
          <div className="pt-2">
            <HeroSection />
          </div>

          {/* Full-Width Expansive Prompt Composer */}
          <div className="w-full">
            <PromptComposer
              prompt={prompt}
              onChangePrompt={setPrompt}
              selectedIntegrations={selectedIntegrations}
              onToggleIntegration={handleToggleIntegration}
              onSubmit={handleRunBuild}
              isLoading={isGenerating}
            />
          </div>

          {/* Quick Archetype Badges */}
          <div className="w-full flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
              <span className="uppercase text-violet-400 font-bold flex items-center gap-1.5 mr-1">
                <Sparkles className="w-3.5 h-3.5" />
                POPULAR ARCHETYPES:
              </span>
              <button
                type="button"
                onClick={() => {
                  setPrompt('Subscription billing engine with Stripe webhook synchronization and customer email alerts');
                  setSelectedIntegrations(['stripe', 'gmail']);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] hover:text-white border border-white/10 hover:border-violet-500/40 transition-all cursor-pointer text-slate-200 shadow-2xs font-medium"
              >
                Stripe Billing SaaS
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrompt('E-commerce inventory tracker syncing Shopify orders with Slack notifications and Google Sheets export');
                  setSelectedIntegrations(['shopify', 'slack', 'google-sheets']);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] hover:text-white border border-white/10 hover:border-violet-500/40 transition-all cursor-pointer text-slate-200 shadow-2xs font-medium"
              >
                Shopify & Sheets Tracker
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrompt('Developer webhook dispatcher with Slack alerting, automated Gmail triage, and Stripe usage meters');
                  setSelectedIntegrations(['slack', 'gmail', 'stripe']);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] hover:text-white border border-white/10 hover:border-violet-500/40 transition-all cursor-pointer text-slate-200 shadow-2xs font-medium"
              >
                Webhook Dispatcher
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span>Zero Lock-in</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Production Artifacts</span>
              </span>
            </div>
          </div>

          {/* Three Feature Highlight Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/[0.08]">
            <div className="p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] hover:border-violet-500/30 transition-all space-y-2.5">
              <div className="flex items-center gap-3 text-white font-semibold text-sm">
                <div className="w-8 h-8 rounded-lg bg-violet-950/80 border border-violet-500/40 flex items-center justify-center shadow-glow-sm">
                  <Zap className="w-4 h-4 text-violet-400" />
                </div>
                <span>Instant Architecture Synthesis</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                Real-time SSE token streaming synthesizes your idea into structured system specifications and stack maps.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] hover:border-cyan-500/30 transition-all space-y-2.5">
              <div className="flex items-center gap-3 text-white font-semibold text-sm">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shadow-glow-cyan">
                  <Shield className="w-4 h-4 text-cyan-400" />
                </div>
                <span>Pre-Wired Ecosystem Connectors</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                Native integrations for Stripe payments, Shopify stores, Gmail automation, Slack alerts, and Google Sheets sync.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] hover:border-indigo-500/30 transition-all space-y-2.5">
              <div className="flex items-center gap-3 text-white font-semibold text-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center shadow-glow-sm">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                </div>
                <span>Implementation-Ready Blueprints</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                Export clean markdown build plans, complete with entity models, deployment roadmaps, and risk mitigations.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <GenerationWorkspace
          isGenerating={isGenerating}
          stages={stages}
          streamedText={streamedText}
          generatedPlan={generatedPlan}
          onCancel={cancel}
          onSaveBuild={handleSaveBuild}
          onStartOver={handleStartOver}
          isSaved={isSaved}
        />
      )}

      {/* Save Build Authentication Modal */}
      <SaveBuildAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleSaveBuild}
      />
    </div>
  );
}
