import { motion } from "framer-motion";
import { X, BarChart3, ShieldAlert, Sun, Layers, LucideIcon } from "lucide-react";

interface AgentScore {
  name: string;
  strength: number;
  influence: number;
}

interface Contradiction {
  a: string;
  b: string;
  topic: string;
}

export interface DebateAnalysis {
  agents: AgentScore[];
  contradictions: Contradiction[];
}

interface Props {
  onClose: () => void;
  analysis: DebateAnalysis | null;
}

const agentInfo: Record<string, { icon: LucideIcon; color: string }> = {
  Optimist: { icon: Sun, color: "agent-optimist" },
  Analyst: { icon: BarChart3, color: "agent-analyst" },
  Critic: { icon: ShieldAlert, color: "agent-critic" },
  Judge: { icon: Layers, color: "agent-synthesizer" },
  Synthesizer: { icon: Layers, color: "agent-synthesizer" },
};

const InsightsPanel = ({ onClose, analysis }: Props) => (
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

    {!analysis ? (
      <div className="p-8 text-center space-y-3 opacity-50">
        <Layers className="w-8 h-8 mx-auto animate-pulse text-muted-foreground" />
        <p className="text-xs">Waiting for debate analysis...</p>
      </div>
    ) : (
      <div className="p-4 space-y-6">
        {/* Argument Strength */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Argument Strength</p>
          <div className="space-y-3">
            {analysis.agents.map((a) => {
              const info = agentInfo[a.name] || { icon: Layers, color: "primary" };
              return (
                <div key={a.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <info.icon className={`w-3 h-3 text-${info.color}`} />
                      <span className="text-xs text-secondary-foreground">{a.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{a.strength}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-${info.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${a.strength}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contradictions */}
        {analysis.contradictions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Contradiction Detection</p>
            <div className="space-y-2">
              {analysis.contradictions.map((c, i) => (
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
        )}

        {/* Influence */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Agent Influence</p>
          <div className="space-y-2">
            {analysis.agents.map((a) => {
              const info = agentInfo[a.name] || { icon: Layers, color: "primary" };
              return (
                <div key={a.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <info.icon className={`w-3 h-3 text-${info.color}`} />
                    <span className="text-xs text-secondary-foreground">{a.name}</span>
                  </div>
                  <span className={`text-xs font-medium text-${info.color}`}>{a.influence}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )}
  </motion.aside>
);

function agentColor(name: string) {
  return agentInfo[name]?.color || "primary";
}

export default InsightsPanel;
