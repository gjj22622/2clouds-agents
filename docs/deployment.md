# Development and Deployment

This project is a Next.js app deployed from GitHub to Zeabur.

## Local Development

Prerequisites:

- Node.js 22
- npm

Setup:

```bash
nvm use
npm ci
npm run dev
```

Open:

```text
http://localhost:3000
```

Validation before pushing:

```bash
npm run ci
```

The CI command runs TypeScript checks, unit tests, and a production build.

## GitHub

Repository:

```text
https://github.com/gjj22622/2clouds-agents
```

Production branch:

```text
main
```

GitHub Actions runs on every pull request and every push to `main`.

Do not commit `.env`, `.env.local`, customer data, internal wiki exports, API keys, or private brand/client materials. The repository is currently public.

## Zeabur Auto Deploy

Use Zeabur's GitHub integration.

1. Log in to Zeabur.
2. Create or open the production project.
3. Add Service.
4. Choose Git / Deploy your source code.
5. Connect GitHub if needed.
6. Select `gjj22622/2clouds-agents`.
7. Select branch `main`.
8. Keep root directory as repository root.
9. Let Zeabur auto-detect Next.js.
10. Set environment variables in the service Configuration / Variables tab.
11. Deploy.

Expected commands:

```text
Install: npm ci
Build: npm run build
Start: npm run start
```

Zeabur triggers a redeploy on pushes to the linked branch by default. Manual redeploy is available from the Zeabur dashboard.

## Environment Variables

Current app only uses mock data and does not require secrets.

When real services are added, define variables in:

- Local: `.env.local`
- GitHub Actions: repository secrets or environment secrets
- Zeabur: service Configuration / Variables

Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Release Flow

1. Work locally on a feature branch.
2. Run `npm run ci`.
3. Open a pull request.
4. Wait for GitHub Actions to pass.
5. Merge to `main`.
6. Zeabur auto deploys from `main`.
7. Verify the deployed URL.
