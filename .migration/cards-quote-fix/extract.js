const { chromium } = require('/home/node/.npm/_npx/405c3e2f92b65aa8/node_modules/playwright-core');

const EXE = '/ms-playwright/chromium-1208/chrome-linux64/chrome';

function pick(el) {
  if (!el) return null;
  const s = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const props = ['display','flex-direction','flex-wrap','align-items','justify-content','gap','row-gap','column-gap',
    'grid-template-columns','width','max-width','min-height','height','padding-top','padding-right','padding-bottom','padding-left',
    'margin-top','margin-right','margin-bottom','margin-left','background-color','background-image','border-top-width','border-top-style','border-top-color',
    'border-radius','box-shadow','color','font-family','font-size','font-weight','line-height','letter-spacing','text-align','text-decoration-line'];
  const out = { tag: el.tagName.toLowerCase(), cls: el.className && el.className.toString ? el.className.toString() : '', rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } };
  props.forEach((p) => { out[p] = s.getPropertyValue(p); });
  return out;
}

(async () => {
  const target = process.argv[2]; // 'source' or 'preview'
  const url = target === 'source'
    ? 'https://www.dentsplysirona.com/en-us'
    : 'http://localhost:3000/content/index';
  const browser = await chromium.launch({ executablePath: EXE, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 2000, height: 1400 }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(2500);
  // dismiss cookie banners
  for (const sel of ['#onetrust-accept-btn-handler', 'button:has-text("Accept")', 'button:has-text("Accept All")']) {
    try { const b = await page.$(sel); if (b) { await b.click(); await page.waitForTimeout(800); } } catch (e) {}
  }

  const result = await page.evaluate((tgt) => {
    function pick(el) {
      if (!el) return null;
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const props = ['display','flex-direction','flex-wrap','align-items','justify-content','gap','row-gap','column-gap',
        'grid-template-columns','width','max-width','min-height','height','padding-top','padding-right','padding-bottom','padding-left',
        'margin-top','margin-right','margin-bottom','margin-left','background-color','background-image','border-top-width','border-top-style','border-top-color',
        'border-radius','box-shadow','color','font-family','font-size','font-weight','line-height','letter-spacing','text-align','text-decoration-line'];
      const out = { tag: el.tagName.toLowerCase(), cls: (el.className && el.className.toString) ? el.className.toString() : '', rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } };
      props.forEach((p) => { out[p] = s.getPropertyValue(p); });
      return out;
    }
    const data = {};
    if (tgt === 'source') {
      // Find heading matching "How are customers achieving better outcomes"
      const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5')];
      const h = heads.find((e) => /how are customers achieving better outcomes/i.test(e.textContent));
      data.heading = pick(h);
      // find the card container: look for cards near the heading containing "DS Core" / "CEREC"
      const allEls = [...document.querySelectorAll('*')];
      const card = allEls.find((e) => /what.?s new on ds core/i.test(e.textContent) && e.querySelector('a') && e.children.length <= 6 && e.getBoundingClientRect().width < 800 && e.getBoundingClientRect().width > 200);
      // climb to a card boundary
      let cardEl = null;
      // Better: find the link "Explore the latest updates", climb to card
      const link = [...document.querySelectorAll('a')].find((a) => /explore the latest updates/i.test(a.textContent));
      data.ctaLink = pick(link);
      if (link) {
        // climb until sibling count increases (card row)
        let node = link;
        for (let i = 0; i < 8; i++) {
          node = node.parentElement;
          if (!node) break;
          const r = node.getBoundingClientRect();
          if (r.width > 300 && r.width < 700 && r.height > 200) { cardEl = node; break; }
        }
      }
      data.card = pick(cardEl);
      if (cardEl) {
        data.cardParent = pick(cardEl.parentElement);
        data.cardTitle = pick(cardEl.querySelector('h1,h2,h3,h4,h5,h6'));
        const ps = [...cardEl.querySelectorAll('p')];
        data.cardBody = pick(ps[0]);
        // section bg
        let sec = cardEl;
        for (let i=0;i<6;i++){ sec=sec.parentElement; if(!sec)break; const bg=getComputedStyle(sec).backgroundColor; if(bg && bg!=='rgba(0, 0, 0, 0)' && bg!=='transparent'){ data.sectionBg = { cls: sec.className.toString(), bg }; break; } }
      }
    } else {
      const sec = document.querySelector('main .section.cards-quote-container');
      data.section = pick(sec);
      const h = sec ? sec.querySelector('h3') : null;
      data.heading = pick(h);
      const wrappers = sec ? [...sec.querySelectorAll('.cards-quote-wrapper')] : [];
      data.numCards = wrappers.length;
      const first = wrappers[0];
      if (first) {
        data.wrapper = pick(first);
        const li = first.querySelector('li');
        data.card = pick(li);
        data.cardTitle = pick(first.querySelector('h5'));
        const ps = [...first.querySelectorAll('.cards-quote-card-body p')];
        data.cardBody = pick(ps[0]);
        data.ctaLink = pick(first.querySelector('a'));
      }
      data.cardHeights = wrappers.map((w) => Math.round(w.querySelector('li').getBoundingClientRect().height));
    }
    return data;
  }, target);

  console.log(JSON.stringify(result, null, 2));

  // screenshot §8
  try {
    let clip;
    if (target === 'source') {
      clip = await page.evaluate(() => {
        const link = [...document.querySelectorAll('a')].find((a) => /explore the latest updates/i.test(a.textContent));
        const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5')];
        const h = heads.find((e) => /how are customers achieving better outcomes/i.test(e.textContent));
        if (!h || !link) return null;
        const hr = h.getBoundingClientRect();
        // find bottom of card row
        let node = link; let cardEl=null;
        for (let i=0;i<8;i++){ node=node.parentElement; if(!node)break; const r=node.getBoundingClientRect(); if(r.width>300&&r.width<700&&r.height>200){cardEl=node;break;} }
        const cr = cardEl ? cardEl.getBoundingClientRect() : hr;
        return { x: Math.max(0, hr.x - 40 + window.scrollX), y: hr.y - 60 + window.scrollY, w: Math.min(1920, 1400), h: (cr.bottom - hr.top) + 140 };
      });
    } else {
      clip = await page.evaluate(() => {
        const sec = document.querySelector('main .section.cards-quote-container');
        const r = sec.getBoundingClientRect();
        return { x: Math.max(0, r.x + window.scrollX), y: r.y - 20 + window.scrollY, w: r.width, h: r.height + 40 };
      });
    }
    if (clip) {
      await page.evaluate((c) => window.scrollTo(0, c.y), clip);
      await page.waitForTimeout(500);
      const c2 = { x: clip.x, y: 0, width: Math.round(clip.w), height: Math.round(clip.h) };
      // recompute after scroll: use full page screenshot clip in page coords
      await page.screenshot({ path: process.argv[3] || `/tmp/${target}.png`, clip: { x: Math.round(clip.x), y: Math.round(clip.y), width: Math.round(clip.w), height: Math.round(clip.h) }, });
    }
  } catch (e) { console.error('screenshot err', e.message); }

  await browser.close();
})();
