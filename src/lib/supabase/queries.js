// Shared Supabase `.select()` column templates.
//
// Pure string constants — no imports, no runtime cost, tree-shakable.
// Template strings differ by shape (which profile columns the consumer needs)
// so we keep four explicit variants rather than a superset that would
// over-fetch on card views.
//
// Adding a new profile column? Update PROFILE_FIELDS_DETAIL first, then the
// narrower shapes as needed. All call sites re-read the constants on import,
// so no grep-and-replace across stores.

// Compact — hot/new/followed/search cards (minimal attribution)
export const PROFILE_FIELDS_COMPACT =
  'profiles:user_id(display_name, is_peer_advisor, avatar_url, is_founding_member)';

// Forum-list card — adds drug/taper-stage context for per-forum thread lists
export const PROFILE_FIELDS_FORUM_CARD =
  'profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, drug_signature, avatar_url, is_founding_member)';

// Full — thread detail + reply bodies (includes location + post_count)
export const PROFILE_FIELDS_DETAIL =
  'profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, post_count, drug_signature, location, avatar_url, is_founding_member)';

// Blog comments — no post_count, no location
export const PROFILE_FIELDS_BLOG_COMMENT =
  'profiles:user_id(display_name, avatar_url, is_peer_advisor, drug, taper_stage, is_founding_member)';

// Thread → forum relation (used alongside the profile join)
export const THREAD_FORUM_RELATION =
  'thread_forums(forum_id, forums:forum_id(name, slug, drug_slug))';
