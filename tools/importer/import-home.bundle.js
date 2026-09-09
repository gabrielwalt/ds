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

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-home.js
  function parse(element, { document: document2 }) {
    const bgImage = element.querySelector(
      ".cmp-hero__bannerimg-div img, .cmp-hero__img-div img, .cmp-image__image, img"
    );
    const heading = element.querySelector(
      ".cmp-hero__title .cmp-maintitle__text, .cmp-maintitle__text, .cmp-hero__title h1, h1, h2"
    );
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
    if (bgImage) cells.push([bgImage]);
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

  // tools/importer/parsers/carousel-promo.js
  function parse2(element, { document: document2 }) {
    let slides = Array.from(element.querySelectorAll(":scope .swiper-slide"));
    if (!slides.length) {
      slides = Array.from(
        element.querySelectorAll(".promocards, .course-card, .cmp-teaser")
      );
    }
    const cells = [];
    slides.forEach((slide) => {
      const image = slide.querySelector(
        ".cmp-promocard__card-image img, .cmp-image__image, img"
      );
      const label = Array.from(
        slide.querySelectorAll(
          ".cmp-promocard__card-label .cmp-label__text, .cmp-label__text"
        )
      ).find((el) => el.textContent.trim());
      const heading = slide.querySelector(
        ".cmp-promocard__card-title .cmp-title__text, .cmp-title__text, h1, h2, h3, h4, h5, h6"
      );
      const description = slide.querySelector(
        ".cmp-promocard__card-text, .cmp-teaser__text, .cmp-text"
      );
      const ctaLinks = Array.from(
        slide.querySelectorAll(
          ".cmp-promocard__card-button1 a, .cmp-promocard__card-button2 a, .cmp-teaser__button a, a.cmp-button, .cmp-teaser__action-link"
        )
      ).filter((a) => {
        const href = a.getAttribute("href");
        return href && href.trim() && !href.trim().startsWith("#");
      });
      const contentCell = [];
      if (label && label.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = label.textContent.trim();
        contentCell.push(p);
      }
      if (heading) contentCell.push(heading);
      if (description) contentCell.push(description);
      contentCell.push(...ctaLinks);
      if (!image && !contentCell.length) return;
      cells.push([image || "", contentCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "carousel-promo",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function parse3(element, { document: document2 }) {
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

  // tools/importer/parsers/cards-overlay.js
  function parse4(element, { document: document2 }) {
    const image = element.querySelector(
      ".cmp-imagetile__image-wrapper img, .cmp-image__image, img"
    );
    const heading = element.querySelector(
      ".cmp-imagetile__content-wrapper .cmp-title__text, .cmp-title__text, h1, h2, h3, h4, h5, h6"
    );
    const description = element.querySelector(
      ".cmp-imagetile__content-wrapper .cmp-text, .cmp-text"
    );
    const ctaLinks = Array.from(
      element.querySelectorAll(".cmp-imagetile__content-wrapper a.cmp-button, a.cmp-button")
    );
    if (!image && !heading && !description) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    contentCell.push(...ctaLinks);
    const cells = [];
    cells.push([image || "", contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "cards-overlay",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-quote.js
  function parse5(element, { document: document2 }) {
    const heading = element.querySelector(
      ".content .cmp-title__text, .cmp-title__text, h1, h2, h3, h4, h5, h6"
    );
    const description = element.querySelector(
      ".content .cmp-text, .cmp-text, .text"
    );
    const ctaLinks = Array.from(
      element.querySelectorAll(".content a.cmp-button, a.cmp-button")
    );
    if (!heading && !description && !ctaLinks.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    contentCell.push(...ctaLinks);
    const cells = [];
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "cards-quote",
      cells
    });
    element.replaceWith(block);
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

  // tools/importer/import-home.js
  var parsers = {
    "hero-home": parse,
    "carousel-promo": parse2,
    "cards-feature": parse3,
    "cards-overlay": parse4,
    "cards-quote": parse5
  };
  var PAGE_TEMPLATE = {
    name: "home",
    description: "Dentsply Sirona (en-us) homepage: hero, promo carousel, icon feature card grids, photo-overlay toolkit tiles, course carousel, and text case-study cards.",
    urls: [
      "https://www.dentsplysirona.com/en-us"
    ],
    blocks: [
      {
        name: "hero-home",
        instances: [".hero.cmp-hero__banner-center--large", ".hero"]
      },
      {
        name: "carousel-promo",
        instances: [".slider-container"]
      },
      {
        name: "cards-feature",
        instances: [".teaser.basemarketingproperties", ".iconcard"]
      },
      {
        name: "cards-overlay",
        instances: [".imagetile"]
      },
      {
        name: "cards-quote",
        instances: [".quotecard"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero",
        selector: "body > div.bootstrap-template.bootstrap-container.container:nth-of-type(1) > div.cmp-container > div.container.responsivegrid.cmp__container--fluid:nth-of-type(4) > div.cmp-container > div.hero.cmp-hero__banner-center--large.cmp-hero__white-title-style:nth-of-type(1)",
        style: null,
        blocks: ["hero-home"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Promo carousel",
        selector: "body > div.bootstrap-template.bootstrap-container.container:nth-of-type(1) > div.cmp-container > div.container.responsivegrid.cmp__container--fluid:nth-of-type(4) > div.cmp-container > div.bootstrap-grid.cmp__container--minus-mt-58:nth-of-type(2)",
        style: null,
        blocks: ["carousel-promo"],
        defaultContent: []
      },
      {
        id: "section-3",
        name: "Workflow features",
        selector: "body > div.bootstrap-template.bootstrap-container.container:nth-of-type(1) > div.cmp-container > div.container.responsivegrid.cmp__container--fluid:nth-of-type(4) > div.cmp-container > div.bootstrap-grid:nth-of-type(3)",
        style: "grey-soft",
        blocks: ["cards-feature"],
        defaultContent: [".title"]
      },
      {
        id: "section-4",
        name: "Toolkit photo tiles",
        selector: "body > div.bootstrap-template.bootstrap-container.container:nth-of-type(1) > div.cmp-container > div.container.responsivegrid.cmp__container--fluid:nth-of-type(4) > div.cmp-container > div.bootstrap-grid:nth-of-type(4)",
        style: "grey",
        blocks: ["cards-overlay"],
        defaultContent: [".title"]
      },
      {
        id: "section-5",
        name: "Goal tools (dark)",
        selector: "body > div.bootstrap-template.bootstrap-container.container:nth-of-type(1) > div.cmp-container > div.container.responsivegrid.cmp__container--fluid:nth-of-type(4) > div.cmp-container > div.bootstrap-grid:nth-of-type(5)",
        style: "dark",
        blocks: ["cards-feature"],
        defaultContent: [".title"]
      },
      {
        id: "section-6",
        name: "Course carousel",
        selector: "body > div.bootstrap-template.bootstrap-container.container:nth-of-type(1) > div.cmp-container > div.container.responsivegrid.cmp__container--fluid:nth-of-type(4) > div.cmp-container > div.bootstrap-grid:nth-of-type(6)",
        style: null,
        blocks: ["carousel-promo"],
        defaultContent: [".title"]
      },
      {
        id: "section-7",
        name: "Advantage (blue)",
        selector: "body > div.bootstrap-template.bootstrap-container.container:nth-of-type(1) > div.cmp-container > div.container.responsivegrid.cmp__container--fluid:nth-of-type(4) > div.cmp-container > div.bootstrap-grid:nth-of-type(7)",
        style: "blue",
        blocks: ["cards-feature"],
        defaultContent: [".title", ".text"]
      },
      {
        id: "section-8",
        name: "Case-study cards (dark)",
        selector: "body > div.bootstrap-template.bootstrap-container.container:nth-of-type(1) > div.cmp-container > div.container.responsivegrid.cmp__container--fluid:nth-of-type(4) > div.cmp-container > div.bootstrap-grid:nth-of-type(8)",
        style: "dark",
        blocks: ["cards-quote"],
        defaultContent: [".title"]
      },
      {
        id: "section-9",
        name: "Contact features",
        selector: "body > div.bootstrap-template.bootstrap-container.container:nth-of-type(1) > div.cmp-container > div.container.responsivegrid.cmp__container--fluid:nth-of-type(4) > div.cmp-container > div.bootstrap-grid:nth-of-type(9)",
        style: null,
        blocks: ["cards-feature"],
        defaultContent: [".title"]
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
  var import_home_default = {
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
      const SECTION_CTAS = [
        { heading: "Dentsply Sirona Advantage", label: "Learn more", href: "https://www.dentsplysirona.com/en-us/why-ds.html" },
        { heading: "find what you need", label: "Visit support", href: "https://www.dentsplysirona.com/en-us/support.html" },
        { heading: "Training to meet you where you are", label: "Explore Academy", href: "https://www.dentsplysirona.com/en-us/learn.html" }
      ];
      SECTION_CTAS.forEach(({ heading, label, href }) => {
        const h = [...main.querySelectorAll("h1, h2, h3, h4")].find((el) => el.textContent.includes(heading));
        if (!h) return;
        const section = h.closest("div.bootstrap-grid") || h.parentElement;
        if (!section) return;
        if ([...section.querySelectorAll("a")].some((a2) => a2.textContent.trim() === label && a2.closest("p"))) return;
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = label;
        strong.append(a);
        p.append(strong);
        section.append(p);
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
      main.textContent = "";
      main.append(rebuilt);
      const path = WebImporter.FileUtils.sanitizePath("/index");
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
  return __toCommonJS(import_home_exports);
})();
