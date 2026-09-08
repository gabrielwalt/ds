const { chromium } = require('/home/node/.npm/_npx/405c3e2f92b65aa8/node_modules/playwright-core');
const EXE = '/ms-playwright/chromium-1208/chrome-linux64/chrome';

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 2000, height: 1400 }, deviceScaleFactor: 1 });
  await page.goto('https://www.dentsplysirona.com/en-us', { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(2500);
  for (const sel of ['#onetrust-accept-btn-handler']) {
    try { const b = await page.$(sel); if (b) { await b.click(); await page.waitForTimeout(800); } } catch (e) {}
  }

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
    const cards = [...document.querySelectorAll('.quotecard, .quotecard--dark')];
    // dedupe: pick elements that actually have the dark bg surface
    const surfaces = cards.filter((c) => getComputedStyle(c).backgroundColor === 'rgb(41, 51, 61)');
    d.numSurfaces = surfaces.length;
    if (surfaces.length) {
      const surf = surfaces[0];
      d.surface = pick(surf);
      d.surfaceHeights = surfaces.map((s) => Math.round(s.getBoundingClientRect().height));
      d.surfaceWidths = surfaces.map((s) => Math.round(s.getBoundingClientRect().width));
      // row container = common parent
      const row = surf.parentElement;
      d.row = pick(row, ['column-gap','flex-wrap','grid-template-columns']);
      // span of the 3-card row
      const first = surfaces[0].getBoundingClientRect();
      const last = surfaces[surfaces.length - 1].getBoundingClientRect();
      d.rowSpan = { left: Math.round(first.x), right: Math.round(last.right), total: Math.round(last.right - first.x) };
      if (surfaces.length > 1) d.gapBetween = Math.round(surfaces[1].getBoundingClientRect().x - surfaces[0].getBoundingClientRect().right);
      // CTA link inside first surface
      const link = surf.querySelector('a');
      d.cta = pick(link);
      if (link) {
        // check ::after content and inner text color
        const after = getComputedStyle(link, '::after');
        d.ctaAfter = { content: after.content, color: after.color, fontFamily: after.fontFamily };
        // actual rendered color of the text node - check first child / span
        const inner = link.querySelector('span') || link.firstElementChild;
        if (inner) d.ctaInner = pick(inner);
        // distance from body bottom to CTA (separation)
        const ps = [...surf.querySelectorAll('p')];
        if (ps.length) {
          const bodyP = ps.find((p) => p.textContent.length > 60);
          if (bodyP) d.ctaSeparation = Math.round(link.getBoundingClientRect().top - bodyP.getBoundingClientRect().bottom);
          d.bodyP = pick(bodyP);
        }
      }
      // title
      d.title = pick(surf.querySelector('h1,h2,h3,h4,h5,h6'));
      // section (dark) that contains the cards
      let sec = surf;
      for (let i=0;i<8;i++){ sec=sec.parentElement; if(!sec)break; const bg=getComputedStyle(sec).backgroundColor; if(bg==='rgb(51, 63, 76)' || (bg!=='rgba(0, 0, 0, 0)'&&bg!=='rgb(41, 51, 61)'&&bg!=='transparent')){ d.sectionBgWrap={cls:(sec.className||'').toString(),bg, y:Math.round(sec.getBoundingClientRect().top), h:Math.round(sec.getBoundingClientRect().height)}; break; } }
    }
    // heading
    const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5')];
    const h = heads.find((e) => /how are customers achieving better outcomes/i.test(e.textContent));
    d.heading = pick(h);
    if (h && surfaces.length) {
      d.headingToCardsGap = Math.round(surfaces[0].getBoundingClientRect().top - h.getBoundingClientRect().bottom);
      d.headingLeftVsCard = { headingLeft: Math.round(h.getBoundingClientRect().x), cardLeft: Math.round(surfaces[0].getBoundingClientRect().x) };
    }
    return d;
  });

  console.log(JSON.stringify(data, null, 2));

  // screenshot: scroll to heading, capture region
  const box = await page.evaluate(() => {
    const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5')];
    const h = heads.find((e) => /how are customers achieving better outcomes/i.test(e.textContent));
    const surfaces = [...document.querySelectorAll('.quotecard--dark')].filter((c) => getComputedStyle(c).backgroundColor === 'rgb(41, 51, 61)');
    if (!h) return null;
    const hr = h.getBoundingClientRect();
    const last = surfaces.length ? surfaces[surfaces.length-1].getBoundingClientRect() : hr;
    return { top: hr.top + window.scrollY - 80, height: (last.bottom - hr.top) + 160 };
  });
  if (box) {
    await page.evaluate((y) => window.scrollTo(0, y), box.top);
    await page.waitForTimeout(800);
    await page.screenshot({ path: '/backups/gabrielwalt/ds/repo/.migration/cards-quote-fix/source.png', clip: { x: 300, y: 20, width: 1400, height: Math.min(1000, box.height) } });
    console.log('screenshot saved');
  }
  await browser.close();
})();
