/* theme.js · single dark theme — no toggle */

(function () {
  document.documentElement.removeAttribute('data-theme');
  window.theme = {
    get() { return 'dark'; },
    set() {},
    toggle() {}
  };
})();
