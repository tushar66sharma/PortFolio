import { useCallback, useRef, useState } from "react";

const GREETING = "Hi! Ask me anything about Tushar's experience, projects, skills or education.";
const BUSY = "The assistant is busy right now. Please try again in a minute.";
const MAX_HISTORY = 3;
// Only questions the bot actually answered become context for follow-ups.
const CONTEXT_KINDS = new Set(["answer", "no_info"]);

export function useChat({ endpoint = "/api/chat", timeoutMs = 20000 } = {}) {
  const [messages, setMessages] = useState([{ id: 0, role: "bot", text: GREETING, kind: "greeting" }]);
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false); // guards double sends before the state update lands
  const nextId = useRef(1);
  const context = useRef([]);

  const add = (message) => setMessages((list) => [...list, { id: nextId.current++, ...message }]);

  const send = useCallback(
    async (raw) => {
      const text = raw.trim();
      if (!text || pendingRef.current) return;
      pendingRef.current = true;
      setPending(true);
      add({ role: "user", text, kind: "question" });

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let reply = { text: BUSY, kind: "busy" };
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: text, history: context.current.slice(-MAX_HISTORY) }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (typeof data?.reply === "string" && data.reply) reply = { text: data.reply, kind: data.kind ?? "answer" };
      } catch {
        /* network error, timeout or bad JSON: keep the busy reply */
      } finally {
        clearTimeout(timer);
      }

      if (CONTEXT_KINDS.has(reply.kind)) context.current = [...context.current, text].slice(-MAX_HISTORY);
      add({ role: "bot", ...reply });
      pendingRef.current = false;
      setPending(false);
    },
    [endpoint, timeoutMs]
  );

  return { messages, pending, send };
}
