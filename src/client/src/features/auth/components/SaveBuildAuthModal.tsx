import React, { useState } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';

interface SaveBuildAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SaveBuildAuthModal({ isOpen, onClose, onSuccess }: SaveBuildAuthModalProps) {
  const { login, register } = useAuth();
  const [isSignInMode, setIsSignInMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isSignInMode) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      onSuccess?.();
      onClose();
    } catch {
      setError('Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isSignInMode ? "Sign in to Stunning" : "Save your build"}
      description={
        isSignInMode
          ? "Enter your credentials to access your saved workspace builds."
          : "Create an account to keep this build and return to it later."
      }
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase text-slate-300 font-bold tracking-tight">
            Email address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/[0.05] border border-white/15 rounded-xl focus:bg-white/[0.08] focus:outline-hidden focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all font-mono text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase text-slate-300 font-bold tracking-tight">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/[0.05] border border-white/15 rounded-xl focus:bg-white/[0.08] focus:outline-hidden focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all font-mono text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full justify-between"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-violet-600" />
            {isSignInMode ? "Sign In" : "Create Account & Save"}
          </Button>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => {
                setIsSignInMode(!isSignInMode);
                setError(null);
              }}
              className="text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
            >
              {isSignInMode
                ? "Need an account? Create one"
                : "Already have an account? Sign in"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              Maybe later
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
