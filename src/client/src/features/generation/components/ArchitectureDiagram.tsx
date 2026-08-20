import { getIntegrationIcon } from '@/shared/icons/IntegrationIcons';

interface ArchitectureDiagramProps {
  integrations?: string[];
  framework?: string;
}

export function ArchitectureDiagram({ integrations = ['stripe', 'slack'], framework = 'Next.js' }: ArchitectureDiagramProps) {
  return (
    <div className="relative w-full bg-[#0B0C16] text-white rounded-2xl border border-violet-500/25 p-6 font-mono text-xs shadow-glow-sm overflow-x-auto">
      {/* Background radial glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-glow-cyan" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300">
            SYSTEM TOPOLOGY & DATA CONDUIT
          </span>
        </div>
        <span className="text-[10px] text-violet-400 font-mono">
          Architecture Map
        </span>
      </div>

      <div className="min-w-[540px] flex flex-col items-center gap-4 py-2 select-none">
        {/* Tier 1: Client */}
        <div className="flex items-center justify-center">
          <div className="px-6 py-3 rounded-xl bg-white/[0.06] border border-white/20 text-center shadow-2xs hover:border-cyan-400/50 transition-colors">
            <span className="text-cyan-400 text-[10px] uppercase block font-semibold">Client Presentation Layer</span>
            <span className="font-bold text-white tracking-wide text-sm">{framework.toUpperCase()} WEB WORKSPACE</span>
          </div>
        </div>

        {/* Connector 1 */}
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-400 to-violet-500" />
          <span className="text-[10px] text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/10 my-0.5">HTTPS / WSS / SSE</span>
          <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-violet-500" />
        </div>

        {/* Tier 2: Core API Engine */}
        <div className="flex items-center justify-center">
          <div className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-950/90 via-indigo-950/90 to-violet-950/90 border border-violet-500/50 text-center shadow-glow-sm">
            <span className="text-violet-300 text-[10px] uppercase block font-bold tracking-wider">Application Core Engine</span>
            <span className="font-bold text-white text-sm tracking-tight">ASP.NET CORE .NET 10 BACKEND</span>
          </div>
        </div>

        {/* Connector 2 Split */}
        <div className="w-80 flex justify-between items-center relative py-1">
          <div className="w-1/2 border-b border-violet-500/40" />
          <div className="w-1/2 border-b border-violet-500/40" />
        </div>

        {/* Tier 3: Data & State & Integrations */}
        <div className="grid grid-cols-3 gap-3.5 w-full max-w-xl">
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/15 text-center hover:border-violet-500/40 transition-colors">
            <span className="text-slate-400 text-[10px] uppercase block">Primary Store</span>
            <span className="font-semibold text-slate-200">PostgreSQL (Railway)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/15 text-center hover:border-violet-500/40 transition-colors">
            <span className="text-slate-400 text-[10px] uppercase block">Cache & PubSub</span>
            <span className="font-semibold text-slate-200">Redis Engine</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/15 text-center hover:border-violet-500/40 transition-colors">
            <span className="text-slate-400 text-[10px] uppercase block">AI Orchestrator</span>
            <span className="font-semibold text-slate-200">OpenAI GPT-4o</span>
          </div>
        </div>

        {/* Tier 4: Connected Integrations */}
        {integrations.length > 0 && (
          <>
            <div className="flex flex-col items-center mt-3">
              <div className="w-0.5 h-5 bg-gradient-to-b from-violet-500 to-cyan-400" />
              <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-cyan-400" />
            </div>

            <div className="w-full max-w-xl p-4 rounded-xl bg-black/50 border border-white/15 flex flex-wrap items-center justify-center gap-2.5">
              <span className="text-[10px] uppercase text-violet-400 font-bold mr-2 tracking-wider">
                EXTERNAL CONNECTORS:
              </span>
              {integrations.map((id) => (
                <div
                  key={id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.07] border border-white/15 text-slate-200 text-xs shadow-2xs"
                >
                  {getIntegrationIcon(id, true, 'w-3.5 h-3.5')}
                  <span className="capitalize font-medium">{id.replace('-', ' ')}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
