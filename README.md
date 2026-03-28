# CloudMD

A collaborative markdown editor built with Next.js 15 (App Router), TypeScript (strict mode), Bun, and Google OAuth via NextAuth 5.

## Features

- **Authentication**: Google OAuth sign-in via NextAuth v5 (JWT strategy)
- **Document management**: Create, list, search, edit markdown documents
- **Editor**: CodeMirror-based markdown editor with edit, preview, and split modes
- **Autosave**: 900ms debounced saves with automatic checkpoint snapshots every 5 minutes
- **Version history**: Manual snapshots and timed auto-checkpoints
- **Collaboration**: Invite members by email with role-based access (Owner / Editor / Viewer)
- **Comments**: Inline comments with optional text-range anchors
- **Dev mode**: Set `BYPASS_AUTH=true` to skip Google OAuth locally

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15.2 (App Router) |
| Language | TypeScript (strict) |
| Runtime / PM | Bun |
| Auth | NextAuth 5 beta (Google provider) |
| Editor | `@uiw/react-codemirror` + `@codemirror/lang-markdown` |
| Markdown render | `react-markdown` + `remark-gfm` + `rehype-highlight` |
| Validation | Zod |
| Styling | CSS Modules (no Tailwind) |
| Data storage | JSON file (`data/db.json`) — MVP only |

## Local setup

1. Install dependencies:

```bash
bun install
```

2. Create your env file:

```bash
cp .env.example .env.local
```

3. Fill in these values in `.env.local`:
   - `AUTH_SECRET` — any long random string
   - `AUTH_URL` — `http://localhost:3000`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

4. In Google Cloud OAuth settings, add this callback URL:
   - `http://localhost:3000/api/auth/callback/google`

5. Start the app:

```bash
bun dev
```

Then open `http://localhost:3000`.

## Scripts

```bash
bun dev      # Start dev server (port 3000)
bun build    # Production build
bun start    # Start production server
bun lint     # Run ESLint
```

## Notes

- Data is stored locally in `data/db.json` via a JSON file store with promise-based write locking. This is suitable for local development only — production should migrate to a managed database.
- Real-time multi-user sync (e.g. Liveblocks + Yjs) is not yet implemented; concurrent editing by multiple users on the same document is not supported.
- No test framework is configured yet.
- A `prisma/` directory exists but is unused.
