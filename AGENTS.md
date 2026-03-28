# AGENTS.md

Guide for AI agents working in this codebase.

## Project overview

CloudMD is an MVP collaborative markdown editor. Next.js 15 App Router, TypeScript strict, Bun runtime, NextAuth 5 (Google OAuth), JSON file storage.

## Directory structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # NextAuth handler
│   │   └── documents/[id]/
│   │       ├── route.ts                   # PATCH — save document
│   │       ├── comments/route.ts          # POST — add comment
│   │       └── versions/route.ts          # POST — create snapshot
│   ├── components/                        # All UI components (14 files)
│   ├── docs/
│   │   ├── page.tsx                       # Document list page
│   │   ├── actions.ts                     # Server action: create doc
│   │   └── [id]/
│   │       ├── page.tsx                   # Editor page (server component)
│   │       └── EditorClient.tsx           # Editor page (client component)
│   ├── page.tsx                           # Landing / sign-in page
│   ├── layout.tsx                         # Root layout
│   └── globals.css                        # Global styles
├── lib/
│   ├── store.ts                           # Data layer — all DB operations
│   ├── auth.ts                            # requireUser() helper
│   └── documents.ts                       # Permission helpers (canEdit, canManageMembers)
├── types/
│   └── next-auth.d.ts                     # Session/JWT type augmentation
└── auth.ts                                # NextAuth config (providers, callbacks)

data/db.json                               # JSON file database (MVP persistence)
```

## Key architectural decisions

- **No ORM / no SQL database**: All data lives in `data/db.json`. The store (`src/lib/store.ts`) reads/writes this file with a promise-based mutex for write safety. Every data operation goes through this module.
- **No Tailwind**: Styling uses CSS Modules and `globals.css`.
- **No real-time sync**: There is no WebSocket, Liveblocks, or Yjs integration. Edits are single-user; collaboration is via sharing + comments.
- **No test framework**: No tests exist. If adding tests, set up vitest or jest first.
- **Auth bypass for dev**: Set `BYPASS_AUTH=true` in `.env.local` to skip Google OAuth and auto-create a dev user.

## Data model

Five collections in `data/db.json`:

| Collection | Key fields | Notes |
|---|---|---|
| `users` | id, email, name, image | Upserted on Google sign-in |
| `documents` | id, title, content, ownerId | Content max 200k chars |
| `members` | id, documentId, userId, role | Roles: OWNER, EDITOR, VIEWER |
| `versions` | id, documentId, title, content, reason | reason: "manual-snapshot" or "autosave-checkpoint" |
| `comments` | id, documentId, authorId, body, anchorStart, anchorEnd | anchorStart/End are optional char offsets |

## API routes

| Method | Path | Purpose |
|---|---|---|
| PATCH | `/api/documents/[id]` | Save title + content (Zod validated) |
| POST | `/api/documents/[id]/comments` | Add comment |
| POST | `/api/documents/[id]/versions` | Create manual snapshot |

All API routes require authentication via `requireUser()`. Request bodies are validated with Zod schemas defined in each route file.

## Auth flow

1. NextAuth 5 configured in `src/auth.ts` with Google provider and JWT strategy.
2. On sign-in, the `signIn` callback upserts the user in the JSON store.
3. `requireUser()` in `src/lib/auth.ts` enforces auth on pages/routes — redirects to `/` if unauthenticated.
4. Session includes `user.id` (added via JWT callback).

## Permission model

- `canEdit(role)` — OWNER or EDITOR
- `canManageMembers(role)` — OWNER only
- Enforced at the store level in `saveDocument()`, `addComment()`, `createSnapshot()`, `upsertMemberByEmail()`.

## Autosave behavior

- Client debounces changes by 900ms, then PATCHes `/api/documents/[id]`.
- On save, if 5+ minutes since last snapshot, an auto-checkpoint version is created.
- UI shows save status via `StatusIndicator` component.

## Common tasks

**Adding a new API route**: Create a `route.ts` under `src/app/api/`, call `requireUser()` at the top, validate input with Zod, use store functions from `src/lib/store.ts`.

**Adding a new page**: Create under `src/app/`, call `requireUser()` in the server component, wrap with `AppShell` for consistent layout.

**Modifying the data model**: Update types and functions in `src/lib/store.ts`. The JSON store has no migrations — schema changes apply immediately. Existing `data/db.json` may need manual updates.

**Adding a component**: Place in `src/app/components/`. Components are vanilla React with CSS Modules.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `AUTH_SECRET` | Yes | Random string for NextAuth JWT signing |
| `AUTH_URL` | Yes | App URL (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `BYPASS_AUTH` | No | Set to `true` to skip auth in development |
