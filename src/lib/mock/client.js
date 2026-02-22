// ─── Mock Supabase Client ───
// Drop-in replacement that stores data in localStorage.
// Implements the same chaining API as @supabase/supabase-js.

import * as store from './store';

// ─── Auth State Change Listeners ───
let _authListeners = [];

function notifyAuthListeners(event, session) {
  for (const cb of _authListeners) {
    try { cb(event, session); } catch { /* ignore */ }
  }
}

// ─── Query Builder ───
// Supports: .from(table).select(cols).eq(c,v).order(c,opts).limit(n).single()
//           .from(table).insert(row).select(cols).single()
//           .from(table).update(data).eq(c,v)
//           .from(table).delete().eq(c,v)

class QueryBuilder {
  constructor(table) {
    this._table = table;
    this._select = '*';
    this._filters = [];
    this._order = [];
    this._limit = null;
    this._offset = 0;
    this._single = false;
    this._wantCount = false;
    this._search = null;
    this._insertRow = null;
    this._updateData = null;
    this._isDelete = false;
    this._insertSelect = null;
  }

  select(columns) {
    if (this._insertRow != null) {
      // Chained after .insert() — store the select for the insert return
      this._insertSelect = columns || '*';
      return this;
    }
    this._select = columns || '*';
    return this;
  }

  eq(column, value) {
    this._filters.push([column, value]);
    return this;
  }

  order(column, opts = {}) {
    this._order.push({ column, ascending: opts.ascending !== false });
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  range(from, to) {
    this._offset = from;
    this._limit = to - from + 1;
    return this;
  }

  textSearch(column, query) {
    this._search = query;
    return this;
  }

  single() {
    this._single = true;
    // Return a thenable (like real Supabase) instead of a plain object
    return this;
  }

  // Terminal — resolves the query via .then() when awaited
  then(resolve, reject) {
    try {
      const result = this._resolve();
      // Use queueMicrotask for proper async resolution
      queueMicrotask(() => resolve(result));
    } catch (e) {
      queueMicrotask(() => {
        if (reject) reject(e);
      });
    }
  }

  // Support .catch() for error handling
  catch(onReject) {
    return Promise.resolve(this).catch(onReject);
  }

  _resolve() {
    try {
      // ─── INSERT ───
      if (this._insertRow != null) {
        const { data, error } = store.insert(this._table, this._insertRow);
        if (error) return { data: null, error };

        // If .select() was chained, resolve joins on the inserted row
        if (this._insertSelect) {
          const result = store.query(this._table, {
            filters: [['id', data.id]],
            select: this._insertSelect,
            single: true,
          });
          if (this._single) return result;
          return { data: [result.data], error: null };
        }

        return this._single ? { data, error: null } : { data: [data], error: null };
      }

      // ─── UPDATE ───
      if (this._updateData != null) {
        return store.update(this._table, this._updateData, this._filters);
      }

      // ─── DELETE ───
      if (this._isDelete) {
        return store.remove(this._table, this._filters);
      }

      // ─── SELECT ───
      return store.query(this._table, {
        filters: this._filters,
        select: this._select,
        order: this._order,
        limit: this._limit,
        offset: this._offset,
        single: this._single,
        count: this._wantCount,
        search: this._search,
      });
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  }
}

// ─── Table Entry Point ───

function fromTable(table) {
  return {
    select(columns, opts = {}) {
      const qb = new QueryBuilder(table);
      qb._select = columns || '*';
      if (opts.count === 'exact') qb._wantCount = true;
      return qb;
    },
    insert(row) {
      const qb = new QueryBuilder(table);
      qb._insertRow = row;
      return qb;
    },
    update(data) {
      const qb = new QueryBuilder(table);
      qb._updateData = data;
      return qb;
    },
    delete() {
      const qb = new QueryBuilder(table);
      qb._isDelete = true;
      return qb;
    },
    upsert(row) {
      // Simple upsert: try update, fall back to insert
      const qb = new QueryBuilder(table);
      qb._insertRow = row;
      return qb;
    },
  };
}

// ─── Auth Module ───

const auth = {
  signUp({ email, password, options = {} }) {
    const metadata = options.data || {};
    const { user, error } = store.addAuthUser(email, password, metadata);
    if (error) return Promise.resolve({ data: { user: null, session: null }, error });

    // Create session immediately (no email confirmation in mock)
    const session = { user: { id: user.id, email, user_metadata: metadata }, access_token: 'mock-token-' + user.id };
    store.setSession(session);
    notifyAuthListeners('SIGNED_IN', session);
    return Promise.resolve({ data: { user: session.user, session }, error: null });
  },

  signInWithPassword({ email, password }) {
    const user = store.findAuthUser(email, password);
    if (!user) {
      return Promise.resolve({ data: { user: null, session: null }, error: { message: 'Invalid login credentials' } });
    }
    const session = { user: { id: user.id, email: user.email, user_metadata: user.user_metadata }, access_token: 'mock-token-' + user.id };
    store.setSession(session);
    notifyAuthListeners('SIGNED_IN', session);
    return Promise.resolve({ data: { user: session.user, session }, error: null });
  },

  getUser() {
    const session = store.getSession();
    if (!session) return Promise.resolve({ data: { user: null }, error: null });
    return Promise.resolve({ data: { user: session.user }, error: null });
  },

  getSession() {
    const session = store.getSession();
    return Promise.resolve({ data: { session }, error: null });
  },

  signOut() {
    store.clearSession();
    notifyAuthListeners('SIGNED_OUT', null);
    return Promise.resolve({ error: null });
  },

  onAuthStateChange(callback) {
    _authListeners.push(callback);
    // Fire initial event with current state
    const session = store.getSession();
    if (session) {
      setTimeout(() => callback('INITIAL_SESSION', session), 0);
    }
    return {
      data: {
        subscription: {
          unsubscribe() {
            _authListeners = _authListeners.filter((cb) => cb !== callback);
          },
        },
      },
    };
  },

  exchangeCodeForSession(_code) {
    // No-op for mock — just return success
    return Promise.resolve({ error: null });
  },
};

// ─── RPC ───
function rpc(name, args) {
  const result = store.rpc(name, args);
  return Promise.resolve(result);
}

// ─── Exported Mock Client ───

export function createMockClient() {
  return {
    from: fromTable,
    auth,
    rpc,
  };
}
