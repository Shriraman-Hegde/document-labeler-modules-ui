# document-labeler-modules-ui

Lit.js modular UI for the [document-labeler](https://github.com/Shriraman-Hegde/document-labeler) HTTP API.

**System prod docs (application, SDLC, reports):** [document-labeler/docs/prod](https://github.com/Shriraman-Hegde/document-labeler/tree/main/docs/prod)  
**UI SDLC addendum:** [docs/SDLC.md](./docs/SDLC.md)

## Modules

| Tag | Role |
| --- | --- |
| `digitizer-app` | Shell / orchestration |
| `capture-stage` | Camera viewport + still/PDF preview |
| `scan-form` | API base, department, mode, actions |
| `result-panel` | Scan / relate JSON output |

Shared API helpers live in `src/lib/api.ts`.

## State management

**Zustand is not used.** UI state lives in Lit reactive `@state()` / `@property()` on `digitizer-app` and child modules. There is no cross-tree React-style store to justify Zustand; adding it would duplicate Lit’s own reactivity.

## Develop

```bash
# terminal 1 — API
cd ../document-labeler
DIGITIZER_ALLOW_STUB=1 ./bin/digitizer serve --addr :8091 --root .

# terminal 2 — UI
npm install
npm run dev
```

Open the Vite URL (default http://127.0.0.1:5173).  
Set **API base** to `http://127.0.0.1:8091`, or use `?api=http://127.0.0.1:8091`.

## Production build (Rollup + Babel)

```bash
npm run build
npm run preview
```

- `rollup.config.mjs` emits **minified** ES + IIFE bundles (`dist/digitizer-modules.js`, `dist/digitizer-modules.iife.js`) via Terser
- CSS (`tokens.css`) minified with CSSO; `index.html` whitespace-minified
- TypeScript handles Lit `experimentalDecorators`; Babel (`babel.config.json`) only downlevels for browser targets

## Test (Playwright)

```bash
npx playwright install chromium   # once
npm test
```

E2E specs in `e2e/` drive the production build with mocked `/v1/scan` and `/v1/relate`.

CI runs `npm run build` + Playwright on every push/PR (`.github/workflows/ci.yml`).
