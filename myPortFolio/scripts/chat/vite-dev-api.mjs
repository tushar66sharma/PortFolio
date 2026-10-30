// Dev-only Vite plugin: serves /api/chat from `npm run dev` with the same code
// Vercel runs, reading GROQ_* settings from .env.local (never committed).
import { loadEnv } from "vite";

async function readAll(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export function chatDevApi() {
  return {
    name: "chat-dev-api",
    apply: "serve",
    configureServer(server) {
      for (const [key, value] of Object.entries(loadEnv(server.config.mode, server.config.root, "GROQ_"))) {
        process.env[key] ??= value;
      }

      server.middlewares.use("/api/chat", async (req, res) => {
        const { GET, POST } = await server.ssrLoadModule("/api/chat.js");
        const headers = new Headers();
        for (const [name, value] of Object.entries(req.headers)) {
          if (typeof value === "string") headers.set(name, value);
        }
        const url = `http://${req.headers.host}${req.originalUrl}`;
        const response =
          req.method === "POST" ? await POST(new Request(url, { method: "POST", headers, body: await readAll(req) })) : GET();

        res.statusCode = response.status;
        response.headers.forEach((value, name) => res.setHeader(name, value));
        res.end(await response.text());
      });
    },
  };
}
