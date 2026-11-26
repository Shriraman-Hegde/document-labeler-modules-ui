# document-labeler-modules-ui

Lit.js modular UI for the [document-labeler](https://github.com/Shriraman-Hegde/document-labeler) HTTP API.

## Modules

| Tag | Role |
| --- | --- |
| `digitizer-app` | Shell / orchestration |
| `capture-stage` | Camera viewport + still/PDF preview |
| `scan-form` | API base, department, mode, actions |
| `result-panel` | Scan JSON output |

Shared API helpers live in `src/lib/api.ts`.

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

## Build

```bash
npm run build
npm run preview
```
