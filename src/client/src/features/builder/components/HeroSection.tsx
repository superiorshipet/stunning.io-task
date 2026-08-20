import { Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative pt-6 sm:pt-10 pb-4 max-w-4xl">
      {/* Radiant Pill Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/70 border border-violet-500/40 text-violet-300 mb-4 shadow-glow-sm backdrop-blur-md">
        <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
        <span className="font-mono text-xs font-semibold tracking-wide uppercase">
          AI Architecture & Build Engine
        </span>
      </div>

      {/* Main Impact Headline */}
      <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-extrabold tracking-tight text-white leading-[1.08] drop-shadow-md">
        Software begins before the <span className="text-gradient-neon">first line of code.</span>
      </h1>

      {/* Subtitle */}
      <p className="mt-4 text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
        Step into your engineering hub. Describe the product, inject the ecosystem, and synthesize an implementation-ready technical build plan.
      </p>
    </div>
  );
}
