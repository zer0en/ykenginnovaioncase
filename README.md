# ⚡ AI Arena

> **Test and compare AI models — side by side, in your browser.**

AI Arena is a fully static web application that lets you send the same prompt to multiple AI providers and compare their responses in real time. No backend, no signups, no data collection — your API keys stay in your browser only.

**Live demo:** `https://<your-username>.github.io/ai-arena/`

---

## Features

| Feature | Details |
|---|---|
| **Multi-provider** | OpenAI (GPT-4o, GPT-3.5), Google Gemini (2.0 Flash, 1.5 Pro), Hugging Face open-source models |
| **Side-by-side comparison** | Compare two models simultaneously with one click |
| **Response timing** | See exactly how long each model takes to respond |
| **Token count** | Shows total tokens used (where the API supports it) |
| **Private** | API keys stored only in `localStorage` — never sent to any server other than the AI provider |
| **Zero dependencies** | Pure HTML, CSS, and JavaScript — no build step, no frameworks |
| **Keyboard shortcut** | `Ctrl+Enter` / `Cmd+Enter` to send a prompt |

---

## Supported Models

### OpenAI
- GPT-4o
- GPT-4o mini
- GPT-4 Turbo
- GPT-3.5 Turbo

### Google Gemini *(free API tier available)*
- Gemini 2.0 Flash
- Gemini 1.5 Flash
- Gemini 1.5 Pro
- Gemini 1.5 Flash-8B

### Hugging Face *(open-source)*
- Mistral 7B Instruct
- Zephyr 7B Beta
- DialoGPT Large
- Falcon 7B Instruct
- Flan-T5 Large

---

## Getting Started

### 1. Get an API key

| Provider | How to get a key | Free tier? |
|---|---|---|
| Google Gemini | [aistudio.google.com](https://aistudio.google.com) | ✅ Yes |
| OpenAI | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | Limited |
| Hugging Face | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) | ✅ Yes |

### 2. Open the site and paste your key

1. Select a provider from the dropdown in panel A
2. Paste your API key and click **Save** — it's stored locally in your browser
3. Type a prompt and hit **Send ▶** (or `Ctrl+Enter`)

### 3. Compare two models

Click **+ Compare** to open panel B. Choose a different provider/model, then send — both panels respond simultaneously.

---

## Running Locally

No build step needed. Just open `index.html` in any browser:

```bash
# Clone the repo
git clone https://github.com/<your-username>/ai-arena.git
cd ai-arena

# Option A: open directly
start index.html        # Windows
open index.html         # macOS

# Option B: serve with Python (avoids any CORS issues with file://)
python -m http.server 8080
# then open http://localhost:8080
```

---

## Deploying to GitHub Pages

This repo is configured to deploy automatically via GitHub Actions.

1. Fork or push this repo to GitHub
2. Go to **Settings → Pages** and set source to **GitHub Actions**
3. Push to `main` — the workflow in `.github/workflows/deploy.yml` will deploy automatically

Your site will be live at `https://<your-username>.github.io/ai-arena/`.

---

## Project Structure

```
ai-arena/
├── index.html              # App structure
├── style.css               # Dark theme, responsive layout
├── app.js                  # All logic: API calls, rendering, state
├── README.md
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Pages auto-deploy
```

---

## Security & Privacy

- **Keys never leave your device** — all API calls are made directly from your browser to the AI provider's endpoint (e.g. `api.openai.com`)
- Keys are stored in `localStorage` under keys like `aiarena_key_openai` — clear them at any time in your browser's DevTools
- No analytics, no tracking, no cookies

---

## License

MIT — free to use, modify, and distribute.
