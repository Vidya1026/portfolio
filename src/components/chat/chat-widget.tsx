"use client";

import React, { useEffect, useRef, useState } from "react";

type Msg = { sender: "user" | "assistant"; text: string };

// History (off by default)
const HISTORY_LIMIT = 20;
const STORAGE_KEY = "bhargava.chat.history.v1";
const PERSIST_HISTORY = false; // flip to true if you want last 20 msgs to persist

// Size + bounds
const MIN_W = 320, MAX_W = 640;
const MIN_H = 360, MAX_H = 720;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  // debug: prove this component file is live
  useEffect(() => {
    console.log("ChatWidget v3 live");
  }, []);

  // attention wiggle for the FAB on first render
  const [attn, setAttn] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setAttn(false), 6000); // wiggle & ping for 6s
    return () => clearTimeout(t);
  }, []);

  // size + resizing
  const [size, setSize] = useState({ w: 360, h: 480 });
  const resizingRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  // dragging (panel)
  const [drag, setDrag] = useState({ x: 0, y: 0 }); // translate offsets from bottom-right anchor
  const draggingPanelRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);

  // Load chat history on mount (local only)
  useEffect(() => {
    if (!PERSIST_HISTORY) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Msg[];
        if (Array.isArray(parsed)) setMessages(parsed.slice(-HISTORY_LIMIT));
      }
    } catch {}
  }, []);

  // Save latest messages (cap to HISTORY_LIMIT)
  useEffect(() => {
    if (!PERSIST_HISTORY) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-HISTORY_LIMIT)));
    } catch {}
  }, [messages]);

  // Greet once per session: show climb animation, then mark greeted
  useEffect(() => {
    if (!PERSIST_HISTORY) {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
    const greeted = sessionStorage.getItem("bot.greeted");
    if (greeted) { setHasGreeted(true); return; }
    setHasGreeted(false);
    const t = setTimeout(() => {
      setHasGreeted(true);
      try { sessionStorage.setItem("bot.greeted", "1"); } catch {}
    }, 3200);
    return () => clearTimeout(t);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // --- Resize handlers ---
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      // resize
      if (resizingRef.current && startPosRef.current) {
        const dx = e.clientX - startPosRef.current.x;
        const dy = e.clientY - startPosRef.current.y;
        const newW = clamp(startPosRef.current.w + dx, MIN_W, MAX_W);
        const newH = clamp(startPosRef.current.h + dy, MIN_H, MAX_H);
        setSize({ w: newW, h: newH });
      }
      // drag
      if (draggingPanelRef.current && dragStartRef.current) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setDrag({ x: dragStartRef.current.ox + dx, y: dragStartRef.current.oy + dy });
      }
    };
    const onUp = () => {
      if (resizingRef.current) {
        resizingRef.current = false;
        startPosRef.current = null;
        document.body.style.userSelect = "";
      }
      if (draggingPanelRef.current) {
        draggingPanelRef.current = false;
        dragStartRef.current = null;
        document.body.style.userSelect = "";
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const startResize = (e: React.MouseEvent) => {
    resizingRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h };
    document.body.style.userSelect = "none";
  };

  const startDragPanel = (e: React.MouseEvent) => {
    // avoid starting drag when clicking buttons/links inside the header
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    draggingPanelRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY, ox: drag.x, oy: drag.y };
    document.body.style.userSelect = "none";
  };

  // --- Chat send ---
  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setMessages((m) => [...m, { sender: "user", text: msg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      const text = data.response || data.error || "Sorry, I couldn’t answer that.";
      setMessages((m) => [...m, { sender: "assistant", text }]);
    } catch {
      setMessages((m) => [
        ...m,
        { sender: "assistant", text: "⚠️ Something went wrong. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] select-none" style={{ transform: `translate(${drag.x}px, ${drag.y}px)` }}>
      {/* Collapsed Floating Button */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setHasGreeted(true); }}
          aria-label="Open chat"
          title="Open Gemini 2.0 Assistant"
          type="button"
          className={`relative w-14 h-14 rounded-full bg-violet-600 text-white shadow-[0_0_22px_rgba(139,92,246,0.85)] flex items-center justify-center hover:shadow-[0_0_28px_rgba(139,92,246,1)] transition-shadow overflow-visible ${attn ? "chat-fab-attn" : ""}`}
        >
          {/* Robot head */}
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden>
            <path d="M12 2a2 2 0 0 1 2 2v1.05A7.002 7.002 0 0 1 19 12v3a3 3 0 0 1-3 3h-1.18l-1.6 2.13a1 1 0 0 1-1.64 0L10 18H9a3 3 0 0 1-3-3v-3a7.002 7.002 0 0 1 5-6.95V4a2 2 0 0 1 2-2ZM9 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
          </svg>
          {/* soft ping ring */}
          {attn && <span className="fab-ping absolute inset-0 -z-10 rounded-full" aria-hidden></span>}

          {!hasGreeted && (
            <>
              {/* rope drops in first */}
              <div className="bot-rope" aria-hidden />
              {/* bot climbs in, bobs, and waves */}
              <div className="bot-climb" aria-hidden>
                <svg className="bot-body" width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <rect x="10" y="18" width="44" height="30" rx="8" fill="#fff" />
                  <circle cx="28" cy="33" r="4" fill="#111" />
                  <circle cx="40" cy="33" r="4" fill="#111" />
                  <rect x="14" y="48" width="36" height="4" rx="2" fill="#e5e7eb" />
                  <rect x="31" y="8" width="2" height="8" rx="1" fill="#a855f7" />
                  <circle cx="32" cy="6" r="3" fill="#06b6d4" />
                  {/* waving arm */}
                  <g className="bot-arm" style={{ transformOrigin: '12px 28px' }}>
                    <rect x="6" y="26" width="10" height="4" rx="2" fill="#fff" />
                  </g>
                  {/* right arm (static) */}
                  <rect x="48" y="26" width="10" height="4" rx="2" fill="#fff" />
                </svg>
              </div>
              {/* speech bubble pops/fades */}
              <div className="bot-say" role="status" aria-live="polite">Hello!</div>
            </>
          )}
        </button>
      )}

      {/* Expanded Chat */}
      {isOpen && (
        <div
          data-version="v3"
          className="flex flex-col rounded-2xl chat-neon overflow-hidden bg-background/70 backdrop-blur-xl border border-white/10 animate-in fade-in zoom-in-95"
          style={{ width: size.w, height: isMinimized ? 56 : size.h, minWidth: 320, minHeight: 340, boxSizing: 'border-box', paddingBottom: 0, overflow: 'hidden' }}
          role="dialog"
          aria-label="Gemini 2.0 chat"
        >
          {/* Top bar (drag handle) */}
          <div
            className="sticky top-0 z-50 shrink-0 px-4 py-3 bg-gradient-to-r from-violet-600/70 to-cyan-600/70 text-white text-sm font-semibold flex justify-between items-center gap-2 chat-drag select-none border-b border-white/10"
            onMouseDown={startDragPanel}
          >
            <div className="flex items-center gap-2">
              <span className="inline-block hand-wave animate-wiggle-slow">🤖</span>
              <span>Gemini 2.0 Assistant</span>
              <span className="ml-2 text-[10px] opacity-80">v3</span>
              {loading && (
                <span className="ml-2 text-[10px] bg-white/20 px-2 py-[2px] rounded-full">thinking…</span>
              )}
            </div>
            <div
              className="flex items-center gap-2 cursor-default flex-nowrap justify-end max-w-[70%] whitespace-nowrap overflow-x-auto no-scrollbar pointer-events-auto"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Size presets */}
              <button
                type="button"
                className="text-white/85 hover:text-white text-[11px] px-2 py-1 rounded-md hover:bg-white/10 whitespace-nowrap"
                onClick={(e) => { e.stopPropagation(); setSize({ w: 380, h: 500 }); }}
                aria-label="Reset size"
              >
                Reset
              </button>
              <button
                type="button"
                className="text-white/85 hover:text-white text-[11px] px-2 py-1 rounded-md hover:bg-white/10 whitespace-nowrap"
                onClick={(e) => { e.stopPropagation(); setSize({ w: 500, h: 640 }); }}
                aria-label="Large size"
              >
                Large
              </button>
              <button
                type="button"
                className="text-white/85 hover:text-white text-[11px] px-2 py-1 rounded-md hover:bg-white/10 whitespace-nowrap"
                onClick={(e) => { e.stopPropagation(); try { localStorage.removeItem(STORAGE_KEY); } catch {} try { sessionStorage.removeItem("bot.greeted"); } catch {} setMessages([]); }}
                aria-label="Clear chat"
              >
                Clear
              </button>
              <button
                type="button"
                className="text-white/85 hover:text-white text-lg leading-none"
                onClick={(e) => { e.stopPropagation(); setIsMinimized((v) => !v); }}
                aria-label="Minimize"
                title="Minimize"
              >
                {isMinimized ? "▢" : "–"}
              </button>
              <button
                type="button"
                className="text-white/85 hover:text-white text-lg leading-none"
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Thinking shimmer bar */}
          {loading && !isMinimized && (
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-white/70 to-transparent animate-pulse" />
          )}

          {/* Messages */}
          {!isMinimized && (
            <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pt-2 pb-20 px-3 z-0">
              <div className="max-w-[80%] px-3 py-2 rounded-2xl text-sm bg-violet-500/20 text-white rounded-bl-md shadow-[0_0_6px_rgba(139,92,246,0.6)]">
                👋 I’m Bhargava’s Portfolio Assistant. Ask about projects, experience, or certifications.
              </div>

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    m.sender === "assistant"
                      ? "bg-violet-500/20 text-white rounded-bl-md shadow-[0_0_6px_rgba(139,92,246,0.5)]"
                      : "bg-white/85 text-black ml-auto rounded-br-md shadow"
                  }`}
                >
                  {m.text}
                </div>
              ))}

              {/* Typing indicator for assistant */}
              {loading && (
                <div className="max-w-[80%] px-3 py-2 rounded-2xl text-sm bg-violet-500/20 text-white rounded-bl-md shadow-[0_0_6px_rgba(139,92,246,0.5)] flex gap-1 items-center">
                  <span className="sr-only">Assistant is typing</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce [animation-delay:0ms]"></span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce [animation-delay:120ms]"></span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce [animation-delay:240ms]"></span>
                </div>
              )}

              <div ref={endRef} />
            </div>
          )}

          {/* Input */}
          {!isMinimized && (
            <div className="p-4 pt-3 pb-7 pr-7 border-t border-white/10 bg-background/60 relative chat-input-wrap z-10">
              <div className="relative">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Type a message…"
                  disabled={loading}
                  className="w-full resize-none chat-input rounded-xl bg-white/10 text-white placeholder-white/60 px-3 py-3 pr-36 leading-6 min-h-[48px] max-h-40"
                  style={{ scrollbarWidth: 'thin' }}
                  aria-label="Type a message"
                />
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="absolute right-4 bottom-4 px-5 h-11 rounded-xl bg-violet-600 text-white disabled:opacity-50 hover:shadow-[0_0_20px_rgba(139,92,246,0.8)] transition-shadow"
                  type="button"
                  aria-label="Send message"
                >
                  Send
                </button>
              </div>
              <div className="mt-1 text-[10px] text-white/60 text-center">Powered by Gemini 2.0</div>
              {/* spacer so the resize handle never overlaps the input */}
              <div className="h-3" />
            </div>
          )}

          {/* Resize handle (bottom-right of the panel) */}
          {!isMinimized && (
            <div
              className="absolute bottom-3 left-3 w-3.5 h-3.5 cursor-nesw-resize rounded bg-white/25 hover:bg-white/35 z-30"
              onMouseDown={startResize}
              title="Drag to resize"
              aria-hidden
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;