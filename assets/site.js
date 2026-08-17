/* KORE — findshim.com
 *
 * The only script on the site: a header hairline and a scroll reveal. Both are
 * progressive enhancement. The `js` class that arms the reveal is set by a
 * one-liner in each page's <head>, not here — so a page whose script never
 * loads shows all of its content rather than none of it, and there is no frame
 * in which visible content is hidden again.
 */
(function () {
  'use strict';

  function init() {
    var reduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Header hairline once the page has scrolled ------------------------
    var header = document.querySelector('.site-header');
    if (header) {
      var onScroll = function () {
        header.classList.toggle('is-stuck', window.scrollY > 4);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // --- Reveal on scroll --------------------------------------------------
    var targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    if (reduced || !('IntersectionObserver' in window)) {
      for (var i = 0; i < targets.length; i++) targets[i].classList.add('is-in');
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    targets.forEach(function (el, index) {
      // A short stagger inside one group reads as one movement rather than as
      // several; anything longer starts to look like the page loading slowly.
      el.style.transitionDelay = (index % 4) * 70 + 'ms';
      io.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
