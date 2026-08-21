import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBuilds, useDeleteBuild } from '../api/useBuilds';
import { TechnicalPlanDocument } from '@/features/generation/components/TechnicalPlanDocument';
import { DocumentNavigation } from '@/features/generation/components/DocumentNavigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/Button';
import { GeneratedPlan } from '@/features/generation/types';
import { buildPlanSections } from '@/features/generation/utils/planSections';

export function SavedBuildDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: builds = [], isLoading } = useBuilds();
  const { mutate: deleteBuild } = useDeleteBuild();
  const [activeSection, setActiveSection] = useState('planning');

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

  const savedPlan = build.plan;
  const plan: GeneratedPlan = savedPlan?.rawContent ? savedPlan : {
    title: build.name,
    summary: build.description || 'Saved AI model response.',
    integrations: build.integrations || [],
    createdAt: new Date(build.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    rawContent: build.description || 'No saved AI response content was found for this build.',
    sections: buildPlanSections(build.description || 'No saved AI response content was found for this build.'),
  };
  const sections = plan.sections?.length ? plan.sections : buildPlanSections(plan.rawContent);

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
            sections={sections}
          />
        </aside>

        <main className="lg:col-span-9 w-full">
          <TechnicalPlanDocument
            plan={plan}
            onSaveBuild={() => {}}
            onStartOver={() => navigate('/')}
            isSaved={true}
            activeSectionId={activeSection}
            onSelectSection={scrollToSection}
          />
        </main>
      </div>
    </div>
  );
}
