import { ACCESS_PLANS } from './access-config.mjs?v=20261109-1';

const fail = (code, context = {}) => ({ kind: 'error', code, ...context });

export function resolveAccess(search, plans = ACCESS_PLANS) {
  const params = new URLSearchParams(search);
  if (!params.has('session_id') && !params.has('plan')) return { kind: 'landing' };
  if (params.getAll('session_id').length > 1 || params.getAll('plan').length > 1) return fail('ambiguous_parameters');

  const hasPlan = params.has('plan');
  const requestedPlan = params.get('plan');
  if (hasPlan && !Object.hasOwn(plans, requestedPlan)) return fail('invalid_plan');
  const selected = hasPlan ? { planId: requestedPlan, planName: plans[requestedPlan].name } : {};
  const sessionId = params.get('session_id');
  if (!sessionId) return fail('missing_session', selected);

  // Structural validation only. Stripe IDs are opaque; the bot verifies the
  // actual payment/product via Stripe. Never trim, re-encode or truncate the ID.
  const match = /^cs_(test|live)_([A-Za-z0-9_-]+)$/.exec(sessionId);
  if (!match) return fail('invalid_session', selected);
  const [, mode, payload] = match;
  if (payload.length > 64) return fail('payload_too_long', { ...selected, mode });
  if (!hasPlan && mode === 'live') return fail('missing_plan', { mode });

  // Compatibility is deliberately limited to test sessions without any plan.
  const planId = hasPlan ? requestedPlan : 'temel';
  const plan = plans[planId];
  const context = { planId, planName: plan.name, mode };
  const username = typeof plan.botUsername === 'string' ? plan.botUsername.trim().replace(/^@/, '') : '';
  if (!/^[A-Za-z0-9_]{5,32}$/.test(username) || !/bot$/i.test(username)) {
    return { kind: 'unavailable', code: 'bot_unavailable', ...context };
  }

  const url = new URL(`https://t.me/${username}`);
  url.searchParams.set('start', payload);
  return { kind: 'ready', ...context, payload, telegramUrl: url.href };
}
