(() => {
  const root = document.querySelector('[data-discovery]');
  if (!root) return;

  const form = root.querySelector('form');
  const steps = [...root.querySelectorAll('[data-step]')];
  const inputs = [...form.querySelectorAll('input[type="checkbox"]')];
  const progress = root.querySelector('.discovery__progress');
  const segments = [...progress.children];
  const heading = root.querySelector('#discovery-step-title');
  const stepNumber = root.querySelector('[data-step-number]');
  const back = root.querySelector('.discovery__back');
  const next = root.querySelector('.discovery__next');
  const nextLabel = next.querySelector('span');
  const summary = root.querySelector('.discovery__summary');
  const summaryHeading = summary.querySelector('h3');
  const selectionList = summary.querySelector('.discovery__selection-list');
  const empty = summary.querySelector('.discovery__empty');
  const counter = root.querySelector('output');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const selected = new Set();
  let currentStep = 0;
  let transition;

  function updateSelection() {
    for (const input of inputs) {
      input.closest('.problem-option').classList.toggle('is-selected', input.checked);
      if (input.checked) selected.add(input.value);
      else selected.delete(input.value);
    }
    counter.value = `${selected.size} / ${inputs.length} seçildi`;
  }

  function enterView(element, focusTarget) {
    transition?.cancel();
    if (!reducedMotion.matches && typeof element.animate === 'function') {
      transition = element.animate(
        [{ opacity: 0, transform: 'translateY(7px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 240, easing: 'ease-out' }
      );
    }
    focusTarget.focus({ preventScroll: true });
    root.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
  }

  function showStep(index) {
    currentStep = index;
    summary.hidden = true;
    form.hidden = false;
    steps.forEach((step, i) => { step.hidden = i !== index; });
    progress.classList.remove('is-complete');
    segments.forEach((segment, i) => {
      if (i === index) segment.setAttribute('aria-current', 'step');
      else segment.removeAttribute('aria-current');
    });
    heading.textContent = steps[index].querySelector('legend').textContent;
    stepNumber.textContent = index + 1;
    stepNumber.parentElement.setAttribute('aria-label', `Adım ${index + 1} / ${steps.length}`);
    back.hidden = index === 0;
    nextLabel.textContent = index === steps.length - 1 ? 'Seçimlerimi gör' : 'Devam et';
    enterView(root.querySelector('.discovery__steps'), heading);
  }

  function showSummary() {
    selectionList.replaceChildren();
    for (const input of inputs) {
      if (!selected.has(input.value)) continue;
      const item = document.createElement('li');
      item.textContent = input.closest('label').querySelector('.problem-option__text').textContent;
      selectionList.append(item);
    }
    empty.hidden = selected.size > 0;
    selectionList.hidden = selected.size === 0;
    form.hidden = true;
    summary.hidden = false;
    progress.classList.add('is-complete');
    segments.forEach(segment => segment.removeAttribute('aria-current'));
    enterView(summary, summaryHeading);
  }

  form.addEventListener('change', updateSelection);
  form.addEventListener('submit', event => {
    event.preventDefault();
    updateSelection();
    if (currentStep < steps.length - 1) showStep(currentStep + 1);
    else showSummary();
  });
  back.addEventListener('click', () => showStep(Math.max(0, currentStep - 1)));
  root.querySelector('.discovery__edit').addEventListener('click', () => showStep(0));
  window.addEventListener('pageshow', updateSelection);
  updateSelection();
  // Enable navigation only after the handler that prevents form transmission is ready.
  next.disabled = false;
})();
