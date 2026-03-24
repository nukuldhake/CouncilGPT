import { motion } from "framer-motion";
import { BarChart3, ShieldAlert, Sun, Layers, User } from "lucide-react";

const messages = [
  { role: "user", name: "You", icon: User, color: "primary", text: "Should we launch an AI tutoring startup entirely focused on edge-case subjects?" },
  { role: "agent", name: "Analyst", icon: BarChart3, color: "agent-analyst", text: "Breaking this down: the EdTech market is valued at $340B. Technical feasibility for niche subjects is high with current deep learning models." },
  { role: "agent", name: "Critic", icon: ShieldAlert, color: "agent-critic", text: "That assumes demand. Market saturation in mainstream subjects is increasing, but are edge-cases profitable enough to sustain CAC? Also, content hallucination in ultra-niche subjects is harder to verify. Liability could be massive due to this risk." },
  { role: "agent", name: "Optimist", icon: Sun, color: "agent-optimist", text: "Absolutely! Personalized learning for severely underserved subjects is a blue ocean. We can build a deeply loyal early adopter base." },
  { role: "agent", name: "Synthesizer", icon: Layers, color: "agent-synthesizer", text: "Consensus: High opportunity, high risk. Recommendation: Launch a beta targeting 3 specific niches to validate demand and test hallucination mitigation before scaling." },
];

const DemoPreview = () => (
  <section id="demo" className="py-32 px-6 relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
    
    <div className="max-w-4xl mx-auto relative z-10">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-medium tracking-wide mb-6">
          Live Example
        </div>
        <h2 className="font-heading text-4xl md:text-5xl font-black text-foreground mb-6 tracking-tight">Watch the Council in Action</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
          A glimpse into the real-time autonomous debate interface.
        </p>
      </motion.div>

      <motion.div
        className="glass rounded-2xl overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] border border-glass-border/50 bg-background/80 backdrop-blur-2xl"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.25, 0.4, 0.2, 1] }}
      >
        {/* Window Header */}
        <div className="px-5 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500/50 shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-500/50 shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-green-500/80 border border-green-500/50 shadow-sm" />
          </div>
          <div className="text-xs font-mono text-muted-foreground bg-black/20 px-3 py-1 rounded-full border border-white/5">
            council-deliberation-01.log
          </div>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>

        <div className="p-6 md:p-8 space-y-6 max-h-[600px] overflow-y-auto scrollbar-hide bg-gradient-to-b from-transparent to-black/20">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              initial={{ opacity: 0, y: 20, x: msg.role === "user" ? 20 : -20 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 + 0.3, ease: "easeOut" }}
            >
              <div className={`w-10 h-10 rounded-xl bg-${msg.color}/10 flex items-center justify-center shrink-0 border border-${msg.color}/20 shadow-lg shadow-${msg.color}/5 relative`}>
                <div className={`absolute inset-0 rounded-xl bg-${msg.color}/20 blur-md opacity-0 animate-pulse-glow`} />
                <msg.icon className={`w-5 h-5 text-${msg.color} relative z-10`} />
              </div>
              <div className={`max-w-[85%] md:max-w-[75%] ${msg.role === "user" ? "text-right" : ""}`}>
                <span className={`text-xs font-bold uppercase tracking-wider text-${msg.color} mb-1.5 block`}>{msg.name}</span>
                <div className={`
                  px-5 py-3.5 text-[15px] leading-relaxed relative
                  ${msg.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm shadow-md" 
                    : "glass-subtle text-secondary-foreground rounded-2xl rounded-tl-sm border-white/5 shadow-md bg-white/5"
                  }
                `}>
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Typing indicator */}
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <div className={`w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center shrink-0 border border-white/5`}>
              <div className="flex gap-1">
                <motion.div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} />
                <motion.div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} />
                <motion.div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default DemoPreview;

// Minor formatting update

