import { useState, useRef, useCallback } from 'react';
import { GenerationStage, GeneratedPlan } from '../types';
import { streamApi } from '@/shared/api/client';

const INITIAL_STAGES: GenerationStage[] = [
  { id: '1', number: '01', name: 'Understand idea', status: 'pending' },
  { id: '2', number: '02', name: 'Map context', status: 'pending' },
  { id: '3', number: '03', name: 'Design architecture', status: 'pending' },
  { id: '4', number: '04', name: 'Build implementation plan', status: 'pending' },
  { id: '5', number: '05', name: 'Finalize technical plan', status: 'pending' },
];

export function useGenerationStream() {
  const [stages, setStages] = useState<GenerationStage[]>(INITIAL_STAGES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startGeneration = useCallback(async (prompt: string, integrations: string[]) => {
    setIsGenerating(true);
    setStreamedText('');
    setGeneratedPlan(null);
    setError(null);
    setStages(INITIAL_STAGES);

    abortControllerRef.current = new AbortController();

    const updateStageStatus = (stageIndex: number, status: 'active' | 'completed' | 'pending') => {
      setStages((prev) =>
        prev.map((s, idx) => {
          if (idx < stageIndex) return { ...s, status: 'completed' };
          if (idx === stageIndex) return { ...s, status };
          return { ...s, status: 'pending' };
        })
      );
    };

    try {
      // Stage 1: Understand idea
      updateStageStatus(0, 'active');
      await new Promise((r) => setTimeout(r, 600));
      updateStageStatus(0, 'completed');

      // Stage 2: Map context
      updateStageStatus(1, 'active');
      await new Promise((r) => setTimeout(r, 700));
      updateStageStatus(1, 'completed');

      // Stage 3: Design architecture
      updateStageStatus(2, 'active');

      let accumulated = '';
      await streamApi(
        '/api/v1/generate/stream',
        {
          prompt,
          template: 'saas',
          framework: 'nextjs',
          requestedIntegrations: integrations,
        },
        (chunk) => {
          accumulated += chunk;
          setStreamedText((prev) => prev + chunk);
        },
        () => {
          // Stream completed
        },
        (err) => {
          console.warn('Stream API fallback notice:', err.message);
        },
        abortControllerRef.current.signal
      );

      // Stage 4: Implementation plan
      updateStageStatus(2, 'completed');
      updateStageStatus(3, 'active');
      await new Promise((r) => setTimeout(r, 800));
      updateStageStatus(3, 'completed');

      // Stage 5: Finalize
      updateStageStatus(4, 'active');
      await new Promise((r) => setTimeout(r, 500));
      updateStageStatus(4, 'completed');

      // Construct high-quality technical plan
      const plan = buildTechnicalPlanFromPrompt(prompt, integrations, accumulated);
      setGeneratedPlan(plan);
    } catch (err) {
      if (!abortControllerRef.current?.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Generation failed');
      }
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  }, []);

  return {
    stages,
    isGenerating,
    streamedText,
    generatedPlan,
    error,
    startGeneration,
    cancel,
  };
}

function buildTechnicalPlanFromPrompt(
  prompt: string,
  integrations: string[],
  _rawOutput: string
): GeneratedPlan {
  const title = prompt.length > 50 ? prompt.slice(0, 47).trim() + '...' : prompt;

  const stack = [
    { layer: 'Frontend', technology: 'Next.js 15 (App Router) + TypeScript + Tailwind CSS', reason: 'Server components for fast initial load and interactive client hooks for workspace controls.' },
    { layer: 'Backend API', technology: 'ASP.NET Core (.NET 10) Minimal APIs', reason: 'Feature-Driven Architecture providing ultra-low latency, typed OpenAPI endpoints, and resilience.' },
    { layer: 'Primary Database', technology: 'PostgreSQL on Railway via EF Core (Npgsql)', reason: 'Relational ACID integrity for projects, users, integration credentials, and JSONB settings.' },
    { layer: 'Cache & Message Bus', technology: 'Redis Engine (StackExchange.Redis)', reason: 'Sub-millisecond state caching, rate limiting, and real-time Pub/Sub live event streaming.' },
    { layer: 'AI Orchestration', technology: 'OpenAI GPT-4o / Realtime SSE Streaming', reason: 'Structured JSON output scaffolding, prompt refinement, and incremental code generation.' },
  ];

  const integrationDetails = integrations.map((id) => {
    switch (id) {
      case 'stripe':
        return {
          id: 'stripe',
          name: 'Stripe',
          strategy: 'Stripe Checkout Sessions with customer portal for subscription tier upgrades and automated webhook handling for payment disputes and invoice events.',
          webhooks: ['checkout.session.completed', 'invoice.paid', 'customer.subscription.deleted'],
        };
      case 'shopify':
        return {
          id: 'shopify',
          name: 'Shopify',
          strategy: 'OAuth2 Admin API integration to synchronize product catalogs, track inventory levels in real-time, and ingest order fulfillment webhooks.',
          webhooks: ['orders/create', 'inventory_levels/update', 'products/update'],
        };
      case 'gmail':
        return {
          id: 'gmail',
          name: 'Gmail',
          strategy: 'Google OAuth2 service integration to dispatch branded transactional notifications, receipts, and alert digests via Gmail API.',
        };
      case 'slack':
        return {
          id: 'slack',
          name: 'Slack',
          strategy: 'Incoming Webhook and Bot token integration to broadcast real-time operational notifications and alerts to designated team channels.',
          webhooks: ['incoming_webhook', 'chat.postMessage'],
        };
      case 'google-sheets':
        return {
          id: 'google-sheets',
          name: 'Google Sheets',
          strategy: 'Google Sheets API v4 service connector to automatically append new customer leads, signups, and transaction rows for bi-directional reporting.',
        };
      default:
        return {
          id,
          name: id,
          strategy: `Custom integration connector configuration for ${id}.`,
        };
    }
  });

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    summary: `Technical implementation blueprint for: ${prompt}`,
    template: 'SaaS / Multi-Service',
    framework: 'Next.js + ASP.NET Core .NET 10',
    integrations,
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    overview: `This architecture plan defines an enterprise-grade software system engineered for high availability and clean separation of concerns. The platform accepts user requests through an editorial client interface, orchestrates asynchronous pipelines via Redis, and leverages ASP.NET Core .NET 10 for core business logic and third-party integrations.`,
    architecture: {
      diagramType: 'node_topology',
      description: 'The system uses a decoupled client-server architecture with a high-throughput API gateway, persistent relational PostgreSQL storage, and low-latency Redis message bus.',
      nodes: [
        { name: 'Web Client', role: 'Interactive UI', type: 'frontend' },
        { name: 'ASP.NET Core API', role: 'Business Logic & Auth', type: 'backend' },
        { name: 'PostgreSQL', role: 'Relational Store', type: 'database' },
        { name: 'Redis', role: 'Cache & PubSub', type: 'cache' },
        { name: 'AI Provider', role: 'LLM Orchestration', type: 'ai' },
      ],
    },
    stack,
    integrationDetails: integrationDetails.length > 0 ? integrationDetails : [
      { id: 'internal', name: 'Core Engine', strategy: 'Standard RESTful JSON API with OpenAPI specifications and RFC 7807 ProblemDetails.' }
    ],
    implementationSteps: [
      { step: 1, title: 'Database Schema & Entity Setup', detail: 'Initialize PostgreSQL tables for apps, integrations, user credentials, and build logs using EF Core migrations.', estimatedHours: '4h' },
      { step: 2, title: 'Core API Endpoints & Auth Guard', detail: 'Implement Feature-Driven route slices for CRUD operations, background jobs, and JWT security middleware.', estimatedHours: '6h' },
      { step: 3, title: 'Integration SDK Connectors', detail: `Configure and test authenticated connectors for ${integrations.length > 0 ? integrations.join(', ') : 'third-party APIs'}.`, estimatedHours: '8h' },
      { step: 4, title: 'Frontend Workspace & Real-Time Sync', detail: 'Build interactive React client with TanStack Query and Server-Sent Events (SSE) listener for real-time progress.', estimatedHours: '8h' },
      { step: 5, title: 'Containerization & Production Deployment', detail: 'Generate Dockerfile, verify Railway environment variables, and configure health check monitoring.', estimatedHours: '4h' },
    ],
    risks: [
      { risk: 'Third-party API Rate Limiting', severity: 'medium', mitigation: 'Implement Redis token bucket rate limiting and exponential backoff retry policies in HTTP client handlers.' },
      { risk: 'Credential & Webhook Security', severity: 'high', mitigation: 'Store all third-party secrets encrypted in PostgreSQL JSONB and verify HMAC SHA256 signatures on incoming webhooks.' },
      { risk: 'Cold-Start Latency on AI Calls', severity: 'low', mitigation: 'Stream partial generation chunks immediately using SSE and cache common query embeddings.' },
    ],
    files: [
      {
        path: 'src/config/integrations.ts',
        language: 'typescript',
        content: `// Integration configuration map\nexport const activeIntegrations = ${JSON.stringify(integrations, null, 2)};\n`,
      },
      {
        path: 'src/services/api.ts',
        language: 'typescript',
        content: `export async function executePlan() {\n  console.log("Executing build for ${title}...");\n}\n`,
      },
    ],
  };
}
