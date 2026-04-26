# AI Arena — Innovation Case
### Programming 4 Money | Programming Specialist Division
**By:** zer0en · April 2026

---

## The Invention: AI Arena

I propose building **AI Arena** — a browser-based platform that lets anyone test and compare AI language models side by side, in real time, without installing anything.

The core problem it solves: there are now dozens of competing AI models (GPT-4o, Gemini, Mistral, and more), but no easy way for a regular person — or a business — to evaluate which model is actually best for their specific use case. AI Arena makes that comparison instant and visual.

**The live MVP is already built and deployed:**
🔗 [https://zer0en.github.io/ykenginnovaioncase/](https://zer0en.github.io/ykenginnovaioncase/)

---

## Why This Is Marketable

The AI industry generated over $184 billion in revenue in 2024, and every business — from law firms to hospitals to e-commerce companies — is trying to figure out which AI tool to use. Currently, the only way to compare models is to:

- Sign up for each service individually
- Pay for multiple subscriptions
- Test them manually, one at a time, with no consistent methodology

AI Arena removes all of that friction. One platform, one prompt, instant comparison. This is valuable to:

| Customer | Use case |
|---|---|
| Businesses | Evaluate AI vendors before signing contracts |
| Developers | Benchmark models for specific tasks |
| Students & researchers | Academic comparison and testing |
| Non-technical users | Try AI without understanding the backend |

---

## Technical Architecture

The MVP is built as a **fully static web application** — meaning it runs entirely in the user's browser with no server infrastructure required. This was a deliberate engineering decision.

### Stack

| Layer | Technology | Reason |
|---|---|---|
| UI | HTML5 + CSS3 | Zero dependencies, instant load, works everywhere |
| Logic | Vanilla JavaScript (ES2022) | No framework overhead, full browser support |
| API integration | Fetch API (browser-native) | Direct calls to AI providers, no proxy needed |
| Deployment | GitHub Pages + GitHub Actions | Free, reliable, deploys on every git push |

### How the API integration works

When a user sends a prompt, the browser makes a direct HTTP request to the AI provider's REST API:

```
User types prompt
       ↓
Browser sends POST request → api.openai.com
                           → generativelanguage.googleapis.com (Gemini)
                           → api-inference.huggingface.co
       ↓
Response rendered in panel with timing + token count
```

The user's API key is stored in `localStorage` — it never passes through any intermediate server. This is critical from a security standpoint: the platform cannot be breached to steal user keys because it never sees them.

### Side-by-side comparison

When compare mode is activated, both API calls are fired simultaneously using `Promise.allSettled()`. This means:

- Both models are queried at the same time (not sequentially)
- If one fails, the other still shows its result
- Response time is measured independently for each

### Supported providers (in the MVP)

- **OpenAI**: GPT-4o, GPT-4o mini, GPT-4 Turbo, GPT-3.5 Turbo
- **Google Gemini**: Gemini 2.0 Flash (free tier), Gemini 1.5 Pro
- **Hugging Face**: Mistral 7B, Zephyr 7B, Falcon 7B — all open-source

### Scaling beyond the MVP

A production version would add:

- **Backend API layer** (Node.js/Express) — to proxy requests, add rate limiting, and allow the platform to hold API keys server-side for a subscription model
- **Database** (PostgreSQL) — to save and share prompt comparison results
- **Authentication** — so users can save history and preferences
- **Leaderboard** — community voting on which model won each comparison
- **Model analytics dashboard** — aggregate data on which models perform best by category

---

## Communication to the Firm

To pitch this to Programming 4 Money's leadership, I would present a three-stage rollout:

### Stage 1 — Free tool (months 1–3)
Launch the static MVP (already done) to build an audience. No cost to run — GitHub Pages is free. Goal: 10,000 monthly active users. Use this as proof of market demand.

### Stage 2 — Freemium SaaS (months 4–9)
Add user accounts and a paid tier:
- **Free**: 20 prompts/day, 2 models
- **Pro ($9/month)**: Unlimited prompts, all models, comparison history
- **Teams ($49/month)**: Shared workspaces, API usage analytics, export to CSV

### Stage 3 — Enterprise (month 10+)
White-label licensing for companies that want to run internal AI evaluation platforms. Custom model integrations, SSO, compliance features.

### Revenue projection (conservative)

| Year | Users | Conversion | MRR |
|---|---|---|---|
| Year 1 | 50,000 | 2% Pro | ~$9,000/mo |
| Year 2 | 200,000 | 3% Pro + Teams | ~$60,000/mo |
| Year 3 | 500,000 | Mix of tiers | ~$200,000/mo |

Total investment needed: ~$250,000 (1 backend developer, hosting, marketing). Break-even: approximately 14 months.

### How the company actually makes money

To make this clearer, the business earns money in three direct ways:

1. **Monthly subscriptions (main income):**
Free users can test the product, but paid users unlock higher limits, saved history, team workspaces, and analytics.

2. **Enterprise licensing (high-value contracts):**
Companies can buy a private version with SSO, audit logs, and internal model integrations. This is sold as yearly contracts.

3. **Usage margin on API calls (optional):**
In the paid hosted version, the platform can include API usage in the plan price and keep a margin between provider cost and customer price.

In short: free tier for growth, subscriptions for recurring revenue, and enterprise deals for larger profit.

---

## The MVP — What's Already Built

The working prototype demonstrates the core value proposition right now. Here is what it does:

- ✅ Send any prompt to OpenAI, Gemini, or Hugging Face models
- ✅ Compare two models side-by-side with one click
- ✅ Displays response time (in seconds) and token usage
- ✅ API keys saved locally in the browser — fully private
- ✅ Works on mobile and desktop
- ✅ Zero install — just a URL
- ✅ Deployed and publicly accessible

**Live site:** [https://zer0en.github.io/ykenginnovaioncase/](https://zer0en.github.io/ykenginnovaioncase/)
**Source code:** [https://github.com/zer0en/ykenginnovaioncase](https://github.com/zer0en/ykenginnovaioncase)

The fact that I can show a working, deployed product — not just a slideshow — is the strongest possible argument that this idea works.

---

## Reflection

I started out wanting to build something way more complicated, with user logins, a database and a full backend. But the more I thought about it, the more I realised that would just slow me down without actually proving the idea works. So I kept it simple and ended up with something I could actually show people, which felt way better than a half-finished project with a lot of fancy features.

One thing I thought about early on was what happens if someone's API key gets leaked. By keeping the keys in the user's own browser instead of storing them on a server, I removed that problem completely. It wasn't something I read in a textbook, it just made sense when I thought it through.

Writing the case alongside the code also changed how I thought about the project. Explaining why I made certain choices, and how the business side could work, made me look at it differently than if I had just been coding. I think that is actually a useful skill going forward, being able to talk about what you built and why, not just build it.

If I were to do this again I would probably spend more time upfront checking if people actually want something like this before jumping into the code. That is probably the most important thing I take away from this.

---

*MIT License · Built with HTML, CSS, and JavaScript · Deployed on GitHub Pages*
