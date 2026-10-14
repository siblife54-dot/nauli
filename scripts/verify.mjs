import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root = path.resolve(import.meta.dirname, '../dist');
let scripts = 0, references = 0;
for (const file of ['index.html', 'facecontrol/index.html']) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc=/.test(match[1])) continue;
    new vm.Script(match[2], { filename: file });
    scripts++;
  }
  for (const match of html.matchAll(/\/(assets\/[^\s"'<>),;]+)/g)) {
    if (!fs.existsSync(path.join(root, match[1].split('?')[0]))) throw Error(`Missing asset: ${match[1]}`);
    references++;
  }
  if (/mc\.yandex\.ru|widget\/script|tilda-stat-1/.test(html)) throw Error('Remote tracking/payment script remains');
}
for (const file of fs.readdirSync(path.join(root,'assets'))) {
  if (file.endsWith('.js')) {
    new vm.Script(fs.readFileSync(path.join(root, 'assets', file), 'utf8'), {filename: file});
    scripts++;
  }
  if (file.endsWith('.css')) {
    const css = fs.readFileSync(path.join(root, 'assets', file), 'utf8');
    for (const match of css.matchAll(/url\(['"]?\/(assets\/[^'"\s)]+)/g)) {
      if (!fs.existsSync(path.join(root, match[1].split('?')[0]))) throw Error(`Missing font/CSS asset: ${match[1]}`);
      references++;
    }
  }
}
console.log(JSON.stringify({scripts, references, assets: fs.readdirSync(path.join(root,'assets')).length, status:'passed'}));
