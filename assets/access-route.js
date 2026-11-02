(() => {
  const params = new URLSearchParams(location.search);
  if (!params.has('session_id') && !params.has('plan')) return;
  // Decide before first paint. The ordinary landing remains unchanged otherwise.
  document.documentElement.dataset.accessView = '';
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('access-page');
    import('./access-page.mjs?v=20261102-1')
      .then(({ showAccess }) => showAccess(root, location.search))
      .catch(() => {
        root.dataset.state = 'error';
        root.querySelector('[data-access-title]').textContent = 'Erişim bilgileri yüklenemedi.';
        root.querySelector('[data-access-intro]').textContent = 'Lütfen bağlantını sakla ve sayfayı yeniden aç.';
        root.querySelector('[data-access-message]').textContent = 'Sorun devam ederse ödeme sonrası bağlantını eğitim ekibiyle paylaş. Yeniden ödeme yapmana gerek yok.';
        root.querySelector('[data-access-telegram]').hidden = true;
      });
  }, { once: true });
})();
