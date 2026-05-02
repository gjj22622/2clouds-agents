# Claude / Gemini 分支工作分配：木酢自動營運 Agent Team

日期：2026-05-02

目標：把「Jacky 給予木酢寵物達人營收目標後，Agent Team 24 小時拆解、執行、請求資源、回報進度」轉成下一階段可開發的產品規格與前端操作介面。

背景來源：

- `docs/mujiso-brand-pack.md`
- `docs/brand-onboarding-workflow.md`
- `docs/brand-sheet-connector-spec.md`
- `docs/platform-simulations/muzopet-three-role-platform-simulation-2026-05-02.md`
- `src/lib/brand-packs/muzopet.ts`

---

## 1. Claude 分支任務

分支：`dev/claude`

主要責任：產品清晰度、訓練工作流、營運規則、acceptance criteria。

### 工作目標

Claude 要把「木酢自動營運 Agent Team」整理成 Phase 2 product slice，不做 UI 實作，不碰 shared domain code，先把規格與任務邊界定清楚。

### 建議檔案範圍

Claude 優先修改：

- `docs/muzopet-autonomous-agent-team-spec.md`（新建）
- `docs/mvp-roadmap.md`
- `docs/modules.md`
- `docs/reviewer-workflow.md`（只補 approval gate 規則，不重寫原文）
- `docs/platform-simulations/README.md`（如新增模擬紀錄才更新）
- `docs/platform-simulations/*.md`（如需要補充模擬）

Claude 避免修改：

- `src/lib/domain.ts`
- `src/lib/training.ts`
- `src/components/**`
- `src/app/**`
- `src/app/globals.css`

### 交付內容

1. 新增 `docs/muzopet-autonomous-agent-team-spec.md`

   必須包含：

   - 一句話定位：木酢 Brand Revenue Operating Agent Team
   - 使用者故事：
     - Jacky 設定營收目標
     - Agent Team 拆解目標
     - Agent 產生 action proposals
     - 藝嘉審查品牌與合規
     - Jacky 審高風險策略與授權
     - Sophia 處理客戶資源與窗口確認
     - 政澔處理 connector / 自動化 / 資料同步
   - Agent Team 組成：
     - Revenue Commander Agent
     - Member Reactivation Agent
     - Content & Offer Agent
     - Compliance & Brand Reviewer Agent
     - Data Attribution Agent
     - Resource Request Agent
   - 24 小時營運 loop
   - 什麼可以自動，什麼必須 approval
   - 木酢紅線：
     - 醫療宣稱
     - 退訂戶 / 毛孩過世戶
     - 價格與折扣承諾
     - 客訴 / 退款 / 法律威脅
     - 品牌定位或商品策略改變
   - 第一版 mock workflow
   - 第一版不做事項

2. 定義 Phase 2 acceptance criteria

   至少包含：

   - Jacky 可以設定 RevenueGoal
   - 系統可以把 RevenueGoal 拆成 3-5 個策略方向
   - Agent Team 可以產生 ActionProposal
   - ActionProposal 有 riskLevel
   - 高風險 proposal 需要 Jacky 或藝嘉 approval
   - ResourceRequest 可以指派給 Sophia / 政澔 / Jacky / 藝嘉
   - DailyOperatingReport 可以列出 progress、actions、blockers、next actions

3. 補一份角色模擬紀錄

   建議新增：

   ```text
   docs/platform-simulations/muzopet-autonomous-agent-team-simulation-2026-05-02.md
   ```

   模擬：

   - Jacky 輸入本月營收目標，例如 `+300,000 TWD`
   - Revenue Commander 拆目標
   - Member Reactivation Agent 產出會員喚醒方案
   - Compliance Agent 擋下醫療 / 防蚊風險
   - Resource Request Agent 向 Sophia 要名單與授權
   - Jacky approval gate 決定哪些可以執行

### Claude 完成定義

Claude PR 需要回答：

- 這個 Agent Team 為什麼不是單純文案工具？
- 它如何從營收目標拆到每日行動？
- 哪些動作可以自動？
- 哪些動作必須人類 approval？
- 下一個工程 slice 要做哪些頁面與資料物件？

---

## 2. Gemini 分支任務

分支：`dev/gemini`

主要責任：前端體驗、資訊架構、互動流程、neutral internal-tool UI。

### 工作目標

Gemini 要根據現有 `BrandWorkspaces` 與木酢 Brand App，設計「Agent Team 營運 cockpit」的前端骨架。第一版可以用 mock data，不需要真實自動化，不需要串 OpenAI，不需要高保真品牌視覺。

### 建議檔案範圍

Gemini 優先修改：

- `src/app/globals.css`
- `src/components/**`
- `src/app/brands/[id]/page.tsx`
- 可新增：
  - `src/components/AgentTeamPanel.tsx`
  - `src/components/RevenueGoalPanel.tsx`
  - `src/components/ActionProposalList.tsx`
  - `src/components/ApprovalQueue.tsx`
  - `src/components/DailyOperatingReport.tsx`

Gemini 避免修改：

- `src/lib/domain.ts`
- `src/lib/training.ts`
- `src/lib/brand-packs/muzopet.ts`
- `docs/muzopet-autonomous-agent-team-spec.md`

如需 mock data，先在 component 內局部 mock；等 Codex 後續整理 domain model。

### UI 要呈現的工作流

在 `/brands/brand-muzopet` 或品牌詳情頁中，新增一個 Agent Team operating section，至少包含：

1. Revenue Goal

   顯示：

   - 目標金額
   - 期間
   - 目前進度
   - 距離目標差距

2. Agent Team

   顯示 6 個 Agent：

   - Revenue Commander
   - Member Reactivation
   - Content & Offer
   - Compliance & Brand Reviewer
   - Data Attribution
   - Resource Request

   每個 Agent 顯示：

   - 目前狀態
   - 今日任務
   - blocked / needs approval / running / ready

3. Action Proposals

   顯示：

   - proposal title
   - expected revenue impact
   - risk level
   - required approval role
   - status

4. Approval Queue

   分出：

   - 藝嘉 review
   - Jacky approval
   - Sophia resource confirmation
   - 政澔 connector task

5. Daily Operating Report

   顯示：

   - 今日做了什麼
   - 哪些被擋住
   - 哪些需要人類資源
   - 明天下一步

### UI 原則

- 維持 neutral internal-tool，不做品牌色或高保真視覺
- 不做 landing page
- 不做大型 hero
- 不使用裝飾性插圖
- 優先資訊密度、掃描性、狀態清楚
- 卡片只用於重複 item，例如 Agent、Proposal、Approval
- 避免多層 card inside card

### Gemini 完成定義

Gemini PR 需要回答：

- Jacky 進入品牌頁後，是否能立刻看出營收目標與缺口？
- 藝嘉是否能看出哪些 proposal 要審？
- Sophia / 政澔是否能看出自己被要求什麼資源？
- 新人是否能看出自己不能碰哪些高風險動作？
- Daily Operating Report 是否能讓團隊知道 Agent Team 今天做了什麼？

---

## 3. Codex 後續接回任務

Codex 後續負責結構與正確性：

- 定義 domain model：
  - `RevenueGoal`
  - `AgentTeam`
  - `AgentRun`
  - `ActionProposal`
  - `ResourceRequest`
  - `DailyOperatingReport`
- 把 Gemini 的 mock data 移到 `src/lib`
- 補 tests：
  - approval policy
  - risk level routing
  - revenue progress calculation
  - resource request ownership
- 補 API/resource boundaries
- 確保 `npm run check` 通過

---

## 4. 建議 merge 順序

1. Claude：先合 product spec 與 acceptance criteria
2. Gemini：再合 UI skeleton
3. Codex：最後合 domain model、資料層、測試與 API 邊界

原因：Claude 先定義產品語意，Gemini 根據語意做介面，Codex 最後把資料與行為固定下來。

