/* supabase-auth.js · Supabase Auth wrapper for /my-admin
   Uses the same project client as db.js — sessions are shared
   via the Supabase SDK's localStorage store.                   */

(function () {
  const SUPABASE_URL = 'https://pyrsqzlvnhhzokzxxolr.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5cnNxemx2bmhoem9renh4b2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDk2MzEsImV4cCI6MjA5NTI4NTYzMX0.9jtQ6iLWtQlfJf2_fu5ha609044tK7w1dL4NpLTOuUU';

  const _ready = new Promise(resolve => {
    function init() {
      resolve(window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, storageKey: 'club5to7:admin:v1' }
      }));
    }
    if (window.supabase) init();
    else {
      /* CDN loaded by the <script> tag above this one in the HTML */
      document.currentScript?.addEventListener?.('load', init);
      window.addEventListener('load', () => { if (window.supabase) init(); }, { once: true });
    }
  });

  window.supabaseAuth = {
    async signIn(email, password) {
      const c = await _ready;
      return c.auth.signInWithPassword({ email, password });
    },
    async signOut() {
      const c = await _ready;
      await c.auth.signOut();
    },
    async getUser() {
      const c = await _ready;
      const { data: { user } } = await c.auth.getUser();
      return user;
    },
    async resetPassword(email) {
      const c = await _ready;
      return c.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/my-admin.html'
      });
    },
    async updatePassword(newPassword) {
      const c = await _ready;
      return c.auth.updateUser({ password: newPassword });
    },
    onAuthChange(cb) {
      _ready.then(c => c.auth.onAuthStateChange(cb));
    }
  };
})();
