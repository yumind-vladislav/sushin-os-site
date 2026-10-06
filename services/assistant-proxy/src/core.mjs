import { buildSystemPrompt } from './os-guide.mjs';

export const LIMITS = {
  bodyBytes: 16 * 1024,
  messages: 8,
  messageChars: 600,
  replyTokens: 300,
};

/** Accepts only the shape the Sushin OS client sends; everything else is a 400. */
export function parseAssistantRequest(raw) {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return { error: 'invalid_json' };
  }
  if (!payload || typeof payload !== 'object') return { error: 'invalid_body' };
  const locale = payload.locale === 'en' ? 'en' : 'ru';
  if (!Array.isArray(payload.messages) || payload.messages.length === 0)
    return { error: 'missing_messages' };
  const messages = payload.messages.slice(-LIMITS.messages).map((message) => ({
    role: message?.role === 'assistant' ? 'assistant' : 'user',
    content: typeof message?.content === 'string' ? message.content.trim().slice(0, LIMITS.messageChars) : '',
  }));
  if (messages.some((message) => !message.content)) return { error: 'empty_message' };
  if (messages.at(-1).role !== 'user') return { error: 'last_message_not_user' };
  return { locale, messages };
}

export function parseAllowedOrigins(value) {
  return new Set(
    String(value ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
      .map((origin) => new URL(origin).origin),
  );
}

/** Fixed-window limiter keyed by client address, plus a global daily cap. */
export function createRateLimiter({ perMinute, perDay, now = () => Date.now() }) {
  const minute = new Map();
  let day = { start: now(), count: 0 };
  return (key) => {
    const time = now();
    if (time - day.start >= 86_400_000) day = { start: time, count: 0 };
    if (day.count >= perDay) return { ok: false, reason: 'daily_cap' };
    const entry = minute.get(key);
    if (!entry || time - entry.start >= 60_000) {
      minute.set(key, { start: time, count: 1 });
    } else if (entry.count >= perMinute) {
      return { ok: false, reason: 'rate_limited' };
    } else {
      entry.count += 1;
    }
    if (minute.size > 10_000) {
      for (const [address, value] of minute) if (time - value.start >= 60_000) minute.delete(address);
    }
    day.count += 1;
    return { ok: true };
  };
}

export async function askOpenRouter({
  fetchImpl = fetch,
  apiKey,
  model,
  referer,
  locale,
  messages,
  timeoutMs = 20_000,
}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
        ...(referer ? { 'http-referer': referer } : {}),
        'x-title': 'Sushin OS',
      },
      body: JSON.stringify({
        model,
        max_tokens: LIMITS.replyTokens,
        temperature: 0.4,
        messages: [{ role: 'system', content: buildSystemPrompt(locale) }, ...messages],
      }),
    });
    if (!response.ok) throw new Error(`upstream_${response.status}`);
    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) throw new Error('upstream_empty');
    return reply.trim().slice(0, 1200);
  } finally {
    clearTimeout(timer);
  }
}
