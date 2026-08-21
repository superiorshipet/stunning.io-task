import { useState, useRef, useCallback } from 'react';
import { GenerationStage, GeneratedPlan } from '../types';
import { streamApi } from '@/shared/api/client';
import { buildPlanSections } from '../utils/planSections';

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
      let streamError: Error | null = null;
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
          streamError = err;
        },
        abortControllerRef.current.signal
      );

      if (streamError) {
        throw streamError;
      }

      if (!accumulated.trim()) {
        throw new Error('The AI model returned an empty response.');
      }

      // Stage 4: Implementation plan
      updateStageStatus(2, 'completed');
      updateStageStatus(3, 'active');
      await new Promise((r) => setTimeout(r, 800));
      updateStageStatus(3, 'completed');

      // Stage 5: Finalize
      updateStageStatus(4, 'active');
      await new Promise((r) => setTimeout(r, 500));
      updateStageStatus(4, 'completed');

      const plan = buildGeneratedPlanFromAiResponse(prompt, integrations, accumulated);
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

function buildGeneratedPlanFromAiResponse(
  prompt: string,
  integrations: string[],
  rawOutput: string
): GeneratedPlan {
  const title = prompt.length > 50 ? prompt.slice(0, 47).trim() + '...' : prompt;

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    summary: `AI model response for: ${prompt}`,
    integrations,
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    rawContent: rawOutput.trim(),
    sections: buildPlanSections(rawOutput),
  };
}
