#!/usr/bin/env bash
# Regenerates src/client from openapi.json. Everything else under src/ is hand-written.
set -euo pipefail
cd "$(dirname "$0")/.."
npx openapi-ts
