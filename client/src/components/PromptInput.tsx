import { useState, useRef, useEffect } from "react";
import { ArrowUp, Sparkles, Loader2 } from "lucide-react";
import { useGenerateProject } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  projectId: number;
  isGenerating: boolean;
}

export function PromptInput({ projectId, isGenerating }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const generate = useGenerateProject();

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    generate.mutate({ id: projectId, prompt: prompt.trim() }, {
      onSuccess: () => setPrompt("")
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-30">
      <form 
        onSubmit={handleSubmit}
        className={cn(
          "glass p-2 rounded-2xl flex items-end gap-2 transition-all duration-300",
          isGenerating ? "opacity-90 ring-2 ring-primary/50" : "focus-within:ring-2 focus-within:ring-primary/50 focus-within:shadow-primary/10"
        )}
      >
        <div className="pl-3 pb-3">
          {isGenerating ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isGenerating ? "Applying changes..." : "Make the header text larger and add a dark mode toggle..."}
          disabled={isGenerating}
          className="w-full bg-transparent border-none focus:outline-none focus:ring-0 resize-none py-3 min-h-[48px] max-h-[200px] text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-50"
          rows={1}
        />
        
        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className="p-3 bg-foreground text-background rounded-xl hover:bg-white hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 mb-0.5 mr-0.5 flex-shrink-0"
        >
          <ArrowUp className="w-4 h-4 font-bold" />
        </button>
      </form>
    </div>
  );
}
