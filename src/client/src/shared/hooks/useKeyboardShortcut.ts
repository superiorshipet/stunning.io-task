import { useEffect } from 'react';

type KeyCombo = {
  key: string;
  metaOrCtrl?: boolean;
  shift?: boolean;
  alt?: boolean;
};

export function useKeyboardShortcut(
  combo: KeyCombo,
  callback: (e: KeyboardEvent) => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      const matchKey = e.key.toLowerCase() === combo.key.toLowerCase();
      const matchMetaCtrl = combo.metaOrCtrl ? (e.metaKey || e.ctrlKey) : true;
      const matchShift = combo.shift ? e.shiftKey : true;
      const matchAlt = combo.alt ? e.altKey : true;

      if (matchKey && matchMetaCtrl && matchShift && matchAlt) {
        callback(e);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [combo, callback, enabled]);
}
