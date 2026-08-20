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
  template: string;
  framework: string;
  integrations: string[];
  createdAt: string;
  overview: string;
  architecture: {
    diagramType: string;
    description: string;
    nodes: Array<{ name: string; role: string; type: string }>;
  };
  stack: Array<{ layer: string; technology: string; reason: string }>;
  integrationDetails: Array<{ id: string; name: string; strategy: string; webhooks?: string[] }>;
  implementationSteps: Array<{ step: number; title: string; detail: string; estimatedHours: string }>;
  risks: Array<{ risk: string; severity: 'low' | 'medium' | 'high'; mitigation: string }>;
  files: GeneratedFileItem[];
}
