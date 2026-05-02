# 三分支整合控制：木酢自動營運 Agent Team

日期：2026-05-02

整合負責：Main / Integration Owner

目標：讓 `dev/codex`、`dev/claude`、`dev/gemini` 三條分支各自工作，但最後能按順序回到 `main`，避免互相覆蓋、規格與 UI 脫節、或 domain model 被重複定義。

---

## 1. 當前整合原則

不要讓任何 agent 直接改 `main`。

所有工作都必須走：

```text
dev/{agent}
→ PR
→ review / check
→ main
→ 其他分支 rebase 或 merge 最新 main
```

推薦 merge 順序：

1. `dev/codex`：先合目前已完成的 shared logic、simulation records、handoff docs
2. `dev/claude`：再合產品規格、acceptance criteria、模擬文件
3. `dev/gemini`：再合 UI skeleton
4. `dev/codex`：最後接回 domain model、tests、API/resource boundaries

---

## 2. 為什麼 Codex / Integration 要先合一次

目前 `dev/codex` 已經有：

- reviewer `needs_revision` note validation
- `docs/platform-simulations/`
- 木酢三角色平台模擬紀錄
- platform simulation template
- Claude / Gemini 任務分配文件
- 三分支整合控制文件

這些是其他分支工作需要依賴的上下文。若不先進 `main`，Claude/Gemini 會各自看不到最新模擬與分工，容易重複寫或偏離方向。

---

## 3. 第一階段：Codex → Main

Codex PR 內容：

```text
Add reviewer note validation and platform simulation records
```

應包含：

- `src/lib/domain.ts`
- `src/lib/training.ts`
- `src/lib/training.test.ts`
- `docs/platform-simulations/**`
- `docs/agent-handoffs/**`

Quality gates：

```bash
npm run typecheck
npm run test
npm run build
```

合併後，Claude 與 Gemini 都必須先更新：

```bash
git fetch origin
git checkout dev/claude
git merge origin/main
```

```bash
git fetch origin
git checkout dev/gemini
git merge origin/main
```

---

## 4. 第二階段：Claude → Main

Claude 只做產品與文件，不碰前端與 shared domain code。

Claude PR 應包含：

- `docs/muzopet-autonomous-agent-team-spec.md`
- `docs/mvp-roadmap.md`
- `docs/modules.md`
- `docs/reviewer-workflow.md`
- `docs/platform-simulations/*.md`

Claude PR 合併條件：

- 已定義 Revenue Goal → Agent Team → Action Proposal → Approval Gate → Daily Report 的產品流程
- 已定義 automation / approval 邊界
- 已定義 Phase 2 acceptance criteria
- 沒有修改 `src/lib/domain.ts`
- 沒有修改 `src/components/**`

Claude 合併後，Gemini 必須更新 `main` 再做 UI：

```bash
git fetch origin
git checkout dev/gemini
git merge origin/main
```

---

## 5. 第三階段：Gemini → Main

Gemini 只做前端體驗與 mock UI，不定義正式 domain model。

Gemini PR 應包含：

- `src/app/brands/[id]/page.tsx`
- `src/components/AgentTeamPanel.tsx`
- `src/components/RevenueGoalPanel.tsx`
- `src/components/ActionProposalList.tsx`
- `src/components/ApprovalQueue.tsx`
- `src/components/DailyOperatingReport.tsx`
- `src/app/globals.css`

Gemini PR 合併條件：

- UI 對齊 Claude spec
- 使用 neutral internal-tool 視覺
- mock data 只留在 component 局部
- 沒有修改 `src/lib/domain.ts`
- 沒有新增未驗證外部套件
- `npm run build` 通過

---

## 6. 第四階段：Codex 接回整合

Codex 在 Claude/Gemini 都合入 `main` 後，從最新 `main` 開始做結構化整合。

Codex 後續 PR 應包含：

- domain model：
  - `RevenueGoal`
  - `AgentTeam`
  - `AgentRun`
  - `ActionProposal`
  - `ResourceRequest`
  - `DailyOperatingReport`
- seed / mock data 移到 `src/lib`
- approval policy logic
- tests
- API/resource boundary docs

Codex 合併條件：

- Claude 規格被轉成 domain types
- Gemini mock UI 改為讀 shared data
- risk routing 有 unit tests
- resource request ownership 有 unit tests
- `npm run check` 通過

---

## 7. 衝突處理規則

若兩個分支改同一檔：

1. product meaning 以 Claude spec 為準
2. UI composition 以 Gemini layout 為準
3. domain logic / API / tests 以 Codex 為準
4. 若 `docs/reviewer-workflow.md` 同時被 Claude 與 Codex 修改，先保留 Claude 的產品語意，再由 Codex 補上可測規則
5. 若 `src/app/brands/[id]/page.tsx` 同時被 Gemini 與 Codex 修改，先合 Gemini UI，再由 Codex 接資料層

---

## 8. Main Owner 檢查清單

每次合 PR 前確認：

- PR 是否只碰該 agent 的責任範圍
- 是否有不該碰的檔案
- 是否跑過對應 quality gate
- 是否更新相關 simulation / spec / acceptance criteria
- 是否需要其他分支先 merge 最新 `main`
- 是否會阻塞下一個 agent

