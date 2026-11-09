// Public routing only. Never put Stripe keys, Telegram tokens or channel invites here.
// Enter each bot's own username (without https://t.me/; a leading @ is optional).
// null means activation is unavailable for that plan. Never fall back to another bot.
export const ACCESS_PLANS = Object.freeze({
  temel: Object.freeze({
    name: 'NAULİ TEMEL PAKET',
    botUsername: 'nauli_temel_paket_bot'
  }),
  yakin: Object.freeze({
    name: 'NAULİ YAKIN TAKİP',
    botUsername: 'nauli_yakin_takip_bot'
  }),
  ozel: Object.freeze({
    name: 'NAULİ ÖZEL',
    botUsername: 'nauli_ozel_bot'
  })
});
