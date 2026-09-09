#!/usr/bin/env node
/* eslint-disable no-console, no-restricted-syntax, no-continue */
/**
 * Post-import image optimizer.
 *
 * EDS refuses to preview/publish a page whose referenced images exceed 20 MB.
 * The source site serves some assets as raw DAM download URLs
 * (`/content/dam/....jpg|png`) that return the full-resolution original
 * (20-40 MB) and — unlike Scene7 (`s7d1.scene7.com/is/image/...`) URLs — ignore
 * width/quality query params, so they cannot be shrunk at the source.
 *
 * This script scans imported `content/**\/*.plain.html`, finds every DAM image
 * reference, checks its byte size, and for any over the threshold:
 *   1. downloads the original,
 *   2. re-encodes it to a web-appropriate size (max 2000px wide, quality 82,
 *      stripped metadata) with ImageMagick — a huge size cut with no visible
 *      quality loss at display sizes,
 *   3. writes it to `content/images/<slug>.jpg` (the local copy to upload),
 *   4. rewrites every reference in every page to `/en-us/images/<slug>.jpg`.
 *
 * Reference path note: the optimised files are referenced at `/en-us/images/…`
 * — the path they serve from on EDS once uploaded to Document Authoring
 * (`admin.da.live/source/{org}/{repo}/en-us/images/<slug>.jpg`). The local
 * `aem up` dev server proxies that path to the EDS preview, so the same
 * reference renders in both environments. After running this script, upload the
 * files in `content/images/` to DA at `en-us/images/` and trigger a preview.
 *
 * Scene7 URLs are left untouched (Scene7 serves resized renditions already).
 *
 * Usage:  node tools/importer/optimize-oversized-images.js [--max-mb 20] [--width 2000]
 * Requires: ImageMagick `convert` on PATH, network access to the source host.
 */
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const CONTENT_DIR = path.join(ROOT, 'content');
const IMAGES_DIR = path.join(CONTENT_DIR, 'images');

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const MAX_MB = parseFloat(getArg('max-mb', '20'));
const THRESHOLD = parseFloat(getArg('threshold-mb', '18')) * 1048576; // optimise a bit below the hard cap
const MAX_WIDTH = parseInt(getArg('width', '2000'), 10);
const QUALITY = parseInt(getArg('quality', '82'), 10);

// Recursively list every .plain.html under content/ (skip the images dir).
function listPlainHtml(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full !== IMAGES_DIR) out.push(...listPlainHtml(full));
    } else if (entry.name.endsWith('.plain.html')) {
      out.push(full);
    }
  }
  return out;
}

// Turn a DAM URL into a short, stable, unique local filename.
function slugFor(url) {
  const base = decodeURIComponent(url.split('/').pop()).replace(/\.[a-z]+$/i, '');
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  return `${slug}.jpg`;
}

function contentLength(url) {
  try {
    const head = execSync(`curl -sI -L --max-time 60 "${url.replace(/"/g, '')}"`, { encoding: 'utf8' });
    const m = head.match(/content-length:\s*(\d+)/i);
    return m ? parseInt(m[1], 10) : 0;
  } catch (e) {
    return 0;
  }
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error('No content/ directory found.');
    process.exit(1);
  }
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const files = listPlainHtml(CONTENT_DIR);
  // Collect every distinct DAM image URL across all pages.
  const damUrls = new Set();
  const DAM_RE = /(https:\/\/[^"'\s]*\/content\/dam\/[^"'\s]+\.(?:png|jpe?g))/gi;
  for (const f of files) {
    const html = fs.readFileSync(f, 'utf8');
    let m;
    // eslint-disable-next-line no-cond-assign
    while ((m = DAM_RE.exec(html)) !== null) damUrls.add(m[1]);
  }

  const rewrites = new Map(); // originalUrl (all variants) -> local path
  for (const url of damUrls) {
    const bytes = contentLength(url);
    if (bytes <= THRESHOLD) continue; // small enough — leave the original reference
    const name = slugFor(url);
    // Reference path = where the asset serves on EDS (uploaded to DA under
    // en-us/images/); the local dev server proxies this to the EDS preview.
    const localRel = `/en-us/images/${name}`;
    const localAbs = path.join(IMAGES_DIR, name);
    const tmp = path.join('/tmp', `opt-src-${name}`);
    try {
      execSync(`curl -s -L --max-time 180 "${url.replace(/"/g, '')}" -o "${tmp}"`);
      // resize only if wider than MAX_WIDTH ('>' modifier), strip metadata, re-encode
      execFileSync('convert', [tmp, '-resize', `${MAX_WIDTH}x${MAX_WIDTH}>`, '-strip', '-interlace', 'Plane', '-quality', String(QUALITY), localAbs]);
      const after = fs.statSync(localAbs).size;
      console.log(`optimised ${name}: ${(bytes / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(1)}MB`);
      rewrites.set(url, localRel);
    } catch (e) {
      console.error(`FAILED to optimise ${url}: ${e.message}`);
    }
  }

  if (!rewrites.size) {
    console.log(`No DAM images over ${(THRESHOLD / 1048576).toFixed(0)}MB found. Nothing to do.`);
    return;
  }

  // Rewrite references in every page (handle %20 and literal-space variants).
  let totalRefs = 0;
  for (const f of files) {
    let html = fs.readFileSync(f, 'utf8');
    let changed = false;
    for (const [orig, local] of rewrites) {
      for (const variant of [orig, orig.replace(/%20/g, ' ')]) {
        if (html.includes(variant)) {
          html = html.split(variant).join(local);
          changed = true;
          totalRefs += 1;
        }
      }
    }
    if (changed) fs.writeFileSync(f, html);
  }
  console.log(`Rewrote ${totalRefs} reference(s) across ${files.length} page(s); optimised ${rewrites.size} image(s) (cap ${MAX_MB}MB).`);
}

main();
