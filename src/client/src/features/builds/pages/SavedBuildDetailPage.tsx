import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBuilds, useDeleteBuild } from '../api/useBuilds';
import { TechnicalPlanDocument } from '@/features/generation/components/TechnicalPlanDocument';
import { DocumentNavigation } from '@/features/generation/components/DocumentNavigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/Button';
import { GeneratedPlan } from '@/features/generation/types';

export function SavedBuildDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: builds = [], isLoading } = useBuilds();
  const { mutate: deleteBuild } = useDeleteBuild();
  const [activeSection, setActiveSection] = useState('overview');

  const build = builds.find((b) => b.id === id);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDelete = () => {
    if (id && confirm('Are you sure you want to delete this build plan?')) {
      deleteBuild(id);
      navigate('/builds');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center font-mono text-xs text-slate-500">
        Loading build details...
      </div>
    );
  }

  if (!build) {
    return (
      <div className="flex-1 max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Build not found</h2>
        <p className="text-xs text-slate-400">The requested build plan could not be located in your workspace.</p>
        <Button variant="primary" size="sm" onClick={() => navigate('/builds')}>
          Back to My Builds
        </Button>
      </div>
    );
  }

  const plan: GeneratedPlan = build.plan || {
    title: build.name,
    summary: build.description || 'Saved technical architecture build plan.',
    template: build.template || 'saas',
    framework: build.framework || 'nextjs',
    integrations: build.integrations || [],
    createdAt: new Date(build.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    overview: build.description || 'This architecture blueprint outlines system components and connected cloud services.',
    architecture: {
      diagramType: 'node_topology',
      description: 'System architecture topology connecting web client, API gateway, and backend services.',
      nodes: [
        { name: 'Web Client', role: 'Frontend UI', type: 'frontend' },
        { name: 'ASP.NET Core API', role: 'Engine', type: 'backend' },
        { name: 'PostgreSQL', role: 'Data Layer', type: 'database' },
      ],
    },
    stack: [
      { layer: 'Frontend', technology: 'Next.js 15 + TypeScript + Tailwind CSS', reason: 'High performance rendering.' },
      { layer: 'Backend', technology: 'ASP.NET Core .NET 10', reason: 'Feature-driven REST API.' },
      { layer: 'Database', technology: 'PostgreSQL on Railway', reason: 'Relational data persistence.' },
    ],
    integrationDetails: (build.integrations || []).map((intId) => ({
      id: intId,
      name: intId.toUpperCase(),
      strategy: `Integration connector for ${intId}.`,
    })),
    implementationSteps: [
      { step: 1, title: 'Database Migrations', detail: 'Initialize tables for project models.', estimatedHours: '3h' },
      { step: 2, title: 'API Endpoints', detail: 'Implement core endpoints.', estimatedHours: '5h' },
      { step: 3, title: 'Integration Testing', detail: 'Verify webhooks and authentication.', estimatedHours: '4h' },
    ],
    risks: [
      { risk: 'Third-party latency', severity: 'medium', mitigation: 'Use background queueing and caching.' },
    ],
    files: [],
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <Link
          to="/builds"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-violet-400" />
          <span>Back to builds</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
          >
            New Build
          </Button>
        </div>
      </div>

      {/* Document Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="hidden lg:block lg:col-span-3">
          <DocumentNavigation
            activeSection={activeSection}
            onSelectSection={scrollToSection}
          />
        </aside>

        <main className="lg:col-span-9 w-full">
          <TechnicalPlanDocument
            plan={plan}
            onSaveBuild={() => {}}
            onStartOver={() => navigate('/')}
            isSaved={true}
          />
        </main>
      </div>
    </div>
  );
}
