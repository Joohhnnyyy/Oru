# Oru

**A verification layer for India's informal waste chain.** When a household hands sorted waste to a garbage truck, kabadiwala or e-waste point, the collector shows a QR code that changes every 30 seconds and the household scans it. That handover becomes a geo-verified record. Both sides earn credits, and the neighbourhood's guardian animal recovers as the area improves.

Built for **Environmental Hacks: WeMakeDevs × AWS** (Track 03: Waste and Energy).

## Repository layout

```
.
├── frontend/              The Oru website (React + TypeScript + Vite) → see frontend/README.md
│   ├── src/               App code: pages, sections, components, i18n (en/hi)
│   ├── public/            Static files: media (characters, scenes, logo), icons, service worker
│   ├── design/            Source art and the art pipeline inputs
│   └── scripts/           Prerender, bundle-size report, art pipeline
├── docs/                  Project context: product, AWS, backend API, web, mobile, game design
├── legacy/                The team's earlier "Butter" video-editor clone (kept for reference, not used by Oru)
├── CLAUDE.md              Working rules for AI-assisted frontend development
├── amplify.yml            AWS Amplify Hosting build config (app root: frontend)
├── package.json           Workspace root (pnpm)
└── pnpm-workspace.yaml    Workspace packages: frontend, apps/*, packages/*
```

Future backend and mobile code is planned under `apps/` and shared code under `packages/` (see `docs/02-BACKEND-CONTEXT.md` and `docs/04-MOBILE-CONTEXT.md`).

## Quick start

Requires **Node.js 22+**. Run these at the repository root:

```bash
corepack enable          # uses the pnpm version pinned in package.json
pnpm install
pnpm --filter web dev    # http://localhost:5173
```

| Task | Command |
|---|---|
| Production build (typecheck + build + prerender every page) | `pnpm --filter web build` |
| Preview the build | `pnpm --filter web preview` → http://localhost:4173 |
| Tests | `pnpm --filter web test` |
| Lint / typecheck | `pnpm --filter web lint` · `pnpm --filter web typecheck` |

Open the site through the Vite server. Opening `index.html` directly, or with VS Code Live Server, shows a blank page because the TypeScript needs compiling first.

## Pages

Home · How it works · Guardians (plus one page per guardian) · Grow · Places · Impact · Roadmap · Play · Not found. Each page is prerendered to static HTML at build time. See `frontend/README.md` for details, design tokens, media replacement and deployment.

## Docs

| File | What it covers |
|---|---|
| `docs/00-PROJECT-CONTEXT.md` | Problem, solution, scope |
| `docs/01-AWS-REQUIREMENTS.md` | AWS services and cost envelope |
| `docs/02-BACKEND-CONTEXT.md` | API contract, data model, Lambdas |
| `docs/03-WEB-CONTEXT.md` | Web app and municipal console spec |
| `docs/04-MOBILE-CONTEXT.md` | Mobile app spec |
| `docs/05-GAME-DESIGN.md` | Credits, tasks, territories, guardian animals |

## Deploying

AWS Amplify Hosting builds `frontend/` using `amplify.yml`. Pages are written as `frontend/dist/<route>/index.html`, so clean URLs work on Amplify. On S3 + CloudFront, add an index-rewrite function (see `frontend/README.md`).
