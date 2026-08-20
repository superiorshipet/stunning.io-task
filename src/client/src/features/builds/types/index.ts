import { GeneratedPlan } from '@/features/generation/types';

export interface SavedBuild {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  template?: string;
  framework?: string;
  status?: string;
  integrations: string[];
  createdAt: string;
  updatedAt?: string;
  plan?: GeneratedPlan;
}
