export function renderProgram() {
  return `      <section class="program" id="program" aria-labelledby="program-title">
        <header class="program__header">
          <h2 id="program-title"><span>Nauli Programı:</span> Düz Bir Karına ve Sağlığa Giden Yolun</h2>
          <p class="program__intro">Nauli, karın kaslarını güçlendiren, iç organları destekleyen ve vücudu yenileyen eşsiz bir tekniktir.</p>
        </header>
        <h3 class="program__levels-title">Program 3 seviyeden oluşur:</h3>
        <ol class="program__steps">
          <li class="program__step">
            <span class="program__number" aria-hidden="true">01</span>
            <div class="program__step-copy">
              <h4>1. Seviye - Diyafram Nefesi</h4>
              <ul><li>Doğru nefes almanın temeli</li><li>Karın kaslarının derin aktivasyonu</li></ul>
            </div>
          </li>
          <li class="program__step">
            <span class="program__number" aria-hidden="true">02</span>
            <div class="program__step-copy">
              <h4>2. Seviye - Vakum</h4>
              <ul><li>Karın sıkılaştırma</li><li>İç organların sağlığı ve duruşun iyileştirilmesi</li></ul>
            </div>
          </li>
          <li class="program__step">
            <span class="program__number" aria-hidden="true">03</span>
            <div class="program__step-copy">
              <h4>3. Seviye - Nauli</h4>
              <ul><li>Karın kaslarını tam kontrol etme</li><li>Metabolizmayı hızlandırma</li></ul>
            </div>
          </li>
        </ol>
        <aside class="program__telegram" aria-labelledby="telegram-training-title">
          <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 3-4 18-6-6-4 3 1-7L21 3ZM8 11 3 9l18-6M8 11l3 4L21 3"/></svg>
          <div><h3 id="telegram-training-title">Telegram üzerinden eğitim</h3><p>Eğitim özel Telegram kanalında gerçekleşecektir, süreci/erişimi 2 ay.</p></div>
        </aside>
      </section>`;
}
