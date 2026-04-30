# 双云 AI 行銷部訓練與營運平台 Spec

## 1. 專案定位

平台名稱：双云 AI 行銷部訓練與營運平台

專案代號：`2clouds-agents`

一句話定位：

> 讓新人透過操作平台，直接進入双云的 AI First 工作方式，並在 Jacky 知識圖譜、成員腦、品牌腦與品管回饋的輔助下，從 0 開始成為可交付的 60 分數位行銷服務者。

這不是一般 CRM，也不是單純教育訓練系統，而是三合一：

1. 新人導入訓練系統
2. 双云營運管理平台
3. AI 行銷服務交付系統

## 2. 核心使用情境

新人進入平台後，應該可以完成以下路徑：

```text
認識双云
→ 學會看品牌腦
→ 學會呼叫 Jacky 知識圖譜
→ 完成內容任務
→ 接受品管與修稿
→ 看懂客戶服務流程
→ 達到 60 分可交付標準
```

營運成員則從同一平台管理：

- 客戶導入
- 品牌工作台
- 內容生產
- 品管審核
- Skill OS
- 工作流 trace
- 自動化與 API

## 3. 首頁設計

首頁不做行銷官網，而是營運 cockpit。

### 3.1 新人模式

新人登入後優先看到：

- 今天該學什麼
- 今天該做什麼任務
- 目前能力等級
- 哪些任務已通過
- 哪些能力還沒達 60 分
- 可以呼叫哪些腦袋輔助
- 最近一次品管回饋
- 下一個推薦任務

### 3.2 營運模式

營運角色看到：

- 進行中客戶數
- 待處理接案
- 待審內容
- 待補資料品牌
- 本週任務完成率
- 異常工作流數
- Prompt 修改待確認
- 自動化發布狀態

## 4. 角色

| 角色 | 權限與重點 |
|---|---|
| Jacky | 全域決策、Prompt 修改確認、方法論維護、知識圖譜治理 |
| Sophia | 接案、客戶導入、合約前流程、客戶服務節點 |
| 藝嘉 | 社群內容、合規、審稿、內容品管 |
| 政澔 | API、workflow、自動化、connector 技術狀態 |
| 新人 | 完成訓練任務、呼叫知識圖譜、產出低風險交付物 |
| 客戶端 | 第一階段不開放；後續可做 client portal 或 API |

## 5. 第一版路由

```text
/
  新人 Cockpit + 營運總覽

/training
  任務型新人導入

/training/tasks
  任務訓練場

/knowledge-graph
  Jacky 知識圖譜

/decision
  Jacky Decision Layer 測試台

/brains
  Jacky 腦 / 成員腦 / 品牌腦

/brands
  品牌工作台

/brands/:id
  品牌詳情

/brands/:id/agents
  4 Agent 委員會

/content
  內容工廠

/content/:id
  內容詳情與版本

/reviews
  品管中心

/clients
  客戶導入

/clients/:id/onboarding
  客戶 Stage 0-9

/skills
  Skill OS

/skills/:id
  Skill 詳情、版本、測試

/workflows
  Workflow runs / trace logs

/automation
  自動化發布

/settings
  使用者、角色、connector 設定
```

## 6. 產品原則

- 平台本身就是導入訓練。
- 方法論要散布在各工作節點，不只放在課程頁。
- 成員卡住時，可以呼叫 Jacky Decision Layer。
- 所有決策都要留下 trace log。
- 可發布輸出必須經過品管。
- 新人要學會升級問題，而不是硬做。
