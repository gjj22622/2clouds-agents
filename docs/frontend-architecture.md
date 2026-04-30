# Frontend Architecture

Phase 1 should build a small internal tool, not a polished marketing surface.

The visual system is intentionally deferred until Jacky provides the 双云品牌視覺系統.

## 1. Stack

Recommended:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui for internal-tool primitives
- Zod for schemas
- Mock data / local JSON fixtures first
- Vitest for domain logic tests
- Playwright for smoke tests after the main flow exists

Phase 1 can use route handlers and mock services. A real database can be introduced after the domain model stabilizes.

## 2. Directory Structure

```text
app/
  page.tsx
  training/
    page.tsx
    tasks/
      page.tsx
      [taskId]/page.tsx
  brains/page.tsx
  knowledge-graph/page.tsx
  decision/page.tsx
  brands/
    page.tsx
    [brandId]/page.tsx
  content/
    page.tsx
    [contentId]/page.tsx
  reviews/page.tsx
  workflows/page.tsx
  settings/page.tsx

components/
  layout/
  cockpit/
  decision-panel/
  task/
  brains/
  brands/
  reviews/
  trace/

lib/
  schemas/
  mock-data/
  services/
  decision/
  trace/

tests/
  unit/
  e2e/
```

## 3. Phase 1 Route Scope

Start with:

```text
/
  Newcomer cockpit

/training/tasks
  Training task list

/training/tasks/:taskId
  Task execution page with right-side Decision Panel

/brains
  Minimal brain directory

/brands
  Minimal brand workspace

/content
  Minimal content factory

/reviews
  Minimal review center

/workflows
  Trace log browser
```

`/knowledge-graph` and `/decision` can exist as test surfaces, but the primary user value is the embedded Decision Panel inside task pages.

## 4. First UI Slice

Build the first flow:

```text
/
  See today's task: write one IG draft

/training/tasks/:taskId
  Read brief
  View brand brain
  View Jacky Decision Panel guidance
  Submit draft

/reviews
  Reviewer marks needs_revision or pass

/
  60-point progress updates

/workflows
  Trace log shows each key event
```

## 5. Validation

Required checks once app exists:

```text
tsc --noEmit
npm run lint
npm run test
```

Unit test targets:

- Task status transitions.
- Review result updates certification progress.
- Trace log is created for key actions.
- Task eligibility for 60-point certification.

Playwright smoke targets:

- `/` shows today task and 60-point progress.
- User can open task from cockpit.
- Task page shows Decision Panel.
- User can submit draft.
- Reviewer can review draft.
- Trace log shows the submitted and reviewed events.

## 6. Brand Visual Gate

Before high-fidelity UI work, request from Jacky:

- 双云 logo
- Brand colors
- Typography
- Button / card / tag conventions
- Example slides, proposals, website, or social templates
- Any visual rules for Jacky / team / brand brain surfaces

Until then, use restrained neutral admin styling.
