"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuid } from "crypto";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function generateSessionId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const CHIPS = [
  "Qui es-tu ? 👀",
  "Qui t'a créé ?",
  "What can you do?",
  "Raconte-moi une blague 😄",
  "C'est quoi HEI Madagascar ?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId] = useState(() => generateSessionId());
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (override?: string) => {
    const content = (override || input).trim();
    if (!content || loading) return;

    setError("");
    const userMsg: Message = { role: "user", content };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "22px";
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, sessionId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");

      setMessages([...updated, { role: "assistant", content: data.reply }]);
    } catch (e: any) {
      setError(e.message || "Erreur réseau");
      setMessages(updated);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "22px";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  return (
    <div className="chat-root">
      {/* TOPBAR */}
      <header className="topbar">
        <div className="topbar-avatar">H</div>
        <div className="topbar-info">
          <span className="topbar-name">Harris Bot</span>
          <span className="topbar-status">
            <span className="status-dot" /> En ligne
          </span>
        </div>
        <span className="topbar-badge">Llama 3.3 · Free</span>
      </header>

      {/* MESSAGES */}
      <main className="messages">
        {messages.length === 0 && (
          <div className="welcome">
            <div className="welcome-avatar">H</div>
            <p className="welcome-title">Salut ! Je suis Harris Bot 👋</p>
            <p className="welcome-desc">
              Sympa, décontracté, et là pour t'aider. Pose-moi n'importe quelle question !
            </p>
            <div className="chips">
              {CHIPS.map((c) => (
                <button key={c} className="chip" onClick={() => sendMessage(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`msg-row ${msg.role}`}>
            <div className={`avatar ${msg.role}`}>
              {msg.role === "user" ? "Toi" : "H"}
            </div>
            <div className={`bubble ${msg.role}`}>{msg.content}</div>
          </div>
        ))}

        {loading && (
          <div className="msg-row assistant">
            <div className="avatar assistant">H</div>
            <div className="bubble assistant">
              <div className="typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        {error && <div className="error-msg">⚠ {error}</div>}
        <div ref={bottomRef} />
      </main>

      {/* INPUT */}
      <footer className="input-bar">
        <div className="input-row">
          <textarea
            ref={textareaRef}
            className="textarea"
            placeholder="Écris ton message..."
            value={input}
            onChange={handleTextarea}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p className="footer-note">
          Harris Bot · by <span>Zarcia MAEVASON</span> · HEI Madagascar 🇲🇬
        </p>
      </footer>
    </div>
  );
}
