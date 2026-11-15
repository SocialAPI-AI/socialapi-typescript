# SocialAPI TypeScript SDK

Official TypeScript client for the [SocialAPI](https://social-api.ai) REST API. Runs on Node 18+, Deno, Bun, edge runtimes and browsers.

```bash
npm install socialapi
```

```ts
import { client, listBrands } from 'socialapi';

client.setConfig({ auth: 'sapi_key_...' });
const { data, error } = await listBrands();
```

Every endpoint is an exported function with typed request and response. The API reference is at [docs.social-api.ai](https://docs.social-api.ai).

## Verifying webhooks

```ts
import { verifyWebhook } from 'socialapi';

if (!(await verifyWebhook('whsec_...', rawBody, request.headers))) {
  return new Response('invalid signature', { status: 401 });
}
```

Pass the raw request body, before JSON parsing. Deliveries older than 5 minutes are rejected.

## How this package is built

`src/client` is generated from the API's OpenAPI spec by [@hey-api/openapi-ts](https://heyapi.dev). Do not edit it: every release regenerates it. The rest of `src/` and `test/` is hand-written. Releases are fully automated by `.github/workflows/release.yml`, and versions follow semver from the spec diff.
