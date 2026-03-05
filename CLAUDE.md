# TaperCommunity — Project Context

## Working Directory
`/Users/markoboskovic/Downloads/taper-gpt/`

## Stack
- Next.js 15 (App Router, `use client` components)
- Zustand for state management (stores in `src/stores/`)
- Supabase (auth, database, realtime) — singleton client in `src/lib/supabase/client.js`
- Deployed on Vercel at taper.community

## Git Remotes
- `origin` → `tapermeds-frontend` repo
- `community` → `taper-community` repo (deploys to taper.community)
- Push to both: `git push origin master && git push community master:main`

## Key Directories
- `src/app/` — Next.js pages and API routes
- `src/stores/` — Zustand stores (authStore, forumStore, threadStore, followStore, journalStore, etc.)
- `src/components/` — React components (shared/, thread/, forums/, journal/, home/)
- `src/lib/` — Utilities (supabase client, ensureSession, linkify, fireAndForget)
- `src/hooks/` — Custom hooks (useAuth, useRequireAuth)

## Important Patterns
- Supabase client is a singleton — never create a second instance
- All mutations call `ensureSession()` before insert/update to prevent stale auth
- Stores use `*Loaded` flags to prevent redundant re-fetches
- `.npmrc` has `legacy-peer-deps=true` for React 19 + emoji-mart compatibility

## Dev Server
```bash
npx next dev -p 3001
```
