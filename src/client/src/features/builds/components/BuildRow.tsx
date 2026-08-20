import React from 'react';
import { Link } from 'react-router-dom';
import { SavedBuild } from '../types';
import { IntegrationBadge } from '@/features/integrations/components/IntegrationBadge';
import { ArrowUpRight, Trash2, MoreHorizontal } from 'lucide-react';

interface BuildRowProps {
  build: SavedBuild;
  onDelete: (id: string) => void;
}

export function BuildRow({ build, onDelete }: BuildRowProps) {
  const [showMenu, setShowMenu] = React.useState(false);

  const formattedDate = new Date(build.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group relative flex items-center justify-between p-4 bg-[#0E101B]/80 hover:bg-white/[0.06] border border-white/10 hover:border-violet-500/40 rounded-xl transition-all shadow-2xs backdrop-blur-md">
      <Link
        to={`/builds/${build.id}`}
        className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 pr-4"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
              {build.name}
            </h3>
            <ArrowUpRight className="w-3.5 h-3.5 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
          {build.description && (
            <p className="text-xs text-slate-400 truncate mt-0.5 max-w-lg font-normal">
              {build.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {build.integrations && build.integrations.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {build.integrations.map((id) => (
                <IntegrationBadge key={id} id={id} size="sm" />
              ))}
            </div>
          )}

          <span className="font-mono text-xs text-slate-500 shrink-0">
            {formattedDate}
          </span>
        </div>
      </Link>

      <div className="relative shrink-0">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-8 z-30 w-36 bg-[#0E101B] rounded-xl border border-white/15 shadow-xl py-1.5 font-mono text-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onDelete(build.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Build
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
