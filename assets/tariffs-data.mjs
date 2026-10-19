// Prices are in Turkish lira. Add only verified payment URLs for the matching plan/amount.
export const TARIFFS = [
  {
    id: 'temel',
    number: '01',
    name: 'NAULİ TEMEL PAKET',
    amountTRY: 17000,
    paymentUrl: null,
    tone: 'olive',
    phrase: '“Benim için sistem ve asistan desteği yeterli.”',
    description: 'Kendi hızında öğren, sistemli ilerle.',
    features: [
      '3 aşamalı 2 aylık Nauli eğitimi',
      'Nauli uygulama videoları',
      'Kişisel ilerleme sistemi',
      'Asistan desteği',
      'Genel öğrenci grubu',
      'Asistana gün içinde soru sorma imkânı',
      'Aşama sonlarında teknik kontrol ve yönlendirme'
    ],
    conditions: 'Bu pakette birebir günlük takip yoktur. Asistanın desteği sayesinde süreç boyunca yalnız değilsin.'
  },
  {
    id: 'yakin-takip',
    number: '02',
    name: 'NAULİ YAKIN TAKİP',
    amountTRY: 29000,
    paymentUrl: null,
    tone: 'terracotta',
    phrase: '“İlerlememi takip edecek ve bana düzenli olarak yön verecek birinin olmasını istiyorum.”',
    description: 'Asistanın desteğine ek olarak, sürecine ben de düzenli olarak dahil oluyorum.',
    features: [
      '3 aşamalı 2 aylık Nauli eğitimi',
      'Uygulama videoları',
      'Öğrenci grubu',
      'Asistan desteği + Asistana soru sorma imkânı',
      'Derslerin daha sık kişisel kontrolü',
      'Benim tarafımdan düzenli geri bildirim (Haftalık ilerleme takibi)',
      'Haftalık değerlendirme / yönlendirme',
      'Belirli aşamalarda birebir online görüşmeler',
      'Tekniğe yönelik kişisel düzeltmeler',
      'Bir sonraki aşamaya geçiş için kişisel yönlendirme'
    ],
    conditions: 'Bu paket günlük birebir iletişim içermez.'
  },
  {
    id: 'ozel',
    number: '03',
    name: 'NAULİ ÖZEL',
    amountTRY: 55000,
    paymentUrl: null,
    tone: 'deep-olive',
    capacity: 'Sadece 5 kişi kontenjan',
    phrase: '“Nauli sürecimi doğrudan Valerika ile birebir yürütmek istiyorum.”',
    description: 'Bu programda sadece eğitimi almıyorsun. Süreci benimle birlikte yürütüyorsun.',
    features: [
      '3 aşamalı 2 aylık Nauli eğitimi',
      'Uygulama videoları',
      'Günlük birebir iletişim',
      'Günlük kişisel takip',
      'Günlük teknik geri bildirim',
      'Onlain uygulamalar / birebir Zoom görüşmeleri',
      'Kişiye özel uygulama planı',
      'Bedeninin verdiği yanıtlara göre günlük yönlendirme',
      'Tekniğin kişiye özel düzeltilmesi',
      'Öncelikli iletişim'
    ],
    conditions: 'Bu pakette seni sadece bir öğrenci olarak değil, birebir çalıştığım özel bir öğrenci olarak takip ediyorum.'
  }
];
