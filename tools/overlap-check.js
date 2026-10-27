// Dev check: paste into the console (or eval it) on any page — lists text and
// image boxes that intersect. Not loaded by the site.
(() => {
  document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in'));
  const items = [];
  const visible = (e) => {
    // the body of a closed <details> is not drawn, whatever its styles say
    const shut = e.closest('details:not([open])');
    if (shut && !e.closest('summary')) return false;
    for (let n = e; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
    }
    return true;
  };
  const desc = (e) => {
    const c = typeof e.className === 'string' ? e.className : (e.className && e.className.baseVal) || '';
    const t = (e.textContent || e.getAttribute('src') || '').trim().replace(/\s+/g, ' ').slice(0, 28);
    return `${e.tagName.toLowerCase()}${c ? '.' + c.split(' ').join('.') : ''}「${t}」`;
  };
  // text: one box per text node (the glyphs, not the block)
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode()); ) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || el.closest('script,style,noscript,.marquee,.sr-only') || !visible(el)) continue;
    const r = document.createRange();
    r.selectNodeContents(n);
    for (const b of r.getClientRects()) {
      if (b.width > 1 && b.height > 1) items.push({ el, box: b, kind: 'text' });
    }
  }
  // media: images and top-level svgs
  document.querySelectorAll('img, svg').forEach((el) => {
    if (el.closest('svg') !== el && el.tagName.toLowerCase() !== 'img') return;
    if (el.closest('.marquee') || !visible(el)) return;
    const b = el.getBoundingClientRect();
    if (b.width > 2 && b.height > 2) items.push({ el, box: b, kind: 'media' });
  });
  const out = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
      if (a.kind === 'media' && b.kind === 'media') continue; // phones stacking is the design
      const w = Math.min(a.box.right, b.box.right) - Math.max(a.box.left, b.box.left);
      const h = Math.min(a.box.bottom, b.box.bottom) - Math.max(a.box.top, b.box.top);
      if (w > 1.5 && h > 1.5) {
        out.push(`${Math.round(w * h)}px² ${desc(a.el)} × ${desc(b.el)} @y${Math.round(a.box.top + scrollY)}`);
      }
    }
  }
  return { width: innerWidth, count: out.length, out: [...new Set(out)].slice(0, 60) };
})();
