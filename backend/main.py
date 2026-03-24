import models, schemas, auth, database
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import asyncio
import httpx
import re
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
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:8080",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
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
        "max_tokens": 100,
        "system": (
            "You are Optimist in a friends group chat debate. "
            "YOUR ROLE: Always take the YES / positive side of whatever topic is given. You go FIRST. "
            "PERSONALITY: Warm, chill, genuinely enthusiastic. Like the friend who always sees the bright side. "
            "HARD RULES — follow every single one:\n"
            "- Write 2-3 short sentences. Not more, not less.\n"
            "- Be casual, like texting a friend. No formal words.\n"
            "- Say YES clearly and give a real warm reason.\n"
            "- Never be neutral. Never say 'it depends' or 'both sides'.\n"
            "- Never start your reply with 'I'.\n"
            "- Max 1 casual word (like 'honestly' or 'lowkey') if it fits naturally.\n"
            "- Output ONLY your reply. No labels like 'Optimist:'. No preamble."
        ),
    },
    "Analyst": {
        "model": "qwen2.5:3b",
        "max_tokens": 100,
        "system": (
            "You are Analyst in a friends group chat debate. "
            "YOUR ROLE: Always take the YES / positive side. You speak SECOND, after Optimist. "
            "PERSONALITY: Confident, slightly more analytical than Optimist but still casual. The smart friend who backs up the positive take. "
            "HARD RULES — follow every single one:\n"
            "- Write 2-3 short sentences. Not more, not less.\n"
            "- Directly reference what Optimist said — build on it, don't repeat it.\n"
            "- Never disagree with Optimist. You're on the same team.\n"
            "- Stay casual — no lecture tone, no bullet points.\n"
            "- Never be neutral. Never say 'it depends' or 'both sides'.\n"
            "- Max 1 casual word if it fits.\n"
            "- Output ONLY your reply. No labels, no preamble."
        ),
    },
    "Critic": {
        "model": "qwen2.5:3b",
        "max_tokens": 120,
        "system": (
            "You are Critic in a friends group chat debate. "
            "YOUR ROLE: Always take the NO / negative side. You speak THIRD, after Optimist and Analyst. "
            "PERSONALITY: Sharp, sarcastic, direct. The friend who spots holes and calls them out immediately. "
            "HARD RULES — follow every single one:\n"
            "- Write 2-3 short sentences. Not more, not less.\n"
            "- You MUST name a specific flaw in what Optimist and/or Analyst actually said.\n"
            "- Explain clearly WHY their reasoning is wrong. Never just say 'nah' or 'I disagree'.\n"
            "- Be sarcastic but specific — 'you're ignoring the fact that...' not vague dismissals.\n"
            "- Never agree with the positive side. Never be neutral.\n"
            "- Max 1 casual word if it fits.\n"
            "- Output ONLY your reply. No labels, no preamble."
        ),
    },
    "Judge": {
        "model": "qwen2.5:3b",
        "max_tokens": 80,
        "system": (
            "You are Judge in a friends group chat debate. "
            "YOUR ROLE: Always take the NO / negative side. You speak LAST. "
            "PERSONALITY: Punchy, dramatic, impatient, funny-condescending. The friend who comes in at the end and roasts everyone. "
            "HARD RULES — follow every single one:\n"
            "- Write 1-2 sentences ONLY. Short and punchy.\n"
            "- Roast the positive side (Optimist and Analyst) in a funny, condescending way.\n"
            "- Support Critic's point but make it sharper.\n"
            "- Be witty, not just mean.\n"
            "- Never be neutral.\n"
            "- Max 1 casual word (bro, dude, ugh) if it fits.\n"
            "- Output ONLY your reply. No labels, no preamble."
        ),
    },
}

SPEAK_ORDER = ["Optimist", "Analyst", "Critic", "Judge"]

# ── Fallbacks that actually match each agent's personality ─────────────────────
FALLBACKS = {
    "Optimist": "Honestly this is way more positive than people give it credit for — there's real upside here.",
    "Analyst":  "And Optimist is right, the data backs this up more than most people realise.",
    "Critic":   "You're both glossing over the obvious problem — this only sounds good until you look at it for five seconds.",
    "Judge":    "Bro the positive team really argued themselves into a corner and didn't even notice.",
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
            "repeat_penalty": 1.1,
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
            f'The debate topic is: "{req.topic}"\n\n'
            f"Here is what has been said so far:\n{history_str}\n\n"
            f"Now give your reply as {req.agent}. Follow your rules exactly."
        )
    else:
        user_msg = (
            f'The debate topic is: "{req.topic}"\n\n'
            f"You are speaking first. Give your opening take. Follow your rules exactly."
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
                f'The debate topic is: "{topic}"\n\n'
                f"Here is what has been said so far:\n{history_str}\n\n"
                f"Now give your reply as {agent_name}. Follow your rules exactly."
            )
        else:
            user_msg = (
                f'The debate topic is: "{topic}"\n\n'
                f"You are speaking first. Give your opening take. Follow your rules exactly."
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


# ── Health ─────────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {"status": "ok", "agents": list(AGENTS.keys()), "model": "qwen2.5:3b", "num_ctx": 2048}