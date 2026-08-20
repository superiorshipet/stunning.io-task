import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBuilds, useDeleteBuild } from '../api/useBuilds';
import { BuildRow } from '../components/BuildRow';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Plus, Search, Terminal, LogOut, User, FolderGit2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';

export function MyBuildsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: builds = [], isLoading } = useBuilds();
  const { mutate: deleteBuild } = useDeleteBuild();
  const [search, setSearch] = useState('');

  const filteredBuilds = useMemo(() => {
    if (!search.trim()) return builds;
    const q = search.toLowerCase().trim();
    return builds.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q)) ||
        b.integrations?.some((i) => i.toLowerCase().includes(q))
    );
  }, [builds, search]);

  return (
    <div className="flex-1 w-full px-6 sm:px-10 lg:px-16 py-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Subtle Workspace Sidebar (3 cols) */}
        <aside className="md:col-span-3 space-y-6">
          <div className="space-y-1.5 font-mono text-xs">
            <Link
              to="/"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white text-neutral-950 font-bold shadow-glow-sm hover:shadow-glow-md transition-all"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-violet-600" />
                New Build
              </span>
              <span className="text-[10px] text-neutral-500 font-mono font-medium">⌘N</span>
            </Link>

            <Link
              to="/builds"
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.08] text-white font-medium border border-white/10"
            >
              <FolderGit2 className="w-4 h-4 text-violet-400" />
              <span>My Builds</span>
              <span className="ml-auto text-[10px] bg-white/10 px-2 py-0.5 rounded-md text-slate-300">
                {builds.length}
              </span>
            </Link>
          </div>

          {/* User Profile Box */}
          <div className="p-4 rounded-2xl border border-white/10 bg-[#0E101B]/80 backdrop-blur-xl space-y-3.5 font-mono text-xs shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-950/80 border border-violet-500/40 text-violet-300 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-white block truncate">
                  {user?.email || 'Anonymous Workspace'}
                </span>
                <span className="text-[10px] text-slate-400 block">Celestial Tier</span>
              </div>
            </div>

            {user && (
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-[11px] cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            )}
          </div>
        </aside>

        {/* Main Content: My Builds Workspace (9 cols) */}
        <main className="md:col-span-9 space-y-6">
          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                My Builds
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Saved technical architecture blueprints and generated packages
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search builds or integrations..."
                className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-white/[0.04] border border-white/10 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* List of Build Rows */}
          {isLoading ? (
            <div className="py-20 text-center text-xs font-mono text-slate-500">
              Loading workspace builds...
            </div>
          ) : filteredBuilds.length === 0 ? (
            <div className="py-20 px-4 text-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] space-y-4">
              <Terminal className="w-10 h-10 text-violet-400 mx-auto stroke-1" />
              <div>
                <h3 className="text-base font-semibold text-white">
                  {search ? 'No matching builds found' : 'No saved builds yet'}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
                  {search
                    ? 'Try searching for a different keyword or integration name.'
                    : 'Transform your first software idea into an engineering plan from the builder.'}
                </p>
              </div>
              {!search && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/')}
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="mt-2"
                >
                  Create New Build
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBuilds.map((b) => (
                <BuildRow
                  key={b.id}
                  build={b}
                  onDelete={(id) => deleteBuild(id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
