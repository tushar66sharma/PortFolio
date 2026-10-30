# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Chatbot

The round button at the bottom-right of the site opens a chat that answers questions about Tushar, using only the portfolio's own data. Anything that isn't about Tushar, even half of a question, gets one fixed reply. The answers come from [Groq](https://groq.com)'s free API through the Vercel function in `api/chat.js`. The API key stays on the server and is never committed.

### 1. Get a free Groq key

1. Sign in at [console.groq.com](https://console.groq.com) with Google or GitHub. No card is needed.
2. Open **API Keys** and click **Create API Key**.
3. Copy the key (it starts with `gsk_`). Groq shows it only once.

### 2. Add it to Vercel

1. In the Vercel dashboard, open the project, then **Settings → Environment Variables**.
2. Add `GROQ_API_KEY` with the key as its value, and tick **Production** and **Preview**.
3. Save, then redeploy (**Deployments → ⋯ → Redeploy**). Settings only reach deployments built after they were added.

Also check **Settings → Build & Deployment**: the framework preset should be Vite, with no build or output overrides that conflict with `vercel.json`.

Optional settings, also in Vercel's environment variables:

| Name | Default | Use |
|---|---|---|
| `GROQ_MODEL` | `openai/gpt-oss-20b` | Switch models if Groq retires the default |
| `GROQ_GUARD_MODEL` | `meta-llama/llama-prompt-guard-2-86m` | Set to `off` to skip the prompt-injection check |

Never give any of these names a `VITE_` prefix: Vite copies `VITE_` variables into the public JavaScript.

### 3. Run it locally

Create `myPortFolio/.env.local` (it is git-ignored) containing:

```
GROQ_API_KEY=gsk_your_key_here
```

Then run `npm run dev`; the dev server serves `/api/chat` too. Without a key, the chat replies that it is busy.

### Keeping the bot up to date

The bot answers from `api/_lib/knowledge.js`, a file generated from `src/constants.js`. After editing `constants.js`:

1. Run `npm run build` (or `npm run knowledge`), which regenerates the file.
2. Commit `constants.js` and `api/_lib/knowledge.js` together, then push.

`npm test` fails if `knowledge.js` is out of date.

### Checks

| Command | What it checks |
|---|---|
| `npm test` | Filters, rate limit, pipeline, function and knowledge (no key needed) |
| `npm run chat:eval` | Sends about 40 real questions through Groq, including on-topic, off-topic, half-and-half and injection attempts, and checks each reply type (needs the key in `.env.local`; takes about 2 minutes) |
| `node scripts/audit/secret-check.mjs` | After a build, confirms the site contains no key or Groq endpoint |
