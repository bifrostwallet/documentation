/**
 * CSP hygiene after `docusaurus build`.
 *
 * Docusaurus theme-classic injects:
 * - An executable inline FOUC/theme script (preBody)
 * - An SVG sprite with style="display: none;"
 *
 * This site is dark-only (`disableSwitch` + `defaultMode: 'dark'`), so we bake
 * theme attrs onto <html>, strip executable inline scripts, and move the SVG
 * hide rule into CSS. Prism still emits style="" on tokens — covered by
 * style-src-attr 'unsafe-inline' on the backend bucket (see STATUS.md).
 *
 * JSON-LD (`type="application/ld+json"`) is left in place; it is not JS and is
 * not governed by script-src under CSP Level 3.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const buildDir = path.join(root, "build");

function executableInlineScripts(html) {
  const re =
    /<script(?![^>]*\bsrc=)(?![^>]*\btype=["']application\/ld\+json["'])([^>]*)>([\s\S]*?)<\/script>/gi;
  return [...html.matchAll(re)];
}

async function* walkHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkHtml(full);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      yield full;
    }
  }
}

function transformHtml(html, filePath) {
  let next = html;
  const found = executableInlineScripts(next);
  for (const match of found) {
    next = next.replace(match[0], "");
  }

  // Bake dark theme so removing the FOUC script does not flash light mode.
  if (!/\bdata-theme=/.test(next)) {
    next = next.replace(/<html\b([^>]*)>/i, '<html$1 data-theme="dark" data-theme-choice="dark">');
  } else if (!/\bdata-theme-choice=/.test(next)) {
    next = next.replace(
      /(<html\b[^>]*\bdata-theme=["'][^"']*["'])/i,
      '$1 data-theme-choice="dark"',
    );
  }

  next = next.replace(
    /(<svg\b[^>]*)\sstyle=["']display:\s*none;?["']/gi,
    '$1 class="docusaurus-svg-sprite"',
  );

  const remaining = executableInlineScripts(next);
  if (remaining.length > 0) {
    throw new Error(`Executable inline <script> remains in ${filePath} (${remaining.length})`);
  }

  return { html: next, removed: found.length };
}

async function main() {
  let files = 0;
  let scriptsRemoved = 0;

  for await (const file of walkHtml(buildDir)) {
    const original = await readFile(file, "utf8");
    const { html, removed } = transformHtml(original, file);
    if (html !== original) {
      await writeFile(file, html);
    }
    files += 1;
    scriptsRemoved += removed;
  }

  if (files === 0) {
    throw new Error(`No HTML under ${buildDir}; run docusaurus build first`);
  }

  console.log(
    `CSP postbuild: ${files} HTML pages, removed ${scriptsRemoved} executable inline script(s)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
