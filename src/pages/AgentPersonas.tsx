import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, MessagesSquare } from "lucide-react";

const AgentPersonas = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8 pt-12">
        <Link to="/docs" className="inline-flex items-center text-sm text-primary hover:underline hover:text-primary/90 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Docs
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass p-8 md:p-12 space-y-6 glow-primary rounded-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-agent-analyst/10 rounded-xl flex items-center justify-center">
              <MessagesSquare className="w-6 h-6 text-agent-analyst" />
            </div>
            <h1 className="font-heading text-4xl font-bold text-foreground">Agent Personas</h1>
          </div>
          <p className="text-muted-foreground text-lg">Details about the AI council members.</p>
          <div className="space-y-6 text-secondary-foreground leading-relaxed mt-6">
            <h2 className="text-2xl font-semibold text-agent-analyst mt-8">Analyst</h2>
            <p>Focuses on data, market size, probabilities, and objective facts. Will pull in hypothetical statistics when needed.</p>
            
            <h2 className="text-2xl font-semibold text-agent-critic mt-8">Critic</h2>
            <p>Looks for flaws, risks, saturation, compliance issues, and general contrarian viewpoints.</p>

            <h2 className="text-2xl font-semibold text-agent-optimist mt-8">Optimist</h2>
            <p>Sees the blue ocean, highlights early adopter enthusiasm, and projects positive outcomes.</p>

            <h2 className="text-2xl font-semibold text-agent-synthesizer mt-8">Synthesizer</h2>
            <p>Analyzes the debate, draws consensus, and provides actionable recommendations and confidence levels.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AgentPersonas;
