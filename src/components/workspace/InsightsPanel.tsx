import { motion } from "framer-motion";
import { X, BarChart3, ShieldAlert, Sun, Layers } from "lucide-react";

const agents = [
  { name: "Analyst", icon: BarChart3, color: "agent-analyst", strength: 85, influence: 35 },
  { name: "Critic", icon: ShieldAlert, color: "agent-critic", strength: 78, influence: 30 },
  { name: "Optimist", icon: Sun, color: "agent-optimist", strength: 68, influence: 20 },
  { name: "Synthesizer", icon: Layers, color: "agent-synthesizer", strength: 90, influence: 15 },
];

const contradictions = [
  { a: "Analyst", b: "Critic", topic: "Market demand assumptions" },
  { a: "Optimist", b: "Critic", topic: "Growth vs. regulatory risk" },
];

interface Props {
  onClose: () => void;
}

const InsightsPanel = ({ onClose }: Props) => (
  <motion.aside
    className="w-72 h-full border-l border-border bg-sidebar shrink-0 flex flex-col overflow-y-auto"
    initial={{ width: 0, opacity: 0 }}
    animate={{ width: 288, opacity: 1 }}
    exit={{ width: 0, opacity: 0 }}
    transition={{ duration: 0.25 }}
  >
    <div className="p-4 border-b border-border flex items-center justify-between">
      <h3 className="font-heading text-sm font-semibold text-foreground">AI Insights</h3>
      <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>

    <div className="p-4 space-y-6">
      {/* Argument Strength */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Argument Strength</p>
        <div className="space-y-3">
          {agents.map((a) => (
            <div key={a.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <a.icon className={`w-3 h-3 text-${a.color}`} />
                  <span className="text-xs text-secondary-foreground">{a.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{a.strength}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-${a.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${a.strength}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contradictions */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Contradiction Detection</p>
        <div className="space-y-2">
          {contradictions.map((c, i) => (
            <div key={i} className="glass-subtle p-3 text-xs">
              <div className="flex items-center gap-1 mb-1">
                <span className={`text-${agentColor(c.a)}`}>{c.a}</span>
                <span className="text-muted-foreground">↔</span>
                <span className={`text-${agentColor(c.b)}`}>{c.b}</span>
              </div>
              <p className="text-muted-foreground">{c.topic}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Influence */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Agent Influence</p>
        <div className="space-y-2">
          {agents.map((a) => (
            <div key={a.name} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <a.icon className={`w-3 h-3 text-${a.color}`} />
                <span className="text-xs text-secondary-foreground">{a.name}</span>
              </div>
              <span className={`text-xs font-medium text-${a.color}`}>{a.influence}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.aside>
);

function agentColor(name: string) {
  const map: Record<string, string> = {
    Analyst: "agent-analyst",
    Critic: "agent-critic",
    Optimist: "agent-optimist",
    Synthesizer: "agent-synthesizer",
  };
  return map[name] || "primary";
}

export default InsightsPanel;
