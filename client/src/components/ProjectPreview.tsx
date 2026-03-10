import { useState } from "react";
import { Monitor, Smartphone, RotateCw, Sparkles, Code2, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Project } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProjectPreviewProps {
  project: Project;
}

export function ProjectPreview({ project }: ProjectPreviewProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [view, setView] = useState<"preview" | "code">("preview");
  const [key, setKey] = useState(0); // Used to force reload iframe
  
  // Combine HTML, CSS, JS into a single srcdoc string with Tailwind CDN
  const srcdoc = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          /* Base reset */
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; overflow-x: hidden; }
          ${project.css || ''}
        </style>
      </head>
      <body>
        ${project.html || '<div class="flex items-center justify-center h-screen text-gray-400">No content generated yet.</div>'}
        <script>
          try {
            ${project.js || ''}
          } catch(e) {
            console.error('Project Script Error:', e);
          }
        </script>
      </body>
    </html>
  `;

  return (
    <div className="flex-1 flex flex-col h-full bg-card rounded-2xl border border-border shadow-2xl overflow-hidden relative">
      {/* Fake Browser Chrome */}
      <div className="h-14 bg-muted/30 border-b border-border flex items-center justify-between px-4 select-none">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>

          <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-auto">
            <TabsList className="h-8 bg-background/50 border border-border">
              <TabsTrigger value="preview" className="text-xs gap-1.5 px-3">
                <Eye className="w-3.5 h-3.5" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="text-xs gap-1.5 px-3">
                <Code2 className="w-3.5 h-3.5" />
                Code
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="hidden md:flex flex-1 justify-center max-w-md mx-4">
          <div className="bg-background/80 border border-border rounded-lg px-4 py-1.5 text-[10px] text-muted-foreground flex items-center justify-center w-full max-w-sm truncate gap-2 font-mono uppercase tracking-wider">
            {project.name.replace(/\s+/g, '-').toLowerCase()}.replit.app
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          {view === "preview" && (
            <>
              <button 
                onClick={() => setKey(k => k + 1)}
                className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                title="Reload Preview"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-border mx-1" />
              <button 
                onClick={() => setDevice("desktop")}
                className={cn(
                  "p-2 rounded-lg transition-all", 
                  device === "desktop" ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                )}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setDevice("mobile")}
                className={cn(
                  "p-2 rounded-lg transition-all", 
                  device === "mobile" ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                )}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-muted/10">
        <AnimatePresence mode="wait">
          {view === "preview" ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden"
            >
              <motion.div 
                layout
                initial={false}
                animate={{
                  width: device === "desktop" ? "100%" : "375px",
                  height: "100%",
                }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-white rounded-xl shadow-2xl overflow-hidden border border-border relative h-full w-full"
              >
                {project.status === 'generating' || project.status === 'pending' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm z-10 text-white">
                    <div className="w-16 h-16 relative flex items-center justify-center mb-6">
                      <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
                      <div className="absolute inset-2 rounded-full border-r-2 border-fuchsia-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                      <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                    <h3 className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-fuchsia-500">
                      AI is crafting your vision
                    </h3>
                    <p className="mt-2 text-muted-foreground text-sm max-w-sm text-center">
                      Writing modern code, applying styles, and adding interactivity...
                    </p>
                  </div>
                ) : null}

                <iframe
                  key={key}
                  srcDoc={srcdoc}
                  title="Preview"
                  className="w-full h-full border-none bg-white"
                  sandbox="allow-scripts allow-same-origin"
                />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              key="code"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <Tabs defaultValue="html" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-2 border-b border-border bg-muted/20 flex items-center gap-4">
                  <TabsList className="bg-transparent border-none p-0 h-auto gap-4">
                    <TabsTrigger value="html" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 pb-2 text-xs font-mono">index.html</TabsTrigger>
                    <TabsTrigger value="css" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 pb-2 text-xs font-mono">style.css</TabsTrigger>
                    <TabsTrigger value="js" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 pb-2 text-xs font-mono">script.js</TabsTrigger>
                  </TabsList>
                </div>
                <div className="flex-1 overflow-hidden bg-[#0d1117]">
                  <TabsContent value="html" className="m-0 h-full">
                    <ScrollArea className="h-full w-full">
                      <pre className="p-6 text-xs font-mono text-blue-300 leading-relaxed">
                        <code>{project.html}</code>
                      </pre>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="css" className="m-0 h-full">
                    <ScrollArea className="h-full w-full">
                      <pre className="p-6 text-xs font-mono text-purple-300 leading-relaxed">
                        <code>{project.css}</code>
                      </pre>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="js" className="m-0 h-full">
                    <ScrollArea className="h-full w-full">
                      <pre className="p-6 text-xs font-mono text-yellow-200 leading-relaxed">
                        <code>{project.js}</code>
                      </pre>
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

