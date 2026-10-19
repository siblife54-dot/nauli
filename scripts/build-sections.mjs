import { readFile, writeFile } from 'node:fs/promises';
import { renderProgram } from '../components/program.mjs';
import { renderTariffs } from '../components/tariffs.mjs';

const page = new URL('../index.html', import.meta.url);
let html = await readFile(page, 'utf8');
for (const [name, render] of [['program', renderProgram], ['tariffs', renderTariffs]]) {
  const pattern = new RegExp(`<!-- ${name}:start -->[\\s\\S]*?<!-- ${name}:end -->`);
  if (!pattern.test(html)) throw new Error(`Missing ${name} component markers`);
  html = html.replace(pattern, () => `<!-- ${name}:start -->\n${render()}\n      <!-- ${name}:end -->`);
}
await writeFile(page, html, 'utf8');
console.log('Program and tariffs rendered into index.html. No client-side rendering or dependencies.');
