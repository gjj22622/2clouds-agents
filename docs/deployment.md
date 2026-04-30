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

The local brand visual system source is stored at:

```text
/home/jacky/2clouds-agents/双云行銷-品牌視覺系統
```

Keep the original `.pptx`, `.ai`, and exported brand source files local unless the repository is made private or a public-safe asset policy is agreed. App CSS may contain derived design tokens.

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

## Zeabur CLI

Zeabur also provides an official CLI. It can deploy services, inspect deployments, read logs, restart services, and manage project/service context from the terminal.

Browser login:

```bash
npx zeabur@latest auth login
```

Deploy from this repository:

```bash
npx zeabur@latest deploy
```

The deploy command auto-detects the framework and prompts you to select or create a Zeabur project.

Useful commands:

```bash
npx zeabur@latest project ls
npx zeabur@latest context set project
npx zeabur@latest service ls
npx zeabur@latest context set service
npx zeabur@latest deployment get
npx zeabur@latest deployment log -t=build
npx zeabur@latest deployment log -t=runtime
npx zeabur@latest service restart
```

Token login for headless or CI usage:

```bash
npx zeabur@latest auth login --token <ZEABUR_TOKEN>
```

For automated scripts, use non-interactive mode with `-i=false` and pass project/service/environment identifiers explicitly.

The recommended production flow remains GitHub integration from `main`, because every push is already checked by GitHub Actions before Zeabur deploys. CLI is best for first setup, manual deploys, logs, restarts, and automation scripts.

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
