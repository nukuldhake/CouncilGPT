import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Plus, MessageSquare, Brain, PanelLeftClose, Settings, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";



interface Props {
  open: boolean;
  onToggle: () => void;
  activeSessionId: number | null;
  onSelectSession: (id: number | null) => void;
}

interface ChatSessionItem {
  id: number;
  topic: string;
}

const ChatSidebar = ({ open, onToggle, activeSessionId, onSelectSession }: Props) => {
  const [chatList, setChatList] = useState<ChatSessionItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTopic, setEditTopic] = useState("");
  const [userEmail, setUserEmail] = useState("user@example.com");

  useEffect(() => {
    fetchHistory();
    fetchUser();
  }, [activeSessionId]);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/api/chat/sessions");
      if (res.ok) {
        const data = await res.json();
        setChatList(data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const deleteSession = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat?")) return;
    try {
      const res = await api.delete(`/api/chat/sessions/${id}`);
      if (res.ok) {
        if (activeSessionId === id) onSelectSession(null);
        fetchHistory();
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const startRename = (e: React.MouseEvent, session: ChatSessionItem) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTopic(session.topic);
  };

  const saveRename = async (id: number) => {
    if (!editTopic.trim()) {
      setEditingId(null);
      return;
    }
    try {
      const res = await api.put(`/api/chat/sessions/${id}`, { topic: editTopic });
      if (res.ok) {
        setEditingId(null);
        fetchHistory();
      }
    } catch (err) {
      console.error("Failed to rename session:", err);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === "Enter") saveRename(id);
    if (e.key === "Escape") setEditingId(null);
  };

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUserEmail(data.email);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  const startNewChat = () => {
    onSelectSession(null);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
  <AnimatePresence initial={false}>
    {open && (
      <motion.aside
        className="h-full border-r border-border bg-sidebar flex flex-col shrink-0"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 260, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <div className="p-4 flex items-center justify-between border-b border-border">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Brain className="w-5 h-5 text-primary" />
            <span className="font-heading text-sm font-semibold text-foreground">CouncilGPT</span>
          </Link>
          <button onClick={onToggle} className="text-muted-foreground hover:text-foreground transition-colors">
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3">
          <Button 
            onClick={startNewChat}
            className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 h-9 text-sm" 
            variant="ghost"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          <p className="text-xs text-muted-foreground px-2 py-2 font-medium uppercase tracking-wider">Recent Chats</p>
          {chatList.map((d) => (
            <div
              key={d.id}
              onClick={() => onSelectSession(d.id)}
              className={`group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors cursor-pointer relative ${
                activeSessionId === d.id ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              {editingId === d.id ? (
                <input
                  autoFocus
                  className="bg-background border border-primary/30 rounded px-1 w-full text-xs py-0.5 outline-none"
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  onBlur={() => saveRename(d.id)}
                  onKeyDown={(e) => handleEditKeyDown(e, d.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className="truncate flex-1">{d.topic}</span>
                  <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-auto">
                    <button
                      onClick={(e) => startRename(e, d)}
                      className="p-1 hover:text-primary transition-colors text-muted-foreground/60"
                      title="Rename"
                    >
                      <Plus className="w-3 h-3 rotate-45" /> {/* Using Plus rotated as a tiny cross/tool */}
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button
                      onClick={(e) => deleteSession(e, d.id)}
                      className="p-1 hover:text-red-500 transition-colors text-muted-foreground/60"
                      title="Delete"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>


        {/* User Settings Area */}
        <div className="p-4 border-t border-border mt-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground px-2">
                <UserIcon className="w-4 h-4 mr-2" />
                Workspace Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass">
              <DialogHeader>
                <DialogTitle>Workspace Settings</DialogTitle>
                <DialogDescription>
                  Manage your account and preferences.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">User Profile</p>
                      <p className="text-xs text-muted-foreground">{userEmail}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Preferences</p>
                  <Button variant="outline" className="w-full justify-start font-normal">
                    <Settings className="w-4 h-4 mr-2" /> Adjust AI Confidence Threshold
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start font-normal mt-2"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.aside>
    )}
  </AnimatePresence>
  );
};

export default ChatSidebar;
