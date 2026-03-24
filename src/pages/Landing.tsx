import { motion, useScroll, useTransform } from "framer-motion";
import { Brain, Sparkles, ArrowRight, Zap, Users, Target, Activity, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HowItWorks from "@/components/landing/HowItWorks";
import AgentCards from "@/components/landing/AgentCards";
import DemoPreview from "@/components/landing/DemoPreview";
import { useRef } from "react";

const Landing = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-hidden" ref={containerRef}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40 backdrop-blur-xl bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 border border-primary/30">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <span className="font-heading text-lg font-bold tracking-tight text-foreground">CouncilGPT</span>
            </Link>
          </motion.div>
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/login">
              <Button variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] transition-all">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Animated Background Mesh */}
        <motion.div style={{ y: yBg }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] mix-blend-screen animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-[100px] mix-blend-screen animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        </motion.div>

        {/* Floating Abstract Elements */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <motion.div
            className="absolute top-[20%] right-[15%] w-16 h-16 rounded-2xl bg-gradient-to-br from-agent-analyst/20 to-transparent border border-agent-analyst/30 backdrop-blur-md flex items-center justify-center shadow-lg shadow-agent-analyst/5"
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Target className="w-6 h-6 text-agent-analyst/80" />
          </motion.div>
          
          <motion.div
            className="absolute top-[35%] left-[10%] w-12 h-12 rounded-xl bg-gradient-to-br from-agent-optimist/20 to-transparent border border-agent-optimist/30 backdrop-blur-md flex items-center justify-center shadow-lg shadow-agent-optimist/5"
            animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Sparkles className="w-5 h-5 text-agent-optimist/80" />
          </motion.div>
          
          <motion.div
            className="absolute bottom-[25%] left-[18%] w-14 h-14 rounded-full bg-gradient-to-br from-agent-synthesizer/20 to-transparent border border-agent-synthesizer/30 backdrop-blur-md flex items-center justify-center shadow-lg shadow-agent-synthesizer/5"
            animate={{ y: [0, -25, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <Zap className="w-6 h-6 text-agent-synthesizer/80" />
          </motion.div>
          
          <motion.div
            className="absolute bottom-[30%] right-[12%] w-12 h-12 rounded-lg bg-gradient-to-br from-agent-critic/20 to-transparent border border-agent-critic/30 backdrop-blur-md flex items-center justify-center shadow-lg shadow-agent-critic/5"
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          >
            <ShieldAlert className="w-5 h-5 text-agent-critic/80" />
          </motion.div>
        </div>

        <motion.div 
          className="relative z-20 text-center max-w-5xl mx-auto px-6"
          style={{ y: yText, opacity: opacityText }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.2, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-8 text-sm text-primary font-medium tracking-wide shadow-inner shadow-primary/10">
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen AI Deliberation</span>
            </div>
          </motion.div>

          <motion.h1
            className="font-heading text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[1.05] mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.4, 0.2, 1] }}
          >
            Where AI experts <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-300% animate-gradient">
              debate your ideas.
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.4, 0.2, 1] }}
          >
            Move beyond single-prompt chatbots. Experience a simulated boardroom of specialized AI agents that analyze, challenge, and synthesize solutions together.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.25, 0.4, 0.2, 1] }}
          >
            <Link to="/workspace">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-10 h-14 text-lg font-medium shadow-[0_0_30px_rgba(var(--primary),0.4)] hover:shadow-[0_0_40px_rgba(var(--primary),0.6)] hover:-translate-y-1 transition-all duration-300 rounded-xl">
                Start a Debate
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#demo" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-border bg-transparent hover:bg-white/5 px-10 h-14 text-lg font-medium backdrop-blur-sm transition-all duration-300 rounded-xl">
                See How It Works
              </Button>
            </a>
          </motion.div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <motion.div 
            className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full p-1"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <div className="w-1.5 h-1.5 bg-primary/80 rounded-full mx-auto" />
          </motion.div>
        </motion.div>
      </section>

      {/* Adding a gradient divider that transitions smoothly */}
      <div className="h-32 bg-gradient-to-b from-transparent to-background relative z-10 -mt-32 pointer-events-none" />

      <div className="relative z-20 bg-background">
        <HowItWorks />
        <AgentCards />
        <DemoPreview />

        {/* Footer */}
        <footer className="border-t border-border/40 py-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full translate-y-1/2 opacity-20" />
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="font-heading text-lg font-bold text-foreground block">CouncilGPT</span>
                <span className="text-xs text-muted-foreground">AI Deliberation System</span>
              </div>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link to="/docs" className="hover:text-primary transition-colors">Documentation</Link>
            </div>
            <p className="text-sm text-muted-foreground font-mono">© 2026 CS Dept Project.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
