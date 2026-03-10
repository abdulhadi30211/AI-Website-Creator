import { useParams } from "wouter";
import { Layout } from "@/components/Layout";
import { ProjectPreview } from "@/components/ProjectPreview";
import { PromptInput } from "@/components/PromptInput";
import { useProject } from "@/hooks/use-projects";
import { Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ProjectView() {
  const params = useParams();
  const projectId = parseInt(params.id || "0", 10);
  const { data: project, isLoading, error } = useProject(projectId);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center bg-grid h-full">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="mt-4 text-muted-foreground font-medium">Loading project workspace...</p>
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center bg-grid h-full">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-bold">Project Not Found</h2>
          <p className="mt-2 text-muted-foreground">The project you're looking for doesn't exist or there was an error.</p>
        </div>
      </Layout>
    );
  }

  const isGenerating = project.status === 'generating' || project.status === 'pending';

  return (
    <Layout>
      <div className="flex-1 flex flex-col h-full relative p-4 lg:p-6 pb-24">
        {/* Header / Project Name */}
        <div className="mb-4 px-2 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">{project.name}</h1>
            <p className="text-sm text-muted-foreground truncate max-w-xl opacity-80 mt-1" title={project.prompt}>
              {project.prompt}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Generating
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Ready
              </span>
            )}
          </div>
        </div>

        {/* Main Editor/Preview Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 h-full min-h-0 relative"
        >
          <ProjectPreview project={project} />
        </motion.div>

        {/* Floating Chat Input */}
        <PromptInput projectId={project.id} isGenerating={isGenerating} />
      </div>
    </Layout>
  );
}
