import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root = path.resolve(import.meta.dirname, '..');
const assets = path.join(root, 'dist/assets');
let scripts = 0, references = 0;
function verifyReference(reference, source) {
  if (/^(#|data:|https?:)/i.test(reference)) return;
  if (reference.startsWith('/')) throw Error(`Root-relative path breaks GitHub Pages: ${reference}`);
  const target = path.resolve(path.dirname(source), reference.split(/[?#]/)[0]);
  if (!target.startsWith(assets + path.sep) || !fs.existsSync(target)) {
    throw Error(`Missing or misplaced asset in ${source}: ${reference}`);
  }
  references++;
}
for (const file of ['index.html', 'dist/index.html', 'dist/facecontrol/index.html']) {
  const source = path.join(root, file);
  const html = fs.readFileSync(source, 'utf8');
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc=/.test(match[1])) continue;
    new vm.Script(match[2], { filename: file });
    scripts++;
  }
  for (const match of html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
    verifyReference(match[1], source);
  }
  if (/mc\.yandex\.ru|widget\/script|tilda-stat-1/.test(html)) throw Error('Remote tracking/payment script remains');
}
for (const file of fs.readdirSync(assets)) {
  if (file.endsWith('.js')) {
    new vm.Script(fs.readFileSync(path.join(assets, file), 'utf8'), {filename: file});
    scripts++;
  }
  if (file.endsWith('.css')) {
    const source = path.join(assets, file);
    const css = fs.readFileSync(source, 'utf8');
    for (const match of css.matchAll(/url\(['"]?([^'"\s)]+)['"]?\)/g)) {
      verifyReference(match[1], source);
    }
  }
}
if (!fs.existsSync(path.join(root, '.nojekyll'))) throw Error('Missing GitHub Pages static marker');
console.log(JSON.stringify({scripts, references, assets: fs.readdirSync(assets).length, status:'passed'}));
