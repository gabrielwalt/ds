const { chromium } = require('/home/node/.npm/_npx/405c3e2f92b65aa8/node_modules/playwright-core');
const EXE = '/ms-playwright/chromium-1208/chrome-linux64/chrome';

(async () => {
  const suffix = process.argv[2] || 'before';
  const browser = await chromium.launch({ executablePath: EXE, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 2000, height: 1400 }, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/content/index', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);

  const data = await page.evaluate(() => {
    function pick(el, extra) {
      if (!el) return null;
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const base = ['display','flex-direction','align-items','justify-content','gap',
        'width','min-height','height','padding-top','padding-right','padding-bottom','padding-left',
        'margin-top','margin-bottom','background-color','border-top-width','border-top-style','border-top-color',
        'border-radius','box-shadow','color','font-size','font-weight','line-height','letter-spacing','text-align','text-decoration-line'];
      const out = { tag: el.tagName.toLowerCase(), cls: (el.className||'').toString(), rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } };
      (base.concat(extra||[])).forEach((p) => { out[p] = s.getPropertyValue(p); });
      return out;
    }
    const d = {};
    const sec = document.querySelector('main .section.cards-quote-container');
    d.section = pick(sec, ['column-gap','flex-wrap','padding-left','padding-right']);
    const h = sec ? sec.querySelector('h3') : null;
    d.heading = pick(h);
    const wrappers = sec ? [...sec.querySelectorAll('.cards-quote-wrapper')] : [];
    d.numCards = wrappers.length;
    if (wrappers[0]) {
      const first = wrappers[0];
      d.wrapper = pick(first);
      const li = first.querySelector('li');
      d.card = pick(li);
      d.surfaceWidths = wrappers.map((w) => Math.round(w.querySelector('li').getBoundingClientRect().width));
      d.surfaceHeights = wrappers.map((w) => Math.round(w.querySelector('li').getBoundingClientRect().height));
      const s0 = wrappers[0].querySelector('li').getBoundingClientRect();
      const sl = wrappers[wrappers.length-1].querySelector('li').getBoundingClientRect();
      d.rowSpan = { left: Math.round(s0.x), right: Math.round(sl.right), total: Math.round(sl.right - s0.x) };
      if (wrappers[1]) d.gapBetween = Math.round(wrappers[1].querySelector('li').getBoundingClientRect().x - wrappers[0].querySelector('li').getBoundingClientRect().right);
      d.title = pick(first.querySelector('h5'));
      const ps = [...first.querySelectorAll('.cards-quote-card-body p')];
      d.bodyP = pick(ps[0]);
      d.ctaP = pick(ps[ps.length-1]);
      const link = first.querySelector('a');
      d.cta = pick(link);
      if (link) {
        const after = getComputedStyle(link, '::after');
        d.ctaAfter = { content: after.content, color: after.color };
        const bodyP = ps.find((p) => p.textContent.length > 60);
        if (bodyP) d.ctaSeparation = Math.round(link.getBoundingClientRect().top - bodyP.getBoundingClientRect().bottom);
      }
    }
    if (h && wrappers[0]) d.headingToCardsGap = Math.round(wrappers[0].querySelector('li').getBoundingClientRect().top - h.getBoundingClientRect().bottom);
    return d;
  });
  console.log(JSON.stringify(data, null, 2));

  const box = await page.evaluate(() => {
    const sec = document.querySelector('main .section.cards-quote-container');
    const r = sec.getBoundingClientRect();
    return { top: r.top + window.scrollY - 20, left: r.left + window.scrollX, w: r.width, h: r.height + 40 };
  });
  await page.evaluate((y) => window.scrollTo(0, y), box.top);
  await page.waitForTimeout(500);
  const r2 = await page.evaluate(() => {
    const sec = document.querySelector('main .section.cards-quote-container');
    const r = sec.getBoundingClientRect();
    return { x: Math.max(0, r.left), y: Math.max(0, r.top - 20), w: r.width, h: r.height + 40 };
  });
  await page.screenshot({ path: `/backups/gabrielwalt/ds/repo/.migration/cards-quote-fix/preview-${suffix}.png`, clip: { x: Math.round(r2.x), y: Math.round(r2.y), width: Math.round(r2.w), height: Math.round(r2.h) } });
  console.log('screenshot saved preview-' + suffix);
  await browser.close();
})();
