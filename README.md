# 2clouds-agents

双云 AI 行銷部訓練與營運平台。

本專案的目標是把双云行銷的營運模式、AGENTS 方法論、Jacky 的知識體系、成員腦、客戶品牌腦與品管流程，整合成一個可操作的平台。

新人加入双云後，不是先背誦一整套教育訓練教材，而是在平台上完成真實任務。每個任務節點都嵌入 Jacky 的 wiki 知識圖譜、思考模型、品牌腦與品管規則，讓新人能在可控範圍內成為 60 分以上的數位行銷服務者。

## 核心定位

> 成員在平台上做真實任務；每個任務節點都嵌入 Jacky 的方法論、wiki 知識圖譜、品牌腦與決策模型，讓新人即使只有 60 分能力，也能被系統引導做出接近資深夥伴的反應。

## 核心公式

```text
新人能力
+ Jacky 知識圖譜
+ 成員腦
+ 品牌腦
+ 方法論節點
+ 品管回饋
= 可交付的 60 分數位行銷服務者
```

## 文件索引

### 平台架構與設計

- [平台總規格](docs/platform-spec.md) — 平台定位、核心模組、Phase 規劃
- [多品牌獨立應用架構](docs/multi-brand-app-architecture.md) — Command Center + Brand App 架構決策
- [Brand App 隔離規格](docs/brand-app-isolation-spec.md) — 資料邊界、權限矩陣、落地實施指引 ← **工程師必讀**
- [Domain Model](docs/domain-model.md) — 核心實體定義（草稿版）
- [API / Resource Boundaries](docs/api-resource-boundaries.md) — API 端點與資源邊界
- [功能模組](docs/modules.md) — 各模組功能說明

### 新人訓練系統

- [新人導入訓練系統](docs/onboarding-training-system.md) — 6 階段訓練路徑設計
- [Jacky 知識圖譜與決策層](docs/jacky-decision-layer.md) — 決策模型與知識節點
- [Reviewer 品管閉環工作流程](docs/reviewer-workflow.md) — 品管維度、pass/needs_revision 判斷準則

### 品牌營運工作流程

- [Brand Onboarding Workflow](docs/brand-onboarding-workflow.md) — 新人進入品牌日常任務的完整流程（含 Day 1 Checklist）← **新人必讀**
- [品牌導入 Checklist 模板](docs/brand-intake-checklist.md) — 任何新品牌導入時的通用問卷模板
- [木酢寵物達人導入準備格式](docs/mujiso-intake-prep.md)
- [木酢寵物達人 Brand Pack 映射](docs/mujiso-brand-pack.md) — BrandBrain / BrandTask / RevenueSignal / ReviewerRule / BrandSkill 結構化規格 ← **品牌導入必讀** — 木酢品牌專用資料收集佔位格式（含初探會議問題清單）

### 工程開發

- [工程師 Agent Team](docs/engineering-agent-team.md) — Codex / Claude / Gemini 分工規則
- [Phase 1 工程計畫](docs/phase-1-engineering-plan.md) — 目前開發 Phase 的 scope 與 acceptance criteria
- [Frontend Architecture](docs/frontend-architecture.md) — 前端架構與元件規範
- [MVP 路線圖](docs/mvp-roadmap.md) — 版本規劃
- [開發與部署流程](docs/deployment.md) — 本機開發、Zeabur 部署
- [品牌視覺系統導入](docs/brand-visual-system.md) — 視覺規格（待品牌方向確認）
- [資料來源](docs/source-context.md) — 種子資料與外部資料來源說明

## 原則

- 平台本身就是訓練系統。
- 方法論不是課程附件，而是平台判斷引擎。
- 新人不靠記憶服務客戶，而是靠會查腦、會用腦、會被品管修正。
- 每個可交付內容都必須經過 reviewer 與 trace logger。
- Jacky 的知識體系要散布到每個工作節點。
