import { useState } from 'react';
import { HeroSection } from '../components/HeroSection';
import { PromptComposer } from '../components/PromptComposer';
import { GenerationWorkspace } from '@/features/generation/components/GenerationWorkspace';
import { useGenerationStream } from '@/features/generation/hooks/useGenerationStream';
import { SaveBuildAuthModal } from '@/features/auth/components/SaveBuildAuthModal';
import { useAuth } from '@/features/auth/context/AuthContext';
import { apiFetch } from '@/shared/api/client';
import { Cpu, Zap, Shield, Sparkles } from 'lucide-react';

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
    <div className="relative flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-96 left-5 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {!isWorkspaceMode ? (
        <div className="space-y-10 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Content (7 cols) */}
            <div className="lg:col-span-7">
              <HeroSection />
            </div>

            {/* Right Glowing Celestial Emblem (5 cols) */}
            <div className="hidden lg:flex lg:col-span-5 justify-center items-center relative">
              <div className="relative w-72 h-72 rounded-3xl bg-gradient-to-tr from-violet-600/30 via-indigo-500/20 to-cyan-400/20 border border-white/20 p-8 flex flex-col items-center justify-center shadow-[0_0_80px_rgba(139,92,246,0.35)] backdrop-blur-2xl animate-float">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-800 flex items-center justify-center shadow-glow-lg border border-violet-300/40 mb-4">
                  <Cpu className="w-12 h-12 text-white animate-pulse" />
                </div>
                <span className="font-mono text-xs text-white font-bold uppercase tracking-wider">
                  Celestial Core
                </span>
                <span className="text-[11px] font-mono text-violet-300 mt-1 text-center">
                  .NET 10 • PostgreSql • Redis
                </span>
              </div>
            </div>
          </div>

          {/* Prompt Composer Section */}
          <div className="max-w-4xl">
            <PromptComposer
              prompt={prompt}
              onChangePrompt={setPrompt}
              selectedIntegrations={selectedIntegrations}
              onToggleIntegration={handleToggleIntegration}
              onSubmit={handleRunBuild}
              isLoading={isGenerating}
            />
          </div>

          {/* Quick Preset Badges */}
          <div className="max-w-4xl pt-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
              <span className="uppercase text-violet-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Popular Archetypes:
              </span>
              <button
                type="button"
                onClick={() => {
                  setPrompt('Subscription billing engine with Stripe webhook synchronization and customer email alerts');
                  setSelectedIntegrations(['stripe', 'gmail']);
                }}
                className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] hover:text-white border border-white/10 transition-all cursor-pointer text-slate-300"
              >
                Stripe Billing SaaS
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrompt('E-commerce inventory tracker syncing Shopify orders with Slack notifications and Google Sheets export');
                  setSelectedIntegrations(['shopify', 'slack', 'google-sheets']);
                }}
                className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] hover:text-white border border-white/10 transition-all cursor-pointer text-slate-300"
              >
                Shopify & Sheets Tracker
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrompt('Developer webhook dispatcher with Slack alerting, automated Gmail triage, and Stripe usage meters');
                  setSelectedIntegrations(['slack', 'gmail', 'stripe']);
                }}
                className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] hover:text-white border border-white/10 transition-all cursor-pointer text-slate-300"
              >
                Webhook Dispatcher
              </button>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl pt-6 border-t border-white/[0.08]">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <Zap className="w-4 h-4 text-violet-400" />
                <span>Instant Synthesis</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Real-time SSE token streaming transitions ideas straight into production topology maps.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Ecosystem Connectors</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Direct integration schemas with pre-configured webhooks for Stripe, Shopify, Gmail, Slack & Sheets.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>Deployable Blueprints</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Receive stack choices, architectural node diagrams, and risk mitigations ready to commit.
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
