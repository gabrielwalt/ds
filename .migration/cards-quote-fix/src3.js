const { chromium } = require('/home/node/.npm/_npx/405c3e2f92b65aa8/node_modules/playwright-core');
const EXE = '/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 2000, height: 1400 }, deviceScaleFactor: 1 });
  await page.goto('https://www.dentsplysirona.com/en-us', { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(2500);
  try { const b = await page.$('#onetrust-accept-btn-handler'); if (b) { await b.click(); await page.waitForTimeout(800); } } catch (e) {}

  const d = await page.evaluate(() => {
    const surfaces = [...document.querySelectorAll('.quotecard--dark')].filter((c) => getComputedStyle(c).backgroundColor === 'rgb(41, 51, 61)');
    const out = { perCard: [] };
    surfaces.forEach((surf, i) => {
      const r = surf.getBoundingClientRect();
      const link = surf.querySelector('a');
      const ps = [...surf.querySelectorAll('p')];
      const bodyP = ps.find((p) => p.textContent.length > 60);
      const info = { i, cardH: Math.round(r.height), cardBottom: Math.round(r.bottom) };
      if (link) {
        const lr = link.getBoundingClientRect();
        info.ctaTop = Math.round(lr.top);
        info.ctaBottom = Math.round(lr.bottom);
        info.gapFromCardBottom = Math.round(r.bottom - lr.bottom); // padding-bottom ~24 if pinned
        if (bodyP) info.sepFromBody = Math.round(lr.top - bodyP.getBoundingClientRect().bottom);
        // CTA structure
        info.ctaHTML = link.innerHTML.slice(0, 200);
        info.ctaChildren = [...link.children].map((c) => ({ tag: c.tagName.toLowerCase(), cls: (c.className||'').toString(), w: Math.round(c.getBoundingClientRect().width), h: Math.round(c.getBoundingClientRect().height) }));
        // svg?
        const svg = link.querySelector('svg, img, i, use');
        if (svg) { const sr = svg.getBoundingClientRect(); const ss = getComputedStyle(svg); info.icon = { tag: svg.tagName.toLowerCase(), w: Math.round(sr.width), h: Math.round(sr.height), color: ss.color, fill: ss.fill }; }
      }
      out.perCard.push(info);
    });
    // the width-constraining container
    const surf = surfaces[0];
    let node = surf; const chain = [];
    for (let i=0;i<10;i++){ node=node.parentElement; if(!node)break; const r=node.getBoundingClientRect(); chain.push({ cls:(node.className||'').toString().slice(0,40), w: Math.round(r.width), ml: getComputedStyle(node).marginLeft, mr: getComputedStyle(node).marginRight, maxw: getComputedStyle(node).maxWidth, pl: getComputedStyle(node).paddingLeft, pr: getComputedStyle(node).paddingRight }); if (r.width > 1400) break; }
    out.widthChain = chain;
    return out;
  });
  console.log(JSON.stringify(d, null, 2));
  await browser.close();
})();
