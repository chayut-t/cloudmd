# cloudmd

CloudMD is an MVP collaborative markdown editor built with Next.js (App Router), TypeScript (strict mode), Bun, and Google OAuth via NextAuth.

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
- `AUTH_SECRET`: any long random string
- `AUTH_URL`: `http://localhost:3000`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

4. In Google Cloud OAuth settings, add this callback URL:
- `http://localhost:3000/api/auth/callback/google`

5. Start the app:

```bash
bun dev
```

Then open `http://localhost:3000`.

## MVP implemented in this repo

- Google sign-in
- Document list + create
- Markdown editor (textarea-based)
- Autosave
- Manual snapshots + automatic checkpoints
- Commenting with optional text-range anchors
- Member roles (`OWNER`, `EDITOR`, `VIEWER`) and sharing by email

## Notes

- Data is stored locally in `data/db.json` for MVP speed.
- This is suitable for local testing; production should migrate persistence to a managed database before Vercel deployment.
