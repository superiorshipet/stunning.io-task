import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import { ArrowRight, Lightbulb, Puzzle, Cpu, FileCode2, Sparkles } from 'lucide-react';

export function HowItWorksPage() {
  const navigate = useNavigate();

  const steps = [
    {
      num: '01',
      title: 'Idea Formulation',
      desc: 'Describe your product concept in natural language. Outline the core user journey, key SaaS mechanics, and business logic.',
      icon: <Lightbulb className="w-5 h-5 text-amber-400" />,
    },
    {
      num: '02',
      title: 'Context & Integrations Injection',
      desc: 'Attach key third-party ecosystems with a keystroke (Stripe payments, Shopify stores, Slack alerts, Gmail automation, Google Sheets data).',
      icon: <Puzzle className="w-5 h-5 text-cyan-400" />,
    },
    {
      num: '03',
      title: 'Real-Time Architecture Synthesis',
      desc: 'Our engine processes requirements through structured LLM pipelines, mapping system topologies, schema entities, and API gateways.',
      icon: <Cpu className="w-5 h-5 text-violet-400" />,
    },
    {
      num: '04',
      title: 'Implementation-Ready Artifact',
      desc: 'Receive a structured technical build document complete with stack rationale, integration protocols, execution roadmap, and risk mitigations.',
      icon: <FileCode2 className="w-5 h-5 text-emerald-400" />,
    },
  ];

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12 animate-in fade-in duration-300">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-xs font-mono text-violet-300 uppercase shadow-glow-sm">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          Pipeline Mechanics
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          From unformed idea to <span className="text-gradient-neon">implementation-ready artifact.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
          Stunning Builder turns natural language into structured technical specifications and deployment blueprints before code is committed.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {steps.map((s) => (
          <div key={s.num} className="p-6 rounded-2xl border border-white/10 bg-[#0E101B]/80 backdrop-blur-xl space-y-3.5 shadow-2xs hover:border-violet-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                {s.icon}
              </div>
              <span className="font-mono text-xs text-violet-400 font-bold">{s.num}</span>
            </div>
            <h3 className="text-base font-semibold text-white">{s.title}</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-white/[0.08] flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400">Ready to synthesize your next architecture?</span>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Start a New Build
        </Button>
      </div>
    </div>
  );
}
