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
      const label = slide.querySelector(
        ".cmp-promocard__card-label .cmp-label__text, .cmp-label__text"
      );
      const heading = slide.querySelector(
        ".cmp-promocard__card-title .cmp-title__text, .cmp-title__text, h1, h2, h3, h4, h5, h6"
      );
      const description = slide.querySelector(
        ".cmp-promocard__card-text, .cmp-teaser__text, .cmp-text"
      );
      const ctaLinks = Array.from(
        slide.querySelectorAll(
          ".cmp-promocard__card-button1 a, .cmp-promocard__card-button2 a, a.cmp-button, .cmp-teaser__action-link"
        )
      );
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
    );
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

  // tools/importer/transformers/dentsplysirona-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        ".onetrust-pc-dark-filter"
      ]);
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
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-home.js
  var parsers = {
    "hero-home": parse,
    "carousel-promo": parse2,
    "cards-feature": parse3,
    "cards-overlay": parse4
  };
  var PAGE_TEMPLATE = {
    name: "home",
    description: "Dentsply Sirona Swiss (de-ch) homepage: hero, promo carousel, feature/goal/contact card grids, photo-overlay navigational cards, and on-demand course carousel.",
    urls: [
      "https://www.dentsplysirona.com/de-ch"
    ],
    blocks: [
      {
        name: "hero-home",
        instances: [".hero.cmp-hero__banner-center--large", ".hero"]
      },
      {
        name: "carousel-promo",
        instances: [".slider-container", ".course-card-slider.contentfragmentlist"]
      },
      {
        name: "cards-feature",
        instances: [".teaser.basemarketingproperties", ".iconcard"]
      },
      {
        name: "cards-overlay",
        instances: [".imagetile"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero and promo carousel",
        selector: "body > div.bootstrap-template.bootstrap-container.container.responsivegrid > div.cmp-container > div.container.responsivegrid.cmp__container--fluid > div.cmp-container > div.bootstrap-grid.cmp__container--minus-mt-58",
        style: null,
        blocks: ["hero-home", "carousel-promo"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Workflow features",
        selector: "body > div.bootstrap-template.bootstrap-container.container.responsivegrid > div.cmp-container > div.container.responsivegrid.cmp__container--fluid > div.cmp-container > div.bootstrap-grid:nth-of-type(2)",
        style: null,
        blocks: ["cards-feature"],
        defaultContent: [".title"]
      },
      {
        id: "section-3",
        name: "Toolkit photo cards",
        selector: "body > div.bootstrap-template.bootstrap-container.container.responsivegrid > div.cmp-container > div.container.responsivegrid.cmp__container--fluid > div.cmp-container > div.bootstrap-grid:nth-of-type(3)",
        style: null,
        blocks: ["cards-overlay"],
        defaultContent: [".title"]
      },
      {
        id: "section-4",
        name: "Goal-oriented tools (dark)",
        selector: "body > div.bootstrap-template.bootstrap-container.container.responsivegrid > div.cmp-container > div.container.responsivegrid.cmp__container--fluid > div.cmp-container > div.bootstrap-grid:nth-of-type(4)",
        style: "dark",
        blocks: ["cards-feature"],
        defaultContent: [".title"]
      },
      {
        id: "section-5",
        name: "On-demand courses carousel",
        selector: "body > div.bootstrap-template.bootstrap-container.container.responsivegrid > div.cmp-container > div.container.responsivegrid.cmp__container--fluid > div.cmp-container > div.bootstrap-grid:nth-of-type(5)",
        style: null,
        blocks: ["carousel-promo"],
        defaultContent: [".title"]
      },
      {
        id: "section-6",
        name: "Dentsply Sirona advantage (blue)",
        selector: "body > div.bootstrap-template.bootstrap-container.container.responsivegrid > div.cmp-container > div.container.responsivegrid.cmp__container--fluid > div.cmp-container > div.bootstrap-grid:nth-of-type(6)",
        style: "blue",
        blocks: ["cards-feature"],
        defaultContent: [".title", ".text"]
      },
      {
        id: "section-7",
        name: "Single feature story",
        selector: "body > div.bootstrap-template.bootstrap-container.container.responsivegrid > div.cmp-container > div.container.responsivegrid.cmp__container--fluid > div.cmp-container > div.bootstrap-grid:nth-of-type(7)",
        style: null,
        blocks: [],
        defaultContent: [".title", ".teaser"]
      },
      {
        id: "section-8",
        name: "Support and contact",
        selector: "body > div.bootstrap-template.bootstrap-container.container.responsivegrid > div.cmp-container > div.container.responsivegrid.cmp__container--fluid > div.cmp-container > div.bootstrap-grid:nth-of-type(8)",
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
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
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
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
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
