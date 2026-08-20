import { useState, useEffect, useMemo, useRef } from 'react';
import { useIntegrations } from '../api/useIntegrations';
import { IntegrationRow } from './IntegrationRow';
import { Search, X } from 'lucide-react';
import { KeyboardHint } from '@/shared/components/KeyboardHint';

interface IntegrationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onToggleIntegration: (id: string) => void;
}

export function IntegrationPicker({
  isOpen,
  onClose,
  selectedIds,
  onToggleIntegration,
}: IntegrationPickerProps) {
  const { data: integrations = [] } = useIntegrations();
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Grouping structure: PAYMENTS, COMMERCE, COMMUNICATION, DATA
  const filteredIntegrations = useMemo(() => {
    if (!search.trim()) return integrations;
    const q = search.toLowerCase().trim();
    return integrations.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }, [integrations, search]);

  const categories = useMemo(() => {
    const order = ['Payments', 'Commerce', 'E-Commerce', 'Communication', 'Data', 'Productivity'];
    const groups: { [cat: string]: typeof filteredIntegrations } = {};

    filteredIntegrations.forEach((item) => {
      let cat = item.category;
      if (cat.toLowerCase() === 'e-commerce') cat = 'Commerce';
      if (cat.toLowerCase() === 'email' || cat.toLowerCase() === 'messaging') cat = 'Communication';
      if (cat.toLowerCase() === 'productivity') cat = 'Data';

      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    return Object.entries(groups).sort(([a], [b]) => {
      const idxA = order.indexOf(a);
      const idxB = order.indexOf(b);
      return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99);
    });
  }, [filteredIntegrations]);

  // Flattened array for index-based keyboard navigation
  const flatList = useMemo(() => {
    return categories.flatMap(([, items]) => items);
  }, [categories]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setFocusedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % Math.max(1, flatList.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + flatList.length) % Math.max(1, flatList.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatList[focusedIndex]) {
          onToggleIntegration(flatList[focusedIndex].id);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatList, focusedIndex, onClose, onToggleIntegration]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Dark Ambient Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Command Palette */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg bg-[#0E101B]/95 rounded-2xl border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Subtle Top Glow Line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-400/80 to-transparent" />

        {/* Search Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <Search className="w-4 h-4 text-violet-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setFocusedIndex(0);
            }}
            placeholder="Search integrations, capabilities..."
            className="w-full text-xs font-mono bg-transparent border-0 focus:outline-hidden text-white placeholder:text-slate-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categories & Rows List */}
        <div className="max-h-[360px] overflow-y-auto p-2.5 space-y-4">
          {flatList.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-slate-500">
              No integrations found matching "{search}"
            </div>
          ) : (
            categories.map(([category, items]) => (
              <div key={category} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  {category}
                </div>
                <div className="space-y-0.5">
                  {items.map((integration) => {
                    const currentIndex = flatList.findIndex((i) => i.id === integration.id);
                    const isSelected = selectedIds.includes(integration.id);
                    const isFocused = currentIndex === focusedIndex;

                    return (
                      <IntegrationRow
                        key={integration.id}
                        integration={integration}
                        isSelected={isSelected}
                        isFocused={isFocused}
                        onToggle={() => onToggleIntegration(integration.id)}
                        onMouseEnter={() => setFocusedIndex(currentIndex)}
                      />
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with keyboard hints */}
        <div className="flex items-center justify-between px-5 py-3 bg-white/[0.02] border-t border-white/[0.08] text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <KeyboardHint shortcut="↑" />
              <KeyboardHint shortcut="↓" />
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <KeyboardHint shortcut="↵" />
              <span>Toggle</span>
            </span>
          </div>

          <span className="flex items-center gap-1.5">
            <KeyboardHint shortcut="ESC" />
            <span>Close</span>
          </span>
        </div>
      </div>
    </div>
  );
}
