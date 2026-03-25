import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, PanelLeftOpen, PanelRightOpen, BarChart3, ShieldAlert, Sun, Crown, User, Pause, Square, Play, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { DebateAnalysis } from "./InsightsPanel";

// ── Agent metadata ─────────────────────────────────────────────────────────────
//
// FIX: Tailwind purges dynamic class strings like `bg-${color}` at build time —
// they never make it into the CSS bundle, so the styles silently disappear.
// Solution: use static, complete class strings that Tailwind can detect.

const agentMeta: Record<string, {
  icon: typeof BarChart3;
  bgClass: string;       // icon background
  textClass: string;     // label / icon color
  borderClass: string;   // bubble border accent
}> = {
  Optimist: {
    icon: Sun,
    bgClass: "bg-yellow-500/10",
    textClass: "text-yellow-500",
    borderClass: "border-yellow-500/20",
  },
  Analyst: {
    icon: BarChart3,
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-400",
    borderClass: "border-blue-500/20",
  },
  Critic: {
    icon: ShieldAlert,
    bgClass: "bg-red-500/10",
    textClass: "text-red-400",
    borderClass: "border-red-500/20",
  },
  Judge: {
    icon: Crown,
    bgClass: "bg-purple-500/10",
    textClass: "text-purple-400",
    borderClass: "border-purple-500/30",
  },
};

const AGENT_SEQUENCE = ["Optimist", "Analyst", "Critic", "Judge"];

// ── Types ──────────────────────────────────────────────────────────────────────

interface Message {
  id: number;
  role: "user" | "agent";
  agent?: string;
  text: string;
  replyTo?: string;
}

// Structured history entry sent to the backend
interface HistoryEntry {
  role?: "user";
  agent?: string;
  text: string;
}

interface Props {
  onToggleSidebar: () => void;
  onToggleInsights: () => void;
  sidebarOpen: boolean;
  insightsOpen: boolean;
  activeSessionId: number | null;
  onSessionCreated: (id: number) => void;
  onAnalysisUpdate?: (analysis: DebateAnalysis) => void;
}

// ── Typing indicator ───────────────────────────────────────────────────────────

const TypingIndicator = ({ agent }: { agent: string }) => {
  const meta = agentMeta[agent];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <motion.div
      className="flex items-center gap-2 px-4 py-2 max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={`w-6 h-6 rounded-md ${meta.bgClass} flex items-center justify-center`}>
        <Icon className={`w-3 h-3 ${meta.textClass}`} />
      </div>
      <span className={`text-xs ${meta.textClass}`}>{agent} is typing…</span>
      <div className="flex gap-0.5">
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-typing-dot-1" />
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-typing-dot-2" />
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-typing-dot-3" />
      </div>
    </motion.div>
  );
};

// ── Component ──────────────────────────────────────────────────────────────────

const ChatWindow = ({ 
  onToggleSidebar, 
  onToggleInsights, 
  sidebarOpen, 
  insightsOpen, 
  activeSessionId, 
  onSessionCreated,
  onAnalysisUpdate 
}: Props) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<"idle" | "running" | "paused">("idle");
  const [typingAgent, setTypingAgent] = useState("");
  const [sessionTitle, setSessionTitle] = useState("New Chat");
  const [round, setRound] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const ignoreNextLoadRef = useRef(false);

  useEffect(() => {
    if (activeSessionId) {
      if (ignoreNextLoadRef.current) {
        ignoreNextLoadRef.current = false;
        return;
      }
      loadSession(activeSessionId);
    } else {
      setMessages([]);
      setSessionTitle("New Chat");
      setRound(0);
      setStatus("idle");
    }
  }, [activeSessionId]);

  const loadSession = async (id: number) => {
    try {
      const res = await api.get(`/api/chat/sessions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSessionTitle(data.topic);
        const mappedMessages: Message[] = data.messages.map((m: { id: number; role: "user" | "agent"; agent_name?: string; text: string }) => ({
          id: m.id,
          role: m.role,
          agent: m.agent_name,
          text: m.text,
        }));
        setMessages(mappedMessages);
        setStatus("paused");
        latestTopicRef.current = data.topic;
      }
    } catch (err) {
      console.error("Failed to load session:", err);
    }
  };

  const latestTopicRef = useRef("");
  const statusRef = useRef(status);
  const messagesRef = useRef(messages);
  const roundRef = useRef(round);            // FIX: track round in ref so callbacks see latest value
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { roundRef.current = round; }, [round]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingAgent]);

  // ── Build structured history for backend ──────────────────────────────────
  const buildHistory = useCallback((msgs: Message[]): HistoryEntry[] =>
    msgs.map((m) =>
      m.role === "user"
        ? { role: "user", text: m.text }
        : { agent: m.agent, text: m.text }
    ), []);

  const fetchAnalysis = useCallback(async (msgs: Message[], topic: string) => {
    if (!onAnalysisUpdate) return;
    try {
      const history = buildHistory(msgs);
      const res = await api.post("/api/debate/analyze", { history, topic, agent: "Insight_Analyst" });
      if (res.ok) {
        const data = await res.json();
        onAnalysisUpdate(data);
      }
    } catch (err) {
      console.error("Failed to fetch analysis:", err);
    }
  }, [onAnalysisUpdate, buildHistory]);

  // ── Call a single agent ────────────────────────────────────────────────────
  const callAgent = async (
    agentName: string,
    history: HistoryEntry[],
    topic: string,
  ): Promise<string> => {
    const res = await api.post("/api/debate/turn", { agent: agentName, history, topic });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Agent ${agentName} failed (${res.status})`);
    }
    const data = await res.json();
    return data.text || "...";
  };

  // ── Chat runner ────────────────────────────────────────────────────────────
  const runChat = useCallback(async (
    startMessages: Message[],
    currentTopic: string,
    sessionId: number | null
  ) => {
    setStatus("running");
    statusRef.current = "running";
    setErrorMsg(null);

    const currentRound = roundRef.current + 1;
    setRound(currentRound);
    roundRef.current = currentRound;

    let currentMsgs = [...startMessages];

    try {
      for (let i = 0; i < AGENT_SEQUENCE.length; i++) {
        if (statusRef.current !== "running") return;

        const agentName = AGENT_SEQUENCE[i];
        const prevAgent = i > 0 ? AGENT_SEQUENCE[i - 1] : "You";

        setTypingAgent(agentName);

        const history = buildHistory(currentMsgs);
        const agentText = await callAgent(agentName, history, currentTopic);

        if (statusRef.current !== "running") return;

        const newMsg: Message = {
          id: Date.now() + Math.random(),
          role: "agent",
          agent: agentName,
          text: agentText,
          replyTo: prevAgent,
        };

        currentMsgs = [...currentMsgs, newMsg];
        setMessages(currentMsgs);

        // Update session on each agent reply if we have a session ID
        if (sessionId) {
          updateSession(sessionId, currentMsgs, currentTopic);
        }
      }

      setTypingAgent("");
      setStatus("paused");
      statusRef.current = "paused";

      // Trigger analysis after full sequence
      fetchAnalysis(currentMsgs, currentTopic);

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      console.error("Chat error:", msg);
      setErrorMsg(msg);
      setTypingAgent("");
      setStatus("paused");
      statusRef.current = "paused";
    }
  }, [fetchAnalysis, buildHistory]);

  const saveInitialSession = async (msgs: Message[], topic: string) => {
    try {
      const payload = {
        topic,
        messages: msgs.map(m => ({
          role: m.role,
          agent_name: m.agent,
          text: m.text
        }))
      };
      const res = await api.post("/api/chat/sessions", payload);
      if (res.ok) {
        const data = await res.json();
        onSessionCreated(data.id);
        return data.id;
      }
    } catch (err) {
      console.error("Failed to save initial session:", err);
    }
    return null;
  };

  const updateSession = async (id: number, msgs: Message[], topic: string) => {
    try {
      const lastMsg = msgs[msgs.length - 1];
      const payload = {
        role: lastMsg.role,
        agent_name: lastMsg.agent,
        text: lastMsg.text
      };
      await api.post(`/api/chat/sessions/${id}/messages`, payload);
    } catch (err) {
      console.error("Failed to update session with new message:", err);
    }
  };

  // ── Send handler ───────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || status === "running") return;
    const userText = input.trim();
    setErrorMsg(null);

    const isFirstMessage = messages.length === 0 && !activeSessionId;

    if (isFirstMessage) {
      setSessionTitle(userText.length > 40 ? userText.substring(0, 40) + "…" : userText);
    }

    latestTopicRef.current = userText;
    const newMsg: Message = { id: Date.now(), role: "user", text: userText };
    const updated = [...messages, newMsg];
    setMessages(updated);
    setInput("");

    let sessionId = activeSessionId;
    if (isFirstMessage) {
      // Automatically create session on first message
      sessionId = await saveInitialSession(updated, userText);
      ignoreNextLoadRef.current = true;
    }

    runChat(updated, userText, sessionId);
  };

  const handleResume = () => {
    runChat(messagesRef.current, latestTopicRef.current, activeSessionId);
  };

  const handlePause = () => {
    setStatus("paused");
    statusRef.current = "paused";
    setTypingAgent("");
  };

  const handleStop = () => {
    setStatus("idle");
    statusRef.current = "idle";
    setTypingAgent("");
    setErrorMsg(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          {!sidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="font-heading text-sm font-semibold text-foreground">{sessionTitle}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full transition-colors ${status === "running"
                  ? "bg-green-500 animate-pulse"
                  : status === "paused"
                    ? "bg-amber-500"
                    : "bg-muted-foreground"
                  }`} />
                {status === "running"
                  ? "Squad Thinking"
                  : status === "paused"
                    ? `Paused · Round ${round}`
                    : "Ready"}
              </span>
              {round > 0 && <><span>•</span><span>Round {round}</span></>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${status === "running"
              ? "w-2/3 bg-green-500 animate-pulse"
              : status === "paused"
                ? "w-1/2 bg-amber-500"
                : "w-full bg-primary"
              }`} />
          </div>
          {!insightsOpen && (
            <button
              onClick={onToggleInsights}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <PanelRightOpen className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Error banner */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 text-xs text-red-400 text-center"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {errorMsg} — you can resume or try a new message.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 relative">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4">
            <Brain className="w-12 h-12 text-primary animate-pulse" />
            <p className="text-sm font-medium">Start a conversation with the squad! 🔥</p>
          </div>
        )}

        {messages.map((msg) => {
          const meta = msg.agent ? agentMeta[msg.agent] : null;
          const Icon = meta?.icon ?? User;
          const isUser = msg.role === "user";
          const isJudge = msg.agent === "Judge";

          return (
            <motion.div
              key={msg.id}
              className={`flex gap-3 max-w-3xl mx-auto ${isUser ? "flex-row-reverse" : ""}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isUser ? "bg-primary/10" : (meta?.bgClass ?? "bg-muted")
                }`}>
                <Icon className={`w-4 h-4 ${isUser ? "text-primary" : (meta?.textClass ?? "text-muted-foreground")}`} />
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] ${isUser ? "text-right" : ""}`}>
                <span className={`text-xs font-medium mb-1 block ${isUser ? "text-primary" : (meta?.textClass ?? "text-muted-foreground")
                  }`}>
                  {isUser ? "You" : msg.agent}
                  {msg.replyTo && (
                    <span className="text-muted-foreground font-normal"> → {msg.replyTo}</span>
                  )}
                </span>

                <div className={`px-4 py-3 text-sm leading-relaxed rounded-2xl border ${isJudge
                  ? `bg-purple-500/5 ${meta?.borderClass} text-foreground font-medium`
                  : isUser
                    ? "bg-primary/10 border-primary/20 rounded-br-md text-foreground"
                    : `bg-muted/40 ${meta?.borderClass ?? "border-border"} text-secondary-foreground`
                  }`}>
                  {msg.text}
                </div>
              </div>
            </motion.div>
          );
        })}

        <AnimatePresence>
          {status === "running" && typingAgent && (
            <TypingIndicator agent={typingAgent} />
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-border p-4 bg-background/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={status === "running"}
            placeholder={
              status === "running"
                ? `${typingAgent} is typing...`
                : status === "paused"
                  ? "Jump in with your thoughts, or hit ▶ to continue..."
                  : "Send a message..."
            }
            className="flex-1 bg-muted/50 border-border h-11 text-foreground placeholder:text-muted-foreground"
          />

          {/* Running: Pause + Stop */}
          {status === "running" && (
            <div className="flex gap-1.5">
              <Button
                onClick={handlePause}
                variant="outline"
                className="h-11 px-3 border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                title="Pause Chat"
              >
                <Pause className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleStop}
                variant="outline"
                className="h-11 px-3 border-red-500/50 text-red-500 hover:bg-red-500/10"
                title="End Chat"
              >
                <Square className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Paused: Send new message OR Resume + Stop */}
          {status === "paused" && (
            <div className="flex gap-1.5">
              {input.trim() ? (
                <Button
                  onClick={handleSend}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleResume}
                  className="bg-green-600 hover:bg-green-700 text-white h-11 px-3"
                  title="Continue Chat"
                >
                  <Play className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={handleStop}
                variant="outline"
                className="h-11 px-3 border-red-500/50 text-red-500 hover:bg-red-500/10"
                title="End Chat"
              >
                <Square className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Idle: Send */}
          {status === "idle" && (
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-4 shadow-lg shadow-primary/20"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
