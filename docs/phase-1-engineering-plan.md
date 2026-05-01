# Phase 1 Engineering Plan

Phase 1 目標：做出新人訓練閉環。

不是先做完整 CRM，也不是先做自動化，而是讓新人可以：

1. 進入 cockpit
2. 看到自己的導入任務
3. 查看可用的腦袋與知識節點
4. 完成一個任務
5. 呼叫 Jacky Decision Layer mock
6. 送出任務結果
7. 看到 review 狀態（包含退件修改流程）
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

Slice 1：新人訓練閉環（Newcomer Cockpit + Task Workspace + Review Loop）

### User Stories

**作為新人（newcomer role）：**

1. 我登入後看到今天的導入任務、60 分進度與可呼叫的腦袋。
2. 我可以打開一個任務，看到任務說明、交付標準與 Jacky Decision Panel。
3. 我可以把任務從「未開始」推進到「進行中」再到「已送出」。
4. 我可以看到 reviewer 的意見；如果是「需修稿」，我可以把任務重新拉回「進行中」修改後再送出。
5. 我不能跳過狀態（不能從「未開始」直接到「已送出」）。
6. 每次狀態變更都會留下 trace log。

**作為 reviewer（reviewer role）：**

1. 我可以看到「已送出」狀態的任務。
2. 我可以把任務標記為「已品管」（pass）或「需修稿」（needs revision），並附上 reviewer note。
3. 我不能直接操作「未開始」或「進行中」的任務。

### Task Status Flow

```
新人操作：
not_started → in_progress → submitted

Reviewer 操作：
submitted → reviewed   （pass）
submitted → needs_revision  （send back with note）

新人修稿：
needs_revision → in_progress → submitted
```

### In Scope

- `/` newcomer cockpit（任務列表、60 分進度、Decision Panel）
- `/training/tasks` training task list
- `/training/tasks/:id` task workspace（含 trace log、reviewer note 顯示）
- `/brains` brain directory minimal list
- `/knowledge-graph` knowledge node browser minimal
- Right-side Jacky Decision Panel component
- Seed data covering all 6 training stages
- Status transitions: `not_started` → `in_progress` → `submitted` → `reviewed` or `needs_revision`
- Revision cycle: `needs_revision` → `in_progress` → `submitted`
- Trace log on every task status change

### Out of Scope

- Real auth
- Real AI call
- Real wiki retrieval
- Real client data
- Reviewer dashboard UI（reviewer 端的任務佇列頁面）
- Final brand visual design
- Social publishing automation

### Acceptance Criteria

**新人 Cockpit：**
- [ ] 新人可以看到所有已指派的訓練任務及各自的狀態。
- [ ] 新人可以看到 60 分認證進度（reviewedPoints / targetPoints）。
- [ ] 新人可以在 cockpit 直接打開 Jacky Decision Panel（顯示目前進行中任務的決策支架）。

**Task Workspace：**
- [ ] 新人打開任務後可以看到：任務說明、所在 stage、交付標準、可用腦袋與知識節點。
- [ ] 新人只能依序推進狀態（not_started → in_progress → submitted），不能跳過。
- [ ] 新人收到「需修稿」時，可以看到 reviewer note，並可以把任務拉回「進行中」。
- [ ] 任務處於「已品管」或「已送出」（等待 reviewer）時，新人沒有可操作的按鈕。

**Reviewer Flow（資料層完整；UI 由後續切片補）：**
- [ ] Reviewer 能從「已送出」推進到「已品管」。
- [ ] Reviewer 能從「已送出」退回到「需修稿」，並附上 reviewerNote。
- [ ] `getAvailableActorTransitions` 依角色回傳正確的可操作狀態列表。

**Trace Log：**
- [ ] 每次狀態改變都產生一條 TraceLog，記錄 assignmentId、actorId、fromStatus、toStatus、createdAt。
- [ ] TaskWorkspace 顯示任務的完整 trace log 列表。
- [ ] Trace log 在 needs_revision 流程中也正確留存。

**60 分認證進度：**
- [ ] reviewedPoints 只計算狀態為 `reviewed` 的任務點數。
- [ ] submittedPoints 計算 `submitted` 與 `reviewed` 的任務點數（`needs_revision` 不計入）。
- [ ] percent = min(100, round(reviewedPoints / targetPoints * 100))。

**Knowledge & Brains：**
- [ ] `/brains` 顯示 Jacky 腦、成員腦、品牌腦與方法論節點。
- [ ] `/knowledge-graph` 顯示所有知識節點，包含 domain 分類與來源。
- [ ] Decision Panel 正確顯示任務對應的問題框定、推薦模型、相關腦袋、知識節點、下一步、升級條件。

## 3. Phase 1 Data Model

Core entities（已在 domain.ts 定義）：

- `User`（role: newcomer | reviewer | admin）
- `Brain`（type: jacky | member | brand | method）
- `KnowledgeNode`
- `TrainingTask`（含 stage 1–6）
- `TrainingTaskAssignment`（status: not_started | in_progress | submitted | needs_revision | reviewed）
- `DecisionPrompt`
- `TraceLog`
- `CertificationProgress`

Later entities：

- `Client`
- `Brand`
- `BrandPack`
- `BrandAgent`
- `ContentItem`
- `WorkflowRun`
- `AutomationJob`
- `Skill`
- `SkillVersion`

## 4. 6-Stage Training Path

每個 stage 對應一個或多個訓練任務：

| Stage | 名稱 | 重點 | 代表任務 |
|---|---|---|---|
| 1 | 讀懂双云 | 理解三層架構、分工邊界 | 整理 Brain/Hand/Infra 摘要 |
| 2 | 讀懂品牌腦 | 看懂 brand pack、品牌禁忌、語氣規範 | 用品牌腦檢查貼文草稿 |
| 3 | 完成第一個內容任務 | 前情提要、內容交付、自我品管 | 整理前情提要；送出最小交付 |
| 4 | 學會品管與修稿 | 看懂退件原因、理解 needs_revision 流程 | 退件分析與修稿 |
| 5 | 學會客戶服務流程 | 接案 Stage 0-9、升級判斷 | 標出應升級的客戶問題 |
| 6 | 60 分認證 | 完整流程演練 | 模擬任務全流程 |

## 5. Routes for Slice 1

```text
/
  Newcomer cockpit

/training/tasks
  Task list

/training/tasks/:id
  Task detail + workspace

/brains
  Brain directory

/knowledge-graph
  Knowledge node browser minimal
```

## 6. Engineering Sequence

1. Scaffold app.
2. Add base layout and route structure.
3. Define TypeScript domain types（含 stage、needs_revision）.
4. Add seed data covering all 6 training stages.
5. Build task list and task detail / workspace.
6. Build brain directory.
7. Build Decision Panel mock.
8. Add trace log display in TaskWorkspace.
9. Add certification progress calculation.
10. Implement `getAvailableActorTransitions` for role-aware status buttons.
11. Add tests for progress, status transitions, and revision cycle.
12. (Next slice) Reviewer dashboard—submitted task queue + review action panel.

## 7. Open Decisions

- Whether Phase 1 should use real database immediately or start with local seed JSON.
- Whether GitHub repo should remain public once implementation includes internal data.
- What auth model to use for internal team.
- When to ingest actual Jacky Wiki pages into structured knowledge nodes.
- When Jacky will provide 双云品牌視覺系統 for final UI styling.
- Where the reviewer dashboard lives (`/reviews` per platform-spec.md; to be built in Slice 2).
