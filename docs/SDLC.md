# UI SDLC addendum

**System of record** for architecture, cross-repo SDLC, and reports:

→ https://github.com/Shriraman-Hegde/document-labeler/tree/main/docs/prod

This file only covers **document-labeler-modules-ui** mechanics.

## Build & test

| Step | Command |
| --- | --- |
| Dev | `npm run dev` (Vite) |
| Prod bundle | `npm run build` → `dist/` (tsc → Rollup → Babel) |
| Preview | `npm run preview` (serves `dist/` on :4173) |
| E2E | `npm test` (Playwright; builds/serves `dist/`, mocks API) |

CI: `.github/workflows/ci.yml` (Node 22, Chromium, build + Playwright).

## Release checklist (UI)

- [ ] `main` CI green
- [ ] Tag `vX.Y.Z` (record in API repo release report R1)
- [ ] Publish `dist/` to the static host
- [ ] Confirm UI `?api=` / saved base points at **production** API HTTPS origin
- [ ] Staging sign-off (R2) includes UI URL

## Do not duplicate here

APPLICATION.md and REPORTS.md live only under `document-labeler/docs/prod/`.
