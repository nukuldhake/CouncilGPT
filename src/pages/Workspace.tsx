import { useState } from "react";
import ChatSidebar from "@/components/workspace/ChatSidebar";
import ChatWindow from "@/components/workspace/ChatWindow";
import InsightsPanel, { DebateAnalysis } from "@/components/workspace/InsightsPanel";

const Workspace = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [insightsOpen, setInsightsOpen] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [insightsData, setInsightsData] = useState<DebateAnalysis | null>(null);

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <ChatSidebar 
        open={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
      />
      <ChatWindow
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleInsights={() => setInsightsOpen(!insightsOpen)}
        sidebarOpen={sidebarOpen}
        insightsOpen={insightsOpen}
        activeSessionId={activeSessionId}
        onSessionCreated={setActiveSessionId}
        onAnalysisUpdate={setInsightsData}
      />
      {insightsOpen && (
        <InsightsPanel 
          analysis={insightsData} 
          onClose={() => setInsightsOpen(false)} 
        />
      )}
    </div>
  );
};

export default Workspace;
