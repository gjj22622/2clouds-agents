# API and Resource Boundaries

Phase 1 uses internal app APIs only. Do not expose customer-facing APIs yet.

## 1. Dashboard

```text
GET /api/me
GET /api/dashboard/newcomer
```

Purpose:

- Load current user.
- Load today tasks, 60-point progress, latest review feedback, next recommended task.

## 2. Training

```text
GET /api/training/stages
GET /api/training/tasks
GET /api/training/tasks/:id
POST /api/training/tasks/:id/attempts
GET /api/training/progress/:userId
```

Purpose:

- List onboarding stages.
- List task training units.
- Load task detail.
- Submit or update a task attempt.
- Calculate certification progress.

## 3. Brains

```text
GET /api/brains
GET /api/brains/:id
```

Purpose:

- Show callable brains.
- Explain when to call each brain, what it can answer, and what it cannot answer.

## 4. Knowledge and Decision

```text
GET /api/knowledge-nodes
GET /api/knowledge-nodes/:id
POST /api/decision-requests
```

Purpose:

- Browse Jacky knowledge nodes.
- Create a Decision Layer request with task / brand / content context.
- Return problem framing, related knowledge nodes, recommended model, risk, next step, and escalation condition.

## 5. Brands

```text
GET /api/brands
GET /api/brands/:id
GET /api/brands/:id/agents
```

Purpose:

- Load brand workspace data.
- Load brand pack, voice, taboos, CTA style, channel rules.
- Load the 4 Agent committee.

## 6. Content

```text
POST /api/content
GET /api/content/:id
POST /api/content/:id/versions
POST /api/content/:id/submit-review
```

Purpose:

- Create a content item from a training task.
- Store draft versions.
- Submit a version to review.

## 7. Reviews

```text
GET /api/reviews
POST /api/reviews
POST /api/reviews/:id/revision-response
```

Purpose:

- List pending reviews.
- Create review result: `pass`, `needs_revision`, or `reject`.
- Allow newcomer to respond with a revised version.

## 8. Trace Logs

```text
GET /api/trace-logs
POST /api/trace-logs
```

Purpose:

- Record key workflow evidence.
- Query task, content, review, and decision trace.

## 9. First Vertical Slice

The first implemented slice should cross these boundaries:

```text
GET /api/dashboard/newcomer
GET /api/training/tasks/:id
GET /api/brands/:id
POST /api/decision-requests
POST /api/content
POST /api/content/:id/versions
POST /api/content/:id/submit-review
POST /api/reviews
GET /api/trace-logs
GET /api/training/progress/:userId
```

Target flow:

```text
Newcomer dashboard
→ IG draft task
→ Brand brain
→ Jacky Decision Panel
→ Submit draft
→ Review
→ Revision or pass
→ Trace
→ 60-point progress update
```
