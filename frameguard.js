/* Clickjacking guard for static hosting (GitHub Pages cannot send X-Frame-Options / frame-ancestors). */
(function () {
  try {
    if (window.top !== window.self) window.top.location = window.self.location;
  } catch (e) {
    document.documentElement.style.display = 'none';
  }
})();
