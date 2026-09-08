import { createOptimizedPicture } from '../../scripts/aem.js';
import ICONS from './icons.js';

/*
 * Icon-led feature cards on the source use small Phosphor glyphs above the
 * title (info / graduation-cap / handshake / globe / books / users / envelope /
 * download / question). Those glyphs live in the source's CSS classes, which are
 * stripped at import time, so the imported cards carry no icon reference. We
 * restore them here by mapping each card's heading text to the icon the source
 * used, then injecting the extracted Phosphor SVG. Cards that already have an
 * imported image (e.g. the Diagnose/Plan/Make illustrations) are left untouched.
 */
const HEADING_ICON_MAP = [
  [/about ds academy/i, 'Info'],
  [/continuing education/i, 'GraduationCap'],
  [/practice management/i, 'Handshake'],
  [/sales operations/i, 'Globe'],
  [/broadest portfolio/i, 'Flexibility'],
  [/innovation is in our dna/i, 'Books'],
  [/ds worlds/i, 'UsersFour'],
  [/connect with us/i, 'EnvelopeSimple'],
  [/download center/i, 'DownloadSimple'],
  [/help topics/i, 'Question'],
  [/newsletter/i, 'EnvelopeSimple'],
];

function iconForHeading(text) {
  const match = HEADING_ICON_MAP.find(([re]) => re.test(text));
  return match ? ICONS[match[1]] : null;
}

function buildIconEl(icon) {
  const wrap = document.createElement('div');
  wrap.className = 'cards-feature-card-icon';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', icon.viewBox || '0 0 60 60');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.innerHTML = icon.inner;
  wrap.append(svg);
  return wrap;
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      // Drop empty cells (e.g. icon cell where no image was imported)
      if (div.children.length === 0 && div.textContent.trim() === '') {
        div.remove();
        return;
      }
      if (div.querySelector('picture')) div.className = 'cards-feature-card-image';
      else div.className = 'cards-feature-card-body';
    });
    // If this card has no image/illustration, restore its Phosphor icon from
    // the heading text so it matches the source icon-led card.
    if (!li.querySelector('.cards-feature-card-image')) {
      const heading = li.querySelector('h3, h4, h5, h6');
      const icon = heading && iconForHeading(heading.textContent);
      if (icon) li.prepend(buildIconEl(icon));
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    // Scene7 renders these icon graphics with a fixed height; forcing only a
    // width (as createOptimizedPicture does) stretches them. Ask Scene7 to keep
    // the native aspect ratio so the illustration is not distorted.
    optimizedPic.querySelectorAll('source').forEach((source) => {
      if (source.srcset && source.srcset.includes('scene7.com') && !source.srcset.includes('fit=')) {
        source.srcset = source.srcset.replace(/(scene7\.com\/[^\s,]*)/g, '$1&fit=constrain');
      }
    });
    const newImg = optimizedPic.querySelector('img');
    if (newImg && newImg.src.includes('scene7.com') && !newImg.src.includes('fit=')) {
      newImg.src = `${newImg.src}&fit=constrain`;
    }
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
