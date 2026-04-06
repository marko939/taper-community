# Contributing to TaperCommunity

## Established Utilities — Use These, Don't Reinvent

Before writing any data fetching, routing, storage, or realtime subscription code, check if a utility already exists. It almost certainly does.

| Task | Utility | Location |
|------|---------|----------|
| localStorage/sessionStorage | `safeLocal` / `safeSession` | `src/lib/safeStorage.js` |
| Generate UUIDs | `generateId()` | `src/lib/compat.js` |
| Realtime subscriptions | `subscribeWithFallback()` | `src/lib/realtimeAdapter.js` |
| Navigation locking | `acquireNavigationLock()` | `src/lib/navigationLock.js` |
| Fetch with abort cleanup | `useSafeFetch()` | `src/hooks/useSafeFetch.js` |
| Supabase channels in components | `useSupabaseChannel()` | `src/hooks/useSupabaseChannel.js` |
| Event listeners in components | `useEventListener()` | `src/hooks/useEventListener.js` |
| Route cleanup on navigation | `useRouteCleanup()` | `src/hooks/useRouteCleanup.js` |
| Loading skeletons | `<PageSkeleton>` | `src/components/ui/PageSkeleton.jsx` |
| Supabase fetch with retry | `fetchWithRetry()` | `src/lib/fetchWithRetry.js` |

## Required for Every New Page

Every new page component in `src/app/` must have:

1. **`loading.js`** — using `<PageSkeleton>` with the appropriate variant (`feed`, `thread`, `profile`, `list`, `form`)
2. **`error.js`** — using the standard error boundary template
3. **`useRouteCleanup()`** — called at the top of the component

## Required for Every New Store

Every new Zustand store in `src/stores/` must:

1. Implement `cancelAll()` to abort in-flight requests
2. Be registered in `src/components/layout/NavigationObserver.jsx`
3. Be registered in `src/lib/visibilityManager.js` if it has realtime subscriptions

## Query Safety

Every Supabase `.from()` query on a growing table (posts, threads, profiles, notifications, page_views, etc.) must have `.limit()` or `.range()`. The only exceptions are:
- Queries using `{ count: 'exact', head: true }` (DB-side count, no rows fetched)
- Single-record lookups by primary key (annotate with `// unbounded-ok: single record by PK`)
