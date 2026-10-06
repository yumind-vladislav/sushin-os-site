import { appDefinitions, appIds, isAppId, type AppId } from '@/content/apps';
import type { Locale } from '@/content/i18n';

export type AssistantAction =
  | { type: 'open'; app: AppId }
  | { type: 'wallpaper-next' }
  | { type: 'theme-toggle' };

export type AssistantMessage = { role: 'user' | 'assistant'; content: string };

export type AssistantReply = {
  text: string;
  actions: AssistantAction[];
  source: 'remote' | 'local';
};

const actionPattern = /\[\[(open|wallpaper|theme):([a-z-]+)\]\]/g;

/**
 * The model answers in plain text and may append `[[open:calculator]]`,
 * `[[wallpaper:next]]` or `[[theme:toggle]]`. Unknown tokens are dropped, so a
 * reply can never trigger anything outside this list.
 */
export function parseAssistantReply(raw: string): Omit<AssistantReply, 'source'> {
  const actions: AssistantAction[] = [];
  for (const [, kind, value] of raw.matchAll(actionPattern)) {
    if (kind === 'open' && isAppId(value)) actions.push({ type: 'open', app: value });
    if (kind === 'wallpaper' && value === 'next') actions.push({ type: 'wallpaper-next' });
    if (kind === 'theme' && value === 'toggle') actions.push({ type: 'theme-toggle' });
  }
  const text = raw.replace(actionPattern, '').replace(/\s{2,}/g, ' ').trim();
  return { text, actions };
}

const normalize = (value: string) =>
  value.toLowerCase().replaceAll('ё', 'е').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();

/** Best app match for free text, by title first and keywords second. */
export function findApp(query: string, locale: Locale): AppId | null {
  const words = normalize(query).split(/\s+/).filter((word) => word.length > 1);
  if (!words.length) return null;
  let best: { id: AppId; score: number } | null = null;
  for (const id of appIds) {
    const app = appDefinitions[id];
    const titles = [app.title[locale], app.title.ru, app.title.en].map(normalize);
    const keywords = app.keywords.map(normalize);
    let score = 0;
    for (const word of words) {
      if (titles.some((title) => title === word)) score += 4;
      else if (titles.some((title) => title.startsWith(word) || word.startsWith(title)))
        score += 3;
      if (keywords.some((keyword) => keyword === word)) score += 2;
      else if (keywords.some((keyword) => word.length > 3 && keyword.startsWith(word.slice(0, -1))))
        score += 1;
    }
    if (score > 0 && (!best || score > best.score)) best = { id, score };
  }
  return best?.id ?? null;
}

const copy = {
  ru: {
    greeting:
      'Привет! Я Ровер. Могу открыть приложение, сменить обои или подсказать, где что лежит. Просто спроси!',
    help: 'Я умею открывать окна («открой CV», «запусти сапер»), менять обои и тему. А еще могу рассказать, что где лежит в Sushin OS.',
    opening: (title: string) => `Открываю «${title}».`,
    wallpaper: 'Меняю обои.',
    theme: 'Переключаю тему.',
    unknown:
      'Пока не понял вопрос. Попробуй «открой проекты», «где резюме» или «смени обои».',
    offline: 'Сеть ассистента недоступна, отвечаю по встроенной подсказке.',
  },
  en: {
    greeting:
      'Hi! I’m Rover. I can open apps, change the wallpaper or tell you where things are. Just ask!',
    help: 'I can open windows (“open CV”, “start minesweeper”), change the wallpaper and theme, and explain where things are in Sushin OS.',
    opening: (title: string) => `Opening “${title}”.`,
    wallpaper: 'Changing the wallpaper.',
    theme: 'Switching the theme.',
    unknown: 'I didn’t get that yet. Try “open projects”, “where is the CV” or “change wallpaper”.',
    offline: 'The assistant network is unavailable, answering from the built-in guide.',
  },
} as const;

export const assistantCopy = copy;

/** Offline answers: enough to navigate the OS without the model. */
export function answerLocally(question: string, locale: Locale): AssistantReply {
  const text = normalize(question);
  const t = copy[locale];
  if (/(обои|фон|wallpaper|background)/.test(text))
    return { text: t.wallpaper, actions: [{ type: 'wallpaper-next' }], source: 'local' };
  if (/(тем[ауы]|темн|светл|theme|dark|light)/.test(text))
    return { text: t.theme, actions: [{ type: 'theme-toggle' }], source: 'local' };
  // Questions about Rover itself come before app matching: «что ты умеешь»
  // must not open the «Что я умею» window.
  if (/(что ты|ты умеешь|помощ|помоги|help|what can you)/.test(text))
    return { text: t.help, actions: [], source: 'local' };
  const app = findApp(question, locale);
  if (app) {
    const definition = appDefinitions[app];
    return {
      text: `${t.opening(definition.title[locale])} ${definition.summary[locale]}`,
      actions: [{ type: 'open', app }],
      source: 'local',
    };
  }
  return { text: t.unknown, actions: [], source: 'local' };
}

const assistantUrl = process.env.NEXT_PUBLIC_ASSISTANT_URL ?? '';

export function hasRemoteAssistant() {
  return assistantUrl.length > 0;
}

export async function askAssistant(
  history: readonly AssistantMessage[],
  locale: Locale,
): Promise<AssistantReply> {
  const question = history.at(-1)?.content ?? '';
  if (!assistantUrl) return answerLocally(question, locale);

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(assistantUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ locale, messages: history.slice(-8) }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`assistant ${response.status}`);
    const payload = (await response.json()) as { reply?: unknown };
    if (typeof payload.reply !== 'string' || !payload.reply.trim())
      throw new Error('assistant: empty reply');
    return { ...parseAssistantReply(payload.reply), source: 'remote' };
  } catch {
    const local = answerLocally(question, locale);
    return { ...local, text: `${copy[locale].offline} ${local.text}` };
  } finally {
    window.clearTimeout(timer);
  }
}
