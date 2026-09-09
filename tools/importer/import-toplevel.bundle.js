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

  // tools/importer/import-toplevel.js
  var import_toplevel_exports = {};
  __export(import_toplevel_exports, {
    default: () => import_toplevel_default
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
    const cells = [];
    if (bgImage) cells.push([bgImage]);
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (subheading) contentCell.push(subheading);
    contentCell.push(...ctaLinks);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "hero-home",
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
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "cards-feature",
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

  // tools/importer/parsers/accordion.js
  function parse6(element, { document: document2 }) {
    const items = Array.from(
      element.querySelectorAll('.cmp-accordion__item, [data-cmp-hook-accordion="item"]')
    );
    const cells = [];
    items.forEach((item) => {
      const title = item.querySelector(
        '.cmp-accordion__title, [data-cmp-hook-accordion="title"]'
      );
      const panel = item.querySelector(
        '.cmp-accordion__panel, [data-cmp-hook-accordion="panel"]'
      );
      const titleText = title ? title.textContent.trim() : "";
      if (!titleText && !panel) return;
      const titleEl = document2.createElement("p");
      titleEl.textContent = titleText;
      const panelEl = document2.createElement("div");
      if (panel) {
        Array.from(panel.childNodes).forEach((n) => panelEl.appendChild(n.cloneNode(true)));
      }
      cells.push([titleEl, panelEl]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "accordion",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video.js
  function parse7(element, { document: document2 }) {
    let cards = Array.from(
      element.querySelectorAll('.cmp-videocard, [class*="videocard"]')
    );
    if (!cards.length) {
      cards = Array.from(element.querySelectorAll(".swiper-slide"));
    }
    const cells = [];
    cards.forEach((card) => {
      const image = card.querySelector("img");
      const heading = card.querySelector(
        ".cmp-title__text, .cmp-videocard__title, h1, h2, h3, h4, h5, h6"
      );
      const link = card.querySelector("a[href]");
      if (!image && !heading) return;
      const textCell = [];
      if (heading) {
        if (link) {
          const a = document2.createElement("a");
          a.setAttribute("href", link.getAttribute("href"));
          a.textContent = heading.textContent.trim();
          textCell.push(a);
        } else {
          textCell.push(heading);
        }
      } else if (link) {
        textCell.push(link);
      }
      cells.push([image || "", textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "video",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/course-teaser.js
  function parse8(element, { document: document2 }) {
    const image = element.querySelector("img, .cmp-image__image");
    const heading = element.querySelector(
      ".page-break-title .cmp-title__text, .page-break-title h1, .page-break-title h2, .page-break-title h3"
    );
    const subEl = element.querySelector(".page-break-subheading .cmp-title__text");
    let description = null;
    if (subEl && subEl.textContent.trim()) {
      description = document2.createElement("p");
      description.textContent = subEl.textContent.replace(/\s+/g, " ").trim();
    }
    const ctaLinks = Array.from(
      element.querySelectorAll(".page-break-button-container a, a.cmp-button")
    ).filter((a) => {
      const href = a.getAttribute("href");
      return href && href.trim() && !href.trim().startsWith("#");
    });
    if (!heading && !description && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    contentCell.push(...ctaLinks);
    const cells = [[image || "", contentCell]];
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "cards-feature",
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

  // tools/importer/import-toplevel.js
  var parsers = {
    "hero-home": parse,
    "carousel-promo": parse2,
    "cards-feature": parse3,
    "cards-overlay": parse4,
    "cards-quote": parse5,
    "accordion": parse6,
    "video": parse7,
    "course-teaser": parse8
  };
  var PAGE_TEMPLATE = {
    "name": "toplevel",
    "description": "Dentsply Sirona en-us top-level pages (Explore, Learn, Why DS, Support). Reuses homepage blocks (hero, cards-overlay, cards-feature, carousel-promo) plus accordion (Support FAQ) and video (Learn) blocks.",
    "urls": [
      "https://www.dentsplysirona.com/en-us/explore.html",
      "https://www.dentsplysirona.com/en-us/learn.html",
      "https://www.dentsplysirona.com/en-us/why-ds.html",
      "https://www.dentsplysirona.com/en-us/support.html"
    ],
    "blocks": [
      {
        "name": "hero-home",
        "instances": [
          ".hero.cmp-hero__banner-center--large",
          ".hero"
        ]
      },
      {
        "name": "cards-overlay",
        "instances": [
          ".imagetile"
        ]
      },
      {
        "name": "cards-feature",
        "instances": [
          ".iconcard",
          ".teaser.basemarketingproperties"
        ]
      },
      {
        "name": "carousel-promo",
        "instances": [
          ".slider-container",
          ".course-card-slider.contentfragmentlist"
        ]
      },
      {
        "name": "cards-quote",
        "instances": [
          ".quotecard"
        ]
      },
      {
        "name": "accordion",
        "instances": [
          ".accordion.panelcontainer",
          ".cmp-accordion"
        ]
      },
      {
        "name": "video",
        "instances": [
          ".videoslider"
        ]
      },
      {
        "name": "course-teaser",
        "instances": [
          ".pagebreaker-wrapper"
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
  var import_toplevel_default = {
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
      try {
        const win = document2.defaultView || window;
        const colourToStyle = (rgb) => {
          const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(rgb || "");
          if (!m) return null;
          const r = +m[1];
          const g = +m[2];
          const bl = +m[3];
          const a = m[4] === void 0 ? 1 : parseFloat(m[4]);
          if (a === 0) return null;
          const avg = (r + g + bl) / 3;
          if (avg < 110) return "dark";
          if (avg > 245) return null;
          if (avg >= 200) return "grey";
          return null;
        };
        const headings = [...document2.querySelectorAll("main h1, main h2, main h3, main h4, main h5, main h6, .cmp-container h1, .cmp-container h2, .cmp-container h3")];
        const seen = /* @__PURE__ */ new Set();
        headings.forEach((h) => {
          if (!h.textContent.trim()) return;
          let el = h;
          for (let i = 0; i < 12 && el; i += 1) {
            const cs = win.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            if (rect.width >= 1e3) {
              const style = colourToStyle(cs.backgroundColor);
              if (style) {
                const key = `${el.className}|${Math.round(rect.top)}`;
                if (!seen.has(key)) {
                  seen.add(key);
                  h.setAttribute("data-excat-section-style", style);
                }
                break;
              }
            }
            el = el.parentElement;
          }
        });
      } catch (e) {
        console.warn("onLoad section-style detection failed:", e && e.message);
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
      document2.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
        h.querySelectorAll("a").forEach((a) => {
          const href = a.getAttribute("href");
          if (!href || !href.trim()) {
            if (a.textContent.trim()) {
              a.replaceWith(document2.createTextNode(a.textContent));
            } else {
              a.remove();
            }
          }
        });
        h.querySelectorAll("p").forEach((pEl) => {
          if (!pEl.textContent.trim()) pEl.remove();
          else pEl.replaceWith(...pEl.childNodes);
        });
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
      let pendingStyle = null;
      const flushSectionMetadata = () => {
        if (!pendingStyle) return;
        const metadataBlock = WebImporter.Blocks.createBlock(document2, {
          name: "Section Metadata",
          cells: { style: pendingStyle }
        });
        rebuilt.append(metadataBlock);
        pendingStyle = null;
      };
      contentNodes.forEach((n) => {
        const isHeading = /^H[1-6]$/.test(n.tagName);
        const isPageMeta = n.tagName === "TABLE" && /^metadata$/i.test(n.querySelector("th") ? n.querySelector("th").textContent.trim() : "");
        if (placed > 0 && (isHeading || isPageMeta)) {
          flushSectionMetadata();
          rebuilt.append(document2.createElement("hr"));
        }
        if (isHeading && n.getAttribute("data-excat-section-style")) {
          pendingStyle = n.getAttribute("data-excat-section-style");
          n.removeAttribute("data-excat-section-style");
        }
        rebuilt.append(n);
        placed += 1;
      });
      flushSectionMetadata();
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
  return __toCommonJS(import_toplevel_exports);
})();
