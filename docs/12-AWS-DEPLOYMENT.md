# AWS deployment — 11 October 2026

Account: `517025126295`. Region: `ap-south-1` (Mumbai).

- Frontend: https://main.d2yv74n1dn7go4.amplifyapp.com
- Amplify app: `d2yv74n1dn7go4`, production branch `main`, manual deployment job `1`.
- Backend: https://dp029jx9uf.execute-api.ap-south-1.amazonaws.com/
- Backend stacks: Data, Auth, Geo, Api, Workflow, Scheduler (`SaafSafari-` prefix).

The frontend was built from the current local `frontend` workspace, configured with CDK outputs, packaged from `frontend/dist`, and published through Amplify's manual deployment API. Git-based automatic deployments are not configured.

Validation: 73 frontend tests, 128 backend unit tests, and 6 infrastructure tests passed. The production build passed. HTTPS checks passed for the homepage, sign-in, map, grow page, JavaScript, CSS, and service worker. Read-only live API checks passed for public endpoints and authenticated citizen, admin, and collector accounts. The broad test command could not run its live integration suite inside the network-restricted sandbox; separate live read-only checks were run with network access.

Backend updates: run `pnpm deploy:backend`. Frontend updates: export public configuration with `node --import tsx scripts/export-env.ts --frontend-only`, run `pnpm --filter web build`, and upload a ZIP of the contents of `frontend/dist` to the existing Amplify app's `main` branch.
