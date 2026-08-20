import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from './Button';
import { User, LogOut, Terminal } from 'lucide-react';
import { cn } from '../utils/cn';

interface NavbarProps {
  onOpenAuthModal?: () => void;
}

export function Navbar({ onOpenAuthModal }: NavbarProps) {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isMyBuilds = location.pathname.startsWith('/builds');
  const isHowItWorks = location.pathname === '/how-it-works';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07080E]/75 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with Celestial Glow */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-sm text-white hover:opacity-90 transition-opacity group"
          >
            <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight uppercase text-xs text-white">
              Stunning <span className="text-violet-400/60 font-light">/</span> <span className="font-mono text-slate-300 font-medium tracking-wider">BUILDER</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Link
              to="/how-it-works"
              className={cn(
                'px-3 py-1.5 rounded-lg transition-colors hover:text-white hover:bg-white/[0.04]',
                isHowItWorks && 'text-white bg-white/[0.08] font-semibold'
              )}
            >
              How it works
            </Link>
            <Link
              to="/builds"
              className={cn(
                'px-3 py-1.5 rounded-lg transition-colors hover:text-white hover:bg-white/[0.04]',
                isMyBuilds && 'text-white bg-white/[0.08] font-semibold'
              )}
            >
              My Builds
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-200 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                <User className="w-3.5 h-3.5 text-violet-400" />
                <span className="max-w-[140px] truncate">{user?.email}</span>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenAuthModal}
              className="text-xs"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
