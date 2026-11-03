import { resolveTestCheckout } from './test-checkout-logic.mjs?v=20261103-1';

const state = resolveTestCheckout(location.search);
if (state.kind !== 'hidden') {
  const panel = document.getElementById('test-checkout');
  panel.hidden = false;
  if (state.kind === 'ready') {
    const link = panel.querySelector('[data-test-checkout-link]');
    link.href = state.paymentLink;
    link.hidden = false;
    panel.querySelector('[data-test-checkout-disabled]').hidden = true;
  } else {
    panel.querySelector('[data-test-checkout-status]').textContent = 'Тестовая ссылка Stripe ещё не подключена.';
  }
}
