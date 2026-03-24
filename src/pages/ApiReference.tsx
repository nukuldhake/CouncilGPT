import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Code } from "lucide-react";

const ApiReference = () => {
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
            <div className="w-12 h-12 bg-agent-synthesizer/10 rounded-xl flex items-center justify-center">
              <Code className="w-6 h-6 text-agent-synthesizer" />
            </div>
            <h1 className="font-heading text-4xl font-bold text-foreground">API Reference</h1>
          </div>
          <p className="text-muted-foreground text-lg">Integrate CouncilGPT endpoints.</p>
          <div className="space-y-6 text-secondary-foreground leading-relaxed">
            <h2 className="text-2xl font-semibold text-foreground mt-8">Authentication</h2>
            <p>Use Bearer tokens for authorization: <code className="bg-muted px-2 py-1 rounded">Authorization: Bearer YOUR_TOKEN</code></p>
            
            <h2 className="text-2xl font-semibold text-foreground mt-8">Endpoints</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><code className="text-primary">POST /api/v1/debate/start</code> - Starts a new deliberation session with your prompt.</li>
              <li><code className="text-primary">GET /api/v1/debate/:id/status</code> - Gets the current status of the debate.</li>
              <li><code className="text-primary">GET /api/v1/debate/:id/insights</code> - Retrieves the contradiction and influence metrics.</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ApiReference;
