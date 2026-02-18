# CloudMD Product Plan

## Goal
Build a collaborative markdown editor similar to Google Docs, using Next.js, and deploy on Vercel.

## 1. Define MVP Scope (Week 1)
- Core features:
  - Create/open markdown docs
  - Rich editing
  - Real-time collaboration
  - Comments
  - Sharing permissions
  - Autosave
  - Version snapshots
- Non-goals for MVP:
  - Full Google Docs parity (advanced tables, mail merge, plugin ecosystem)
- Success criteria:
  - Multiple users can edit the same doc with low conflict
  - Reliable save and restore behavior

## 2. Lock Architecture and Stack (Week 1)
- App framework: Next.js (App Router, TypeScript, Server Actions)
- Auth: NextAuth or Clerk
- Database: Postgres with Prisma
- Realtime collaboration: Liveblocks + Yjs
- Markdown editor: TipTap with markdown import/export pipeline
- Storage: Vercel Postgres + Vercel Blob (for attachments)

## 3. Build Foundation (Week 2)
- Set up app, linting, formatting, and CI
- Define database schema:
  - `users`
  - `documents`
  - `document_members`
  - `document_versions`
  - `comments`
- Build auth flows and protected routes
- Implement role model (owner/editor/viewer)

## 4. Implement Editor MVP (Weeks 3-4)
- Build editor UI with markdown-first experience
- Add autosave with optimistic updates
- Enable real-time cursors/presence with conflict-free sync
- Support import/export for `.md` files

## 5. Collaboration Features (Weeks 5-6)
- Inline comments and threaded discussions
- Share modal (invite by user/email + role permissions)
- Document list, search, recent docs, and starred docs

## 6. Reliability and Product Polish (Week 7)
- Version history snapshots (manual + timed checkpoints)
- Strong error handling and retries
- Loading/empty states and keyboard shortcuts
- Accessibility pass

## 7. QA and Security (Week 8)
- Unit/integration tests:
  - Editor sync
  - Auth
  - Permissions
- End-to-end tests:
  - Create/edit/share/comment flows
- Security hardening:
  - Authorization checks
  - Rate limiting
  - Input sanitization
  - Basic audit logging

## 8. Deploy to Vercel (Week 8)
- Create Vercel project
- Configure environment variables, DB, and Blob storage
- Enable preview deployments for PRs
- Set up production deploy pipeline
- Add observability (logs, Sentry, uptime checks)

## 9. Post-Launch Roadmap (Phase 2)
- Folder/workspace hierarchy
- Full-text search index
- AI markdown assist (rewrite/summarize)
- Offline mode and local-first sync
- Advanced markdown blocks (tables, diagrams, embeds)

## Suggested First Execution Order (This Week)
1. Finalize MVP feature list and data model.
2. Choose auth provider (Clerk vs NextAuth) and realtime stack (Liveblocks + Yjs).
3. Scaffold Next.js app with Prisma and initial schema.
4. Set up Vercel project with preview deployment.
