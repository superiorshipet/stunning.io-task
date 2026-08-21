import { Link, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

export function Navbar() {
  const location = useLocation();
  const isMyBuilds = location.pathname.startsWith('/builds');
  const isHowItWorks = location.pathname === '/how-it-works';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#06070B]/85 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="w-full px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <a
            href="/"
            className="flex items-center gap-2.5 text-white hover:opacity-90 transition-opacity group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight uppercase text-xs text-white">
              STUNNING <span className="text-violet-400/50 font-light">/</span> <span className="font-mono text-slate-300 font-medium tracking-wider">BUILDER</span>
            </span>
          </a>

          {/* Navigation Links */}
          <nav className="hidden sm:flex items-center gap-1 text-xs font-medium text-slate-400">
            <Link
              to="/how-it-works"
              className={cn(
                'px-3.5 py-1.5 rounded-lg transition-colors hover:text-white hover:bg-white/[0.05]',
                isHowItWorks && 'text-white bg-white/[0.08] font-semibold'
              )}
            >
              How it works
            </Link>
            <Link
              to="/builds"
              className={cn(
                'px-3.5 py-1.5 rounded-lg transition-colors hover:text-white hover:bg-white/[0.05]',
                isMyBuilds && 'text-white bg-white/[0.08] font-semibold'
              )}
            >
              My Builds
            </Link>
          </nav>
        </div>

        <div className="hidden sm:block text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-violet-300">
          Live demo
        </div>
      </div>
    </header>
  );
}
