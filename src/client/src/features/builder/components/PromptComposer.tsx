import React, { useRef, useEffect } from 'react';
import { ContextChip } from './ContextChip';
import { IntegrationPicker } from '@/features/integrations/components/IntegrationPicker';
import { useIntegrations } from '@/features/integrations/api/useIntegrations';
import { Button } from '@/shared/components/Button';
import { Plus, ArrowRight, Sparkles, Terminal } from 'lucide-react';
import { useKeyboardShortcut } from '@/shared/hooks/useKeyboardShortcut';

interface PromptComposerProps {
  prompt: string;
  onChangePrompt: (value: string) => void;
  selectedIntegrations: string[];
  onToggleIntegration: (id: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

const MAX_CHAR_COUNT = 2000;

export function PromptComposer({
  prompt,
  onChangePrompt,
  selectedIntegrations,
  onToggleIntegration,
  onSubmit,
  isLoading = false,
}: PromptComposerProps) {
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: integrations = [] } = useIntegrations();

  // Cmd+K to open integration picker
  useKeyboardShortcut({ key: 'k', metaOrCtrl: true }, (e) => {
    e.preventDefault();
    setIsPickerOpen(true);
  });

  // Cmd+Enter to submit
  useKeyboardShortcut({ key: 'Enter', metaOrCtrl: true }, (e) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit();
    }
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(110, textareaRef.current.scrollHeight)}px`;
    }
  }, [prompt]);

  const charCount = prompt.length;

  return (
    <>
      <div className="relative w-full rounded-2xl bg-[#0E101B]/80 border border-white/15 shadow-[0_0_50px_-10px_rgba(139,92,246,0.3)] backdrop-blur-2xl transition-all focus-within:border-violet-500/60 focus-within:shadow-[0_0_60px_-5px_rgba(139,92,246,0.45)]">
        {/* Subtle Top Glow Gradient */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent opacity-80" />

        {/* Header Label */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-violet-400" />
            <span className="font-mono text-[11px] uppercase font-bold tracking-widest text-slate-300">
              WHAT SHOULD WE BUILD?
            </span>
          </div>
          <span className="inline-flex items-center gap-2 font-mono text-[11px] text-violet-300/80 bg-violet-950/60 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Celestial Engine Active
          </span>
        </div>

        {/* Multiline Prompt Input */}
        <div className="p-6 pt-4">
          <textarea
            ref={textareaRef}
            rows={3}
            value={prompt}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHAR_COUNT) {
                onChangePrompt(e.target.value);
              }
            }}
            placeholder="Describe your software vision... (e.g. Build an AI-driven invoice factoring marketplace with Stripe billing, automated Shopify store audits, and customer alerts to Slack)"
            className="w-full resize-none text-base sm:text-lg text-white placeholder:text-slate-500 placeholder:font-light font-normal bg-transparent focus:outline-hidden leading-relaxed"
          />
        </div>

        {/* Context Section (Integrations) */}
        <div className="px-6 py-3.5 bg-white/[0.02] border-t border-white/[0.06]">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-400 mr-1 select-none">
              CONTEXT
            </span>

            {selectedIntegrations.map((id) => {
              const item = integrations.find((i) => i.id === id);
              return (
                <ContextChip
                  key={id}
                  id={id}
                  name={item?.name || id}
                  onRemove={() => onToggleIntegration(id)}
                />
              );
            })}

            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white border border-dashed border-white/20 hover:border-violet-400 transition-all shadow-2xs cursor-pointer select-none"
            >
              <Plus className="w-3.5 h-3.5 text-violet-400" />
              <span>+ Add context</span>
              <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1 py-0.5 rounded ml-1">⌘K</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/[0.03] border-t border-white/[0.08] rounded-b-2xl">
          <span className="font-mono text-xs text-slate-400">
            {charCount} <span className="text-slate-600">/</span> {MAX_CHAR_COUNT}
          </span>

          <Button
            variant="primary"
            size="md"
            onClick={onSubmit}
            isLoading={isLoading}
            disabled={!prompt.trim() || isLoading}
            shortcut="⌘ ↵"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="px-5 py-2.5"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-violet-600" />
            RUN BUILD
          </Button>
        </div>
      </div>

      {/* Integration Raycast Command Picker */}
      <IntegrationPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedIds={selectedIntegrations}
        onToggleIntegration={onToggleIntegration}
      />
    </>
  );
}
