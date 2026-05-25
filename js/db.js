/* ─────────────────────────────────────────────────────────────────
   db.js · Supabase client
   Same public API as the localStorage prototype — every other file
   keeps working unchanged.

   Singletons (site_settings, current_pick, current_theme, next_theme)
   live in the `kv_store` table as { key, value: jsonb }.
   ───────────────────────────────────────────────────────────────── */

(function () {
  const SUPABASE_URL = 'https://pyrsqzlvnhhzokzxxolr.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5cnNxemx2bmhoem9renh4b2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDk2MzEsImV4cCI6MjA5NTI4NTYzMX0.9jtQ6iLWtQlfJf2_fu5ha609044tK7w1dL4NpLTOuUU';

  /* Resolves to the Supabase client once the CDN lib is ready */
  const _ready = new Promise(resolve => {
    function init() {
      resolve(window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
    }
    if (window.supabase) {
      init();
    } else {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      s.onload = init;
      s.onerror = () => console.error('[db] Failed to load Supabase client');
      document.head.appendChild(s);
    }
  });

  const db = {

    /* ── list ──────────────────────────────────────────────────── */
    async list(table, { sortBy, desc = false, where } = {}) {
      const c = await _ready;
      let q = c.from(table).select('*');
      if (where) Object.entries(where).forEach(([k, v]) => { q = q.eq(k, v); });
      if (sortBy) q = q.order(sortBy, { ascending: !desc });
      const { data, error } = await q;
      if (error) { console.error('[db.list]', table, error.message); return []; }
      return data || [];
    },

    /* ── insert ────────────────────────────────────────────────── */
    async insert(table, row) {
      const c = await _ready;
      const { id: _id, created_at: _ca, ...rest } = row;
      const { data, error } = await c.from(table).insert(rest).select().single();
      if (error) { console.error('[db.insert]', table, error.message); return null; }
      return data;
    },

    /* ── update ────────────────────────────────────────────────── */
    async update(table, id, patch) {
      const c = await _ready;
      const { data, error } = await c
        .from(table)
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) { console.error('[db.update]', table, error.message); return null; }
      return data;
    },

    /* ── remove ────────────────────────────────────────────────── */
    async remove(table, id) {
      const c = await _ready;
      const { error } = await c.from(table).delete().eq('id', id);
      if (error) { console.error('[db.remove]', table, error.message); return false; }
      return true;
    },

    /* ── get · singleton from kv_store ────────────────────────── */
    async get(key, fallback = null) {
      const c = await _ready;
      const { data, error } = await c
        .from('kv_store')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      if (error) { console.error('[db.get]', key, error.message); return fallback; }
      return data ? data.value : fallback;
    },

    /* ── set · singleton upsert into kv_store ──────────────────── */
    async set(key, value) {
      const c = await _ready;
      const { data, error } = await c
        .from('kv_store')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
        .select('value')
        .single();
      if (error) { console.error('[db.set]', key, error.message); return value; }
      return data?.value ?? value;
    },

    /* ── subscribe · Supabase Realtime ─────────────────────────── */
    subscribe(table, fn) {
      _ready.then(c => {
        c.channel(`public:${table}`)
          .on('postgres_changes', { event: '*', schema: 'public', table }, async () => {
            const { data } = await c.from(table).select('*');
            fn(data || []);
          })
          .subscribe();
      });
      return () => {};
    },

    /* ── diagnostic stubs (kept so admin reset button doesn't throw) */
    _raw() { return {}; },
    _reset() { console.warn('[db] _reset() is a no-op with Supabase — use Dashboard → Table Editor.'); },
    _import() { console.warn('[db] _import() is a no-op with Supabase.'); }
  };

  window.db = db;
})();
