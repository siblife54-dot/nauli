(() => {
  const stalePricingAnchor = location.hash === '#tarifeler';
  const navigation = performance.getEntriesByType('navigation')[0];
  const startAtTop = navigation?.type !== 'back_forward' && (!location.hash || stalePricingAnchor);
  if (stalePricingAnchor) history.replaceState(history.state, '', location.pathname + location.search);

  // Run before the target is parsed: stale fragment and scroll restoration must
  // not navigate a fresh visit/reload to the previous pricing position.
  if (startAtTop) {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    let interacted = false;
    const markInteraction = () => { interacted = true; };
    const events = ['pointerdown', 'touchstart', 'wheel', 'keydown'];
    events.forEach(name => addEventListener(name, markInteraction, { passive: true }));
    addEventListener('pageshow', event => requestAnimationFrame(() => {
      if (!event.persisted && !interacted) scrollTo({ top: 0, left: 0, behavior: 'instant' });
      history.scrollRestoration = previousRestoration;
      events.forEach(name => removeEventListener(name, markInteraction));
    }), { once: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const link = document.querySelector('.hero__cta');
    const target = document.getElementById('tarifeler');
    if (!link || !target) return;
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const heading = target.querySelector('h2');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
      target.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  }, { once: true });
})();
