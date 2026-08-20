import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { SavedBuild } from '../types';

export function useBuilds() {
  return useQuery<SavedBuild[]>({
    queryKey: ['builds'],
    queryFn: async () => {
      let remoteBuilds: SavedBuild[] = [];
      try {
        const response = await apiFetch<{ items: Array<{ id: string; name: string; slug: string; description?: string; template: string; framework: string; status: string; settingsJson?: string; createdAt: string; updatedAt: string }> }>('/api/v1/apps?page=1&pageSize=50');
        if (response?.items) {
          remoteBuilds = response.items.map((item) => {
            let integrations: string[] = [];
            let plan;
            if (item.settingsJson) {
              try {
                const parsed = JSON.parse(item.settingsJson);
                integrations = parsed.integrations || [];
                plan = parsed.plan;
              } catch {}
            }
            return {
              id: item.id,
              name: item.name,
              slug: item.slug,
              description: item.description,
              template: item.template,
              framework: item.framework,
              status: item.status,
              integrations,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              plan,
            };
          });
        }
      } catch {
        // Fallback to local
      }

      const localBuilds: SavedBuild[] = JSON.parse(localStorage.getItem('stunning_saved_builds') || '[]');
      
      // Merge unique by ID
      const all = [...localBuilds, ...remoteBuilds];
      const unique = Array.from(new Map(all.map((item) => [item.id, item])).values());
      return unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
  });
}

export function useDeleteBuild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await apiFetch(`/api/v1/apps/${id}`, { method: 'DELETE' });
      } catch {
        // Remove locally
      }
      const localBuilds: SavedBuild[] = JSON.parse(localStorage.getItem('stunning_saved_builds') || '[]');
      const filtered = localBuilds.filter((b) => b.id !== id);
      localStorage.setItem('stunning_saved_builds', JSON.stringify(filtered));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builds'] });
    },
  });
}
