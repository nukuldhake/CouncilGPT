import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Book, Code, MessagesSquare } from "lucide-react";

const Documentation = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8 pt-12">
        <Link to="/" className="inline-flex items-center text-sm text-primary hover:underline hover:text-primary/90 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4 mb-12">
            <h1 className="font-heading text-5xl font-black text-foreground">Documentation</h1>
            <p className="text-xl text-muted-foreground">Everything you need to orchestrate a council of AI agents.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-2xl glow-primary space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Book className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-heading text-xl font-semibold">Getting Started</h2>
              <p className="text-sm text-muted-foreground">Learn the basics of how to prompt the council and interpret the insights panel.</p>
              <Link to="/workspace" className="text-sm text-primary inline-flex hover:underline">Go to Workspace &rarr;</Link>
            </div>
            
            <div className="glass p-6 rounded-2xl glow-primary space-y-4">
              <div className="w-12 h-12 bg-agent-analyst/10 rounded-xl flex items-center justify-center">
                <MessagesSquare className="w-6 h-6 text-agent-analyst" />
              </div>
              <h2 className="font-heading text-xl font-semibold">Agent Personas</h2>
              <p className="text-sm text-muted-foreground">Deep dive into the roles of Analyst, Critic, Optimist, and Synthesizer.</p>
              <Link to="/docs/agent-personas" className="text-sm text-agent-analyst inline-flex hover:underline">Read more &rarr;</Link>
            </div>

            <div className="glass p-6 rounded-2xl glow-primary space-y-4">
              <div className="w-12 h-12 bg-agent-synthesizer/10 rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-agent-synthesizer" />
              </div>
              <h2 className="font-heading text-xl font-semibold">API Reference</h2>
              <p className="text-sm text-muted-foreground">Integrate CouncilGPT debates directly into your own applications with our API.</p>
              <Link to="/docs/api-reference" className="text-sm text-agent-synthesizer inline-flex hover:underline">View API docs &rarr;</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Documentation;
