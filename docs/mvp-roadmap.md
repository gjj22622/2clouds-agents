# MVP 路線圖

## Phase 1：新人訓練閉環

第一期不追求完整自動化，先做出新人能透過平台被訓練、被引導、被品管的閉環。

範圍：

1. 新人 Cockpit
2. 腦袋資料庫
3. Jacky Decision Panel
4. 知識圖譜中心最小版
5. 品牌工作台最小版
6. 任務訓練場
7. 內容工廠最小版
8. 品管中心最小版
9. Trace log
10. 60 分認證進度

不做或只留接口：

- 真正串 FB / IG / LINE API
- n8n 實際執行
- 自動 Prompt 更新
- 客戶外部 API
- 金流 / 報價正式合約系統

## Phase 2：營運管理閉環

補上双云日常營運需要的完整流程。

### Phase 2A：木酢自主營運 Agent Team（當前優先項）

品牌：木酢寵物達人（試點）

規格參考：[木酢自主營運 Agent Team Spec](./muzopet-autonomous-agent-team-spec.md)

範圍：

- RevenueGoal：Jacky 設定月度營收目標
- Agent Team cockpit：Revenue Commander / Member Reactivation / Content & Offer / Compliance & Brand Reviewer / Data Attribution / Resource Request
- ActionProposal：riskLevel + expected_revenue_impact + approval 路由
- ApprovalQueue：分 Jacky / 藝嘉 / Sophia / 政澔
- ResourceRequest：資源請求指派追蹤
- DailyOperatingReport：每日 Agent 執行摘要
- Compliance 紅線攔截（醫療宣稱 / 退訂戶 / 折扣承諾等）

Acceptance Criteria 見 `docs/muzopet-autonomous-agent-team-spec.md` Section 9。

新增 Domain Types（Codex 負責）：

- `RevenueGoal`
- `ActionProposal`
- `ResourceRequest`
- `DailyOperatingReport`
- `AgentRun`
- `ComplianceFlag`
- `ApprovalDecision`

### Phase 2B：營運管理完整閉環

範圍：

- 客戶導入 Stage 0-9
- Skill OS 管理
- Prompt 版本管理
- workflow run 管理
- 進度追蹤
- 團隊工作量
- 內容批次任務
- 退件與修稿統計

## Phase 3：自動化與 API

將手動流程逐步接到自動化。

範圍：

- API Gateway
- 9 GET + 8 POST 路由
- n8n workflow
- FB / IG / LINE connector
- Reels 生成流程
- 工作流錯誤碼
- 客戶 API 預留

## Phase 4：知識進化

讓平台開始沉澱知識。

範圍：

- 品管回饋彙整
- Prompt 修改建議
- 常見客戶問題沉澱
- 成員腦更新
- 品牌腦更新
- 知識圖譜關聯自動推薦

規則：

- Prompt 變更必須 Jacky 確認。
- Agent 不允許自行修改核心方法論。
- 知識圖譜新增節點需要來源頁面或 trace log 佐證。
