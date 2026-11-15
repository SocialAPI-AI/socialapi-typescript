import assert from 'node:assert/strict';
import { test } from 'node:test';
import { verifyWebhook } from '../dist/index.js';

// Reference vector shared by every SDK: HMAC-SHA256("whsec_test", "1700000000." + body).
const SECRET = 'whsec_test';
const BODY = '{"event":"comment.received"}';
const HEADERS = {
  'X-SocialAPI-Timestamp': '1700000000',
  'X-SocialAPI-Signature-V2': 'sha256=a1c084394bcdc1743e02d34447378108cde7b6ac0c963bd211e97ba76bb3f3bf',
};
const NOW = 1700000000;

test('valid delivery', async () => {
  assert.ok(await verifyWebhook(SECRET, BODY, HEADERS, 300, NOW + 60));
  assert.ok(await verifyWebhook(SECRET, new TextEncoder().encode(BODY), new Headers(HEADERS), 300, NOW));
});

test('rejected deliveries', async () => {
  assert.ok(!(await verifyWebhook('wrong', BODY, HEADERS, 300, NOW)));
  assert.ok(!(await verifyWebhook(SECRET, '{}', HEADERS, 300, NOW)));
  assert.ok(!(await verifyWebhook(SECRET, BODY, HEADERS, 300, NOW + 360)));
  assert.ok(!(await verifyWebhook(SECRET, BODY, { 'X-SocialAPI-Signature-V2': HEADERS['X-SocialAPI-Signature-V2'] }, 300, NOW)));
});
