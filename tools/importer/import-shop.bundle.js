/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // tools/importer/import-shop.js
  var import_shop_exports = {};
  __export(import_shop_exports, {
    default: () => import_shop_default
  });

  // tools/importer/parsers/hero-home.js
  function parse(element, { document: document2 }) {
    const bgImage = element.querySelector(
      ".cmp-hero__bannerimg-div img, .cmp-hero__img-div img, .cmp-image__image, img"
    );
    const heading = element.querySelector(
      ".cmp-hero__title .cmp-maintitle__text, .cmp-maintitle__text, .cmp-hero__title h1, h1, h2"
    );
    if (heading) {
      const text = heading.textContent.replace(/\s+/g, " ").trim();
      if (text) heading.textContent = text;
    }
    const subheading = element.querySelector(
      ".cmp-hero__subheading .cmp-text, .cmp-hero__subheading, .cmp-text"
    );
    const ctaLinks = Array.from(
      element.querySelectorAll(".cmp-hero__btn-container a.cmp-button, a.cmp-button")
    );
    if (!heading && !subheading && !bgImage) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const isShopHero = /cmp-shophero|cmp-hero__banner-left/.test(element.className);
    const ctaCells = ctaLinks.map((a) => {
      if (!isShopHero) return a;
      const strong = document2.createElement("strong");
      strong.append(a.cloneNode(true));
      return strong;
    });
    const cells = [];
    cells.push([bgImage || ""]);
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (subheading) contentCell.push(subheading);
    contentCell.push(...ctaCells);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, {
      name: isShopHero ? "hero-home (shop)" : "hero-home",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function parse2(element, { document: document2 }) {
    const image = element.querySelector(
      ".cmp-teaser__image img, .cmp-image__image, img"
    );
    const heading = element.querySelector(
      ".cmp-teaser__title .cmp-title__text, .cmp-title__text, h1, h2, h3, h4, h5, h6"
    );
    const description = element.querySelector(
      ".cmp-teaser__text .cmp-text, .cmp-teaser__text, .cmp-text"
    );
    const ctaLinks = Array.from(
      element.querySelectorAll(
        ".cmp-teaser__action-link, .cmp-teaser__cta a, .cmp-button, a.cmp-teaser__action-link"
      )
    ).filter((a) => !a.closest(".d-none"));
    if (!heading && !description && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    contentCell.push(...ctaLinks);
    const cells = [];
    cells.push([image || "", contentCell]);
    let name = "cards-feature";
    if (/cmp-shop-teaser--banner/.test(element.className)) name = "cards-feature (banner)";
    else if (/cmp-shop-teaser--promotion/.test(element.className)) name = "cards-feature (promotion)";
    const block = WebImporter.Blocks.createBlock(document2, {
      name,
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  function parse3(element, { document: document2 }) {
    const label = element.querySelector(".cmp-label__text");
    const heading = element.querySelector(
      ".cmp-promocard__card-title .cmp-title__text, .cmp-title__text, h1, h2, h3, h4, h5, h6"
    );
    const image = element.querySelector(".cmp-promocard__card-image img, .cmp-image__image, img");
    const ctaLinks = Array.from(
      element.querySelectorAll(
        ".cmp-promocard__card-button1 a, .cmp-promocard__card-button2 a, a.cmp-button, a"
      )
    ).filter((a) => {
      const href = a.getAttribute("href");
      return href && href.trim() && !href.trim().startsWith("#");
    });
    const cta = ctaLinks.find((a) => a.textContent.trim()) || ctaLinks[0];
    if (!heading && !image && !label) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [];
    if (label && label.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = label.textContent.trim();
      contentCell.push(p);
    }
    if (heading) contentCell.push(heading);
    if (cta) contentCell.push(cta);
    const cells = [[image || "", contentCell]];
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "cards-promo",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-category.js
  function parse4(element, { document: document2 }) {
    const titleEl = element.querySelector(
      ".title .cmp-title__text, .cmp-title__text, h1, h2, h3, h4, h5, h6"
    );
    const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
    const allLink = Array.from(element.querySelectorAll("a.cmp-button")).find((a) => {
      const href = a.getAttribute("href");
      return href && href.trim() && a.textContent.trim();
    });
    const tiles = Array.from(
      element.querySelectorAll(".cmp-iconcard__wrapper-anchor")
    );
    const cells = [];
    tiles.forEach((tile) => {
      const href = tile.getAttribute("href");
      const labelEl = tile.querySelector(
        ".iconcard__title .cmp-title__text, .cmp-title__text, .cmp-label__text"
      );
      const text = (labelEl ? labelEl.textContent : tile.textContent).replace(/\s+/g, " ").trim();
      if (!text) return;
      const a = document2.createElement("a");
      a.textContent = text;
      if (href) a.setAttribute("href", href);
      cells.push([a]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "cards-category",
      cells
    });
    const frag = document2.createDocumentFragment();
    if (titleText) {
      const h2 = document2.createElement("h2");
      h2.textContent = titleText;
      frag.append(h2);
    }
    if (allLink) {
      const p = document2.createElement("p");
      p.className = "cards-category-all";
      const a = document2.createElement("a");
      a.textContent = allLink.textContent.replace(/\s+/g, " ").trim();
      a.setAttribute("href", allLink.getAttribute("href"));
      p.append(a);
      frag.append(p);
    }
    frag.append(block);
    element.replaceWith(frag);
  }

  // tools/importer/transformers/dentsplysirona-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        ".onetrust-pc-dark-filter",
        ".legal-popup",
        ".global-legal-popup"
      ]);
      element.querySelectorAll(".cmp-title__text, h1, h2, h3, h4, h5, h6").forEach((h) => {
        if (/^browse by\b.*:?\s*$/i.test(h.textContent.trim())) {
          const wrapper = h.closest(".title") || h;
          wrapper.remove();
        }
      });
      element.querySelectorAll(".cmp-shophero__signin, .hero.hidden").forEach((el) => el.remove());
      element.querySelectorAll("p, span, div").forEach((el) => {
        const t = el.textContent.trim();
        if (/^welcome,?\s*\$?\{?firstname\}?!?$/i.test(t) || /^welcome!$/i.test(t)) {
          el.remove();
        }
      });
      element.querySelectorAll('img[src^="data:image/svg"]').forEach((img) => img.remove());
      element.querySelectorAll("svg").forEach((svg) => svg.remove());
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".cmp-sticky-header",
        ".cmp-experiencefragment--header",
        ".cmp-experiencefragment--footer",
        ".cmp-experiencefragment--alert-on-top",
        ".cmp-experiencefragment--add-practice-alert",
        "footer",
        "nav",
        "iframe",
        "link",
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/dentsplysirona-dm-images.js
  function detectDynamicMediaUrl(urlStr) {
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) {
      return "scene7";
    }
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
  function findLinkedDmCarrier(img) {
    if (!img || !img.parentElement) return null;
    let node = img;
    let parent = img.parentElement;
    while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
      let foundNode = false;
      for (const child of parent.children) {
        if (child === node) {
          foundNode = true;
        } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
          return null;
        }
      }
      if (!foundNode) return null;
      node = parent;
      parent = parent.parentElement;
    }
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      const alt = img.getAttribute("alt") || "";
      const linkedAnchor = findLinkedDmCarrier(img);
      if (linkedAnchor) {
        linkedAnchor.setAttribute("title", src);
        linkedAnchor.textContent = altToLinkText(alt);
        return;
      }
      const parent = img.parentElement;
      if (parent && parent.tagName === "A") {
        console.warn("DM image inside mixed-content anchor, skipped:", src);
        return;
      }
      const a = doc.createElement("a");
      a.href = src;
      a.textContent = altToLinkText(alt);
      img.replaceWith(a);
    });
  }

  // tools/importer/transformers/dentsplysirona-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function transform3(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      const resolved = sections.map((section) => ({
        section,
        el: element.querySelector(section.selector)
      }));
      resolved.forEach(({ section, el }) => {
        if (el) el.setAttribute(SECTION_MARKER_ATTR, section.id);
      });
      for (let i = resolved.length - 1; i >= 0; i -= 1) {
        const { section, el } = resolved[i];
        if (i === 0) continue;
        if (!el) continue;
        el.before(document.createElement("hr"));
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const sectionEl = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        if (section.style && sectionEl) {
          const metadataBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.append(metadataBlock);
        }
        if (sectionEl) sectionEl.removeAttribute(SECTION_MARKER_ATTR);
      }
    }
  }

  // tools/importer/import-shop.js
  var parsers = {
    "hero-home": parse,
    "cards-feature": parse2,
    "cards-promo": parse3,
    "cards-category": parse4
  };
  var PAGE_TEMPLATE = {
    "name": "shop",
    "description": "Dentsply Sirona en-us Shop landing page. Reuses hero-home and cards-feature (banner + promotion teasers); adds cards-promo (eyebrow promo cards) and cards-category (icon-label tiles for top categories + top brands). The 'Shop featured products' React commerce carousel is client-hydrated and does not import.",
    "urls": [
      "https://www.dentsplysirona.com/en-us/shop.html"
    ],
    "blocks": [
      {
        "name": "hero-home",
        "instances": [
          ".hero.cmp-shophero__anonymous"
        ]
      },
      {
        "name": "cards-promo",
        "instances": [
          ".promocards.cmp-shop--promocards"
        ]
      },
      {
        "name": "cards-category",
        "instances": [
          ".bootstrap-grid:has(.cmp-iconcard__wrapper-anchor):not(:has(.bootstrap-grid .cmp-iconcard__wrapper-anchor))"
        ]
      },
      {
        "name": "cards-feature",
        "instances": [
          ".teaser.basemarketingproperties"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    transform2,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform3] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_shop_default = {
    /**
     * Force lazy-loaded images to resolve BEFORE the transform reads the DOM.
     * The AEM Core image component ships each `.imagetile` / `.cmp-image` <img>
     * with a 1x1 base64 GIF placeholder in `src` and swaps in the real Scene7
     * URL only when the element scrolls into view (IntersectionObserver via
     * `data-cmp-hook-image`). The importer never scrolls to the deep toolkit
     * section, so those 6 cards were captured with placeholder/blob src and
     * rendered broken. onLoad runs in the live page context before transform:
     * scroll the whole page to trigger every observer, dispatch scroll/resize so
     * lazy libs that listen for them also fire, then wait for the real `src`
     * values to land. Best-effort — wrapped so a failure never aborts the import.
     */
    onLoad: (_0) => __async(void 0, [_0], function* ({ document: document2 }) {
      try {
        const win = document2.defaultView || window;
        const sleep = (ms) => new Promise((r) => {
          win.setTimeout(r, ms);
        });
        const step = Math.max(400, Math.floor(win.innerHeight * 0.8));
        const maxScroll = () => Math.max(
          document2.body.scrollHeight,
          document2.documentElement.scrollHeight
        );
        for (let y = 0; y <= maxScroll(); y += step) {
          win.scrollTo(0, y);
          win.dispatchEvent(new win.Event("scroll"));
          yield sleep(250);
        }
        win.scrollTo(0, maxScroll());
        win.dispatchEvent(new win.Event("scroll"));
        win.dispatchEvent(new win.Event("resize"));
        document2.querySelectorAll("img.cmp-image__image--is-loading, .imagetile img, .cmp-image img").forEach((img) => {
          try {
            img.scrollIntoView();
          } catch (e) {
          }
        });
        const isPlaceholder = (s) => !s || s.startsWith("data:") || s.startsWith("blob:");
        for (let i = 0; i < 20; i += 1) {
          const pending = [...document2.querySelectorAll(".imagetile img, .cmp-image img")].filter((img) => isPlaceholder(img.getAttribute("src")));
          if (pending.length === 0) break;
          win.scrollBy(0, 100);
          win.dispatchEvent(new win.Event("scroll"));
          yield sleep(300);
        }
        win.scrollTo(0, 0);
      } catch (e) {
        console.warn("onLoad lazy-load scroll failed:", e && e.message);
      }
    }),
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      document2.querySelectorAll(".cmp-title__text .cmp-text--blue, h1 .cmp-text--blue, h2 .cmp-text--blue, h3 .cmp-text--blue, h4 .cmp-text--blue").forEach((span) => {
        const strong = document2.createElement("strong");
        strong.textContent = span.textContent;
        span.replaceWith(strong);
      });
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const titleEl = document2.querySelector("title");
      if (titleEl && titleEl.textContent.indexOf("|") !== -1) {
        const shortTitle = titleEl.textContent.split("|")[0].trim();
        titleEl.textContent = shortTitle;
        document2.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach((m) => {
          const c = m.getAttribute("content") || "";
          if (c.indexOf("|") !== -1) m.setAttribute("content", c.split("|")[0].trim());
        });
      }
      document2.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]').forEach((m) => {
        let c = (m.getAttribute("content") || "").replace(/\s*\|\s*/g, " \u2014 ").replace(/\s+/g, " ").trim();
        if (c.length > 140) {
          c = c.slice(0, 140).replace(/\s+\S*$/, "").trim();
        }
        if (c) m.setAttribute("content", c);
      });
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const isContentNode = (n) => {
        if (n.tagName !== "TABLE" && n.closest("table")) return false;
        if (n.tagName === "P" && !n.textContent.trim() && !n.querySelector("img, a, picture")) return false;
        return true;
      };
      const CONTENT_SELECTOR = "table, h1, h2, h3, h4, h5, h6, p";
      const contentNodes = [...main.querySelectorAll(CONTENT_SELECTOR)].filter(isContentNode);
      const rebuilt = document2.createElement("div");
      let placed = 0;
      contentNodes.forEach((n) => {
        const isHeading = /^H[1-6]$/.test(n.tagName);
        const isPageMeta = n.tagName === "TABLE" && /^metadata$/i.test(n.querySelector("th") ? n.querySelector("th").textContent.trim() : "");
        if (placed > 0 && (isHeading || isPageMeta)) {
          rebuilt.append(document2.createElement("hr"));
        }
        rebuilt.append(n);
        placed += 1;
      });
      [...rebuilt.querySelectorAll("h1, h2, h3, h4, h5, h6")].forEach((h) => {
        let sib = h.nextElementSibling;
        let hasContent = false;
        while (sib && sib.tagName !== "HR") {
          if (!/^H[1-6]$/.test(sib.tagName)) {
            hasContent = true;
            break;
          }
          sib = sib.nextElementSibling;
        }
        if (!hasContent) {
          const next = h.nextElementSibling;
          if (next && next.tagName === "HR") next.remove();
          h.remove();
        }
      });
      main.textContent = "";
      main.append(rebuilt);
      const rawPath = new URL(params.originalURL || url).pathname.replace(/\.html?$/, "").replace(/\/$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath || "/index");
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_shop_exports);
})();
