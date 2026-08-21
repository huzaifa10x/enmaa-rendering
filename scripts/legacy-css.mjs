#!/usr/bin/env node
/**
 * scripts/legacy-css.mjs
 *
 * Post-build pass that rewrites the CSS Next.js emitted so it renders in
 * Chromium 79 (the engine used by technicalseo.com Fetch & Render) WITHOUT
 * downgrading Tailwind v4.
 *
 * Transforms applied, in order:
 *   1. :where() -> :is() -> expanded into plain selector lists   (Chrome <88)
 *   2. @layer flattened with specificity padding                 (Chrome <99)
 *   3. Tailwind's @property fallback un-gated so Chromium gets
 *      the --tw-* initial values                                 (Chrome <85)
 *   4. --tw-scale-*: N%  ->  decimal, so scaleX()/scaleY() parse  (Chrome <104)
 *   5. translate/rotate/scale independent properties get a
 *      composed `transform` fallback                             (Chrome <104)
 *   6. flex `gap` gets margin-based fallbacks                     (Chrome <84)
 *   7. aspect-ratio gets a padding-bottom fallback                (Chrome <88)
 *   8. Lightning CSS pass at targets: chrome 79
 *
 * Every fallback in 5-7 is wrapped in an @supports guard that is FALSE on
 * modern engines, so current browsers are byte-for-byte unaffected.
 *
 * oklch()/color-mix() need no work here: Turbopack's own Lightning CSS pass
 * already resolves oklch, and Tailwind emits hex fallbacks for color-mix
 * behind @supports (color: color-mix(in lab, red, red)).
 *
 * Usage:  node scripts/legacy-css.mjs [--check] [dir ...]
 *   --check  exit 1 if any modern syntax survives (use in CI)
 */

import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import cascadeLayers from '@csstools/postcss-cascade-layers';
import isPseudoClass from '@csstools/postcss-is-pseudo-class';
import { transform, browserslistToTargets, Features } from 'lightningcss';
import browserslist from 'browserslist';

/** The Fetch & Render tool pins Chromium 79. That is the floor. */
const BROWSERS = ['chrome >= 79'];
const TARGETS = browserslistToTargets(browserslist(BROWSERS));

/** Skip display-p3 / lab() duplicate fallbacks - sRGB hex is enough. */
const EXCLUDE = Features.P3Colors | Features.LabColors | Features.ColorFunction;

/**
 * Feature queries used to gate the legacy fallbacks. Each is FALSE on engines
 * that already support the real feature, so modern rendering is untouched.
 *
 *   inset      -> Chrome 87, Safari 14.1, Firefox 66
 *   flex gap   -> Chrome 84, Safari 14.1, Firefox 63
 * Safari lines up exactly; Chrome 84-86 and Firefox 63-65 get both gap and the
 * margin fallback (slightly wide spacing). Those are 2020 builds, ~0% traffic.
 */
const GUARD_GAP = 'not (inset: 0)';
/** translate as an independent property -> Chrome 104, Safari 14.1, Firefox 72 */
const GUARD_TRANSFORM = 'not (translate: 0px)';
/** aspect-ratio -> Chrome 88, Safari 15, Firefox 89 */
const GUARD_ASPECT = 'not (aspect-ratio: 1 / 1)';

const DEFAULT_DIRS = [
  '.next/static/css',
  '.next/static/chunks',
  'out/_next/static/css',
  'out/_next/static/chunks',
  'dist/_next/static/css',
];

/** :where() has no legacy equivalent; :is() at least expands. */
const whereToIs = () => ({
  postcssPlugin: 'where-to-is',
  Rule(rule) {
    if (rule.selector.includes(':where(')) {
      rule.selector = rule.selector.replaceAll(':where(', ':is(');
    }
  },
});

/**
 * Tailwind wraps its @property fallback in an @supports test matching only
 * Safari <16.4 and Firefox. Legacy Chromium fails it and gets no --tw-*
 * defaults, so shadows/transforms/rings break. Un-gate it, as v3 did.
 */
const unwrapPropertyFallback = () => ({
  postcssPlugin: 'unwrap-tailwind-property-fallback',
  AtRule: {
    supports: (rule) => {
      const p = rule.params;
      if (p.includes('-moz-orient') && (p.includes('margin-trim') || p.includes('-webkit-hyphens'))) {
        rule.replaceWith(rule.nodes);
      }
    },
  },
});

/**
 * Tailwind v4 sets --tw-scale-x: 105%. `scale: 105%` is valid; `scaleX(105%)`
 * is not, in Chromium 79. Percentages and decimals are equivalent for both, so
 * normalise to decimals and both paths parse.
 */
const decimalScale = () => ({
  postcssPlugin: 'decimal-scale-vars',
  Declaration(decl) {
    if (!/^--tw-(scale|enter-scale|exit-scale)/.test(decl.prop)) return;
    const m = decl.value.trim().match(/^(-?[\d.]+)%$/);
    if (m) decl.value = String(Number(m[1]) / 100);
  },
});

const supportsWrap = (rule, params, cssText) => {
  const at = postcss.parse(`@supports ${params}{${cssText}}`).first;
  rule.after(at);
};

/** Compose translate/rotate/scale into a single `transform`. */
const TRANSFORM_FALLBACK =
  'transform:translate(var(--tw-translate-x,0),var(--tw-translate-y,0))' +
  ' rotate(var(--tw-rotate-z,0deg))' +
  ' scaleX(var(--tw-scale-x,1)) scaleY(var(--tw-scale-y,1))';

const transformFallback = () => ({
  postcssPlugin: 'legacy-transform-fallback',
  OnceExit(root) {
    root.walkRules((rule) => {
      let touched = false;
      let literalRotate = null;
      rule.each((decl) => {
        if (decl.type !== 'decl') return;
        if (decl.prop === 'translate' || decl.prop === 'scale') touched = true;
        if (decl.prop === 'rotate') {
          touched = true;
          if (!decl.value.includes('var(')) literalRotate = decl.value;
        }
      });
      if (!touched) return;
      const body =
        `${rule.selector}{` +
        (literalRotate ? `--tw-rotate-z:${literalRotate};` : '') +
        TRANSFORM_FALLBACK +
        '}';
      supportsWrap(rule, GUARD_TRANSFORM, body);
    });
  },
});

/** Margin-based stand-in for flex gap. Grid gap already works in Chromium 79. */
const gapFallback = () => ({
  postcssPlugin: 'legacy-flex-gap-fallback',
  OnceExit(root) {
    root.walkRules((rule) => {
      let row = null;
      let col = null;
      rule.each((decl) => {
        if (decl.type !== 'decl') return;
        if (decl.prop === 'gap') {
          const parts = decl.value.trim().split(/\s+(?![^(]*\))/);
          row = parts[0];
          col = parts[1] || parts[0];
        } else if (decl.prop === 'row-gap') row = decl.value;
        else if (decl.prop === 'column-gap') col = decl.value;
      });
      if (row === null && col === null) return;
      const sel = rule.selector;
      const c = col ?? row;
      const r = row ?? col;
      const body =
        `${sel}.flex>*+*{margin-inline-start:${c}}` +
        `${sel}.flex.flex-col>*+*{margin-inline-start:0;margin-top:${r}}` +
        `${sel}.flex.flex-wrap>*{margin-bottom:${r}}`;
      supportsWrap(rule, GUARD_GAP, body);
    });
  },
});

/**
 * padding-bottom stand-in for aspect-ratio. Scoped to `.relative` because every
 * aspect-* usage in this codebase is a relative box holding an absolutely
 * positioned <Image fill>; applying it to sized elements (avatar, radio) would
 * collapse them.
 */
const aspectFallback = () => ({
  postcssPlugin: 'legacy-aspect-ratio-fallback',
  OnceExit(root) {
    root.walkRules((rule) => {
      rule.each((decl) => {
        if (decl.type !== 'decl' || decl.prop !== 'aspect-ratio') return;
        const m = decl.value.trim().match(/^([\d.]+)\s*(?:\/\s*([\d.]+))?$/);
        if (!m) return;
        const w = Number(m[1]);
        const h = m[2] ? Number(m[2]) : 1;
        if (!w || !h) return;
        const pct = ((h / w) * 100).toFixed(4).replace(/\.?0+$/, '');
        const body = `${rule.selector}.relative{height:0;padding-bottom:${pct}%}`;
        supportsWrap(rule, GUARD_ASPECT, body);
      });
    });
  },
});

function scan(css) {
  const c = (re) => (css.match(re) || []).length;
  return {
    layers: c(/@layer[^;{]*\{/g),
    okl: c(/okl(ch|ab)\(/g),
    is: c(/:is\(/g),
    where: c(/:where\(/g),
    indep: c(/[;{](translate|rotate|scale):/g),
    bytes: css.length,
  };
}

async function processFile(file, check) {
  const before = fs.readFileSync(file, 'utf8');

  if (before.includes('scaleX(var(--tw-scale-x')) {
    console.log(`\n  ${path.relative(process.cwd(), file)}\n    already processed - skipping`);
    return null;
  }

  if (!/@layer|okl(ch|ab)\(|:is\(|:where\(|gap:|aspect-ratio|@property/.test(before)) return null;

  const flattened = await postcss([
    whereToIs(),
    isPseudoClass({ onComplexSelector: 'warning' }),
    cascadeLayers({ onRevertLayerKeyword: 'warn', onConditionalRulesChangingLayerOrder: 'warn' }),
    unwrapPropertyFallback(),
    decimalScale(),
    transformFallback(),
    gapFallback(),
    aspectFallback(),
  ]).process(before, { from: file, to: file });

  const { code } = transform({
    filename: path.basename(file),
    code: Buffer.from(flattened.css),
    targets: TARGETS,
    exclude: EXCLUDE,
    minify: true,
    errorRecovery: true,
  });

  const after = code.toString();
  fs.writeFileSync(file, after);

  const b = scan(before);
  const a = scan(after);
  console.log(
    `\n  ${path.relative(process.cwd(), file)}\n` +
    `    @layer blocks    : ${b.layers} -> ${a.layers}\n` +
    `    oklch/oklab      : ${b.okl} -> ${a.okl}\n` +
    `    :is() / :where() : ${b.is} / ${b.where} -> ${a.is} / ${a.where}\n` +
    `    translate/scale  : ${b.indep} -> ${a.indep} (transform fallback added)\n` +
    `    size             : ${(b.bytes / 1024).toFixed(1)}kB -> ${(a.bytes / 1024).toFixed(1)}kB`
  );

  if (check && (a.layers || a.okl || a.is || a.where)) {
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
    if ((await processFile(file, check)) === false) ok = false;
  }

  console.log(ok ? '\nlegacy-css: done.' : '\nlegacy-css: FAILED.');
  if (!ok) process.exit(1);
}

main().catch((err) => {
  console.error('legacy-css: ', err);
  process.exit(1);
});
