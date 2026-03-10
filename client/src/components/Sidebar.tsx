import { Link, useLocation } from "wouter";
import { Plus, LayoutGrid, Sparkles, Code2, Loader2, FolderKanban } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Sidebar() {
  const [location] = useLocation();
  const { data: projects, isLoading } = useProjects();

  return (
    <div className="w-72 h-screen flex-shrink-0 bg-background/50 backdrop-blur-xl border-r border-border/50 flex flex-col relative z-20">
      <div className="p-6 pb-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-primary/20 animate-glow-pulse">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight text-gradient">Lovable.ai</span>
      </div>

      <div className="px-4 mb-6">
        <Link href="/" className="block">
          <button className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl px-4 py-2.5 font-medium transition-all hover:border-white/20 active:scale-[0.98]">
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </Link>
      </div>

      <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <FolderKanban className="w-4 h-4" />
        Your Projects
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          </div>
        ) : projects?.length === 0 ? (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center">
            No projects yet.
          </div>
        ) : (
          projects?.map((project) => {
            const isActive = location === `/project/${project.id}`;
            const isGenerating = project.status === 'generating' || project.status === 'pending';

            return (
              <Link key={project.id} href={`/project/${project.id}`} className="block">
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex flex-col gap-1 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-200",
                    isActive 
                      ? "bg-primary/10 border-primary/20 border text-primary-foreground" 
                      : "border border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate pr-2">
                      {project.name}
                    </span>
                    {isGenerating && (
                      <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] opacity-60">
                    <span className="truncate max-w-[120px]">{project.prompt}</span>
                    <span>{project.createdAt ? formatDistanceToNow(new Date(project.createdAt)) : ''}</span>
                  </div>
                </motion.div>
              </Link>
            );
          })
        )}
      </div>
      
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-2 py-1.5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
            <Code2 className="w-3 h-3" />
          </div>
          <span className="text-xs font-medium">Developer Mode</span>
        </div>
      </div>
    </div>
  );
}
