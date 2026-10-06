import http from 'node:http';
import {
  LIMITS,
  askOpenRouter,
  createRateLimiter,
  parseAllowedOrigins,
  parseAssistantRequest,
} from './core.mjs';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`missing_${name.toLowerCase()}`);
  return value;
}

const config = {
  apiKey: required('OPENROUTER_API_KEY'),
  model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-flash',
  allowedOrigins: parseAllowedOrigins(required('ASSISTANT_ALLOWED_ORIGINS')),
  path: process.env.ASSISTANT_PATH || '/assistant',
  port: Number(process.env.PORT || 8788),
  trustProxy: process.env.ASSISTANT_TRUST_PROXY === '1',
  perMinute: Math.max(1, Number(process.env.ASSISTANT_RATE_PER_MINUTE || 8)),
  perDay: Math.max(1, Number(process.env.ASSISTANT_DAILY_CAP || 500)),
};

if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
  throw new Error('invalid_port');
}

const limit = createRateLimiter({ perMinute: config.perMinute, perDay: config.perDay });
const referer = [...config.allowedOrigins][0];

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > LIMITS.bodyBytes) {
        reject(new Error('body_too_large'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

function respond(response, status, payload, origin) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    vary: 'Origin',
    ...(origin ? { 'access-control-allow-origin': origin } : {}),
  });
  response.end(payload ? `${JSON.stringify(payload)}\n` : '');
}

function clientAddress(request) {
  if (config.trustProxy) {
    const forwarded = String(request.headers['x-forwarded-for'] ?? '').split(',')[0].trim();
    if (forwarded) return forwarded;
  }
  return request.socket.remoteAddress ?? 'unknown';
}

const server = http.createServer(async (request, response) => {
  const origin = config.allowedOrigins.has(String(request.headers.origin))
    ? String(request.headers.origin)
    : null;
  const url = new URL(request.url ?? '/', 'http://localhost');

  if (url.pathname !== config.path) return respond(response, 404, { error: 'not_found' });

  if (request.method === 'OPTIONS') {
    if (!origin) return respond(response, 403, { error: 'origin_not_allowed' });
    response.writeHead(204, {
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'POST',
      'access-control-allow-headers': 'content-type',
      'access-control-max-age': '600',
      vary: 'Origin',
    });
    return response.end();
  }

  if (request.method !== 'POST') return respond(response, 405, { error: 'method_not_allowed' }, origin);
  if (!origin) return respond(response, 403, { error: 'origin_not_allowed' });

  const allowed = limit(clientAddress(request));
  if (!allowed.ok) return respond(response, 429, { error: allowed.reason }, origin);

  let parsed;
  try {
    parsed = parseAssistantRequest(await readBody(request));
  } catch {
    return respond(response, 413, { error: 'body_too_large' }, origin);
  }
  if (parsed.error) return respond(response, 400, { error: parsed.error }, origin);

  try {
    const reply = await askOpenRouter({
      apiKey: config.apiKey,
      model: config.model,
      referer,
      locale: parsed.locale,
      messages: parsed.messages,
    });
    return respond(response, 200, { reply }, origin);
  } catch (error) {
    // Log the failure class only — never prompts, replies, keys or addresses.
    console.error('assistant_upstream_failed', error instanceof Error ? error.message : 'unknown');
    return respond(response, 502, { error: 'upstream_failed' }, origin);
  }
});

server.listen(config.port, '127.0.0.1', () => {
  console.log(`assistant proxy listening on 127.0.0.1:${config.port}${config.path}`);
});
