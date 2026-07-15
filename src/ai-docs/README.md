# Boombox Backend — AI Context

Documentation for LLM agents working on **boombox-backend**. Read these files before exploring the codebase.

## What this project is

REST API for a personal music library (**MelodyMap / Boombox**). It syncs album folders from cloud storage (pCloud, Yandex Disk) into MongoDB, serves metadata and covers to a Vue SPA, and supports collections, compilations, search, backup/restore, Discogs lookup, and Genius lyrics.

## Tech stack

| Item | Choice |
|------|--------|
| Runtime | Node.js ≥18 (build target Node 20) |
| Framework | Express 5 |
| DB | MongoDB + Mongoose 9 |
| Pagination | mongoose-paginate-v2 |
| Auth | JWT in httpOnly cookies (`jsonwebtoken`, `bcrypt`) |
| Build | tsup → single CJS bundle `dist/index.js` |
| Dev | ts-node + nodemon on `src/index.ts` |

## Document map

| File | Contents |
|------|----------|
| [architecture.md](./architecture.md) | Layers, request flow, DI pattern, folders |
| [api-and-routing.md](./api-and-routing.md) | Routes, auth, query params, album filters |
| [domain-and-integrations.md](./domain-and-integrations.md) | Models, sync, backup, clouds, external APIs |

## Build & docs exclusion

- **Production build:** `yarn build` (tsup) bundles only the import graph from `src/index.ts`.
- **`src/ai-docs/`** is **not imported** by runtime code and **excluded** in `tsconfig.json`.
- Markdown files are never part of `dist/`.

## Commands

```bash
yarn dev          # nodemon + ts-node
yarn build        # tsup → dist/
yarn type-check   # tsc --noEmit
yarn start:prod   # node dist/index.js
```

## Environment

See `.env.example`. Key vars: `MONGO_URI`, `JWT_SECRET_TOKEN`, `CLIENT_URL_DEV` / `CLIENT_URL_PROD`, cloud credentials (`PCLOUD_*`, `YCLOUD_*`), `DISCOGS_*`, `GENIUS_SECRET`.

Port: **3001** (hardcoded in `src/index.ts`).

## Conventions (short)

- Repository classes: `*RepositoryContract` in `repositories/`, interfaces in `types/*.d.ts`.
- Controllers: arrow handlers, thin try/catch, delegate to services.
- API responses: shaped by `*ViewFactory` in `views/` (not Mongoose documents raw).
- Query parsing: `Parser.parseNestedQuery(req)` — dotted keys (`sort.title=1` → `{ sort: { title: 1 } }`).
- **No test framework** configured (no jest/vitest in scripts).
- Auth is manual JWT + cookies (`jsonwebtoken`); `passport` in deps is unused.
