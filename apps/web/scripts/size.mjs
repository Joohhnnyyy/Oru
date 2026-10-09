// Reports the gzip size of what a first visit downloads (HTML + CSS + entry JS) against the budget.
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const html = await readFile(path.join(dist, 'index.html'), 'utf8');
const assets = await readdir(path.join(dist, 'assets'));

const refs = [...html.matchAll(/(?:src|href)="\/assets\/([^"]+)"/g)].map((m) => m[1]);
const gz = async (file) => gzipSync(await readFile(file), { level: 9 }).length;

const rows = [['index.html (prerendered)', await gz(path.join(dist, 'index.html')), 'html']];
for (const ref of refs) rows.push([`assets/${ref}`, await gz(path.join(dist, 'assets', ref)), ref.endsWith('.css') ? 'css' : 'js']);
const lazy = assets.filter((a) => !refs.includes(a) && a.endsWith('.js'));
for (const a of lazy) rows.push([`assets/${a} (lazy)`, await gz(path.join(dist, 'assets', a)), 'lazy']);

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const firstLoad = rows.filter((r) => r[2] !== 'lazy').reduce((s, r) => s + r[1], 0);
const js = rows.filter((r) => r[2] === 'js').reduce((s, r) => s + r[1], 0);

for (const [name, size] of rows) console.log(`${name.padEnd(48)} ${kb(size).padStart(9)} gzip`);
console.log('-'.repeat(68));
console.log(`First load (HTML + CSS + JS)`.padEnd(48), kb(firstLoad).padStart(9), firstLoad <= 100 * 1024 ? 'OK  (budget 100 KB)' : 'OVER (budget 100 KB)');
console.log(`First-load JS`.padEnd(48), kb(js).padStart(9), js <= 30 * 1024 ? 'OK  (budget 30 KB)' : 'OVER (budget 30 KB)');
