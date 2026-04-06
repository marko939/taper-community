## Summary
<!-- Brief description of changes -->

## Performance & Stability Checklist
- [ ] Every `fetch()` in `useEffect` uses `useSafeFetch`
- [ ] Every `supabase.channel()` uses `useSupabaseChannel`
- [ ] Every `addEventListener` uses `useEventListener`
- [ ] Every new page has `loading.js` and `error.js`
- [ ] Every new store is registered in `NavigationObserver`
- [ ] Every `supabase.from()` query on a growing table has `.limit()` or `.range()`
- [ ] No direct `localStorage`/`sessionStorage` — use `safeStorage`
- [ ] No direct `crypto.randomUUID()` — use `generateId()`
- [ ] Every new page component calls `useRouteCleanup()`
- [ ] New realtime subscriptions use `subscribeWithFallback` from `realtimeAdapter`
