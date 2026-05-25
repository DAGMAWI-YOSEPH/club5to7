/* auth.js · session management
   Uses localStorage so session persists across page loads.
   Supabase Auth sign-in (in shell.js) also calls signInDemo to sync here. */

(function () {
  const KEY = 'club5to7:session:v2';

  function get() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function set(s) {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent('auth:change', { detail: s }));
  }

  const auth = {
    current() { return get(); },
    isAdmin() { const s = get(); return s && s.role === 'admin'; },
    isMember() { return !!get(); },
    signInDemo(handle = 'member', role = 'member') {
      set({ handle, role, signedInAt: Date.now() });
      return get();
    },
    signInAdmin(password) {
      if (password === 'cinema') {
        set({ handle: 'curator', role: 'admin', signedInAt: Date.now() });
        return true;
      }
      return false;
    },
    signOut() { set(null); }
  };
  window.auth = auth;
})();
