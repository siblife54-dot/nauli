import { TEST_CHECKOUT } from './test-checkout-config.mjs?v=20261103-1';

export function resolveTestCheckout(search, paymentLink = TEST_CHECKOUT.paymentLink) {
  const params = new URLSearchParams(search);
  if (params.getAll('test_checkout').length !== 1 || params.get('test_checkout') !== '1' || params.has('plan') || params.has('session_id')) return { kind: 'hidden' };
  if (typeof paymentLink !== 'string' || !paymentLink) return { kind: 'unavailable' };
  try {
    const url = new URL(paymentLink);
    if (url.protocol !== 'https:' || url.hostname !== 'buy.stripe.com' || url.port || url.username || url.password || url.hash || !/^\/test_[A-Za-z0-9_-]+\/?$/.test(url.pathname)) return { kind: 'unavailable' };
    return { kind: 'ready', paymentLink };
  } catch {
    return { kind: 'unavailable' };
  }
}
