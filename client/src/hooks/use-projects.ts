import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { ProjectInput, ProjectResponse, ProjectsListResponse } from "@shared/routes";

// Utility for robust Zod logging
function parseWithLogging<T>(schema: any, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useProjects() {
  return useQuery({
    queryKey: [api.projects.list.path],
    queryFn: async () => {
      const res = await fetch(api.projects.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      return parseWithLogging<ProjectsListResponse>(api.projects.list.responses[200], data, "projects.list");
    },
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: [api.projects.get.path, id],
    queryFn: async () => {
      if (isNaN(id) || id <= 0) return null;
      const url = buildUrl(api.projects.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch project");
      const data = await res.json();
      return parseWithLogging<ProjectResponse>(api.projects.get.responses[200], data, "projects.get");
    },
    // Poll every 2 seconds if the project is still generating
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return (status === 'pending' || status === 'generating') ? 2000 : false;
    },
    enabled: id > 0,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProjectInput) => {
      const validated = api.projects.create.input.parse(input);
      const res = await fetch(api.projects.create.path, {
        method: api.projects.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create project");
      }
      
      const data = await res.json();
      return parseWithLogging<ProjectResponse>(api.projects.create.responses[201], data, "projects.create");
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: [api.projects.list.path] });
    },
  });
}

export function useGenerateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, prompt }: { id: number; prompt?: string }) => {
      const url = buildUrl(api.projects.generate.path, { id });
      const body = prompt ? { prompt } : {};
      
      const res = await fetch(url, {
        method: api.projects.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Project not found");
        throw new Error("Failed to start generation");
      }
      
      const data = await res.json();
      return parseWithLogging<ProjectResponse>(api.projects.generate.responses[200], data, "projects.generate");
    },
    onMutate: async ({ id }) => {
      // Optimistically set status to generating to trigger immediate UI feedback & polling
      await queryClient.cancelQueries({ queryKey: [api.projects.get.path, id] });
      const previous = queryClient.getQueryData<ProjectResponse>([api.projects.get.path, id]);
      
      if (previous) {
        queryClient.setQueryData<ProjectResponse>([api.projects.get.path, id], {
          ...previous,
          status: 'generating',
        });
      }
      return { previous };
    },
    onError: (err, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData([api.projects.get.path, id], context.previous);
      }
    },
    onSuccess: (data, { id }) => {
      queryClient.setQueryData([api.projects.get.path, id], data);
      queryClient.invalidateQueries({ queryKey: [api.projects.list.path] });
    },
  });
}
