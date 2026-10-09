// Rasterises public/icons/icon.svg into the PNG icons the manifest needs.
// Run with `pnpm --filter web icons` after changing the SVG; the PNGs are committed.
import { readFile, writeFile } from 'node:fs/promises';
import { Resvg } from '@resvg/resvg-js';

const dir = new URL('../public/icons/', import.meta.url);
const svg = await readFile(new URL('icon.svg', dir), 'utf8');

// Maskable: full-bleed background, artwork inside the 80% safe zone.
const inner = svg.replace(/^[\s\S]*?<rect[^>]*\/>/, '').replace(/<\/svg>\s*$/, '');
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#14532d"/><g transform="translate(51.2 51.2) scale(0.8)">${inner}</g></svg>`;

const jobs = [
  ['icon-192.png', svg, 192],
  ['icon-512.png', svg, 512],
  ['icon-maskable-192.png', maskable, 192],
  ['icon-maskable-512.png', maskable, 512],
];

for (const [name, source, size] of jobs) {
  const png = new Resvg(source, { fitTo: { mode: 'width', value: size } }).render().asPng();
  await writeFile(new URL(name, dir), png);
  console.log(`${name}: ${(png.length / 1024).toFixed(1)} KB`);
}
