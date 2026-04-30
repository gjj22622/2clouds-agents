# Phase 1 Engineering Plan

Phase 1 目標：做出新人訓練閉環。

不是先做完整 CRM，也不是先做自動化，而是讓新人可以：

1. 進入 cockpit
2. 看到自己的導入任務
3. 查看可用的腦袋與知識節點
4. 完成一個任務
5. 呼叫 Jacky Decision Layer mock
6. 送出任務結果
7. 看到 review 狀態
8. 留下 trace log
9. 更新 60 分認證進度

## 1. Proposed Stack

第一版建議：

- App：Next.js + TypeScript
- Styling：Tailwind CSS，先用 neutral internal-tool tokens
- Data：PostgreSQL + Prisma
- Auth：先預留 role model；MVP 可用 seed user / simple local session
- Tests：Vitest for unit/domain logic；Playwright later for user flows
- Deployment：先本機開發；後續再選 Vercel / VPS

品牌視覺尚未導入前，不做最終 UI design。

## 2. First Product Slice

Slice 1：新人 Cockpit + Training Task List + Mock Decision Panel

### User Story

作為新人，我登入平台後，可以看到今天要做的導入任務、目前 60 分進度、可呼叫的腦袋，並在任務卡住時打開 Jacky Decision Panel 取得判斷支架。

### In Scope

- `/` newcomer cockpit
- `/training/tasks` training task list
- `/brains` brain directory minimal list
- Right-side Jacky Decision Panel component
- Mock seed data
- Status transitions:
  - `not_started`
  - `in_progress`
  - `submitted`
  - `reviewed`
- Trace log on task status change

### Out of Scope

- Real auth
- Real AI call
- Real wiki retrieval
- Real client data
- Final brand visual design
- Social publishing automation

### Acceptance Criteria

- A newcomer can view assigned tasks.
- A newcomer can open a task and see recommended brain / method.
- A newcomer can open Jacky Decision Panel and see:
  - problem framing
  - recommended model
  - related knowledge nodes
  - suggested next step
  - escalation condition
- A task can move from `not_started` to `submitted`.
- A trace log is created when task status changes.
- 60-point progress updates from completed / reviewed tasks.

## 3. Phase 1 Data Model Draft

Core entities:

- `User`
- `Role`
- `Brain`
- `KnowledgeNode`
- `TrainingTask`
- `TrainingTaskAssignment`
- `DecisionPrompt`
- `Review`
- `TraceLog`
- `CertificationProgress`

Later entities:

- `Client`
- `Brand`
- `BrandPack`
- `BrandAgent`
- `ContentItem`
- `WorkflowRun`
- `AutomationJob`
- `Skill`
- `SkillVersion`

## 4. Routes for Slice 1

```text
/
  Newcomer cockpit

/training/tasks
  Task list

/training/tasks/:id
  Task detail

/brains
  Brain directory

/knowledge-graph
  Knowledge node browser minimal
```

## 5. Engineering Sequence

1. Scaffold app.
2. Add base layout and route structure.
3. Add seed data in code or JSON.
4. Define TypeScript domain types.
5. Build task list and task detail.
6. Build brain directory.
7. Build Decision Panel mock.
8. Add trace log mock.
9. Add certification progress calculation.
10. Add tests for progress and task status transitions.

## 6. Open Decisions

- Whether Phase 1 should use real database immediately or start with local seed JSON.
- Whether GitHub repo should remain public once implementation includes internal data.
- What auth model to use for internal team.
- When to ingest actual Jacky Wiki pages into structured knowledge nodes.
- When Jacky will provide 双云品牌視覺系統 for final UI styling.
