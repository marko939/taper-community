## Summary
<!-- Brief description of changes -->

## Performance & Stability Checklist
- [ ] Every `fetch()` inside `useEffect` has `AbortController` with cleanup
- [ ] Every `supabase.from()` query on posts/profiles/threads/notifications has `.limit()` or `.range()`
- [ ] Every new page has `loading.js` and `error.js` in its route segment
- [ ] No direct `localStorage`/`sessionStorage` — use `safeStorage`
- [ ] No direct `crypto.randomUUID()` — use `generateId()` from `compat.js`
- [ ] Every `addEventListener` has `removeEventListener` in the same `useEffect` cleanup
- [ ] New realtime subscriptions use `subscribeWithFallback` from `realtimeAdapter`
- [ ] Any new store slices that are route-specific are added to `pruneCache` or `cancelAll`
