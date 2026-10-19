import { TARIFFS } from '../assets/tariffs-data.mjs';

const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const arrow = '<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3 12h17m-7-7 7 7-7 7"/></svg>';

function purchaseControl(plan) {
  const content = `<span>Satın al</span>${arrow}`;
  if (!plan.paymentUrl) {
    return `<button class="tariff__purchase" type="button" disabled data-plan="${escapeHTML(plan.id)}" title="Ödeme bağlantısı henüz eklenmedi">${content}</button>`;
  }
  const url = new URL(plan.paymentUrl);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error(`Invalid payment URL for ${plan.id}`);
  return `<a class="tariff__purchase" href="${escapeHTML(url.href)}" data-plan="${escapeHTML(plan.id)}">${content}</a>`;
}

export function renderTariffs(plans = TARIFFS) {
  const cards = plans.map(plan => {
    if (!Number.isSafeInteger(plan.amountTRY) || plan.amountTRY <= 0) throw new Error(`Invalid price for ${plan.id}`);
    if (!['olive', 'terracotta', 'deep-olive'].includes(plan.tone)) throw new Error(`Invalid tone for ${plan.id}`);
    const titleId = `tariff-${plan.id}-title`;
    const price = plan.amountTRY.toLocaleString('tr-TR');
    return `          <article class="tariff tariff--${plan.tone}" aria-labelledby="${escapeHTML(titleId)}">
            <span class="tariff__number">${escapeHTML(plan.number)}</span>
            <h3 id="${escapeHTML(titleId)}">${escapeHTML(plan.name)}</h3>
            <p class="tariff__price"><data value="${plan.amountTRY}">${price} <span>TL</span></data></p>
${plan.capacity ? `            <p class="tariff__capacity">${escapeHTML(plan.capacity)}</p>\n` : ''}            <p class="tariff__phrase">${escapeHTML(plan.phrase)}</p>
            <p class="tariff__description">${escapeHTML(plan.description)}</p>
            <div class="tariff__includes">
              <h4>Bu pakete dahil olanlar</h4>
              <ul>
${plan.features.map(feature => `                <li>${escapeHTML(feature)}</li>`).join('\n')}
              </ul>
            </div>
            <p class="tariff__conditions">${escapeHTML(plan.conditions)}</p>
            ${purchaseControl(plan)}
          </article>`;
  }).join('\n');
  return `      <section class="tariffs" id="tarifeler" aria-labelledby="tariffs-title">
        <header class="tariffs__header">
          <p class="tariffs__eyebrow">NAULI / TARİFELER</p>
          <h2 id="tariffs-title"><span>Senin yolculuğun.</span><em>Senin seçimin.</em></h2>
          <p class="tariffs__intro">Aynı eğitim. Farklı destek seviyeleri.</p>
          <p class="tariffs__details">3 SEVİYE · 2 AY · TELEGRAM</p>
        </header>
        <div class="tariffs__cards">
${cards}
        </div>
      </section>`;
}
