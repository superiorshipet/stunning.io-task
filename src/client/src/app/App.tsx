import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/shared/components/Navbar';
import { SaveBuildAuthModal } from '@/features/auth/components/SaveBuildAuthModal';

export function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#07080E] text-slate-100 font-sans cosmic-mesh relative selection:bg-violet-600 selection:text-white">
      {/* Top Ambient Violet Radial Glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-radial from-violet-600/15 via-transparent to-transparent pointer-events-none -z-10" />

      <Navbar onOpenAuthModal={() => setIsAuthModalOpen(true)} />

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-white/[0.08] py-8 text-center text-xs font-mono text-slate-500 bg-[#07080E]/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            STUNNING BUILDER • CELESTIAL ARCHITECTURE ENGINE
          </span>
          <span className="text-slate-600">v1.0.0 • .NET 10 + REACT 19 • DEEP COSMIC THEME</span>
        </div>
      </footer>

      <SaveBuildAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
