#!/usr/bin/env node
/**
 * scripts/legacy-css.mjs
 *
 * Post-build pass that rewrites the CSS Next.js emitted so it renders in
 * legacy headless engines (technicalseo.com Fetch & Render, old Puppeteer /
 * Chromium builds, screenshot services) WITHOUT downgrading Tailwind v4.
 *
 * What it fixes in Tailwind v4 output:
 *   1. @layer theme/base/components/utilities  -> flattened (Chrome <99 drops
 *      the whole block, which is why the page renders unstyled)
 *   2. oklch() / oklab() / lab() colours       -> hex/rgb, with the modern
 *      value kept behind @supports (incl. inside custom properties)
 *   3. @property-registered --tw-* variables   -> Tailwind's own fallback
 *      block is un-gated so non-Safari legacy engines get the initial values
 *   4. CSS nesting, media-range syntax, prefixes -> transpiled by Lightning CSS
 *
 * color-mix() needs no work: Tailwind already emits a hex fallback and guards
 * the modern value with @supports (color: color-mix(in lab, red, red)).
 *
 * Usage:  node scripts/legacy-css.mjs [--check] [dir ...]
 *   --check  exit 1 if any modern syntax survives (use in CI)
 */

import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import cascadeLayers from '@csstools/postcss-cascade-layers';
import { transform, browserslistToTargets, Features } from 'lightningcss';
import browserslist from 'browserslist';

/** Oldest engines we want the production CSS to render in. */
const BROWSERS = [
  'chrome >= 55',
  'edge >= 79',
  'firefox >= 60',
  'safari >= 11',
  'ios_saf >= 11',
];

const TARGETS = browserslistToTargets(browserslist(BROWSERS));

/**
 * 'cascade' (default) = @csstools/postcss-cascade-layers, which reproduces real
 *   layer precedence with :not(#\#) specificity padding. Byte-for-byte correct,
 *   ~25% larger, slightly ugly selectors.
 * 'strip'   = just unwrap the @layer blocks and rely on source order (which
 *   Tailwind already emits in layer order). Smaller and cleaner, but unlayered
 *   CSS in globals.css no longer automatically beats a higher-specificity
 *   utility. Switch to this only if output size matters more than exactness.
 */
const LAYER_STRATEGY = 'cascade';

/** Skip the display-p3 / lab() duplicate fallbacks - sRGB hex is enough here. */
const EXCLUDE = Features.P3Colors | Features.LabColors | Features.ColorFunction;

/** Unwrap @layer blocks, keeping source order. */
const stripLayers = () => ({
  postcssPlugin: 'strip-cascade-layers',
  AtRule: {
    layer: (rule) => {
      if (rule.nodes) rule.replaceWith(rule.nodes);
      else rule.remove();
    },
  },
});

const DEFAULT_DIRS = [
  '.next/static/css',
  '.next/static/chunks',
  'out/_next/static/css',
  'out/_next/static/chunks',
  'dist/_next/static/css',
];

/**
 * Tailwind wraps its @property fallback in an @supports test that only matches
 * Safari < 16.4 and Firefox. Legacy Chromium fails that test and therefore
 * never gets the --tw-* initial values (shadows, transforms, rings break).
 * Unwrap it so every engine gets the defaults, exactly like Tailwind v3 did.
 */
const unwrapPropertyFallback = () => ({
  postcssPlugin: 'unwrap-tailwind-property-fallback',
  AtRule: {
    supports: (rule) => {
      const p = rule.params;
      const isTailwindPropertyGuard =
        p.includes('-moz-orient') &&
        (p.includes('margin-trim') || p.includes('-webkit-hyphens'));
      if (!isTailwindPropertyGuard) return;
      rule.replaceWith(rule.nodes);
    },
  },
});

function scan(css) {
  const layers = (css.match(/@layer[^;{]*\{/g) || []).length;
  const okl = (css.match(/okl(ch|ab)\(/g) || []).length;
  const rel = (css.match(/\(\s*from\s/g) || []).length;
  // color-mix outside an @supports guard would be fatal; count total vs guarded
  const mix = (css.match(/color-mix\(/g) || []).length;
  const guards = (css.match(/@supports \(color: ?color-mix\(/g) || []).length;
  const prop = (css.match(/@property/g) || []).length;
  return { layers, okl, rel, mix, guards, prop, bytes: css.length };
}

async function processFile(file, check) {
  const before = fs.readFileSync(file, 'utf8');
  if (!/@layer|okl(ch|ab)\(|color-mix\(|@property/.test(before)) return null;

  const layerPlugin =
    LAYER_STRATEGY === 'strip'
      ? stripLayers()
      : cascadeLayers({
          onRevertLayerKeyword: 'warn',
          onConditionalRulesChangingLayerOrder: 'warn',
        });

  const flattened = await postcss([layerPlugin, unwrapPropertyFallback()]).process(before, {
    from: file,
    to: file,
  });

  const { code } = transform({
    filename: path.basename(file),
    code: Buffer.from(flattened.css),
    targets: TARGETS,
    exclude: EXCLUDE,
    minify: true,
    errorRecovery: true,
    drafts: { customMedia: false },
  });

  const after = code.toString();
  fs.writeFileSync(file, after);

  const b = scan(before);
  const a = scan(after);
  console.log(
    `\n  ${path.relative(process.cwd(), file)}\n` +
      `    @layer blocks : ${b.layers} -> ${a.layers}\n` +
      `    oklch/oklab   : ${b.okl} -> ${a.okl}\n` +
      `    color-mix()   : ${b.mix} (guarded by ${b.guards} @supports) -> ${a.mix} (${a.guards})\n` +
      `    @property     : ${b.prop} -> ${a.prop} (initial values now un-gated)\n` +
      `    size          : ${(b.bytes / 1024).toFixed(1)}kB -> ${(a.bytes / 1024).toFixed(1)}kB`
  );

  if (check && (a.layers > 0 || a.okl > 0 || a.rel > 0)) {
    console.error(`    FAIL: modern syntax survived in ${file}`);
    return false;
  }
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const dirs = args.filter((a) => !a.startsWith('--'));
  const roots = (dirs.length ? dirs : DEFAULT_DIRS).filter((d) => fs.existsSync(d));

  if (!roots.length) {
    console.error('legacy-css: no build output found. Run `next build` first.');
    process.exit(1);
  }

  const files = [];
  for (const root of roots) {
    const stack = [root];
    while (stack.length) {
      const dir = stack.pop();
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) stack.push(full);
        else if (entry.name.endsWith('.css')) files.push(full);
      }
    }
  }

  console.log(`legacy-css: downleveling ${files.length} file(s) for ${BROWSERS.join(', ')}`);

  let ok = true;
  for (const file of files) {
    const result = await processFile(file, check);
    if (result === false) ok = false;
  }

  console.log(ok ? '\nlegacy-css: done.' : '\nlegacy-css: FAILED.');
  if (!ok) process.exit(1);
}

main().catch((err) => {
  console.error('legacy-css: ', err);
  process.exit(1);
});
