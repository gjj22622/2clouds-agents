# AI Development Guide

This repository is developed by multiple AI agents in parallel. Each agent must keep its work scoped, easy to review, and aligned with the product goal in `README.md`.

## Project Goal

`2clouds-agents` is the training and operations platform for the 2clouds AI marketing team. The platform should help new members complete real work through guided tasks, embedded Jacky knowledge, brand brains, review checkpoints, and traceable quality control.

Before starting feature work, read:

- `README.md`
- `docs/platform-spec.md`
- `docs/phase-1-engineering-plan.md`
- `docs/engineering-agent-team.md`
- `docs/frontend-architecture.md`
- `docs/domain-model.md`

## Branch Assignments

Use exactly one working branch per model:

- Codex: `dev/codex`
- Claude: `dev/claude`
- Gemini: `dev/gemini`

Do not commit directly to `main`. Open pull requests back into `main` when a slice is complete.

## Agent Responsibilities

### Codex

Primary responsibility: engineering structure and correctness.

Owns:

- App architecture and routing structure
- Data model and shared domain logic
- API/resource boundary design
- Test coverage and CI reliability
- Build, deployment, and runtime fixes

Preferred files:

- `src/lib/**`
- `src/app/**/page.tsx` when wiring behavior
- `docs/api-resource-boundaries.md`
- `docs/domain-model.md`
- `docs/deployment.md`
- `package.json`
- `tsconfig.json`
- `next.config.mjs`

### Claude

Primary responsibility: product clarity and training workflow quality.

Owns:

- Product slice definitions
- User flows and acceptance criteria
- Training task wording and reviewer logic
- Documentation improvements
- Edge cases in newcomer onboarding

Preferred files:

- `docs/**`
- `README.md`
- `src/lib/seed.ts`
- `src/lib/training.ts` when changing training content or workflow states
- Page copy when it supports training clarity

### Gemini

Primary responsibility: frontend experience and interaction polish.

Owns:

- UI composition and responsive behavior
- Visual hierarchy for cockpit, task workspace, brains, and knowledge graph
- Component ergonomics and states
- Lightweight interaction improvements

Preferred files:

- `src/app/globals.css`
- `src/components/**`
- `src/app/**/page.tsx` when improving UI layout
- `docs/frontend-architecture.md`
- `docs/brand-visual-system.md`

## Parallel Work Rules

- Work on one product slice at a time.
- Keep changes small enough to review in one pass.
- Avoid broad rewrites unless the current slice requires them.
- Do not rename shared files without noting it in the PR.
- Do not overwrite another agent's branch.
- If a change crosses another agent's ownership area, document why in the PR.
- If two branches touch the same file, merge the more structural change first, then rebase the other branch.

## Product Slice Definition

Each development slice should include:

- A working user flow
- A clear state change or visible outcome
- Domain or seed data updates when needed
- Review or trace behavior when relevant
- Tests for shared logic when behavior changes
- Documentation updates when the product meaning changes

Phase 1 should stay focused on the newcomer training loop. Do not add production social platform integrations, customer-facing portals, or full automation unless Jacky explicitly asks for them.

## Quality Gates

Run these before opening a PR:

```bash
npm run typecheck
npm run test
npm run build
```

Or run the full check:

```bash
npm run check
```

If a command cannot be run, state the reason in the PR and list the risk.

## Commit and PR Rules

Use focused commits with clear messages:

```text
Add training task review state
Refine newcomer cockpit layout
Document domain model boundaries
```

Each PR should include:

- Summary of the product slice
- Main files changed
- Verification commands and results
- Known tradeoffs or follow-up work
- Screenshots for UI changes when practical

## Merge Order

Recommended merge order when all three branches have work ready:

1. `dev/codex` for structural and shared logic changes
2. `dev/claude` for product workflow and documentation changes
3. `dev/gemini` for UI and interaction polish

After each merge into `main`, rebase or merge `main` into the remaining development branches before continuing.

## Brand Visual Gate

Until Jacky provides the 2clouds brand visual system, keep the UI as a neutral internal tool. Do not introduce final brand colors, logo systems, or high-fidelity branded illustrations without explicit brand direction.
