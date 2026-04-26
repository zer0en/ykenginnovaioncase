/* ─────────────────────────────────────────
   AI Arena · App Logic
   All API calls go directly from the browser
   to the AI provider. Keys are stored only
   in localStorage — never on any server.
   ───────────────────────────────────────── */

'use strict';

// ── Tab navigation ─────────────────────────────────────────────────────────

function showTab(name) {
  document.getElementById('tab-app').classList.toggle('hidden', name !== 'app');
  document.getElementById('tab-case').classList.toggle('hidden', name !== 'case');
  document.querySelectorAll('.nav-tab').forEach((btn, i) => {
    btn.classList.toggle('active', (i === 0 && name === 'app') || (i === 1 && name === 'case'));
  });
}

// ── Model catalogue ────────────────────────────────────────────────────────

const PROVIDERS = {
  openai: {
    label: 'OpenAI',
    models: [
      { id: 'gpt-4o',            label: 'GPT-4o' },
      { id: 'gpt-4o-mini',       label: 'GPT-4o mini' },
      { id: 'gpt-4-turbo',       label: 'GPT-4 Turbo' },
      { id: 'gpt-3.5-turbo',     label: 'GPT-3.5 Turbo' },
    ],
    keyPlaceholder: 'sk-...',
    async call(model, apiKey, prompt) {
      if (!apiKey) throw new Error('OpenAI API key is required.');
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `OpenAI error ${res.status}`);
      }
      const data = await res.json();
      return {
        text:   data.choices?.[0]?.message?.content ?? '(empty response)',
        tokens: data.usage?.total_tokens ?? null,
      };
    },
  },

  gemini: {
    label: 'Google Gemini',
    models: [
      { id: 'gemini-2.0-flash',        label: 'Gemini 2.0 Flash (free)' },
      { id: 'gemini-1.5-flash',        label: 'Gemini 1.5 Flash (free)' },
      { id: 'gemini-1.5-pro',          label: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash-8b',     label: 'Gemini 1.5 Flash-8B' },
    ],
    keyPlaceholder: 'AIza...',
    async call(model, apiKey, prompt) {
      if (!apiKey) throw new Error('Google Gemini API key is required. Get a free key at aistudio.google.com');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1024 },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Gemini error ${res.status}`);
      }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '(empty response)';
      const tokens = data.usageMetadata?.totalTokenCount ?? null;
      return { text, tokens };
    },
  },

  huggingface: {
    label: 'Hugging Face',
    models: [
      { id: 'mistralai/Mistral-7B-Instruct-v0.3',   label: 'Mistral 7B Instruct' },
      { id: 'HuggingFaceH4/zephyr-7b-beta',          label: 'Zephyr 7B Beta' },
      { id: 'microsoft/DialoGPT-large',               label: 'DialoGPT Large' },
      { id: 'tiiuae/falcon-7b-instruct',              label: 'Falcon 7B Instruct' },
      { id: 'google/flan-t5-large',                   label: 'Flan-T5 Large' },
    ],
    keyPlaceholder: 'hf_...',
    async call(model, apiKey, prompt) {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 512 } }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Hugging Face error ${res.status}`);
      }
      const data = await res.json();
      // HF returns different formats depending on the pipeline type
      let text;
      if (Array.isArray(data)) {
        text = data[0]?.generated_text ?? data[0]?.summary_text ?? JSON.stringify(data[0]);
      } else {
        text = data?.generated_text ?? JSON.stringify(data);
      }
      // Strip the original prompt from the output (some HF models echo it back)
      if (text.startsWith(prompt)) text = text.slice(prompt.length).trim();
      return { text: text || '(empty response)', tokens: null };
    },
  },
};

// ── State ──────────────────────────────────────────────────────────────────

let compareMode = false;

// ── Init ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  updateModels('left');
  updateModels('right');
  loadSavedKeys();

  document.getElementById('prompt').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendPrompt();
  });
});

// ── Model selects ──────────────────────────────────────────────────────────

function updateModels(side) {
  const provider = document.getElementById(`provider-${side}`).value;
  const modelSelect = document.getElementById(`model-${side}`);
  const models = PROVIDERS[provider]?.models ?? [];

  modelSelect.innerHTML = '';
  models.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.label;
    modelSelect.appendChild(opt);
  });

  const keyInput = document.getElementById(`apikey-${side}`);
  keyInput.placeholder = PROVIDERS[provider]?.keyPlaceholder ?? 'API Key';

  // Try loading saved key for this provider
  const saved = localStorage.getItem(`aiarena_key_${provider}`);
  if (saved) keyInput.value = saved;
}

// ── API key persistence ────────────────────────────────────────────────────

function saveKey(side) {
  const provider = document.getElementById(`provider-${side}`).value;
  const key = document.getElementById(`apikey-${side}`).value.trim();
  if (!key) { toast('Key is empty — nothing saved.', 'error'); return; }
  localStorage.setItem(`aiarena_key_${provider}`, key);
  toast('API key saved!', 'success');
}

function loadSavedKeys() {
  ['left', 'right'].forEach(side => {
    const provider = document.getElementById(`provider-${side}`).value;
    const saved = localStorage.getItem(`aiarena_key_${provider}`);
    if (saved) document.getElementById(`apikey-${side}`).value = saved;
  });
}

// ── Compare toggle ─────────────────────────────────────────────────────────

function toggleCompare() {
  compareMode = !compareMode;
  const panelRight = document.getElementById('panel-right');
  const panels     = document.getElementById('panels-container');
  const btn        = document.getElementById('compare-btn');
  const btnText    = document.getElementById('compare-btn-text');

  if (compareMode) {
    panelRight.classList.remove('hidden');
    panels.classList.add('compare-mode');
    btn.classList.add('active');
    btnText.textContent = '✕ Close B';
  } else {
    panelRight.classList.add('hidden');
    panels.classList.remove('compare-mode');
    btn.classList.remove('active');
    btnText.textContent = '+ Compare';
  }
}

// ── Prompt utilities ───────────────────────────────────────────────────────

function setPrompt(text) {
  document.getElementById('prompt').value = text;
  updateCharCount();
  document.getElementById('prompt').focus();
}

function updateCharCount() {
  const len = document.getElementById('prompt').value.length;
  document.getElementById('char-count').textContent =
    `${len} character${len !== 1 ? 's' : ''}`;
}

function clearAll() {
  document.getElementById('prompt').value = '';
  updateCharCount();
  ['left', 'right'].forEach(side => {
    setResponsePlaceholder(side);
    document.getElementById(`meta-${side}`).innerHTML = '';
  });
}

// ── Send prompt ────────────────────────────────────────────────────────────

async function sendPrompt() {
  const prompt = document.getElementById('prompt').value.trim();
  if (!prompt) { toast('Please enter a prompt.', 'error'); return; }

  const btn = document.getElementById('send-btn');
  btn.disabled = true;
  btn.textContent = 'Sending…';

  const sides = compareMode ? ['left', 'right'] : ['left'];
  const calls = sides.map(side => runModel(side, prompt));

  await Promise.allSettled(calls);

  btn.disabled = false;
  btn.textContent = 'Send ▶';
}

async function runModel(side, prompt) {
  const provider  = document.getElementById(`provider-${side}`).value;
  const model     = document.getElementById(`model-${side}`).value;
  const apiKey    = document.getElementById(`apikey-${side}`).value.trim();

  setResponseLoading(side, PROVIDERS[provider]?.label ?? provider, model);
  document.getElementById(`meta-${side}`).innerHTML = '';

  const t0 = performance.now();
  try {
    const result  = await PROVIDERS[provider].call(model, apiKey, prompt);
    const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
    setResponseSuccess(side, result.text);
    setMeta(side, elapsed, result.tokens, model);
  } catch (err) {
    setResponseError(side, err.message);
  }
}

// ── Response rendering ─────────────────────────────────────────────────────

function setResponseLoading(side, providerLabel, model) {
  document.getElementById(`response-${side}`).innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      Waiting for ${escapeHtml(providerLabel)} · ${escapeHtml(model)}…
    </div>`;
}

function setResponsePlaceholder(side) {
  document.getElementById(`response-${side}`).innerHTML =
    '<div class="response-placeholder">Response will appear here…</div>';
}

function setResponseSuccess(side, text) {
  document.getElementById(`response-${side}`).innerHTML =
    `<div class="response-content">${renderMarkdown(text)}</div>`;
}

function setResponseError(side, message) {
  document.getElementById(`response-${side}`).innerHTML =
    `<div class="response-error">⚠ ${escapeHtml(message)}</div>`;
}

function setMeta(side, elapsed, tokens, model) {
  const tokensHtml = tokens != null
    ? `<span class="meta-badge meta-tokens">${tokens} tokens</span>` : '';
  document.getElementById(`meta-${side}`).innerHTML = `
    <span class="meta-badge">${escapeHtml(model.split('/').pop())}</span>
    <span class="meta-time">⏱ ${elapsed}s</span>
    ${tokensHtml}`;
}

// ── Minimal Markdown renderer ──────────────────────────────────────────────
// Handles: **bold**, *italic*, `inline code`, ```code blocks```, # headings

function renderMarkdown(text) {
  // Escape HTML first
  let html = escapeHtml(text);

  // Code blocks (``` ... ```)
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) =>
    `<pre><code>${code.trim()}</code></pre>`);

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Headings
  html = html.replace(/^### (.+)$/gm, '<strong>$1</strong>');
  html = html.replace(/^## (.+)$/gm,  '<strong>$1</strong>');
  html = html.replace(/^# (.+)$/gm,   '<strong>$1</strong>');

  // Double newline → paragraph break
  html = html.replace(/\n\n/g, '\n\n');

  return html;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Toast notifications ────────────────────────────────────────────────────

let toastTimer = null;

function toast(message, type = 'info') {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast'; }, 3000);
}
