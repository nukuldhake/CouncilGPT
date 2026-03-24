import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useEffect } from "react";

const debates = [
  { id: 1, title: "AI tutoring startup viability", active: true },
  { id: 2, title: "Remote work policy decision", active: false },
  { id: 3, title: "Market expansion strategy", active: false },
  { id: 4, title: "Product pricing model", active: false },
];

interface Props {
  open: boolean;
  onToggle: () => void;
  activeSessionId: number | null;
  onSelectSession: (id: number | null) => void;
}

const DebateSidebar = ({ open, onToggle, activeSessionId, onSelectSession }: Props) => {
  const [debateList, setDebateList] = useState<any[]>([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("user@example.com");

  useEffect(() => {
    fetchHistory();
    fetchUser();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/api/chat/sessions");
      if (res.ok) {
        const data = await res.json();
        setDebateList(data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
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

  const startNewDebate = () => {
    onSelectSession(null);
    setIsNewDialogOpen(false);
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
          <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 h-9 text-sm" variant="ghost">
                <Plus className="w-4 h-4 mr-2" />
                New Debate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass">
              <DialogHeader>
                <DialogTitle>Start a New Debate</DialogTitle>
                <DialogDescription>
                  Enter the problem or decision you want the council to analyze.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="prompt">Prompt connecting to your goal</Label>
                  <Input
                    id="prompt"
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    placeholder="e.g. Should we launch a new product?"
                    className="col-span-3 bg-muted/50"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={startNewDebate} className="bg-primary hover:bg-primary/90">
                  Convene Council
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          <p className="text-xs text-muted-foreground px-2 py-2 font-medium uppercase tracking-wider">History</p>
          {debateList.map((d) => (
            <button
              key={d.id}
              onClick={() => onSelectSession(d.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                activeSessionId === d.id ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{d.topic}</span>
            </button>
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

export default DebateSidebar;
