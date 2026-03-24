import { motion } from "framer-motion";
import { BarChart3, ShieldAlert, Sun, Layers } from "lucide-react";

const agents = [
  { name: "Analyst", role: "Logic & Data", icon: BarChart3, color: "agent-analyst", desc: "Breaks down problems with structured frameworks and pure data-driven reasoning. Seeks objective ground truth." },
  { name: "Critic", role: "Devil's Advocate", icon: ShieldAlert, color: "agent-critic", desc: "Ruthlessly challenges assumptions. Identifies logical fallacies, risks, and weaknesses in other agents' arguments." },
  { name: "Optimist", role: "Growth & Vision", icon: Sun, color: "agent-optimist", desc: "Highlights untapped opportunities, upside potential, and positive second-order effects." },
  { name: "Synthesizer", role: "Consensus", icon: Layers, color: "agent-synthesizer", desc: "Evaluates the debate quality, detects contradictions via LSTM, and unifies perspectives into a final verdict." },
];

const AgentCards = () => (
  <section className="py-32 px-6 relative bg-card/20">
    {/* Decorative background gradients */}
    <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 blur-[120px] pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-1/3 h-full bg-primary/5 blur-[100px] pointer-events-none" />
    
    <div className="relative max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-16 lg:items-center mb-16">
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-medium tracking-wide mb-6">
            The Council
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-foreground mb-6 tracking-tight leading-tight">
            Meet the Specialised <br className="hidden md:block"/> Evaluators.
          </h2>
          <p className="text-xl text-muted-foreground max-w-xl font-light leading-relaxed">
            Four specialized agents bring unique lenses to the problem. Their interactions are evaluated by neural models to produce a balanced conclusion.
          </p>
        </motion.div>
        
        <div className="hidden lg:flex flex-1 justify-end">
          {/* Abstract representation of agents */}
          <div className="relative w-64 h-64">
             {agents.map((agent, i) => (
                <motion.div 
                   key={i}
                   className={`absolute w-16 h-16 rounded-2xl bg-${agent.color}/20 border border-${agent.color}/30 backdrop-blur-md flex items-center justify-center`}
                   style={{
                      top: '50%', left: '50%',
                      marginTop: -32, marginLeft: -32,
                   }}
                   animate={{ 
                      x: Math.cos((i * 2 * Math.PI) / 4) * 80, 
                      y: Math.sin((i * 2 * Math.PI) / 4) * 80,
                      rotate: [0, 360]
                   }}
                   transition={{ 
                      rotate: { duration: 20 + i * 2, repeat: Infinity, ease: "linear" },
                      x: { duration: 1, delay: i * 0.1, ease: "easeOut" },
                      y: { duration: 1, delay: i * 0.1, ease: "easeOut" }
                   }}
                >
                   <agent.icon className={`w-6 h-6 text-${agent.color}`} />
                </motion.div>
             ))}
             <div className="absolute top-1/2 left-1/2 -mt-4 -ml-4 w-8 h-8 rounded-full bg-primary/40 animate-ping" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.name}
            className="group relative isolate"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
          >
            {/* Hover Glow */}
            <div className={`absolute inset-0 -z-10 rounded-2xl bg-${agent.color}/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="h-full bg-background/60 backdrop-blur-xl border border-glass-border p-6 rounded-2xl flex flex-col items-start transition-all duration-300 group-hover:border-[color:hsl(var(--${agent.color})/0.4)] group-hover:-translate-y-2 group-hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
              <div className={`w-12 h-12 rounded-xl bg-${agent.color}/10 flex items-center justify-center mb-6 border border-${agent.color}/20 group-hover:scale-110 group-hover:bg-${agent.color}/20 transition-all duration-300`}>
                <agent.icon className={`w-6 h-6 text-${agent.color}`} />
              </div>
              
              <div className={`text-[10px] font-bold uppercase tracking-wider text-${agent.color} mb-2`}>{agent.role}</div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-3">{agent.name}</h3>
              
              <div className="h-px w-8 bg-border group-hover:w-full transition-all duration-500 mb-4" />
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {agent.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AgentCards;
