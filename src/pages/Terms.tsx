import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
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
          className="glass p-8 md:p-12 space-y-6 glow-primary rounded-2xl"
        >
          <h1 className="font-heading text-4xl font-bold text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground text-lg">Last updated: March 2026</p>
          <div className="space-y-6 text-secondary-foreground leading-relaxed">
            <h2 className="text-2xl font-semibold text-foreground mt-8">1. Acceptance of Terms</h2>
            <p>By accessing or using the CouncilGPT service, you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>
            
            <h2 className="text-2xl font-semibold text-foreground mt-8">2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on CouncilGPT's website for personal, non-commercial transitory viewing only.</p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">3. Disclaimer</h2>
            <p>The materials on CouncilGPT's website are provided on an 'as is' basis. CouncilGPT makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
