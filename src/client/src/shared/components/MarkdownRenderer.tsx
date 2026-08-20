import React from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [copiedCodeIdx, setCopiedCodeIdx] = React.useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Parse lines into blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';
  let codeBlockCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        const codeText = codeBuffer.join('\n');
        const currentIdx = codeBlockCounter++;
        const lang = codeLanguage || 'text';
        elements.push(
          <div key={`code-${i}`} className="my-5 rounded-xl border border-white/15 overflow-hidden bg-[#07080E] font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between px-4 py-2 bg-white/[0.04] border-b border-white/10 text-slate-300 text-[11px]">
              <span className="flex items-center gap-1.5 font-medium text-cyan-300">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                {lang}
              </span>
              <button
                onClick={() => handleCopyCode(codeText, currentIdx)}
                className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-colors"
              >
                {copiedCodeIdx === currentIdx ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-slate-200 text-xs leading-relaxed font-mono">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBuffer = [];
        codeLanguage = '';
      } else {
        // Start of code block
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
        codeBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Markdown Headers
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-8 mb-4 border-b border-white/10 pb-3">
          {formatInline(line.slice(2))}
        </h1>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg sm:text-xl font-bold text-violet-300 tracking-tight mt-7 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-violet-500 inline-block" />
          {formatInline(line.slice(3))}
        </h2>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm sm:text-base font-semibold text-cyan-300 mt-5 mb-2 font-mono">
          {formatInline(line.slice(4))}
        </h3>
      );
      continue;
    }

    // Unordered List Items
    if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={`li-${i}`} className="text-sm text-slate-300 ml-4 list-disc leading-relaxed my-1">
          {formatInline(line.slice(2))}
        </li>
      );
      continue;
    }

    // Ordered List Items (e.g. 1. 2.)
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      elements.push(
        <div key={`oli-${i}`} className="flex items-start gap-2.5 my-2 text-sm text-slate-300 leading-relaxed">
          <span className="font-mono text-xs font-bold text-violet-400 bg-violet-950/60 border border-violet-500/30 px-1.5 py-0.5 rounded shrink-0">
            {orderedMatch[1]}
          </span>
          <div className="flex-1">{formatInline(orderedMatch[2])}</div>
        </div>
      );
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      elements.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    // Normal Paragraph
    elements.push(
      <p key={`p-${i}`} className="text-sm sm:text-base text-slate-300 leading-relaxed my-2">
        {formatInline(line)}
      </p>
    );
  }

  return <div className="space-y-1 text-slate-200">{elements}</div>;
}

function formatInline(text: string): React.ReactNode {
  // Bold **text**
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-violet-950/70 border border-violet-500/30 font-mono text-[12px] text-cyan-300">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
