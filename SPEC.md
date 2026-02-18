# CloudMD Spec

## MVP

### Objective
Deliver a collaborative markdown editor where multiple users can create, edit, share, and comment on documents in real time with reliable autosave.

### Technical Stack (Locked for MVP)
- Framework: Next.js
- Language: TypeScript with strict typing (`strict: true`)
- Runtime/package manager: Bun
- Deployment target: Vercel

### Target Users
- Individual writers and developers working in markdown
- Small teams collaborating on technical docs

### In Scope
- Authentication via Google account (OAuth) and user accounts
- Create, open, rename, and delete markdown documents
- Rich markdown editing experience (headings, lists, code, links, quotes, inline formatting)
- Real-time collaboration:
  - Multi-user editing on the same document
  - Presence indicators (who is in the doc)
  - Cursor/selection visibility
- Comments:
  - Inline comments anchored to text ranges
  - Threaded replies in each comment thread
- Sharing and permissions:
  - Invite collaborators by user/email
  - Roles: owner, editor, viewer
- Autosave and persistence:
  - Near real-time autosave while typing
  - Recovery of latest saved state on refresh/reopen
- Version snapshots:
  - Manual snapshot creation
  - Time-based checkpoints
- Basic document management:
  - Document list
  - Search by title
  - Recent documents
- Deployable to Vercel with environment-based configuration

### Non-Goals (MVP)
- Full Google Docs feature parity
- Advanced table editing and layout controls
- Plugin marketplace
- Offline-first sync
- AI-assisted writing tools
- Additional auth providers beyond Google (email/password, GitHub, enterprise SSO)

### MVP Success Criteria
- Two or more users can edit the same document concurrently without destructive conflicts
- P95 save latency stays within an acceptable interactive range (target: <= 2s)
- Reopening a document restores the latest saved content reliably
- Permission rules consistently prevent unauthorized edits

### MVP Data Model (Initial)
- `users`: account identity and profile (including Google account identifier)
- `documents`: document metadata and current content pointer
- `document_members`: role-based access per document
- `document_versions`: immutable snapshots/checkpoints
- `comments`: threaded inline discussion items anchored to document ranges

### Out-of-Scope Integrations (MVP)
- Third-party storage providers (Google Drive, Notion, Dropbox)
- External publishing workflows

## Features To Be Added Later

### Authentication and Access
- Additional sign-in providers (GitHub, email magic link)
- Enterprise SSO options

### Collaboration and Workspace
- Folder/workspace hierarchy
- Shared team spaces and organization-level permissions
- Starred/favorites and advanced sorting/filtering

### Editor and Content
- Advanced markdown blocks (tables, diagrams, embeds)
- Reusable templates/snippets
- Better export options (PDF, HTML, docs site formats)

### Search and Discovery
- Full-text search across document content
- Semantic search and smarter ranking

### Intelligence
- AI-assisted rewrite/summarize/outline for markdown
- Comment resolution suggestions and drafting assistance

### Platform and Reliability
- Offline mode with local-first sync
- Stronger audit logs and compliance-oriented history
- Advanced analytics and usage insights
