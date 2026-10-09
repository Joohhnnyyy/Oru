// Post-build step:
// 1. Render the English landing page to HTML and inline it into dist/index.html (fast first paint, works without JS).
// 2. Fill the service worker's precache list and cache version from the final dist contents.
import { createHash } from 'node:crypto';
import { readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, '.ssr');

const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);
const indexPath = path.join(dist, 'index.html');
const template = await readFile(indexPath, 'utf8');
if (!template.includes('<!--app-html-->')) throw new Error('index.html is missing the <!--app-html--> marker');
await writeFile(indexPath, template.replace('<!--app-html-->', render()));
await rm(ssrDir, { recursive: true, force: true });

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])),
  );
  return files.flat();
}

const files = (await walk(dist))
  .map((f) => '/' + path.relative(dist, f).split(path.sep).join('/'))
  .filter((f) => f !== '/sw.js' && !f.endsWith('.map') && f !== '/robots.txt' && f !== '/index.html');

// Precache the shell, styles, scripts (including the Hindi chunk) and icons.
const precache = ['/', ...files.sort()];
const hash = createHash('sha256');
for (const f of precache) hash.update(f === '/' ? await readFile(indexPath) : await readFile(path.join(dist, f)));
const version = hash.digest('hex').slice(0, 12);

const swPath = path.join(dist, 'sw.js');
const sw = (await readFile(swPath, 'utf8'))
  .replace("'__VERSION__'", JSON.stringify(version))
  .replace("self.__PRECACHE__ || ['/', '/offline.html']", JSON.stringify(precache));
await writeFile(swPath, sw);

console.log(`prerendered index.html; sw.js v${version} precaches ${precache.length} files`);
