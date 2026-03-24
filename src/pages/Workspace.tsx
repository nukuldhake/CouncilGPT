import { useState } from "react";
import DebateSidebar from "@/components/workspace/DebateSidebar";
import DebateChat from "@/components/workspace/DebateChat";
import InsightsPanel from "@/components/workspace/InsightsPanel";

const Workspace = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [insightsOpen, setInsightsOpen] = useState(true);

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <DebateSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <DebateChat
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleInsights={() => setInsightsOpen(!insightsOpen)}
        sidebarOpen={sidebarOpen}
        insightsOpen={insightsOpen}
      />
      {insightsOpen && <InsightsPanel onClose={() => setInsightsOpen(false)} />}
    </div>
  );
};

export default Workspace;
