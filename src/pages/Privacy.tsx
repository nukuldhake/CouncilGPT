import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
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
          <h1 className="font-heading text-4xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">Last updated: March 2026</p>
          <div className="space-y-6 text-secondary-foreground leading-relaxed">
            <h2 className="text-2xl font-semibold text-foreground mt-8">1. Introduction</h2>
            <p>Welcome to CouncilGPT. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you how we secure your data when you visit our website.</p>
            
            <h2 className="text-2xl font-semibold text-foreground mt-8">2. Data We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which includes: Identity Data, Contact Data, and Usage Data. Your debate logs are stored securely and won't be used to train models unless explicitly permitted.</p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">3. How We Use Your Data</h2>
            <p>We use your data only to provide and improve the Services. Our agents process your prompts to generate responses but do not permanently learn from your session inputs.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
