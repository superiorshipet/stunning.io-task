import { GeneratedPlanSection } from '../types';

const SECTION_DEFINITIONS = [
  {
    id: 'planning',
    number: '01',
    title: 'Planning',
    keywords: [
      'overview',
      'strategy',
      'project setup',
      'setup',
      'roadmap',
      'milestone',
      'environment',
      'env',
      'requirement',
      'risk',
    ],
  },
  {
    id: 'architecture',
    number: '02',
    title: 'Architecture',
    keywords: [
      'architecture',
      'topology',
      'folder structure',
      'structure',
      'stack',
      'database',
      'schema',
      'model',
      'integration',
      'webhook',
    ],
  },
  {
    id: 'implementation',
    number: '03',
    title: 'Implementation',
    keywords: [
      'implementation',
      'code',
      'component',
      'api',
      'route',
      'service',
      'authentication',
      'stripe',
      'slack',
      'shopify',
      'gmail',
      'sheets',
      'deploy',
    ],
  },
] as const;

type SectionId = (typeof SECTION_DEFINITIONS)[number]['id'];

export function buildPlanSections(rawContent: string): GeneratedPlanSection[] {
  const normalized = rawContent.trim();
  if (!normalized) {
    return SECTION_DEFINITIONS.map((section) => ({
      id: section.id,
      number: section.number,
      title: section.title,
      content: '',
    }));
  }

  const buckets: Record<SectionId, string[]> = {
    planning: [],
    architecture: [],
    implementation: [],
  };

  const chunks = splitMarkdownIntoChunks(normalized);
  for (const chunk of chunks) {
    buckets[classifyChunk(chunk)].push(chunk);
  }

  return SECTION_DEFINITIONS.map((section) => ({
    id: section.id,
    number: section.number,
    title: section.title,
    content: buckets[section.id].join('\n\n').trim(),
  }));
}

function splitMarkdownIntoChunks(content: string): string[] {
  const lines = content.split('\n');
  const chunks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const isHeading = /^#{1,3}\s+\S/.test(line);
    if (isHeading && current.length > 0) {
      chunks.push(current.join('\n').trim());
      current = [];
    }

    current.push(line);
  }

  if (current.length > 0) {
    chunks.push(current.join('\n').trim());
  }

  return chunks.filter(Boolean);
}

function classifyChunk(chunk: string): SectionId {
  const heading = chunk.split('\n')[0]?.toLowerCase() ?? '';
  const text = chunk.slice(0, 600).toLowerCase();
  const scores = SECTION_DEFINITIONS.map((section) => ({
    id: section.id,
    score: section.keywords.reduce((count, keyword) => {
      return count + (heading.includes(keyword) ? 3 : 0) + (text.includes(keyword) ? 1 : 0);
    }, 0),
  }));

  scores.sort((a, b) => b.score - a.score);

  if (scores[0].score > 0) {
    return scores[0].id;
  }

  return 'planning';
}
