# 木酢寵物達人自主 Agent Team 執行模擬

模擬日期：2026-05-02

模擬目標：驗證「Jacky 輸入月度營收目標後，Agent Team 如何拆解目標、產出行動提案、處理合規紅線、向人類請求資源，以及 Jacky approval gate 如何運作」的完整執行邏輯。

模擬品牌：木酢寵物達人 `brand-muzopet`

模擬角色：
- Jacky：老闆 / 最終決策者
- Revenue Commander Agent
- Member Reactivation Agent
- Compliance & Brand Reviewer Agent
- Resource Request Agent
- 藝嘉：品管員 / 合規確認
- Sophia：客戶關係 / 名單資源

---

## 1. Jacky 設定本月營收目標

**時間：** 2026-05-02 09:12

Jacky 進入 `/brands/brand-muzopet`，看到目前木酢本月累計 GMV 為 120,000 TWD（截至 5/2）。

Jacky 在 Agent Team cockpit 設定：

```
RevenueGoal {
  brandId: "brand-muzopet"
  amount: 300000
  currency: "twd"
  period: "2026-05"
  periodStart: "2026-05-01"
  periodEnd: "2026-05-31"
  setBy: "user-jacky"
  setAt: "2026-05-02T09:12:00"
}
```

Jacky 附加一條備注：

```
這個月優先做回購喚醒，不做大促銷感。陳總不喜歡折扣感太重。
重點是讓沉睡的家庭會員記得木酢，不是推銷。
```

**平台動作：**
```
revenue_goal_created
agent_team_run_triggered → brandId: brand-muzopet
```

---

## 2. Revenue Commander Agent 拆解目標

**時間：** 2026-05-02 09:14（自動執行）

Revenue Commander Agent 讀入：
- `RevenueGoal`：+300,000 TWD / 2026-05
- 目前 `BrandNormalizedMetric`：累計 GMV = 120,000 TWD
- 歷史策略參考：2026-04 喚醒 + 蝦皮加購的歸因數據

**計算結果：**
```
缺口：180,000 TWD
剩餘天數：29 天
日均需求：約 6,207 TWD/day
```

**策略方向拆解：**

| 方向 | 機制 | 預期貢獻 | 優先序 | riskLevel |
|---|---|---|---|---|
| A. 會員喚醒（沉睡戶 + 流失戶）| LINE OA + EDM，家庭場景 | +120,000 TWD | P1 | medium |
| B. 蝦皮加購組合推薦 | 蝦皮私訊 + 商品頁組合 | +45,000 TWD | P2 | low |
| C. FB 知識內容引流 | 天然清潔知識貼文，長期品牌認知 | +15,000 TWD（估計低）| P3 | low |

**Revenue Commander Agent 備注：**
```
方向 A 是本月主力，對應 Jacky 備注中的「讓沉睡家庭記得木酢」。
方向 A 需要：名單（Sophia 確認）+ 文案（Content & Offer Agent 起草）+ 藝嘉覆審。
方向 B 可以與 A 並行，技術上較簡單，不需要大量授權。
方向 C 貢獻低但零成本，可由新人負責草稿，不佔資深成員時間。
```

**平台動作：**
```
strategy_directions_generated
  → direction_count: 3
  → primary_direction: "member_reactivation"
  → total_expected_impact: 180000
```

---

## 3. Member Reactivation Agent 產出喚醒方案

**時間：** 2026-05-02 09:31（自動執行）

Member Reactivation Agent 依 Revenue Commander 優先序 P1 啟動，產出三個 ActionProposal。

### ActionProposal #001：沉睡戶 LINE 家庭場景喚醒

```
ActionProposal {
  id: "ap-muz-001"
  brandId: "brand-muzopet"
  title: "沉睡戶 LINE OA 春夏除臭喚醒波次"
  strategyDirection: "A"
  agentId: "member-reactivation-agent"
  targetSegment: "沉睡戶（R > 90, F ≥ 2，約 8,000 人）"
  channel: "line_oa"
  expectedRevenueImpact: 72000
  expectedReachCount: 8000
  estimatedConversionRate: 0.015
  riskLevel: "medium"
  requiredApprovalRole: ["reviewer_yijia", "jacky"]
  status: "pending_compliance_review"
  draftContent: "see_content_draft_001"
  notes: "需先確認退訂黑名單已核，LINE 每月發送次數本月剩餘 2 次"
}
```

### ActionProposal #002：高頻戶 LINE 春夏外出加購組合

```
ActionProposal {
  id: "ap-muz-002"
  brandId: "brand-muzopet"
  title: "高頻戶 LINE 外出防蚊加購組合"
  strategyDirection: "A"
  agentId: "member-reactivation-agent"
  targetSegment: "高頻戶（F ≥ 4, R < 60，約 3,200 人）"
  channel: "line_oa"
  expectedRevenueImpact: 32000
  expectedReachCount: 3200
  estimatedConversionRate: 0.025
  riskLevel: "medium"
  requiredApprovalRole: ["reviewer_yijia", "jacky"]
  status: "pending_compliance_review"
  draftContent: "see_content_draft_002"
  notes: "⚠️ 含「防蚊」主題，需確認狗用/貓用/人用場景區隔，Compliance 標記待確認"
}
```

### ActionProposal #003：流失戶 EDM 品牌故事喚醒

```
ActionProposal {
  id: "ap-muz-003"
  brandId: "brand-muzopet"
  title: "流失戶 EDM 木酢森林循環故事喚醒"
  strategyDirection: "A"
  agentId: "member-reactivation-agent"
  targetSegment: "流失戶（R > 180，約 5,000 人）"
  channel: "edm"
  expectedRevenueImpact: 16000
  expectedReachCount: 5000
  estimatedConversionRate: 0.008
  riskLevel: "low"
  requiredApprovalRole: ["reviewer_yijia"]
  status: "pending_compliance_review"
  notes: "流失戶用 EDM 不用 LINE，避免觸發退訂意願；強調品牌故事，不做促銷訴求"
}
```

---

## 4. Compliance & Brand Reviewer Agent 掃描

**時間：** 2026-05-02 09:45（自動執行）

Compliance Agent 掃描三份 ActionProposal 與相關文案草稿。

### ap-muz-001 掃描結果：🟢 pass

```
ComplianceFlag {
  proposalId: "ap-muz-001"
  result: "pass"
  checks: [
    { rule: "no_medical_claim", status: "pass" },
    { rule: "no_price_commitment", status: "pass" },
    { rule: "blacklist_confirmed", status: "blocked", message: "黑名單未核，發送計畫 block 中" },
    { rule: "brand_voice", status: "pass", note: "語氣符合木酢大家庭風格" }
  ]
  overallStatus: "pass_with_blocker"
  blockerReason: "發送名單黑名單尚未核對，需 Sophia 確認後才能解鎖"
  notifyRoles: ["reviewer_yijia"]
}
```

### ap-muz-002 掃描結果：🟡 flag（防蚊場景混用）

```
ComplianceFlag {
  proposalId: "ap-muz-002"
  result: "flag"
  checks: [
    { rule: "no_medical_claim", status: "pass" },
    { rule: "product_applicability", status: "flag",
      message: "「防蚊」商品適用對象（狗/貓/人）未區分，同一 LINE 訊息混合使用有誤用風險" },
    { rule: "blacklist_confirmed", status: "blocked", message: "黑名單未核" },
    { rule: "brand_voice", status: "pass" }
  ]
  overallStatus: "flag"
  flagReason: "防蚊主題需要區分適用商品，建議拆成兩版本（毛孩用 / 環境用）"
  notifyRoles: ["reviewer_yijia", "jacky"]
  suggestedAction: "拆成「毛孩除蚊除臭」和「居家環境防蚊」兩個版本，各有明確適用說明"
}
```

**Compliance Agent 自動升級通知已觸發：**
```
notification_sent → reviewer_yijia:
  "ap-muz-002 防蚊場景混用，請確認商品適用對象分類後放行或退修。"

notification_sent → jacky:
  "ap-muz-002 防蚊相關文案需要你的最終確認（中風險，含防蚊主題）。"
```

### ap-muz-003 掃描結果：🟢 pass

```
ComplianceFlag {
  proposalId: "ap-muz-003"
  result: "pass"
  checks: [
    { rule: "no_medical_claim", status: "pass" },
    { rule: "no_price_commitment", status: "pass" },
    { rule: "blacklist_confirmed", status: "blocked", message: "退訂名單待 Sophia 確認" },
    { rule: "brand_voice", status: "pass", note: "故事感強，無促銷語氣，符合流失戶策略" }
  ]
  overallStatus: "pass_with_blocker"
  blockerReason: "流失戶名單需確認退訂狀態已剔除"
  notifyRoles: ["reviewer_yijia"]
}
```

---

## 5. Resource Request Agent 向 Sophia 請求名單授權

**時間：** 2026-05-02 10:02（自動執行）

Resource Request Agent 彙整所有 blocked 狀態，產出清單：

### ResourceRequest #001：名單授權確認

```
ResourceRequest {
  id: "rr-muz-001"
  brandId: "brand-muzopet"
  title: "木酢 20 萬家庭會員分群名單授權確認"
  resourceType: "data_authorization"
  requestedBy: "member-reactivation-agent"
  assignee: "sophia"
  deadline: "2026-05-04"
  impactIfBlocked: "ap-muz-001、ap-muz-002、ap-muz-003 全部 block，本月會員喚醒策略無法執行，預期損失 ~120,000 TWD"
  details: """
    需要確認以下事項：
    1. 陳總是否已授權双云存取 20 萬會員分群名單
    2. 退訂戶（LINE 取消訂閱）名單最後更新時間
    3. 毛孩過世戶標記是否已整合到黑名單
    4. 分群資料可以透過哪個 Google Sheet tab 或 API 取得
  """
  status: "pending"
}
```

### ResourceRequest #002：Google Sheet 串接確認

```
ResourceRequest {
  id: "rr-muz-002"
  brandId: "brand-muzopet"
  title: "木酢官網 GA4 轉換事件標籤確認"
  resourceType: "technical_setup"
  requestedBy: "data-attribution-agent"
  assignee: "jeng_hao"
  deadline: "2026-05-06"
  impactIfBlocked: "歸因數據不完整，Data Attribution Agent 週報不可歸因率可能 > 30%"
  details: """
    目前官網 GA4 有追蹤 pageview，但 add_to_cart 和 purchase 事件標籤尚未確認。
    請確認：
    1. GA4 property ID（木酢官網）
    2. purchase 事件是否有正確觸發
    3. Google Sheet 中是否有每日 session + conversion 摘要 tab
  """
  status: "pending"
}
```

**Resource Request Agent 摘要通知已送出：**
```
notification_sent → sophia:
  "ResourceRequest #rr-muz-001 等待你確認：木酢名單授權。截止：2026-05-04。
   影響：3 個喚醒提案全部 block。"

notification_sent → jeng_hao:
  "ResourceRequest #rr-muz-002 等待你確認：GA4 事件標籤。截止：2026-05-06。"
```

---

## 6. Jacky Approval Gate

**時間：** 2026-05-02 14:30

Jacky 進入 `/brands/brand-muzopet/approvals`，看到 Approval Queue：

```
Approval Queue（Jacky）：

[1] ap-muz-002 — 高頻戶 LINE 防蚊加購組合
    riskLevel: medium
    Compliance 標記：防蚊場景混用（藝嘉已收到通知）
    藝嘉狀態：尚未審查
    建議行動：等藝嘉先確認分類後再決策

[2] 策略方向 A（會員喚醒）— 需要 Jacky 確認整體方向優先序
    Revenue Commander 建議：A > B > C
    依據：歷史數據 + Jacky 備注（不做大促銷）
    建議行動：批准方向 A 為本月主力
```

**Jacky 的決策：**

```
ApprovalDecision #1：策略方向確認
  proposalId: "strategy-direction-A"
  decision: "approved"
  reason: """
    確認方向 A（會員喚醒）為本月主力。
    重申：不做促銷感訊息，包故事感，讓人想起木酢品牌，不是在硬銷。
    沉睡戶先試 LINE，流失戶用 EDM，分開操作，不要混。
  """
  decidedBy: "jacky"
  decidedAt: "2026-05-02T14:35:00"
```

```
ApprovalDecision #2：ap-muz-002 等待藝嘉
  proposalId: "ap-muz-002"
  decision: "deferred"
  reason: """
    等藝嘉先確認防蚊商品適用對象分類，拆版本後再送我看。
    如果拆成「毛孩用」和「環境用」兩版本，我大概率 approve 環境版本，
    毛孩版本需要確認適用年齡和品種。
  """
  decidedBy: "jacky"
  decidedAt: "2026-05-02T14:37:00"
```

**Jacky 額外備注（在品牌頁面留下 SeniorMemberActivity）：**
```
SeniorMemberActivity {
  activityType: "note"
  summary: """
    2026-05-02 Jacky 確認：
    本月木酢重點是喚醒沉睡家庭，不是推促銷。
    方向 A approve，防蚊議題（ap-muz-002）等藝嘉拆版本再看。
    名單授權的事請 Sophia 跟陳總確認，這個要快，影響整個喚醒計畫。
  """
  relatedBrandTaskIds: ["mtask-001", "mtask-002"]
  createdAt: "2026-05-02T14:40:00"
  userId: "user-jacky"
}
```

**平台動作：**
```
approval_decision_created → strategy_direction_A: approved
approval_decision_created → ap-muz-002: deferred
senior_member_activity_created → type: note
trace_log_created → action: "jacky_approval_gate_completed"
```

---

## 7. Daily Operating Report（當天收工）

**時間：** 2026-05-02 22:00（Revenue Commander Agent 自動產出）

```
DailyOperatingReport {
  brandId: "brand-muzopet"
  date: "2026-05-02"
  generatedBy: "revenue-commander-agent"
  generatedAt: "2026-05-02T22:00:00"

  revenueProgress: {
    goal: 300000,
    currentGMV: 120000,
    gap: 180000,
    daysRemaining: 29,
    dailyRunRate: 6207
  }

  actionsTaken: [
    "Revenue Goal 已設定：+300,000 TWD / 2026-05",
    "策略方向 A/B/C 已拆解，A 獲 Jacky 批准",
    "三個 ActionProposal 已產出（ap-muz-001/002/003）",
    "Compliance 掃描完成：001/003 pass，002 flag（防蚊場景）",
    "兩個 ResourceRequest 已送出（Sophia / 政澔）"
  ]

  blockers: [
    {
      description: "ap-muz-001、003 的名單黑名單未核對",
      blockedBy: "resource_request_rr-muz-001",
      assignedTo: "sophia",
      deadline: "2026-05-04",
      estimatedImpact: 120000
    },
    {
      description: "ap-muz-002 防蚊場景分類待藝嘉確認",
      blockedBy: "compliance_flag_ap-muz-002",
      assignedTo: "reviewer_yijia",
      deadline: "2026-05-03",
      estimatedImpact: 32000
    }
  ]

  humanResourcesNeeded: [
    "Sophia：名單授權（截止 2026-05-04）",
    "藝嘉：ap-muz-002 防蚊版本確認（截止 2026-05-03）",
    "政澔：GA4 事件標籤確認（截止 2026-05-06）"
  ]

  nextActions: [
    "等 Sophia 確認名單授權後，ap-muz-001/003 可進入發送計畫",
    "等藝嘉審查 ap-muz-002 後，送 Jacky 最終 approve",
    "Content & Offer Agent 今晚準備 ap-muz-001 文案細稿",
    "Data Attribution Agent 明早更新 GMV 進度條"
  ]
}
```

---

## 8. 模擬驗證結果

### 8.1 這次模擬驗證出的平台能力

- Revenue Goal 輸入 → Agent 拆解策略 → 提案生成的完整路徑邏輯清楚
- Compliance 紅線攔截（防蚊場景）可以在提案階段提前標出，不需要等人類發現
- Resource Request 清晰指派到正確人選（Sophia / 政澔），有截止日期與影響說明
- Jacky approval gate 可以在 15 分鐘內完成決策（2 個事項），不用逐字看每份草稿
- Daily Operating Report 讓 Jacky 用一份文件就能掌握今天做了什麼、卡在哪

### 8.2 這次模擬暴露出的平台缺口

1. **ap-muz-002 防蚊分類問題**：Compliance Agent 可以 flag，但「拆版本」的具體建議需要人類判斷。未來可以讓 Content & Offer Agent 自動生成兩個拆版本草稿，減少來回時間。

2. **名單黑名單核對流程**：目前 Compliance Agent 只能 block「黑名單未核」，但名單本身的維護機制不在平台內，仍依賴 Sophia 手動管理。Phase 3 應考慮 Google Sheet 黑名單 tab 自動讀取。

3. **Jacky approval 通知的優先序**：Jacky 看到兩個待辦，但沒有視覺上的「這個比較緊」提示。需要 UI 層補上截止日期與影響金額排序。

4. **Agent Team 執行可視性**：目前 DailyOperatingReport 由 Agent 自動產出，但中間過程（例如哪個 Agent 在 09:31 做了什麼）沒有可查的 AgentRun trace。Codex 應在 domain model 加入 AgentRun 記錄。

### 8.3 後續工程切片建議

1. Gemini：在 `/brands/[id]` 加入 Agent Team cockpit（RevenueGoal 進度條 + 6 Agent 狀態 + Proposal 清單 + Approval Queue + Daily Report）
2. Codex：定義 `RevenueGoal`、`ActionProposal`、`ResourceRequest`、`DailyOperatingReport`、`AgentRun` domain types
3. Codex：approval policy logic（riskLevel → 誰 approve 的路由規則）
4. Codex：Compliance flag 的 unit tests（紅線詞命中 → block 路徑）
5. 下一版模擬：藝嘉確認 ap-muz-002 後，Jacky 最終 approve，ap-muz-002 解鎖進入執行的完整流程
