# TaperCommunity — Full Codebase Audit Report

## AUDIT SUMMARY

Total findings: 32
- CRITICAL: 4
- HIGH: 23
- MEDIUM: 4
- LOW: 1

Estimated freeze risk with current codebase: **MEDIUM** (down from HIGH after v3 fixes)
Browsers currently broken or severely degraded: **None** (Brave and Safari now have fallbacks)

---

## CRITICAL FINDINGS

### [C1] Unbounded analytics queries fetch ALL rows from profiles, threads, replies
File: `src/app/api/analytics/route.js`
Lines: 468-473, 547-548, 634-637
Pattern: #8 (No pagination — unbounded data fetches)
Current behaviour: `fetchEngagement()`, `fetchChurnRisk()`, `fetchPeakHours()`, `fetchTopMembers()`, `fetchTimeToFirstPost()` all fetch entire tables without `.limit()`.
Required fix: Add `.limit()` to all queries in analytics route, or use Supabase RPC functions with aggregation logic pushed to the database.

### [C2] AISidebar fetch in useEffect without AbortSignal
File: `src/components/thread/AISidebar.jsx`
Line: 17
Pattern: #2 (Fetch requests that outlive their component)
Current behaviour: `fetch('/api/ai-summary?threadId=...')` runs in useEffect without AbortController — if user navigates away, the response writes to unmounted component state.
Required fix: Add AbortController, pass signal to fetch, abort in cleanup.

### [C3] Admin analytics page fetch without AbortSignal
File: `src/app/admin/analytics/page.js`
Line: 27
Pattern: #2 (Fetch requests that outlive their component)
Current behaviour: `fetch('/api/analytics')` in useEffect with no AbortController.
Required fix: Add AbortController with cleanup.

### [C4] Zero error.js boundaries across entire app
File: All 35 pages in `src/app/`
Pattern: #9 (No Suspense/error boundaries)
Current behaviour: If any data fetch throws, the entire page crashes to a white screen with no recovery path.
Required fix: Add `error.js` to at minimum: `/forums/[drugSlug]/`, `/thread/[threadId]/`, `/profile/[userId]/`, `/messages/`, `/journals/`, root `/`.

---

## HIGH FINDINGS

### [H1–H19] 19 pages missing loading.js — blank screen during navigation
Pattern: #9 (No Suspense boundaries — freezes instead of skeletons)

Pages missing `loading.js` (HIGH severity only — pages with data fetches):

| # | Page | Queries on mount |
|---|------|-----------------|
| H1 | `src/app/page.js` (Home) | 3+ (hot threads, new threads, blog) |
| H2 | `src/app/journals/page.js` | 2 (entries + assessments) |
| H3 | `src/app/messages/page.js` | 2 (conversations + messages) |
| H4 | `src/app/forums/page.js` | 2 (forums + threads) |
| H5 | `src/app/settings/page.js` | 1 (profile) |
| H6 | `src/app/education/page.js` | Content-heavy |
| H7 | `src/app/resources/page.js` | 1 (blog posts) |
| H8 | `src/app/onboarding/page.js` | Multi-step form |
| H9 | `src/app/admin/analytics/page.js` | 1 (heavy analytics) |
| H10 | `src/app/admin/match-requests/page.js` | 1 (match requests) |
| H11 | `src/app/journey/[username]/page.js` | 2+ (profile + activity) |
| H12 | `src/app/drugs/page.js` | 1 (drug directory) |
| H13 | `src/app/drugs/[drugSlug]/page.js` | 1 (drug detail) |
| H14 | `src/app/resources/blog/[slug]/page.js` | 1 (blog post) |
| H15 | `src/app/resources/blog/admin/page.js` | 1 (post editor) |
| H16 | `src/app/journal/[shareId]/page.js` | 1 (shared journal) |
| H17 | `src/app/deprescribers/page.js` | 1 (map + data) |
| H18 | `src/app/metabolic/page.js` | Content page |
| H19 | `src/app/tools/meal-generator/page.js` | Tool with fetch |

### [H20] Fire-and-forget vote API calls without error handling
File: `src/stores/threadStore.js`
Lines: 498, 583
Pattern: #2 (Fetch requests without cleanup)
Current behaviour: Vote and helpful-mark API calls use `fetch()` without AbortSignal or proper error recovery. If the network fails, the optimistic UI update persists but the server state diverges.
Required fix: Add error handling that reverts optimistic state on failure.

### [H21] DM notification fetch fire-and-forget
File: `src/stores/messageStore.js`
Line: 208
Pattern: #2 (Fetch that outlives component)
Current behaviour: `fetch('/api/dm-notification', ...)` with `.catch(() => {})` — silent failure is intentional but no retry mechanism.
Required fix: LOW RISK — acceptable as fire-and-forget since DM notification is best-effort. No action needed.

### [H22] ProviderPDFButton fetches without AbortSignal
File: `src/components/journal/ProviderPDFButton.jsx`
Lines: 41, 99
Pattern: #2 (Fetch without abort)
Current behaviour: PDF generation fetches in async handlers without AbortSignal. If user clicks away during generation, the fetch continues in background.
Required fix: Track in-flight state and cancel on unmount.

### [H23] Sticky positioning missing -webkit-sticky prefix
File: `src/components/layout/Navbar.jsx:31`, `Sidebar.jsx:122,257`, `MetabolicEducation.jsx:416`, `DrugAutocomplete.jsx:181`
Pattern: #13 (CSS not cross-browser)
Current behaviour: Tailwind `sticky` class only generates `position: sticky` — older Safari (<13) and some iOS Safari versions require `-webkit-sticky`.
Required fix: Add to `globals.css`: `.sticky { position: -webkit-sticky; position: sticky; }` or verify Tailwind PostCSS autoprefixer handles this.

---

## MEDIUM FINDINGS

### [M1] Backdrop-blur on Navbar may need -webkit prefix
File: `src/components/layout/Navbar.jsx:31`
Pattern: #13 (CSS not cross-browser)
Current behaviour: `backdrop-blur-xl` generates `backdrop-filter: blur()` — older Safari needs `-webkit-backdrop-filter`.
Required fix: Verify Tailwind autoprefixer generates the vendor prefix. If not, add to globals.css.

### [M2] forumStore and messageStore not explicitly cleaned in NavigationObserver
File: `src/components/layout/NavigationObserver.jsx`
Pattern: #4 (Store state accumulating)
Current behaviour: NavigationObserver calls `pruneCache` on thread/profile/blog/journal stores but does NOT call `cancelAll()` on forumStore or messageStore.
Required fix: LOW RISK — these stores are cleaned via visibilityManager on tab hide. But explicit cleanup on navigation would be more robust.

### [M3] useRouteHealthCheck uses require() in async context
File: `src/hooks/useRouteHealthCheck.js:60`
Pattern: Code quality
Current behaviour: `require('@/stores/authStore')` used inside a `.then()` callback — mixing ESM imports with CommonJS require.
Required fix: Import authStore at top of file like other stores.

### [M4] Pre-existing ESLint errors in email templates
File: `src/lib/email/templates/*.jsx` (6 files)
Pattern: Code quality
Current behaviour: ~50 `react/no-unescaped-entities` errors in email templates (apostrophes not escaped).
Required fix: Replace `'` with `&apos;` in email template JSX.

---

## LOW FINDINGS

### [L1] useSupabaseChannel hook defined but not used by any component
File: `src/hooks/useSupabaseChannel.js`
Pattern: Code quality
Current behaviour: The hook is a well-implemented channel wrapper but no component or page uses it — all realtime is in stores.
Required fix: No action needed — keep as utility for future use.

---

## CLEAN PATTERNS (correctly implemented — do not break)

### Realtime Channel Management
- `src/stores/messageStore.js` — Stale channel prefix cleanup before subscribe, proper removeChannel on unsubscribe
- `src/stores/notificationStore.js` — Same pattern
- `src/hooks/useSupabaseChannel.js` — Best-practice hook with duplicate prevention and guaranteed cleanup

### Fetch Abort Pattern
- All 8 major stores implement `cancelAll()` with AbortController management
- `src/hooks/useSafeFetch.js` — Component-level abort tracking
- `src/lib/fetchWithRetry.js` — Auth-refresh retry with AbortSignal support

### Event Listener Cleanup
- ALL 23 addEventListener calls across the codebase have corresponding removeEventListener in useEffect cleanup
- ResizeObserver (1 instance) — proper `.disconnect()`
- IntersectionObserver (2 instances) — proper `.disconnect()`
- All setTimeout/setInterval IDs stored and cleared

### Session Resilience
- `src/lib/ensureSession.js` — 6s timeout, retry-once pattern, null handling
- `src/lib/visibilityManager.js` — Re-entrant guard, per-store error boundaries, heartbeat + session health check on tab return
- `src/lib/sessionHealthCheck.js` — Safari ITP detection with user-facing toast
- `src/lib/realtimeGuard.js` — 30s heartbeat detecting dead WebSocket channels

### Cross-Browser Safety
- `src/lib/safeStorage.js` — Safe localStorage/sessionStorage wrapper used in all 7 consumer files
- `src/lib/compat.js` — `generateId()` with crypto.randomUUID fallback, `scheduleIdle()` with requestIdleCallback fallback
- `src/lib/realtimeAdapter.js` — WebSocket test + polling fallback for Brave

### Navigation Stability
- `src/lib/navigationLock.js` — 1.5s auto-release preventing double-navigation
- `src/components/layout/NavigationObserver.jsx` — Cache pruning on every route change
- `src/hooks/useRouteCleanup.js` — Store cancellation on unmount

### Diagnostics (gated behind NEXT_PUBLIC_DIAG_MODE)
- `src/lib/diagnostics/perfAudit.js` — 5s interval with browser detection and channel state
- `src/lib/diagnostics/compatAudit.js` — One-time browser capability check
- `src/lib/diagnostics/wsHealthMonitor.js` — 10s WebSocket health monitoring
- `src/lib/diagnostics/navigationStressTest.js` — Route stress test with abort tracking

---

## RECOMMENDED FIX ORDER

1. **[C1]** Add `.limit()` to all unbounded analytics queries (prevents OOM on growing tables)
2. **[C4]** Add `error.js` to 6 critical route segments (prevents white-screen crashes)
3. **[C2]** Add AbortController to AISidebar fetch (prevents memory leak)
4. **[C3]** Add AbortController to admin analytics fetch
5. **[H1–H19]** Add `loading.js` to 19 high-traffic pages (prevents perceived freezes)
6. **[H20]** Add error recovery to vote API calls
7. **[H23]** Add `-webkit-sticky` CSS fallback
8. **[M3]** Fix require() usage in useRouteHealthCheck
9. **[M4]** Fix ESLint errors in email templates
10. **[M1]** Verify backdrop-filter vendor prefix
11. **[M2]** Add explicit store cleanup in NavigationObserver

---

## GUARDRAIL RECOMMENDATIONS

### ESLint Rules (already partially implemented in eslint.config.mjs)
1. `no-restricted-globals` — Ban direct `localStorage`, `sessionStorage` (already active)
2. `no-restricted-properties` — Ban `crypto.randomUUID` (already active)
3. **NEW**: Custom rule or lint script: flag any `fetch(` inside `useEffect` without `AbortController` in the same scope
4. **NEW**: Custom rule: flag `supabase.from(...).select(...)` without `.limit()` or `.range()` in non-server files

### TypeScript Strict Checks (if migrating)
- Enable `noUncheckedIndexedAccess` to catch potential undefined access on query results
- Enable `strictNullChecks` to catch session assumption issues

### Code Review Checklist (for every PR)
- [ ] Every `fetch()` in a `useEffect` has an `AbortController` with cleanup
- [ ] Every `supabase.from()` query on unbounded tables has `.limit()` or `.range()`
- [ ] Every new page has `loading.js` and `error.js` in its route segment
- [ ] No direct `localStorage`/`sessionStorage` access (use `safeStorage`)
- [ ] No direct `crypto.randomUUID()` (use `generateId()`)
- [ ] Every `addEventListener` has a corresponding `removeEventListener` in cleanup
- [ ] Every `supabase.channel()` creation checks for existing channels first
- [ ] Store state that accumulates is included in `pruneCache` or `cancelAll` patterns
- [ ] New realtime subscriptions use the adapter (`subscribeWithFallback`)
