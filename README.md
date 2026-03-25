# CouncilGPT 🏛️

CouncilGPT is a sophisticated multi-agent debate platform that leverages Large Language Models to simulate structured, multi-perspective discussions on any given topic. By employing a "Council" of specialized AI agents, the platform provides users with a comprehensive 360-degree view of complex ideas, moving beyond simple one-on-one AI chat.

## 🚀 Project Overview

The core philosophy of CouncilGPT is that truth and insight emerge from the friction of opposing viewpoints. Instead of asking one AI for an answer, CouncilGPT triggers a chain of specialized personas that debate, analyze, and judge the topic in real-time.

### Key Features
- **Multi-Agent Debate Chain**: A sequential four-stage debate process.
- **Specialized Personas**: Unique agents with distinct reasoning styles and tones.
- **Deep Insights**: Post-debate analysis providing metrics on argument strength and contradictions.
- **Full History Persistence**: Save and revisit past debates with a built-in database.
- **Modern UI/UX**: A premium, responsive interface built with React, Tailwind CSS, and Framer Motion.
- **Local LLM Integration**: Privacy-focused and cost-effective execution using Ollama.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database**: [SQLAlchemy](https://www.sqlalchemy.org/) with SQLite
- **Authentication**: JWT-based (jose, passlib, bcrypt)
- **LLM Engine**: [Ollama](https://ollama.com/)

## 🧠 Model Details

CouncilGPT uses the **`qwen2.5:3b`** model by default.
- **Why qwen2.5:3b?**: It offers a significant quality jump over 1.5b models for persona following and nuanced reasoning while maintaining a low VRAM footprint (~2.2 GB).
- **Optimization**: The backend uses `keep_alive=0` to release VRAM immediately after each agent's turn, allowing it to run comfortably on GPUs with as little as 4 GB VRAM.
- **Context**: Configured with `num_ctx: 2048` to ensure agents can reference the full debate history.

## 🔄 Workflow & Architecture

### The Council (Agents)
1. **Optimist**: Takes the positive/YES side. Warm and casual tone. Focuses on upside and excitement.
2. **Analyst**: Backs the positive side with facts, data, and logical extensions. Smart and confident.
3. **Critic**: Takes the negative/NO side. Sharp and sarcastic. Points out risks, flaws, and overhype.
4. **Judge**: Delivers the final take. Punchy, dramatic, and witty. Usually leans towards the critical side for a "mic-drop" conclusion.
5. **Insight Analyst**: A background agent that parses the entire debate into a structured JSON analysis (strength, influence, contradictions).

### Data Flow
`User Topic` ➔ `Optimist` ➔ `Analyst` ➔ `Critic` ➔ `Judge` ➔ `Final Conclusion` ➔ `Insight Analysis`

## 📂 Directory Structure

```text
CouncilGPT/
├── backend/                # FastAPI Application
│   ├── main.py             # Entry point, API routes & Agent logic
│   ├── models.py           # SQLAlchemy Database models
│   ├── schemas.py          # Pydantic data validation schemas
│   ├── database.py         # DB connection & Session management
│   ├── auth.py             # JWT & Password hashing logic
│   └── sql_app.db          # SQLite Database file
├── src/                    # React Frontend
│   ├── components/         # Reusable UI components (shadcn/ui)
│   │   ├── landing/        # Landing page specific components
│   │   ├── workspace/      # Debate interface components
│   │   └── ui/             # Core UI primitives
│   ├── pages/              # Main view containers
│   │   ├── Landing.tsx     # Homepage
│   │   ├── Workspace.tsx   # Active debate area
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Shared utilities
│   └── main.tsx            # Application entrance
├── public/                 # Static assets
├── package.json            # Frontend dependencies & scripts
├── tailwind.config.ts      # Tailwind styling configuration
└── tsconfig.json           # TypeScript configuration
```

## ⚙️ Getting Started

### Prerequisites
- **Node.js**: v18+
- **Python**: v3.10+
- **Ollama**: [Download and install Ollama](https://ollama.com/download)

### Step 1: LLM Setup
Pull the required model in Ollama:
```bash
ollama pull qwen2.5:3b
```

### Step 2: Backend Setup
```bash
# Navigate to backend
cd backend

# Create a virtual environment (Recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic httpx passlib[bcrypt] python-multipart python-jose[cryptography] bcrypt

# Start the server
python main.py
```
*The backend will run on `http://localhost:8000`*

### Step 3: Frontend Setup
```bash
# Open a new terminal in the root directory
npm install

# Start development server
npm run dev
```
*The frontend will run on `http://localhost:8080`*

## 📖 Usage
1. **Registration**: Create an account to save your debates.
2. **New Debate**: Enter a topic on the landing page or workspace.
3. **Watch**: Observe as the Optimist, Analyst, Critic, and Judge take turns.
4. **Analysis**: Once the debate finishes, view the "Insights" tab for a scientific breakdown of the discussion.

---
*Created for PBL - Deep Learning (Semester 6)*
