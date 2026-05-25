/* theme.js · light / dark toggle (persistent) */

(function () {
  const KEY = 'club5to7:theme';

  function get() {
    return localStorage.getItem(KEY) || 'light';
  }
  function set(mode) {
    localStorage.setItem(KEY, mode);
    apply();
    window.dispatchEvent(new CustomEvent('theme:change', { detail: mode }));
  }
  function apply() {
    document.documentElement.setAttribute('data-theme', get());
  }
  // Apply ASAP to avoid FOUC
  apply();

  window.theme = { get, set, toggle() { set(get() === 'light' ? 'dark' : 'light'); } };
})();
