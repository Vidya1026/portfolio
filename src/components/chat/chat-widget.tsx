"use client";

import React, { useEffect, useRef, useState } from "react";

type Msg = { sender: "user" | "assistant"; text: string };

// History (off by default)
const HISTORY_LIMIT = 20;
const STORAGE_KEY = "vidya.chat.history.v1";
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
  const compact = size.w < 420;
  const resizingRef = useRef(false);
  const resizeSideRef = useRef<'right' | 'left'>("right");
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
        // For a left-side handle, horizontal delta inverts
        const effDx = resizeSideRef.current === 'left' ? -dx : dx;
        const newW = clamp(startPosRef.current.w + effDx, MIN_W, MAX_W);
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

  const startResize = (e: React.MouseEvent, side: 'right' | 'left' = 'right') => {
    resizingRef.current = true;
    resizeSideRef.current = side;
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
          title="Open RAG + Gemini 2.0 Assistant"
          type="button"
          className={`relative w-14 h-14 rounded-full bg-violet-600 text-white shadow-[0_0_22px_rgba(139,92,246,0.85)] flex items-center justify-center hover:shadow-[0_0_28px_rgba(139,92,246,1)] transition-shadow overflow-visible hover:animate-wiggle ${attn ? "chat-fab-attn" : ""}`}
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
          className={`flex flex-col rounded-2xl chat-neon overflow-hidden bg-transparent backdrop-blur-xl border border-white/15 animate-in fade-in zoom-in-95 ${loading ? "chat-neon-pulse" : ""}`}
          style={{ width: size.w, height: isMinimized ? 56 : size.h, minWidth: 320, minHeight: 360, boxSizing: 'border-box', paddingBottom: 0, overflow: 'hidden' }}
          role="dialog"
          aria-label="Gemini 2.0 chat"
        >
          {/* Top bar (drag handle) */}
          <div
            className="sticky top-0 z-[120] shrink-0 px-4 py-3 min-h-[56px] bg-gradient-to-r from-violet-600/70 to-cyan-600/70 text-white text-sm font-semibold flex justify-between items-center gap-4 chat-drag select-none border-b border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.35)] backdrop-blur-xl overflow-visible"
            onMouseDown={startDragPanel}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
              <span className="inline-block hand-wave animate-wiggle-slow">🤖</span>
              <span className={`truncate ${compact ? "text-[13px]" : ""}`}>Gemini 2.0 + RAG Assistant</span>
            </div>
            <div
              className={`flex items-center ${compact ? "gap-2" : "gap-4"} cursor-default flex-none whitespace-nowrap pointer-events-auto z-[90] flex-wrap`}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <span className="text-[10px] opacity-80">v3</span>
              {loading && (
                <span className="text-[10px] bg-white/20 px-2 py-[2px] rounded-full">thinking…</span>
              )}
              <button
                type="button"
                tabIndex={0}
                title="Reset size"
                className={`text-white/85 hover:text-white ${compact ? "text-[12px] px-1.5 py-0.5" : "text-[11px] px-2 py-1"} rounded-md hover:bg-white/10`}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setSize({ w: 380, h: 500 }); }}
                aria-label="Reset size"
              >
                {compact ? "↺" : "Reset"}
              </button>
              <button
                type="button"
                tabIndex={0}
                title="Large size"
                className={`text-white/85 hover:text-white ${compact ? "text-[12px] px-1.5 py-0.5" : "text-[11px] px-2 py-1"} rounded-md hover:bg-white/10`}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setSize({ w: 500, h: 640 }); }}
                aria-label="Large size"
              >
                {compact ? "⬛" : "Large"}
              </button>
              <button
                type="button"
                tabIndex={0}
                title="Clear conversation"
                className={`text-white/85 hover:text-white ${compact ? "text-[12px] px-1.5 py-0.5" : "text-[11px] px-2 py-1"} rounded-md hover:bg-white/10`}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); try { localStorage.removeItem(STORAGE_KEY); } catch {} try { sessionStorage.removeItem("bot.greeted"); } catch {} setMessages([]); }}
                aria-label="Clear chat"
              >
                {compact ? "✖" : "Clear"}
              </button>
              <button
                type="button"
                className={`text-white/85 hover:text-white ${compact ? "text-base" : "text-lg"} leading-none w-6 text-center`}
                onClick={(e) => { e.stopPropagation(); setIsMinimized((v) => !v); }}
                aria-label="Minimize"
                title="Minimize"
              >
                {isMinimized ? "▢" : "–"}
              </button>
              <button
                type="button"
                className={`text-white/85 hover:text-white ${compact ? "text-base" : "text-lg"} leading-none w-6 text-center`}
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                aria-label="Close chat"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Thinking shimmer bar */}
          {loading && !isMinimized && (
            <div className="h-[2px] w-full overflow-hidden">
              <div className="h-full w-[160%] -ml-[30%] bg-gradient-to-r from-transparent via-white/80 to-transparent animate-[shimmer_1.2s_linear_infinite]" />
            </div>
          )}

          {/* Messages */}
          {!isMinimized && (
            <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pt-2 pb-28 px-3 z-[10]">
              <div className="max-w-[80%] px-3 py-2 rounded-2xl text-sm bg-violet-500/20 text-white rounded-bl-md shadow-[0_0_6px_rgba(139,92,246,0.6)]">
                👋 I’m Vidya’s Portfolio Assistant — powered by <span className="font-semibold">RAG + Gemini&nbsp;2.0</span> (Supabase). Ask anything about Vidya — <span className="font-medium">projects</span>, <span className="font-medium">experience</span>, <span className="font-medium">skills</span>, <span className="font-medium">publications</span>, <span className="font-medium">certifications</span>, or <span className="font-medium">education</span>.
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
              {/* Lightweight skeleton bubble for perceived responsiveness */}
              {loading && (
                <div className="max-w-[60%] h-8 rounded-xl bg-white/10 overflow-hidden relative">
                  <div className="absolute inset-0 -translate-x-1/2 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.4s_linear_infinite]" />
                </div>
              )}

              <div ref={endRef} />
            </div>
          )}

          {/* Input */}
          {!isMinimized && (
            <div className="p-4 pt-3 pb-6 pr-4 border-t border-white/10 bg-black/25 backdrop-blur-xl chat-input-wrap z-[50]">
              <div className="flex items-end gap-3">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Type a message…"
                  disabled={loading}
                  className="flex-1 resize-none chat-input rounded-xl bg-white/10 text-white placeholder-white/60 px-4 py-[14px] leading-6 h-12 min-h-[48px] max-h-40"
                  style={{ scrollbarWidth: 'thin' }}
                  aria-label="Type a message"
                />
                <div className="relative group">
                  {/* soft outer glow on hover */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-[3px] rounded-2xl bg-gradient-to-r from-violet-500/50 via-violet-400/40 to-violet-300/50 blur-md opacity-0 group-hover:opacity-90 transition-opacity duration-300"
                  />
                  <button
                    onClick={send}
                    disabled={loading || !input.trim() }
                    type="button"
                    aria-label="Send message"
                    className="relative h-11 px-7 rounded-2xl text-white font-medium
                                 bg-gradient-to-r from-violet-700 via-violet-600 to-violet-500
                                 border border-white/20 backdrop-blur-md
                                 shadow-[0_8px_24px_rgba(124,58,237,0.35)]
                                 hover:shadow-[0_10px_28px_rgba(139,92,246,0.55)]
                                 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:saturate-[.6]
                                 overflow-hidden"
                  >
                    {/* glossy top highlight */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent"
                    />
                    {/* animated sheen on hover */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2
                                 bg-gradient-to-r from-transparent via-white/60 to-transparent
                                 skew-x-[-20deg] opacity-0 group-hover:opacity-100
                                 animate-[shimmer_1.6s_ease-in-out_infinite]"
                    />
                    <span className="relative z-10">Send</span>
                  </button>
                </div>
              </div>
              <div className="mt-2 text-[10px] text-white/60 text-center">Powered by Gemini 2.0 + RAG</div>
            </div>
          )}

          {/* Resize handle (bottom-left of chat) */}
          {!isMinimized && (
            <div
              className="absolute bottom-3 left-3 w-3.5 h-3.5 cursor-nesw-resize rounded bg-white/30 hover:bg-white/60 z-[90]"
              onMouseDown={(e) => startResize(e, 'left')}
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