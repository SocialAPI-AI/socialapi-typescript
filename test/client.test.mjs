// Release gate for the generated client: base URL, bearer auth, decoding,
// error mapping, and tolerance of values the spec does not list yet.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createClient, createConfig, getPost } from '../dist/index.js';

const POST = '{"id":"p_1","status":"published","queue_id":null,"field_from_the_future":1,"targets":[{"platform":"platform_from_the_future"}]}';
const ERROR = '{"error":{"code":"post.not_found","message":"Post not found"},"request_id":"req_1"}';

function testClient(status, body) {
  const fetch = async (req) => {
    assert.equal(req.headers.get('Authorization'), 'Bearer sapi_key_test');
    assert.equal(new URL(req.url).pathname, '/v1/posts/p_1');
    return new Response(body, { status, headers: { 'Content-Type': 'application/json' } });
  };
  return createClient(createConfig({ baseUrl: 'https://api.test.local/v1', auth: 'sapi_key_test', fetch }));
}

test('forward-compatible decode', async () => {
  const { data, error } = await getPost({ client: testClient(200, POST), path: { post_id: 'p_1' } });
  assert.equal(error, undefined);
  assert.equal(data.id, 'p_1');
  assert.equal(data.targets[0].platform, 'platform_from_the_future');
});

test('error response', async () => {
  const { data, error, response } = await getPost({ client: testClient(404, ERROR), path: { post_id: 'p_1' } });
  assert.equal(data, undefined);
  assert.equal(response.status, 404);
  assert.equal(error.error.code, 'post.not_found');
});
