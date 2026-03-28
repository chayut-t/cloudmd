# CLAUDE.md

## Commands

```bash
bun dev          # Dev server on :3000
bun build        # Production build (also type-checks)
bun lint         # ESLint
```

No test framework is configured yet. If adding one, use vitest.

## Code style

- TypeScript strict mode — no `any`, no implicit types on exports
- Next.js App Router conventions: server components by default, `"use client"` only when needed
- Validate API request bodies with Zod (schemas co-located in route files)
- CSS Modules for styling — no Tailwind
- Import paths use `@/*` alias (maps to `src/*`)

## Architecture

- **Data layer**: All DB operations go through `src/lib/store.ts` (JSON file store with write mutex). Do not read/write `data/db.json` directly.
- **Auth**: `requireUser()` from `src/lib/auth.ts` at the top of every protected page/route. Returns `{ id, email, name }`.
- **Permissions**: `canEdit(role)` and `canManageMembers(role)` from `src/lib/documents.ts`. Enforced in store functions.
- **Components**: All in `src/app/components/`. No component library — vanilla React + CSS Modules.
- **API routes**: Under `src/app/api/`. Always call `requireUser()`, validate with Zod, use store functions.

## Dev auth bypass

Set `BYPASS_AUTH=true` in `.env.local` to skip Google OAuth and auto-login as a dev user.

## Gotchas

- `data/db.json` is gitignored — it's created on first write. If the app errors on fresh clone, run the app and sign in (or use BYPASS_AUTH) to bootstrap it.
- `prisma/` directory exists but is unused — ignore it.
- No real-time sync — concurrent multi-user editing is not supported.
- NextAuth v5 is beta (`next-auth@5.0.0-beta.25`) — API may differ from stable v4 docs.
