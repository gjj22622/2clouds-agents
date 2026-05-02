# 功能模組

## 1. 新人 Cockpit

首頁優先顯示新人要完成的導入任務。

功能：

- 今日任務
- 能力進度
- 60 分認證狀態
- 最近品管回饋
- 可呼叫腦袋
- 下一步推薦

## 2. 腦袋資料庫

路由：`/brains`

分類：

- Jacky 腦
- 成員腦
- 客戶品牌腦

每個腦袋包含：

- 負責什麼
- 什麼時候該呼叫
- 可以回答什麼
- 不能回答什麼
- 相關 SOP
- 相關範例
- 最後更新時間
- 品管信任等級

## 3. 知識圖譜中心

路由：`/knowledge-graph`

功能：

- 查看 Jacky 知識體系節點
- 搜尋問題
- 看方法論關聯
- 從情境反查模型
- 從客戶問題反查可用話術
- 從平台功能反查背後方法論

## 4. 客戶導入模組

路由：`/clients`

對應：`sy.hand.client-onboard`

管理接案 Stage 0-9：

- Stage 0：產業研究
- Stage 1：需求初探
- Stage 2：意願評估
- Stage 3：方案規劃
- Stage 4：提案二談
- Stage 5：跟進確認
- Stage 6：合約準備
- Stage 7：簽約收網
- Stage 8：組建團隊與啟動會議
- Stage 9：滿意度調查

## 5. 品牌工作台

路由：`/brands`

每個品牌有獨立營運空間。

內容：

- brand pack
- 老闆 Agent
- 主管 Agent
- 窗口 Agent
- 品牌 Agent
- review rules
- 品牌專屬 task skills
- 品牌資料完整度

## 5A. 品牌自主營運 Agent Team（Phase 2A）

路由：`/brands/[id]/agent-team`

依 `docs/muzopet-autonomous-agent-team-spec.md` 定義，每個品牌可配置一套獨立的 Agent Team。

模組組成：

- Revenue Goal：目標設定 + 缺口進度
- Agent Team 狀態：6 個 Agent 各自的今日任務 + 狀態（running / blocked / needs_approval）
- Action Proposals：提案清單，含 riskLevel + expected_revenue_impact + approval 狀態
- Approval Queue：分 Jacky / 藝嘉 / Sophia / 政澔 的待辦
- Resource Request：對人類成員的資源請求追蹤
- Daily Operating Report：今日執行摘要、blockers、明日行動

Agent 清單：

- Revenue Commander Agent：拆目標 + 策略方向 + 日報
- Member Reactivation Agent：RFM 分群 + 喚醒提案
- Content & Offer Agent：文案草稿 + 優惠組合建議
- Compliance & Brand Reviewer Agent：紅線掃描 + 🟢🟡🔴 評估
- Data Attribution Agent：數據歸因 + 週報草稿
- Resource Request Agent：人類協作請求彙整

Approval 規則：
- low riskLevel → 藝嘉 review
- medium riskLevel → 藝嘉 review + Jacky deferred
- high riskLevel → Jacky approval 必要
- 紅線命中（醫療 / 退訂戶 / 折扣承諾）→ 自動 block + 通知藝嘉

## 6. 內容工廠

路由：`/content`

用途：

- 新增內容需求
- 產生 brief
- 產出 FB / IG / Reels / LINE / EDM / 週報 / 月報
- 管理草稿版本
- 送審與退修
- 保留 trace

流程：

```text
品牌需求
→ brand-ops-agent 標準化 brief
→ master-content-orchestrator 分派任務
→ 品牌專屬 task skill 產出
→ content-reviewer 審查
→ trace-logger 留紀錄
```

## 7. 品管中心

路由：`/reviews`

審查模式：

- structure
- brand
- compliance
- final

審查結果：

- pass
- needs_revision
- reject

所有可發布內容都必須經過 reviewer 與 trace logger。

## 8. Skill OS

路由：`/skills`

管理双云的 Agent 工廠。

核心 Skill：

- `shuangyun-brand-ops-agent`
- `shuangyun-master-content-orchestrator`
- `shuangyun-brand-pack-builder`
- `shuangyun-content-reviewer`
- `shuangyun-trace-logger`
- `shuangyun-task-skill-builder`
- `shuangyun-review-rule-builder`
- `shuangyun-workflow-mapper`

功能：

- Skill 清單
- Skill 層級
- Skill 狀態
- 流程拆解表
- Agent 說明書 9 區塊
- 殘酷測試
- Skill 完整度評分
- Skill 瘦身建議
- Prompt 版本歷史

## 9. Workflow / Trace Logs

路由：`/workflows`

功能：

- workflow run 狀態
- chain handoff
- QA review
- trace log
- 錯誤碼
- prompt 修改建議
- 人工確認紀錄

## 10. 自動化發布

路由：`/automation`

功能：

- FB 自動發佈
- IG 草稿發佈
- Reels 腳本與影片生成
- LINE Channel 設定與測試
- connector 管理
- 發布狀態紀錄
- 失敗重試
