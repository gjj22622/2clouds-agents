# 工程師 Agent Team

本文件定義 `2clouds-agents` 的工程師 agent team。目標不是一次把所有功能做完，而是讓平台能按階段穩定長出來。

## 1. Team Operating Model

開發節奏採「產品切片」而不是「按技術層堆功能」。

每個切片都要交付：

- 可操作的使用者流程
- 對應資料模型
- 至少一個可驗證的狀態變更
- trace 或 audit 記錄
- 下一步可延伸接口

Phase 1 不做完整自動化、不接正式社群 API、不做客戶外部入口。先做新人訓練閉環。

## 2. Agent Roles

### Product Architect Agent

責任：

- 把 Jacky 的需求轉成可開發的 product slice
- 維護 Phase 1 / Phase 2 backlog
- 定義每個頁面的完成條件
- 確認功能沒有偏離「平台即訓練系統」定位

主要產出：

- user flow
- acceptance criteria
- product decision log

### Domain Model Agent

責任：

- 定義核心 entities 與關聯
- 控制資料模型不要過早複雜化
- 確保 brand brain、team brain、Jacky knowledge node、training task、review、trace log 可以串起來

主要產出：

- schema draft
- migration plan
- fixture data plan

### Full-Stack App Agent

責任：

- 建立 app skeleton
- 實作 routing、data access、server actions / API handlers
- 串接 mock data 到真實資料層
- 保持工程結構清楚

主要產出：

- running app
- page routes
- service layer
- data layer

### UX Flow Agent

責任：

- 設計新人 cockpit、任務訓練場、Jacky Decision Panel 的操作流程
- 先做 wireframe / information architecture
- 等 Jacky 提供双云品牌視覺系統後，再進 UI visual design

注意：

- 需要 UI 視覺、色彩、字體、logo、品牌元件時，必須向 Jacky 要双云品牌視覺系統。
- 在品牌視覺未提供前，只做低保真介面與資訊架構。

### Knowledge Graph Agent

責任：

- 將 Jacky Wiki 內容映射成 knowledge nodes
- 定義節點欄位：概念、適用情境、不適用情境、關聯節點、可回答問題、代表話術、來源頁
- 定義 Decision Layer 的 retrieval / reasoning payload

主要產出：

- knowledge node schema
- first seed nodes
- decision prompt contract

### QA and Review Agent

責任：

- 定義每個 product slice 的測試方式
- 確認新人流程不會繞過 reviewer
- 確認 trace log 有留下關鍵狀態
- 建立 smoke test checklist

主要產出：

- test plan
- manual QA script
- regression checklist

## 3. Development Rule

每次開發只做一個清楚切片。

推薦順序：

1. Project scaffold
2. Domain seed data
3. Newcomer cockpit
4. Training task list
5. Brain directory
6. Jacky Decision Panel mock
7. Review workflow mock
8. Trace log
9. 60-point certification progress

## 4. Brand Visual Gate

以下任務開始前，需要 Jacky 提供双云品牌視覺系統：

- 高保真 UI
- landing / cockpit visual polish
- color tokens
- typography tokens
- logo / icon system
- cards, buttons, tags, navigation final styling
- brand-specific empty states or illustrations

在取得品牌視覺前，工程只使用 neutral internal-tool UI。
