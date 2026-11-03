import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveTestCheckout } from '../assets/test-checkout-logic.mjs';

// Isolated fixture, never used as a production payment destination.
const fixture = 'https://buy.stripe.com/test_fixture100';
test('Only the exact, non-duplicated flag exposes the test checkout', () => {
  for (const search of ['', '?v=1', '?test_checkout=0', '?test_checkout=true', '?test_checkout=', '?test_checkout=1&test_checkout=1', '?test_checkout=1&plan=temel', '?test_checkout=1&session_id=cs_test_Example']) {
    assert.deepEqual(resolveTestCheckout(search, fixture), { kind: 'hidden' });
  }
  assert.deepEqual(resolveTestCheckout('?test_checkout=1', fixture), { kind: 'ready', paymentLink: fixture });
});
test('An absent link or a live/non-Stripe destination is never activated', () => {
  for (const url of [null, '', 'https://buy.stripe.com/live_example', 'https://buy.stripe.com/example', 'http://buy.stripe.com/test_fixture', 'https://buy.stripe.com.evil.invalid/test_fixture', 'https://example.com/test_fixture', 'https://buy.stripe.com:444/test_fixture', 'https://name@buy.stripe.com/test_fixture', 'javascript:alert(1)']) {
    assert.deepEqual(resolveTestCheckout('?test_checkout=1', url), { kind: 'unavailable' });
  }
});
test('The existing Payment Link is preserved and cannot be overridden by query input', () => {
  const original = fixture + '?client_reference_id=existing';
  assert.equal(resolveTestCheckout('?test_checkout=1&paymentLink=https://example.com', original).paymentLink, original);
});
