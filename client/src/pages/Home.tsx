import { useState } from "react";
import { Layout } from "@/components/Layout";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Code2, Paintbrush, Zap } from "lucide-react";

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const features = [
    { icon: <Code2 className="w-5 h-5"/>, title: "Clean Code", desc: "Generates semantic HTML, modern CSS, and vanilla JS." },
    { icon: <Paintbrush className="w-5 h-5"/>, title: "Beautiful UI", desc: "Designs that look premium and professional by default." },
    { icon: <Zap className="w-5 h-5"/>, title: "Instant Iteration", desc: "Just type what you want to change, and watch it happen." },
  ];

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-grid relative z-10">
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-fuchsia-500/10 blur-[100px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl text-center space-y-8 relative z-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-muted-foreground mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            The Future of Web Creation
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight leading-[1.1]">
            Build websites at the <br />
            <span className="text-gradient-primary">speed of thought.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Describe what you want, and our AI crafts a beautiful, production-ready website in seconds. No coding required.
          </p>

          <div className="pt-4">
            <button
              onClick={() => setIsDialogOpen(true)}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-2xl font-bold text-lg hover:bg-white hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
            >
              Start Building
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-5xl relative z-20"
        >
          {features.map((feature, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl flex flex-col items-center text-center gap-4 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {feature.icon}
              </div>
              <h3 className="font-display font-bold text-lg">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        <CreateProjectDialog 
          isOpen={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)} 
        />
      </div>
    </Layout>
  );
}
