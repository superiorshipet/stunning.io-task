export type StageStatus = 'pending' | 'active' | 'completed';

export interface GenerationStage {
  id: string;
  number: string;
  name: string;
  status: StageStatus;
}

export interface GeneratedPlanSection {
  id: string;
  number: string;
  title: string;
  content?: string;
}

export interface GeneratedFileItem {
  path: string;
  language: string;
  content: string;
}

export interface GeneratedPlan {
  title: string;
  summary: string;
  integrations: string[];
  createdAt: string;
  rawContent: string;
}
