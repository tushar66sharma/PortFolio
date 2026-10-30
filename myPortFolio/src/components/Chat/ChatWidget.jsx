import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import { CHAT_SAMPLES } from "../../site";
import { useChat } from "./useChat";

const MAX_LENGTH = 300;
const MUTED_KINDS = new Set(["refused", "busy", "limited", "no_info"]);
const PHONE = "(max-width: 639px)";

const Bubble = ({ message }) => {
  const mine = message.role === "user";
  const tone = mine
    ? "rounded-br-sm bg-line text-paper"
    : `rounded-bl-sm border border-line/40 bg-panel ${MUTED_KINDS.has(message.kind) ? "text-muted" : "text-ink"}`;
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <p className={`min-w-0 max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-[13px] leading-relaxed wrap-anywhere ${tone}`}>
        {message.text}
      </p>
    </div>
  );
};

Bubble.propTypes = {
  message: PropTypes.shape({ role: PropTypes.string.isRequired, text: PropTypes.string.isRequired, kind: PropTypes.string }).isRequired,
};

const Typing = () => (
  <div className="flex justify-start" aria-label="Assistant is typing">
    <p className="flex gap-1 rounded-xl rounded-bl-sm border border-line/40 bg-panel px-3 py-3">
      {[0, 150, 300].map((delay) => (
        <span key={delay} style={{ animationDelay: `${delay}ms` }} className="size-1.5 rounded-full bg-muted motion-safe:animate-pulse" />
      ))}
    </p>
  </div>
);

// Round launcher fixed to the bottom-right; the panel opens above it (full screen on phones).
export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const [draft, setDraft] = useState("");
  const { messages, pending, send } = useChat();
  const launcherRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const wasOpen = useRef(false);
  const asked = messages.some((m) => m.role === "user");

  // Focus the input while open; hand focus back to the launcher once the panel has closed.
  useEffect(() => {
    if (open && !pending) inputRef.current?.focus();
    if (!open && wasOpen.current) launcherRef.current?.focus();
    wasOpen.current = open;
  }, [open, pending]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, pending, open]);

  // Escape closes; on phones (full screen) Tab stays inside the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.key !== "Tab" || !window.matchMedia(PHONE).matches) return;
      const items = panelRef.current.querySelectorAll("button:not([disabled]), input:not([disabled])");
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = () => {
    setSeen(true);
    setOpen((o) => !o);
  };

  const submit = (text) => {
    if (pending || !text.trim()) return;
    send(text);
    setDraft("");
  };

  return (
    <>
      {open && (
        <div
          id="chat-panel"
          ref={panelRef}
          role="dialog"
          aria-label="Chat about Tushar"
          className="fixed inset-0 z-[55] flex flex-col bg-paper pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] sm:inset-auto sm:bottom-[calc(max(16px,env(safe-area-inset-bottom))+72px)] sm:right-[max(16px,env(safe-area-inset-right))] sm:h-[min(560px,calc(100dvh-120px))] sm:w-[360px] sm:overflow-hidden sm:rounded-[10px] sm:border-[1.5px] sm:border-line sm:p-0 sm:shadow-[0_10px_30px_rgb(15_43_85/0.25)]"
        >
          <div className="flex items-center gap-3 border-b border-line bg-panel px-4 py-3">
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-line text-xs font-semibold text-paper">
              TS
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-bold uppercase leading-tight tracking-[0.04em]">Ask about Tushar</p>
              <p className="text-[10.5px] uppercase tracking-[0.14em] text-muted">answers about Tushar only</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-line transition-colors hover:text-accent"
            >
              <FiX aria-hidden="true" className="size-5" />
            </button>
          </div>

          <div ref={logRef} role="log" aria-live="polite" className="js-chat-log flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4">
            {messages.map((m) => (
              <Bubble key={m.id} message={m} />
            ))}
            {!asked && (
              <div className="flex flex-wrap gap-2">
                {CHAT_SAMPLES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => submit(q)}
                    className="js-chat-sample cursor-pointer rounded-full border border-line bg-panel px-3 py-1.5 text-left text-xs transition-colors hover:border-accent hover:text-accent"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {pending && <Typing />}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(draft);
            }}
            className="border-t border-line bg-panel"
          >
            <div className="flex items-center gap-2 p-3">
              <label htmlFor="chat-input" className="sr-only">
                Your question
              </label>
              <input
                id="chat-input"
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={MAX_LENGTH}
                disabled={pending}
                autoComplete="off"
                placeholder="Type your question…"
                className="min-w-0 flex-1 rounded-full border border-line bg-paper px-4 py-2.5 text-[13px] text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={pending || !draft.trim()}
                aria-label="Send"
                className="js-chat-send grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-line text-paper transition-opacity disabled:cursor-default disabled:opacity-50"
              >
                <FiSend aria-hidden="true" className="size-4" />
              </button>
            </div>
            {draft.length > 250 && (
              <p className="px-4 pb-2 text-right text-[11px] tabular-nums text-muted">
                {draft.length}/{MAX_LENGTH}
              </p>
            )}
          </form>
        </div>
      )}

      <button
        ref={launcherRef}
        type="button"
        onClick={toggle}
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        aria-controls="chat-panel"
        className={`js-chat-launcher fixed bottom-[max(16px,env(safe-area-inset-bottom))] right-[max(16px,env(safe-area-inset-right))] z-[55] grid size-14 cursor-pointer place-items-center rounded-full bg-line text-paper shadow-[0_6px_18px_rgb(15_43_85/0.3)] transition-transform hover:scale-105 ${open ? "max-sm:hidden" : ""}`}
      >
        {!seen && <span aria-hidden="true" className="js-chat-dot absolute right-0.5 top-0.5 size-3 rounded-full border-2 border-paper bg-accent" />}
        {open ? <FiX aria-hidden="true" className="size-6" /> : <FiMessageCircle aria-hidden="true" className="size-6" />}
      </button>
    </>
  );
};
