// ─── In-Memory Store with localStorage Persistence ───
// Mimics a Supabase/PostgreSQL data layer for local development.

import {
  SEED_PROFILES,
  SEED_FORUMS,
  SEED_THREADS,
  SEED_REPLIES,
  SEED_THREAD_VOTES,
  SEED_REPLY_VOTES,
  SEED_JOURNAL_ENTRIES,
  SEED_JOURNAL_SHARES,
} from './data';

const STORAGE_KEY = 'taper_mock_db';
const SEED_VERSION = 9; // bump to force re-seed

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ─── Bootstrap ───
let _db = null;

function seedData() {
  return {
    _version: SEED_VERSION,
    profiles: [...SEED_PROFILES],
    forums: [...SEED_FORUMS],
    threads: [...SEED_THREADS],
    replies: [...SEED_REPLIES],
    thread_votes: [...SEED_THREAD_VOTES],
    reply_votes: [...SEED_REPLY_VOTES],
    helpful_votes: [],
    journal_entries: [...SEED_JOURNAL_ENTRIES],
    journal_shares: [...SEED_JOURNAL_SHARES],
    _auth_users: [], // email/password credentials
    _auth_session: null, // current session
  };
}

function loadDB() {
  if (_db) return _db;

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed._version === SEED_VERSION) {
          _db = parsed;
          // Auto-login if no session exists
          if (!_db._auth_session && _db.profiles.length > 0) {
            const demoUser = _db.profiles[0];
            _db._auth_session = {
              user: {
                id: demoUser.id,
                email: `${demoUser.display_name.toLowerCase()}@demo.test`,
                user_metadata: { display_name: demoUser.display_name },
              },
            };
            persist();
          }
          return _db;
        }
      }
    } catch {
      // corrupt — re-seed
    }
  }

  _db = seedData();

  // Auto-login with the first seed user for testing
  if (_db.profiles.length > 0 && !_db._auth_session) {
    const demoUser = _db.profiles[0];
    _db._auth_session = {
      user: {
        id: demoUser.id,
        email: `${demoUser.display_name.toLowerCase()}@demo.test`,
        user_metadata: { display_name: demoUser.display_name },
      },
    };
  }

  persist();
  return _db;
}

function persist() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_db));
    } catch {
      // storage full — silently ignore
    }
  }
}

// ─── Low-level accessors ───

export function getTable(name) {
  const db = loadDB();
  if (!db[name]) db[name] = [];
  return db[name];
}

export function getAll(table) {
  return [...getTable(table)];
}

export function getById(table, id) {
  return getTable(table).find((row) => row.id === id) || null;
}

/**
 * Query rows with filters, ordering, joins, limit.
 *
 * @param {string} table
 * @param {object} opts
 * @param {Array<[string, string]>} opts.filters  — [[col, val], ...]
 * @param {string|null} opts.select — PostgREST-style select string (supports joins)
 * @param {Array<{column: string, ascending: boolean}>} opts.order
 * @param {number|null} opts.limit
 * @param {number} opts.offset — number of rows to skip (for pagination)
 * @param {boolean} opts.single — return first row or null
 * @param {boolean} opts.count — if true, include total count before pagination
 * @param {string|null} opts.search — full-text search across title/body/name/description
 * @returns {{ data: any, error: any, count?: number }}
 */
export function query(table, opts = {}) {
  const { filters = [], select = '*', order = [], limit = null, offset = 0, single = false, count: wantCount = false, search = null } = opts;

  let rows = getAll(table);

  // Apply filters
  for (const [col, val] of filters) {
    rows = rows.filter((r) => r[col] === val);
  }

  // Apply full-text search across common text fields
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    rows = rows.filter((r) => {
      const fields = [r.title, r.body, r.name, r.description, r.display_name, r.notes].filter(Boolean);
      return fields.some((f) => f.toLowerCase().includes(q));
    });
  }

  // Apply ordering (stable multi-sort)
  if (order.length) {
    rows.sort((a, b) => {
      for (const { column, ascending } of order) {
        const av = a[column];
        const bv = b[column];
        if (av === bv) continue;
        if (av == null) return 1;
        if (bv == null) return -1;
        // booleans: treat true > false for descending pinned behavior
        if (typeof av === 'boolean') {
          const diff = (av === bv) ? 0 : av ? -1 : 1;
          return ascending ? diff : -diff;
        }
        const cmp = av < bv ? -1 : 1;
        return ascending ? cmp : -cmp;
      }
      return 0;
    });
  }

  // Capture total count after filtering but before pagination
  const totalCount = rows.length;

  // Apply offset and limit (pagination)
  if (offset > 0 || limit != null) {
    const start = offset || 0;
    const end = limit != null ? start + limit : undefined;
    rows = rows.slice(start, end);
  }

  // Apply joins from select string
  rows = applyJoins(rows, table, select);

  // Apply column filtering from select string (only top-level non-join columns)
  rows = applyColumnFilter(rows, select);

  if (single) {
    return { data: rows[0] || null, error: rows[0] ? null : { message: 'Row not found' }, count: wantCount ? totalCount : undefined };
  }

  return { data: rows, error: null, count: wantCount ? totalCount : undefined };
}

/**
 * Parse PostgREST-style select and perform in-memory joins.
 *
 * Supports: "*, profiles:user_id(display_name, is_peer_advisor)"
 * This means: join the "profiles" table where profiles.id === row.user_id
 */
function applyJoins(rows, _table, select) {
  if (!select || select === '*') return rows;

  // Find join patterns: alias:fk_col(col1, col2, ...)
  const joinRegex = /(\w+):(\w+)\(([^)]+)\)/g;
  const joins = [];
  let match;
  while ((match = joinRegex.exec(select)) !== null) {
    joins.push({
      alias: match[1],     // e.g. "profiles" or "forums"
      fkColumn: match[2],  // e.g. "user_id" or "forum_id"
      columns: match[3].split(',').map((c) => c.trim()),
    });
  }

  if (joins.length === 0) return rows;

  return rows.map((row) => {
    const joined = { ...row };
    for (const { alias, fkColumn, columns } of joins) {
      const fkValue = row[fkColumn];
      // The alias IS the table name to join from
      const targetTable = getTable(alias);
      const targetRow = targetTable.find((t) => t.id === fkValue);
      if (targetRow) {
        const picked = {};
        for (const col of columns) {
          if (col === '*') {
            Object.assign(picked, targetRow);
          } else {
            picked[col] = targetRow[col];
          }
        }
        joined[alias] = picked;
      } else {
        joined[alias] = null;
      }
    }
    return joined;
  });
}

/**
 * Filter columns based on select string. If select is '*' or contains '*',
 * keep all columns. Otherwise only keep named columns + join results.
 */
function applyColumnFilter(rows, select) {
  if (!select || select === '*') return rows;

  // Remove join expressions to get plain columns
  const withoutJoins = select.replace(/\w+:\w+\([^)]+\)/g, '').trim();
  // If remaining has *, keep all
  if (withoutJoins.includes('*')) return rows;

  const cols = withoutJoins
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);

  if (cols.length === 0) return rows;

  // Also keep join aliases
  const joinRegex = /(\w+):\w+\([^)]+\)/g;
  let match;
  while ((match = joinRegex.exec(select)) !== null) {
    cols.push(match[1]);
  }

  return rows.map((row) => {
    const filtered = {};
    for (const col of cols) {
      if (col in row) filtered[col] = row[col];
    }
    return filtered;
  });
}

// ─── Mutations ───

export function insert(table, row) {
  const db = loadDB();
  if (!db[table]) db[table] = [];
  const newRow = { id: row.id || uuid(), ...row, created_at: row.created_at || new Date().toISOString(), updated_at: new Date().toISOString() };
  db[table].push(newRow);
  persist();
  return { data: newRow, error: null };
}

export function update(table, data, filters = []) {
  const db = loadDB();
  const rows = db[table] || [];
  let updated = null;
  for (const row of rows) {
    let match = true;
    for (const [col, val] of filters) {
      if (row[col] !== val) { match = false; break; }
    }
    if (match) {
      Object.assign(row, data, { updated_at: new Date().toISOString() });
      updated = row;
    }
  }
  persist();
  return { data: updated, error: updated ? null : { message: 'No rows matched' } };
}

export function remove(table, filters = []) {
  const db = loadDB();
  if (!db[table]) return { data: null, error: null };
  const before = db[table].length;
  db[table] = db[table].filter((row) => {
    for (const [col, val] of filters) {
      if (row[col] !== val) return true;
    }
    return false;
  });
  persist();
  return { data: null, error: before === db[table].length ? { message: 'No rows matched' } : null };
}

// ─── Auth helpers ───

export function getAuthUsers() {
  return loadDB()._auth_users || [];
}

export function addAuthUser(email, password, metadata = {}) {
  const db = loadDB();
  if (!db._auth_users) db._auth_users = [];

  const existing = db._auth_users.find((u) => u.email === email);
  if (existing) return { user: null, error: { message: 'User already registered' } };

  const id = uuid();
  const user = {
    id,
    email,
    password,
    user_metadata: metadata,
    created_at: new Date().toISOString(),
  };
  db._auth_users.push(user);

  // Also create a profile
  insert('profiles', {
    id,
    display_name: metadata.display_name || email.split('@')[0],
    location: null,
    bio: null,
    drug: null,
    duration: null,
    taper_stage: null,
    has_clinician: null,
    drug_signature: null,
    is_peer_advisor: false,
    post_count: 0,
    joined_at: new Date().toISOString(),
  });

  persist();
  return { user, error: null };
}

export function findAuthUser(email, password) {
  const users = getAuthUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  return user || null;
}

export function setSession(session) {
  const db = loadDB();
  db._auth_session = session;
  persist();
}

export function getSession() {
  const db = loadDB();
  return db._auth_session || null;
}

export function clearSession() {
  const db = loadDB();
  db._auth_session = null;
  persist();
}

// ─── RPC ───

export function rpc(name, args) {
  if (name === 'increment_view_count') {
    const tid = args.tid;
    const db = loadDB();
    const thread = (db.threads || []).find((t) => t.id === tid);
    if (thread) {
      thread.view_count = (thread.view_count || 0) + 1;
      persist();
    }
    return { data: null, error: null };
  }
  return { data: null, error: { message: `Unknown RPC: ${name}` } };
}
