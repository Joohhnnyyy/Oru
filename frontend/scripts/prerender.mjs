// Post-build step:
// 1. Render every route (English) to static HTML: dist/index.html, dist/<route>/index.html and dist/404.html.
//    Fast first paint, crawlable pages, works without JS, and no SPA rewrite is needed on S3/CloudFront.
// 2. Fill the service worker's precache list and cache version from the final dist contents.
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, '.ssr');

const { render, PRERENDER_PATHS } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);
const indexPath = path.join(dist, 'index.html');
const template = await readFile(indexPath, 'utf8');
if (!template.includes('<!--app-html-->')) throw new Error('index.html is missing the <!--app-html--> marker');

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const canonicalMatch = template.match(/<link rel="canonical" href="([^"]*)\/"/);
const site = canonicalMatch ? canonicalMatch[1] : '';

for (const route of PRERENDER_PATHS) {
  const { html, title } = await render(route);
  const url = route === '/404' ? `${site}/` : `${site}${route === '/' ? '/' : route}`;
  const page = template
    .replace('<!--app-html-->', html)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeHtml(title)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  const out =
    route === '/' ? indexPath : route === '/404' ? path.join(dist, '404.html') : path.join(dist, route.slice(1), 'index.html');
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, page);
}
await rm(ssrDir, { recursive: true, force: true });
console.log(`prerendered ${PRERENDER_PATHS.length} pages`);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])));
  return files.flat();
}

// Precache the shell pages, styles, scripts (incl. the Hindi chunk), media and icons.
const files = (await walk(dist))
  .map((f) => '/' + path.relative(dist, f).split(path.sep).join('/'))
  .filter((f) => f !== '/sw.js' && !f.endsWith('.map') && f !== '/robots.txt' && f !== '/index.html' && f !== '/404.html')
  .map((f) => (f.endsWith('/index.html') ? f.slice(0, -'index.html'.length) : f));
const precache = ['/', ...files.sort()];
const hash = createHash('sha256');
for (const f of precache) {
  const file = f.endsWith('/') ? path.join(dist, f, 'index.html') : path.join(dist, f);
  hash.update(await readFile(file));
}
const version = hash.digest('hex').slice(0, 12);

const swPath = path.join(dist, 'sw.js');
const sw = (await readFile(swPath, 'utf8'))
  .replace("'__VERSION__'", JSON.stringify(version))
  .replace("self.__PRECACHE__ || ['/', '/offline.html']", JSON.stringify(precache));
await writeFile(swPath, sw);

console.log(`sw.js v${version} precaches ${precache.length} files`);
