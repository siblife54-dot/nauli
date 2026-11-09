import { resolveAccess } from './access-logic.mjs?v=20261109-1';

const MESSAGES = {
  missing_session: 'Bu bağlantıda ödeme oturumu bilgisi bulunamadı. Lütfen ödeme sonrası açılan bağlantıyı eksiksiz kullan.',
  invalid_session: 'Ödeme oturumu bilgisi geçerli görünmüyor. Lütfen ödeme sonrası açılan bağlantıyı eksiksiz kullan.',
  missing_plan: 'Bu bağlantıda paket bilgisi bulunamadı. Lütfen paket bilgisini içeren ödeme sonrası bağlantısını kullan.',
  invalid_plan: 'Bu bağlantıdaki paket bilgisi tanınmıyor. Lütfen ödeme sonrası açılan bağlantıyı kontrol et.',
  ambiguous_parameters: 'Bağlantıdaki bilgiler birbiriyle uyuşmuyor. Lütfen ödeme sonrası açılan bağlantıyı değiştirmeden kullan.',
  payload_too_long: 'Erişim bilgisi Telegram’a eksiksiz aktarılamıyor. Ödeme sonrası bağlantını sakla ve eğitim ekibiyle paylaş. Yeniden ödeme yapmana gerek yok.'
};

export function showAccess(root, search) {
  const state = resolveAccess(search);
  if (state.kind === 'landing') return;
  const get = name => root.querySelector(`[data-access-${name}]`);
  const ready = state.kind === 'ready';
  const unavailable = state.kind === 'unavailable';
  root.dataset.state = state.kind;
  document.title = 'NAULI — Telegram Erişimi';
  get('title').textContent = ready ? 'Ödeme adımı tamamlandı.' : unavailable ? 'Aktivasyon henüz hazır değil.' : 'Erişim bağlantısı açılamadı.';
  get('intro').textContent = ready ? 'NAULI yolculuğuna hoş geldin. Eğitimine erişmek için son bir adım kaldı.' : unavailable ? 'Paketin için erişim bilgilerini burada bulacaksın.' : 'Bağlantındaki bilgileri birlikte kontrol edelim.';
  get('plan').hidden = !state.planName;
  get('plan-name').textContent = state.planName || '';
  get('message').textContent = ready
    ? 'Telegram’ı aç ve botta “Başlat” düğmesine dokunarak devam et.'
    : unavailable
      ? 'Bu paket için Telegram aktivasyonu henüz kullanıma açılmadı. Lütfen ödeme sonrası bağlantını sakla ve eğitim ekibiyle iletişime geç. Yeniden ödeme yapmana gerek yok.'
      : MESSAGES[state.code];
  const telegram = get('telegram');
  telegram.hidden = !ready;
  telegram.removeAttribute('href');
  if (ready) telegram.href = state.telegramUrl;
  get('verification').hidden = !ready;
  get('test').hidden = state.mode !== 'test';
  get('icon').setAttribute('d', ready ? 'm7 12 3 3 7-7' : 'M12 7v6m0 4h.01');
  get('title').focus({ preventScroll: true });
}
