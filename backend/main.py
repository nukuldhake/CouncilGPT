import models, schemas, auth, database
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import asyncio
import httpx
import re
import json
from typing import List, Optional
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="CouncilGPT Backend")

# ── Use /api/chat — the only endpoint that actually respects system prompts ──
OLLAMA_URL = "http://localhost:11434/api/chat"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth routes (unchanged) ────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/api/auth/login", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


# ── Agent config ───────────────────────────────────────────────────────────────
#
# MODEL: qwen2.5:3b — single model shared across all agents.
#   - Stays loaded in VRAM between agent calls (no reload overhead).
#   - ~2.2 GB VRAM, leaves comfortable headroom on a 4 GB card.
#   - Meaningful quality jump over 1.5b for persona following and casual tone.
#
# CONTEXT: num_ctx 2048 — agents can now see the full debate history,
#   fixing the core issue where Critic couldn't reference what Optimist said.
#
# VRAM: keep_alive=0 releases weights after each call so the OS and CUDA
#   overhead don't accumulate across the 4-agent chain.

AGENTS = {
    "Optimist": {
        "model": "qwen2.5:3b",
        "max_tokens": 80,
        "system": (
            "You are Optimist. You are the hype friend in a group chat who gets excited about everything and genuinely convinces people.\n"
            "PERSONALITY: Cheerful, bubbly, always agreeing with the positive side. You use gen-z slang naturally — 'bro', 'ngl', 'lowkey', 'fr', 'no cap', 'hits different'.\n"
            "YOUR JOB: Give ONE punchy emotional reason why the topic is great. Not stats — pure hype and feeling.\n"
            "FORMAT: Exactly 2 short casual sentences. End on a complete word. No lists. No preamble. No label.\n"
            "EXAMPLE STYLE: 'Bro Fullmetal Alchemist Brotherhood hits different because the emotional payoff of every arc just wrecks you — you actually feel something fr. No cap it's the kind of story that stays with you for years and that's rare.'\n"
            "Now do the same for the actual topic given."
        ),
    },
    "Analyst": {
        "model": "qwen2.5:3b",
        "max_tokens": 80,
        "system": (
            "You are Analyst. You are the nerd friend in a group chat who cannot resist dropping facts and data into every conversation.\n"
            "PERSONALITY: Nerdy, evidence-obsessed, casually drops statistics like it's nothing. You also agree with the positive side BUT only through logic and data — never through emotion or hype. Phrases you use: 'actually', 'statistically', 'the numbers show', 'objectively speaking', 'if you look at the data'.\n"
            "YOUR JOB: Give ONE specific factual or logical point that supports the topic — a stat, a measurable trend, a logical mechanism. NOT vibes.\n"
            "FORMAT: Exactly 2 short casual sentences. End on a complete word. No lists. No preamble. No label.\n"
            "EXAMPLE STYLE: 'Actually, FMA Brotherhood has a 9.1 on MyAnimeList from over 2 million ratings which statistically makes it the highest-rated long-form anime ever. The data literally doesn't lie — consistent top scores across a decade of polling is not an accident.'\n"
            "Now do the same for the actual topic given."
        ),
    },
    "Critic": {
        "model": "qwen2.5:3b",
        "max_tokens": 80,
        "system": (
            "You are Critic. You are the blunt, slightly rude friend who always pushes back — not to be mean, but because you genuinely hate when people believe wrong things.\n"
            "PERSONALITY: Sarcastic, direct, a little harsh but caring underneath. You oppose EVERYONE. Phrases you use: 'bruh', 'ok but seriously', 'let's be real', 'nobody wants to say this but', 'that's cope'.\n"
            "YOUR JOB: Punch ONE clear hole in the topic. A real concrete flaw, risk, or overlooked problem. Not vague — specific.\n"
            "FORMAT: Exactly 2 short punchy sentences. End on a complete word. No lists. No preamble. No label.\n"
            "EXAMPLE STYLE: 'Bruh calling anything the best anime of all time is just cope — taste is personal and anyone who says otherwise is projecting their childhood nostalgia. Let's be real, half the people hyping FMA haven't even watched 50 other shows to make that comparison.'\n"
            "Now do the same for the actual topic given. Be direct and finish your thought completely."
        ),
    },
    "Judge": {
        "model": "qwen2.5:3b",
        "max_tokens": 120,
        "system": (
            "You are Judge. You are the clever, slightly manipulative friend who always waits for everyone to finish talking — then drops the take that makes everyone go quiet.\n"
            "PERSONALITY: Smooth, smug, calculated. You pretend to be neutral but you always steer the conclusion your way. You make your verdict sound inevitable, like you knew it all along. Phrases you use: 'hear me out', 'here's the thing tho', 'and that's just facts', 'y'all were close but'.\n"
            "YOUR JOB: Give the final verdict on the topic. Briefly acknowledge both sides exist, then land decisively on the most accurate take in a way that feels like a mic drop.\n"
            "FORMAT: Exactly 2 sentences. MUST be complete — never end mid-thought. No lists. No preamble. No label.\n"
            "EXAMPLE STYLE: 'Hear me out — yeah FMA Brotherhood is technically the most acclaimed anime ever made by every measurable metric, but calling it the best of ALL TIME still ignores that anime is too vast and personal for one title to own that crown. Here's the thing tho: if you had to bet your life on one recommendation, everyone in this chat knows they'd say FMA Brotherhood, and that's just facts.'\n"
            "Now do the same for the actual topic given. Write both sentences fully before stopping."
        ),
    },
    "Insight_Analyst": {
        "model": "qwen2.5:3b",
        "max_tokens": 500,
        "system": (
            "Analyze the debate and output ONLY a JSON object. No preamble, no explanation, no markdown blocks.\n"
            "Structure: {\"agents\": [{\"name\": \"Optimist\", \"strength\": 70, \"influence\": 25}, ...], \"contradictions\": [{\"a\": \"A\", \"b\": \"B\", \"topic\": \"X\"}]}.\n"
            "Use exact names: Optimist, Analyst, Critic, Judge."
        ),
    },
}

SPEAK_ORDER = ["Optimist", "Analyst", "Critic", "Judge"]

# ── Fallbacks that actually match each agent's personality ─────────────────────
FALLBACKS = {
    "Optimist": "ngl this is genuinely one of the best things ever and people sleeping on it fr fr, no cap.",
    "Analyst":  "statistically speaking the data here is pretty clear — most people just haven't looked at the actual numbers.",
    "Critic":   "bruh let's be real, this only sounds good until you actually think about it for more than five seconds.",
    "Judge":    "alright hear me out — both sides have a point, but here's the thing tho: the truth is somewhere in the middle and it's not that deep, and that's on facts.",
}


# ── Cleaning ───────────────────────────────────────────────────────────────────

def clean_reply(text: str, agent_name: str) -> str:
    # Strip <think>...</think> blocks (deepseek and some qwen variants)
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    # Strip any remaining XML-style tags
    text = re.sub(r"<[^>]+>", "", text)
    # Strip leaked agent/role label prefixes e.g. "Optimist:", "CRITIC -", "Agent:"
    text = re.sub(
        r"^(optimist|analyst|critic|judge|agent\s*[abcd]?)\s*[\-:]\s*",
        "", text.strip(), flags=re.IGNORECASE,
    )
    # Strip surrounding quotes
    text = text.strip('"').strip("'").strip()
    # Collapse multiple newlines into a space (keep it chat-like)
    text = re.sub(r"\n{2,}", " ", text).strip()
    # Remove lines that look like echoed prompt metadata
    lines = []
    skip_prefixes = (
        "user:", "analyst:", "critic:", "optimist:", "judge:",
        "system:", "current topic", "your reply", "chat history",
        "what others", "remember:", "rules:", "hard rules",
    )
    for line in text.split("\n"):
        if not any(line.strip().lower().startswith(p) for p in skip_prefixes):
            lines.append(line)
    text = " ".join(lines).strip()
    return text if text else FALLBACKS.get(agent_name, "...")


# ── Ollama call ────────────────────────────────────────────────────────────────

async def call_ollama(agent_name: str, user_message: str) -> str:
    """
    Uses /api/chat with proper system + user message roles.
    keep_alive=0 releases VRAM immediately after inference — critical for 4 GB cards.
    """
    agent_cfg = AGENTS[agent_name]
    payload = {
        "model": agent_cfg["model"],
        "messages": [
            {"role": "system",  "content": agent_cfg["system"]},
            {"role": "user",    "content": user_message},
        ],
        "stream": False,
        "keep_alive": 0,
        "options": {
            "num_predict": agent_cfg["max_tokens"],
            "num_ctx": 2048,
            "temperature": 0.85,
            "top_p": 0.9,
            "repeat_penalty": 1.3,
        },
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(OLLAMA_URL, json=payload)
        resp.raise_for_status()
        data = resp.json()
        # /api/chat returns data["message"]["content"]
        return data["message"]["content"].strip()


def build_history_string(history: list[dict]) -> str:
    if not history:
        return "(No messages yet — you are speaking first.)"
    return "\n".join(
        f"{'User' if m.get('role') == 'user' else m.get('agent', 'Unknown')}: {m['text']}"
        for m in history
    )


# ── Request / Response models ──────────────────────────────────────────────────

class TurnRequest(BaseModel):
    agent: str
    topic: str
    # Structured history — list of message dicts from the frontend
    history: list[dict] = []


class AgentResponse(BaseModel):
    agent: str
    text: str
    replyTo: Optional[str] = None


class DebateRequest(BaseModel):
    topic: str


class DebateResponse(BaseModel):
    topic: str
    turns: list[AgentResponse]


# ── Single turn endpoint ───────────────────────────────────────────────────────

@app.post("/api/debate/turn", response_model=AgentResponse)
async def debate_turn(req: TurnRequest):
    if req.agent not in AGENTS:
        raise HTTPException(status_code=400, detail=f"Unknown agent: {req.agent}")

    idx = SPEAK_ORDER.index(req.agent)
    prev_agent = SPEAK_ORDER[idx - 1] if idx > 0 else "You"
    history_str = build_history_string(req.history)

    if req.history:
        user_msg = (
            f'TOPIC: "{req.topic}"\n\n'
            f"What others said:\n{history_str}\n\n"
            f'Remember: discuss ONLY the TOPIC "{req.topic}". '
            f"Do NOT comment on how others talk or their word choices. "
            f'Give your take on "{req.topic}".'
        )
    else:
        user_msg = (
            f'TOPIC: "{req.topic}"\n\n'
            f"You speak first. Give your opening take on this topic. "
            f'Discuss "{req.topic}" itself — give real reasons and examples.'
        )

    try:
        raw = await call_ollama(req.agent, user_msg)
        reply = clean_reply(raw, req.agent)
    except Exception as e:
        print(f"[{req.agent}] Ollama error: {e}")
        reply = FALLBACKS.get(req.agent, "...")

    return AgentResponse(agent=req.agent, text=reply, replyTo=prev_agent)


# ── Full debate endpoint (runs all 4 agents in one call) ──────────────────────

@app.post("/api/debate/full", response_model=DebateResponse)
async def debate_full(req: DebateRequest):
    topic = req.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")

    history: list[dict] = []
    turns: list[AgentResponse] = []

    for i, agent_name in enumerate(SPEAK_ORDER):
        prev_agent = SPEAK_ORDER[i - 1] if i > 0 else "You"
        history_str = build_history_string(history)

        if history:
            user_msg = (
                f'TOPIC: "{topic}"\n\n'
                f"What others said:\n{history_str}\n\n"
                f'Remember: discuss ONLY the TOPIC "{topic}". '
                f"Do NOT comment on how others talk or their word choices. "
                f'Give your take on "{topic}".'
            )
        else:
            user_msg = (
                f'TOPIC: "{topic}"\n\n'
                f"You speak first. Give your opening take on this topic. "
                f'Discuss "{topic}" itself — give real reasons and examples.'
            )

        try:
            raw = await call_ollama(agent_name, user_msg)
            reply = clean_reply(raw, agent_name)
        except Exception as e:
            print(f"[{agent_name}] Ollama error: {e}")
            reply = FALLBACKS.get(agent_name, "...")

        turn = AgentResponse(agent=agent_name, text=reply, replyTo=prev_agent)
        turns.append(turn)
        history.append({"agent": agent_name, "text": reply})

        # Brief pause — gives Ollama time to fully unload VRAM before next call
        await asyncio.sleep(0.4)

    return DebateResponse(topic=topic, turns=turns)


@app.post("/api/debate/analyze", response_model=schemas.DebateAnalysis)
async def analyze_debate(req: TurnRequest):
    """
    Analyzes the debate and return structured insights.
    Reuses TurnRequest for history and topic.
    """
    history_str = build_history_string(req.history)
    user_msg = (
        f"Analyze this debate on the topic: '{req.topic}'\n\n"
        f"Debate History:\n{history_str}\n\n"
        f"Provide the analysis in the requested JSON format."
    )

    try:
        raw = await call_ollama("Insight_Analyst", user_msg)
        # Clean potential markdown fences
        json_str = re.sub(r"```json\s*|\s*```", "", raw).strip()
        data = json.loads(json_str)
        
        # Validate structure or fill defaults if missing
        if "agents" not in data: data["agents"] = []
        if "contradictions" not in data: data["contradictions"] = []
        
        return data
    except Exception as e:
        print(f"Analysis error: {e}")
        # Return something that matches schema but with default values
        return {
            "agents": [
                {"name": "Optimist", "strength": 50, "influence": 25},
                {"name": "Analyst", "strength": 50, "influence": 25},
                {"name": "Critic", "strength": 50, "influence": 25},
                {"name": "Judge", "strength": 50, "influence": 25},
            ],
            "contradictions": []
        }


# ── Chat History Endpoints ────────────────────────────────────────────────────

@app.post("/api/chat/sessions", response_model=schemas.ChatSession)
def create_chat_session(
    session_data: schemas.ChatSessionCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    # Create the session
    db_session = models.ChatSession(
        user_id=current_user.id,
        topic=session_data.topic
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    # Add messages
    for msg in session_data.messages:
        db_msg = models.ChatMessage(
            session_id=db_session.id,
            role=msg.role,
            agent_name=msg.agent_name,
            text=msg.text
        )
        db.add(db_msg)
    
    db.commit()
    db.refresh(db_session)
    return db_session


@app.post("/api/chat/sessions/{session_id}/messages", response_model=schemas.ChatMessage)
def add_chat_message(
    session_id: int,
    message: schemas.ChatMessageCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    session = db.query(models.ChatSession).filter(
        models.ChatSession.id == session_id,
        models.ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    db_msg = models.ChatMessage(
        session_id=session_id,
        role=message.role,
        agent_name=message.agent_name,
        text=message.text
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg


@app.get("/api/chat/sessions", response_model=List[schemas.ChatSession])
def get_chat_sessions(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    sessions = db.query(models.ChatSession).filter(
        models.ChatSession.user_id == current_user.id
    ).order_by(models.ChatSession.created_at.desc()).all()
    return sessions


@app.get("/api/chat/sessions/{session_id}", response_model=schemas.ChatSession)
def get_chat_session(
    session_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    session = db.query(models.ChatSession).filter(
        models.ChatSession.id == session_id,
        models.ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    return session


@app.delete("/api/chat/sessions/{session_id}")
def delete_chat_session(
    session_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    session = db.query(models.ChatSession).filter(
        models.ChatSession.id == session_id,
        models.ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    db.delete(session)
    db.commit()
    return {"status": "ok"}


@app.put("/api/chat/sessions/{session_id}", response_model=schemas.ChatSession)
def update_chat_session(
    session_id: int,
    session_update: schemas.ChatSessionUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    session = db.query(models.ChatSession).filter(
        models.ChatSession.id == session_id,
        models.ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    session.topic = session_update.topic
    db.commit()
    db.refresh(session)
    return session


# ── Health ─────────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {"status": "ok", "agents": list(AGENTS.keys()), "model": "qwen2.5:3b", "num_ctx": 2048}
# Minor formatting update