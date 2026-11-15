// Hand-written: survives regeneration.

export const DEFAULT_WEBHOOK_TOLERANCE_SECONDS = 300;

type HeaderSource = Headers | Record<string, string | string[] | undefined>;

function header(headers: HeaderSource, name: string): string {
  if (headers instanceof Headers) return headers.get(name) ?? '';
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === name) return (Array.isArray(v) ? v[0] : v) ?? '';
  }
  return '';
}

/**
 * Checks the X-SocialAPI-Signature-V2 and X-SocialAPI-Timestamp headers of a
 * webhook delivery. Pass the raw request body, before JSON parsing.
 * Uses Web Crypto, so it runs in Node 18+, Deno, Bun, edge runtimes and browsers.
 */
export async function verifyWebhook(
  secret: string,
  rawBody: string | Uint8Array,
  headers: HeaderSource,
  toleranceSeconds = DEFAULT_WEBHOOK_TOLERANCE_SECONDS,
  nowSeconds = Date.now() / 1000,
): Promise<boolean> {
  const ts = header(headers, 'x-socialapi-timestamp');
  const sig = header(headers, 'x-socialapi-signature-v2');
  if (!/^\d+$/.test(ts) || Math.abs(nowSeconds - Number(ts)) > toleranceSeconds) return false;

  const enc = new TextEncoder();
  const body = typeof rawBody === 'string' ? enc.encode(rawBody) : rawBody;
  const prefix = enc.encode(ts + '.');
  const message = new Uint8Array(prefix.length + body.length);
  message.set(prefix);
  message.set(body, prefix.length);

  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, message));
  const expected = 'sha256=' + Array.from(mac, (b) => b.toString(16).padStart(2, '0')).join('');

  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}
