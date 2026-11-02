import test from 'node:test';
import assert from 'node:assert/strict';
import { ACCESS_PLANS } from '../assets/access-config.mjs';
import { resolveAccess } from '../assets/access-logic.mjs';
import { TARIFFS } from '../assets/tariffs-data.mjs';

test('Ordinary visitors stay on the landing, including existing queries', () => {
  for (const search of ['', '?v=2247191', '?utm_source=telegram&v=1']) assert.deepEqual(resolveAccess(search), { kind: 'landing' });
});

test('The legacy URL defaults only a valid test session to temel', () => {
  const result = resolveAccess('?session_id=cs_test_a1AbC_09-Z');
  assert.equal(result.kind, 'ready');
  assert.equal(result.planId, 'temel');
  assert.equal(result.mode, 'test');
  assert.equal(result.payload, 'a1AbC_09-Z');
  assert.equal(result.telegramUrl, 'https://t.me/nauli_temel_paket_bot?start=a1AbC_09-Z');
  assert.equal(resolveAccess('?session_id=cs_live_a1AbC_09-Z').code, 'missing_plan');
});

test('Each explicit plan retains its own name, for test and future live IDs', () => {
  for (const mode of ['test', 'live']) {
    for (const planId of ['temel', 'yakin', 'ozel']) {
      const result = resolveAccess(`?plan=${planId}&session_id=cs_${mode}_a1Example`);
      assert.equal(result.planId, planId);
      assert.equal(result.planName, ACCESS_PLANS[planId].name);
      assert.equal(result.mode, mode);
      if (planId === 'temel') {
        assert.equal(result.kind, 'ready');
        assert.equal(result.payload, 'a1Example');
      } else {
        assert.equal(result.kind, 'unavailable');
        assert.ok(!('telegramUrl' in result));
      }
    }
  }
});

test('Payload bounds: preserve every character; 64 accepted, 65 rejected', () => {
  for (const length of [1, 63, 64]) {
    const suffix = 'A'.repeat(length - 1) + 'z';
    const result = resolveAccess(`?plan=temel&session_id=cs_test_${suffix}`);
    assert.equal(result.kind, 'ready');
    assert.equal(result.payload, suffix);
    assert.equal(new URL(result.telegramUrl).searchParams.get('start'), suffix);
  }
  const tooLong = resolveAccess(`?plan=temel&session_id=cs_test_${'A'.repeat(65)}`);
  assert.equal(tooLong.code, 'payload_too_long');
  assert.ok(!('telegramUrl' in tooLong));
  const nested = resolveAccess('?plan=temel&session_id=cs_test_cs_test_cs_live_Ab9-');
  assert.equal(nested.payload, 'cs_test_cs_live_Ab9-');
});

test('Malformed, empty, unexpanded or whitespace-bearing session IDs never make a link', () => {
  for (const id of ['', 'cs_test_', 'cs_live_', 'cs_TEST_abc', 'cs_abc', 'abc', '{CHECKOUT_SESSION_ID}', ' cs_test_ABC', 'cs_test_ABC ', 'cs_test_ABC\n', 'cs_test_ABC\r\n', 'cs_test_AB C', 'cs_test_AB+C', 'cs_test_AB/C', 'cs_test_ğ', 'cs_test_AB?C', 'cs_test_AB\0C', 'cs_test_<script>']) {
    const result = resolveAccess(`?plan=temel&session_id=${encodeURIComponent(id)}`);
    assert.equal(result.kind, 'error', `Accepted ${JSON.stringify(id)}`);
    assert.ok(!('telegramUrl' in result));
  }
  assert.equal(resolveAccess('?plan=temel').code, 'missing_session');
});

test('Unknown/empty plans, prototype keys and duplicate parameters fail closed', () => {
  for (const plan of ['', 'yakin-takip', 'TEMEL', 'unknown', '__proto__', 'constructor', 'toString', '<img>']) {
    const result = resolveAccess(`?plan=${encodeURIComponent(plan)}&session_id=cs_test_a1Example`);
    assert.equal(result.code, 'invalid_plan');
    assert.ok(!('telegramUrl' in result));
  }
  for (const search of ['?plan=temel&plan=ozel&session_id=cs_test_A', '?session_id=cs_test_A&session_id=cs_test_B', '?plan=temel&plan=temel&session_id=cs_test_A']) {
    assert.equal(resolveAccess(search).code, 'ambiguous_parameters');
  }
});

test('Unset or invalid bot configuration never falls back to a different bot', () => {
  assert.equal(ACCESS_PLANS.yakin.botUsername, null);
  assert.equal(ACCESS_PLANS.ozel.botUsername, null);
  for (const botUsername of [null, undefined, '', 'https://example.com/bot', 'bad/name_bot', 'bad?start=other', 'bad-name_bot', 'A'.repeat(33) + 'bot', 'not_a_bot_name']) {
    const plans = { ...ACCESS_PLANS, temel: { ...ACCESS_PLANS.temel, botUsername } };
    const result = resolveAccess('?plan=temel&session_id=cs_test_a1Example', plans);
    assert.equal(result.kind, 'unavailable');
    assert.ok(!('telegramUrl' in result));
  }
});

test('A future configured bot is used only for its own plan (isolated test fixture)', () => {
  const plans = { ...ACCESS_PLANS, yakin: { ...ACCESS_PLANS.yakin, botUsername: '@fixture_yakin_bot' } };
  const result = resolveAccess('?plan=yakin&session_id=cs_test_a1Example', plans);
  assert.equal(result.telegramUrl, 'https://t.me/fixture_yakin_bot?start=a1Example');
  assert.equal(resolveAccess('?plan=temel&session_id=cs_test_a1Example', plans).telegramUrl, 'https://t.me/nauli_temel_paket_bot?start=a1Example');
});

test('Access labels match existing tariffs, without changing tariff IDs, prices or links', () => {
  for (const [route, tariffId] of [['temel', 'temel'], ['yakin', 'yakin-takip'], ['ozel', 'ozel']]) {
    assert.equal(ACCESS_PLANS[route].name, TARIFFS.find(plan => plan.id === tariffId).name);
  }
  assert.deepEqual(TARIFFS.map(plan => plan.amountTRY), [17000, 29000, 55000]);
});
