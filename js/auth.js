/* auth.js · mock session.
   In production: replace with supabase.auth */

(function () {
  const KEY = 'club5to7:session';

  function get() {
    try { return JSON.parse(sessionStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function set(s) {
    if (s) sessionStorage.setItem(KEY, JSON.stringify(s));
    else sessionStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent('auth:change', { detail: s }));
  }

  const auth = {
    current() { return get(); },
    isAdmin() { const s = get(); return s && s.role === 'admin'; },
    isMember() { return !!get(); },
    signInDemo(handle = 'rahel.k', role = 'member') {
      set({ handle, role, signedInAt: Date.now() });
      return get();
    },
    signInAdmin(password) {
      // Demo gate. In production: real password / OAuth / magic link.
      const SET = JSON.parse(localStorage.getItem('club5to7:v1') || '{}').site_settings;
      const adminPass = (SET && SET.admin_password) || 'cinema';
      if (password === adminPass) {
        set({ handle: 'curator', role: 'admin', signedInAt: Date.now() });
        return true;
      }
      return false;
    },
    signOut() { set(null); }
  };
  window.auth = auth;
})();
