import { motion, useScroll, useTransform } from "framer-motion";
import { MessageSquare, Users, Lightbulb } from "lucide-react";
import { useRef } from "react";

const steps = [
  {
    icon: MessageSquare,
    title: "1. Frame the Problem",
    description: "Submit a complex scenario, decision, or idea that needs multifaceted analysis.",
  },
  {
    icon: Users,
    title: "2. The Council Deliberates",
    description: "Four specialized AI agents debate internally, challenging assumptions and exploring alternative angles.",
  },
  {
    icon: Lightbulb,
    title: "3. Synthesized Verdict",
    description: "Receive a structured, transparent output that balances conflicting viewpoints into actionable intelligence.",
  },
];

const HowItWorks = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="py-32 px-6 relative" ref={ref}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-medium tracking-wide mb-6">
            Process
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-foreground mb-6 tracking-tight">How the Council Operates</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            A deterministic, multi-round protocol that turns single inputs into comprehensive analytical reports.
          </p>
        </motion.div>

        <div className="relative grid md:grid-cols-3 gap-8 md:gap-12">
          {/* Connecting Line background */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-border/40" />
          
          {/* Animated Connecting Line */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 origin-left">
            <motion.div 
              className="w-full h-full bg-gradient-to-r from-primary/50 via-primary to-accent/50"
              style={{ scaleX: pathLength }}
            />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="relative z-10 flex flex-col items-center text-center group"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.2, ease: "easeOut" }}
            >
              <div className="w-24 h-24 rounded-2xl bg-background/80 backdrop-blur-xl border border-glass-border flex items-center justify-center mb-8 shadow-2xl shadow-black/20 group-hover:scale-110 transition-transform duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <step.icon className="w-10 h-10 text-primary relative z-10 transition-transform duration-500 group-hover:-translate-y-1" />
              </div>
              
              <h3 className="font-heading text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">{step.title}</h3>
              <p className="text-base text-muted-foreground leading-relaxed px-4">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

# Minor formatting update

