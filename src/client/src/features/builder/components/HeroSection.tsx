import { Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative pt-12 sm:pt-20 pb-8 max-w-4xl">
      {/* Background Orbit Ring Visual */}
      <div className="absolute -top-16 -left-20 w-[600px] h-[600px] orbit-ring opacity-40 -z-10" />
      <div className="absolute -top-32 -left-40 w-[850px] h-[850px] orbit-ring opacity-20 -z-10" />

      {/* Radiant Pill Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 mb-6 shadow-glow-sm backdrop-blur-md">
        <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
        <span className="font-mono text-xs font-medium tracking-wide uppercase">
          AI Architecture & Build Engine
        </span>
      </div>

      {/* Main Impact Headline */}
      <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-extrabold tracking-tight text-white leading-[1.08] drop-shadow-sm">
        Software begins before the <span className="text-gradient-neon">first line of code.</span>
      </h1>

      {/* Subtitle */}
      <p className="mt-6 text-base sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl">
        Step into your engineering hub. Describe the product, inject the ecosystem, and synthesize an implementation-ready technical plan.
      </p>
    </div>
  );
}
