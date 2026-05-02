# 木酢 Agent Team — QA、Edge Cases & Manual Acceptance 文件

**版本：** v1.0 · 2026-05-02
**用途：** 提供 Gemini（UI 驗收）與 Codex（domain tests）共同使用的可執行驗收依據
**前置規格：** [木酢自主營運 Agent Team Spec](./muzopet-autonomous-agent-team-spec.md)
**前置模擬：** [執行模擬 2026-05-02](./platform-simulations/muzopet-autonomous-agent-team-simulation-2026-05-02.md)

---

## 1. Approval Edge Cases

每個 edge case 包含：觸發條件、預期系統行為、錯誤行為（不可出現）、UI 驗收要點。

---

### EC-A01：LINE 每月超過 2 次 push

**觸發條件：**
本月 LINE push 已發 2 次（2 筆發送紀錄均為 `status: sent`），Member Reactivation Agent 或 Content & Offer Agent 產出第 3 個 LINE 發送類 ActionProposal。

**預期系統行為：**

1. Compliance & Brand Reviewer Agent 掃描到「本月第 3 次 LINE push」
2. 提案標記 `compliance_flag: line_frequency_exceeded`，狀態設為 🟡 flag（不是 🔴 block，因需 Jacky 授權例外）
3. Jacky Approval Queue 出現一筆：「本月 LINE 已發 2 次，此為第 3 次，需要你授權例外」
4. 未收到 Jacky approval 前，提案狀態維持 `pending_jacky_approval`，不可進入執行佇列
5. Jacky approve 後：提案解鎖，狀態改為 `approved`
6. Jacky reject 後：提案改為 `rejected`，附 Jacky 的理由，Content & Offer Agent 收到通知

**錯誤行為（不可出現）：**
- 第 3 次 LINE push 在未獲 Jacky 授權前自動進入執行佇列
- 系統將此直接 block 且不給 Jacky 授權的機會（LINE 頻率是規則，但 Jacky 有例外授權權）
- UI 未顯示「本月已使用 2/2 LINE push 配額」的狀態提示

**UI 驗收要點（Gemini）：**
- Revenue Goal 進度區顯示「本月 LINE 配額：2/2 已用」
- 第 3 個 LINE 提案在 Proposal 清單顯示 🟡 flag + 「需 Jacky 授權：超出頻率上限」
- Jacky Approval Queue 此筆顯示月份、已發次數、預期觸達數、預期影響金額

---

### EC-A02：防蚊文案混用狗用 / 貓用 / 人用

**觸發條件：**
Content & Offer Agent 產出的文案草稿，在同一則 LINE / FB / 蝦皮訊息中同時提及「狗」「貓」「毛孩」與「防蚊」，且未明確區分商品適用對象（例：「防蚊除臭組合，貓狗毛孩通用」）。

**預期系統行為：**

1. Compliance Agent 標記 `compliance_flag: product_applicability_ambiguous`，狀態 🟡 flag
2. 通知藝嘉：「防蚊文案適用對象模糊，請確認狗用 / 貓用 / 人用商品是否可並列」
3. 修改建議自動產出：「建議拆成兩版本：(A) 毛孩防蚊除臭版、(B) 居家環境防蚊版，各有適用說明」
4. 提案進入藝嘉 Review Queue，狀態 `pending_reviewer_yijia`
5. 藝嘉 approve（確認拆版本後）→ 提案繼續推往 Jacky
6. 藝嘉 needs_revision → 提案退回 Content & Offer Agent，附藝嘉的修改指引

**錯誤行為（不可出現）：**
- 防蚊混用文案直接 🟢 pass，未被 Compliance Agent 識別
- Compliance Agent 直接 🔴 block（防蚊適用對象問題屬可修復的 flag，不是硬性 block）
- 系統在藝嘉未確認前，允許此文案進入發送計畫

**UI 驗收要點（Gemini）：**
- Proposal 清單中此提案顯示 🟡 flag + 「適用對象模糊，需藝嘉確認」
- 藝嘉 Review Queue 顯示 Compliance 的修改建議文字（兩版本建議）
- 藝嘉在介面上可以選「approve（已確認或已拆版本）」或「needs_revision（附說明退回）」

---

### EC-A03：退訂戶或毛孩過世戶被包含在名單

**觸發條件：**
Sophia 提供了名單，但系統偵測到以下任一情況：
- 名單中存在「退訂狀態 = true」的用戶
- 名單中存在「毛孩過世標記 = true」的用戶
- 名單的最後更新時間 > 30 天（可能過期，無法確認黑名單現況）

**預期系統行為：**

1. Member Reactivation Agent 在收到名單後，觸發黑名單核對檢查
2. 若發現退訂戶或毛孩過世戶：
   - 名單 🔴 block，發送計畫強制暫停
   - 通知藝嘉：「名單包含退訂戶 [N 筆] / 毛孩過世戶 [M 筆]，已阻止發送計畫」
   - Resource Request Agent 產出清單更新請求給 Sophia：「需要更新後的黑名單，截止 [日期]」
3. 若名單更新時間 > 30 天（過期風險）：
   - 狀態改為 🟡 flag（不直接 block，但標記警告）
   - 通知藝嘉：「名單最後更新 [N] 天前，建議 Sophia 重新確認黑名單」
4. 黑名單問題解決後，名單重新進入 Compliance 掃描流程

**錯誤行為（不可出現）：**
- 退訂戶被包含在名單中，系統仍讓發送計畫進入 approved 狀態
- 毛孩過世戶被發送任何行銷訊息（此為木酢最高等級客訴紅線）
- 系統僅記錄警告但不 block 發送計畫

**UI 驗收要點（Gemini）：**
- 發送計畫狀態欄顯示 🔴 block + 「名單含 [N] 筆退訂戶 / [M] 筆毛孩過世戶」
- Sophia 的 Resource Request Queue 顯示「名單重新確認請求」，含截止日期
- 阻止發送的理由在 trace log 中有記錄（actorId: compliance-agent, action: blacklist_check_failed）

---

### EC-A04：文案出現醫療宣稱

**觸發條件：**
Content & Offer Agent 產出的文案草稿中，出現以下任一詞語（不論上下文）：
治療 / 預防疾病 / 消滅跳蚤 / 消滅細菌 / 臨床證實 / 獸醫推薦 / 100% 有效 / 保證無副作用 / 抗菌（若搭配功效描述）

**預期系統行為：**

1. Compliance Agent 立即 🔴 block，標記 `compliance_flag: medical_claim`
2. 通知藝嘉 + Jacky：「文案含醫療宣稱，已自動攔截，請確認修改方向」
3. 提案狀態設為 `blocked_medical_claim`，不進入任何 Approval Queue 的正常流程
4. 修改建議自動產出（若可替換）：例如「消滅跳蚤」→ 建議改為「有助減少跳蚤困擾」
5. 通知 Content & Offer Agent：草稿需重寫，附 Compliance 標記的命中詞與建議替換詞
6. 藝嘉確認修改後，提案重新進入 Compliance 掃描流程

**例外處理（降級為 🟡 flag 的條件）：**
- 文案附有「此為產品資訊說明，非醫療建議，毛孩健康問題請諮詢獸醫」的免責聲明
- 此時狀態改為 🟡 flag，仍需藝嘉人工確認，但不直接 block

**錯誤行為（不可出現）：**
- 醫療宣稱詞出現在文案中，Compliance Agent 未偵測到（漏判）
- 🔴 block 後，系統允許 Jacky 直接 approve 此提案（醫療宣稱不是 Jacky 可以授權的例外）
- 通知只發給藝嘉，Jacky 沒收到通知

**UI 驗收要點（Gemini）：**
- Proposal 顯示 🔴 blocked + 命中詞高亮顯示（例：「消滅跳蚤」標紅）
- 顯示 Compliance 的替換建議
- Approval Queue 中此提案不出現「approve」按鈕，只有「查看詳情」

---

### EC-A05：Agent 想要調整價格或折扣

**觸發條件：**
Content & Offer Agent 在優惠組合建議中，產出以下任一類型：
- 永久折扣（「長期會員享八折」）
- 不明確結束時間的優惠（「現在訂購，特別優惠中」但無截止日期）
- 與品牌定價政策衝突的折扣幅度（例：官網 full price 商品出現 > 20% 折扣建議）

**預期系統行為：**

1. Compliance Agent 標記 `compliance_flag: price_commitment`，狀態 🔴 block（若永久折扣）或 🟡 flag（若僅無截止日期）
2. 永久折扣 → 自動 block + 通知 Jacky：「提案含永久折扣承諾，需你確認或修改」
3. 無截止日期 → 🟡 flag + 通知 Jacky：「提案優惠無明確截止日期，需確認是否為限時活動」
4. Jacky approve 時，必須附上：折扣幅度、有效期間（截止日期必填）
5. Approval 記錄包含：Jacky 確認的折扣幅度 + 截止日期，作為後續執行的硬性參數
6. 若 Jacky reject：提案回到 Content & Offer Agent，附 Jacky 的說明（「不做折扣，改用加購故事感」）

**可通過的寫法（不觸發 flag）：**
```
「5/15 前訂購，加贈除臭噴霧一瓶」→ 有截止日期，非永久承諾
「本月會員限定組合」→ 有期間限制
```

**錯誤行為（不可出現）：**
- 永久折扣提案在未獲 Jacky approval 前進入執行佇列
- 系統接受無截止日期的優惠作為確認的提案
- Jacky approve 但未填截止日期，系統仍讓提案通過

**UI 驗收要點（Gemini）：**
- 🟡 flag 的優惠提案顯示「截止日期未填寫，需 Jacky 確認」
- Jacky approve 介面有「截止日期」必填欄位
- 執行佇列中的優惠類提案，顯示 Jacky 確認的截止日期

---

### EC-A06：Agent 想改主力商品線或品牌定位

**觸發條件：**
Revenue Commander Agent 或 Content & Offer Agent 的策略建議，涉及以下任一情況：
- 主力推廣商品從「木酢寵物清潔」切換到「企業 ESG 採購」
- 新增未在 BrandBrain 登記的受眾（例：開始推廣「老人用品」市場）
- 通路策略重大改變（例：停止 LINE，改主攻 TikTok）
- 提案的 `targetSegment` 超出現有 BrandBrain.audience 定義範圍

**預期系統行為：**

1. Revenue Commander Agent 偵測到策略偏離 BrandBrain.audience 或 BrandBrain.offer
2. 標記 `requires_jacky_approval: strategy_change`，提案進入 Jacky Approval Queue
3. 通知 Jacky：「策略方向建議含品牌定位或商品策略改變，需你確認」
4. 通知 Sophia：「若策略方向獲批，需確認客戶（陳總）是否知情」
5. Jacky approve：提案解鎖，Sophia 收到「確認陳總知情」的 ResourceRequest
6. Jacky reject：提案退回 Revenue Commander，附理由，策略方向重設

**錯誤行為（不可出現）：**
- 系統允許未經 Jacky 確認的策略方向改變直接執行
- 品牌定位改變提案只通知藝嘉而不通知 Jacky（品牌定位是老闆決策，不是品管決策）
- Sophia 在陳總未知情前，已執行策略改變相關的客戶聯絡

**UI 驗收要點（Gemini）：**
- 策略方向清單中「策略改變類」提案有 🟡 flag + 「需 Jacky 確認：涉及品牌定位」
- Jacky Approval Queue 中此類提案顯示「與現有 BrandBrain 定義的差異說明」
- approve 後，Sophia 的 Resource Request 出現「通知陳總確認」

---

## 2. ResourceRequest Edge Cases

---

### EC-R01：Sophia 沒拿到名單授權

**觸發條件：**
Resource Request #rr-muz-001（名單授權）已到截止日期，Sophia 標記為「無法取得：陳總尚未回應」或「陳總拒絕此次名單授權」。

**預期系統行為：**

**情況 A：截止日期已過，Sophia 尚未回應**
1. Resource Request Agent 自動升級：狀態從 `pending` 改為 `overdue`
2. 通知 Jacky：「ResourceRequest rr-muz-001 已逾期 [N] 天，影響喚醒計畫 ~120,000 TWD」
3. 依賴此名單的所有 ActionProposal 持續維持 `blocked` 狀態
4. DailyOperatingReport 的 blockers 清單更新：「名單授權逾期，已通知 Jacky」

**情況 B：陳總拒絕名單授權**
1. Sophia 將 ResourceRequest 標記為 `completed_denied`，附原因
2. Member Reactivation Agent 收到通知：「名單授權被拒，喚醒策略 A 需要改為其他名單來源或降低觸達規模」
3. Revenue Commander Agent 重新計算可用策略：從方向 A 期望的 +120,000 TWD 調降，依新情況重新估算
4. Jacky Approval Queue 出現：「名單被拒，策略方向 A 受影響，請確認是否調整整體目標」

**錯誤行為（不可出現）：**
- ResourceRequest 逾期但系統無通知，Jacky 不知道名單授權卡住
- 名單授權被拒後，ActionProposal 仍顯示為 `pending` 而不是 `blocked`
- Revenue Commander 未自動調整策略，仍繼續計算 +120,000 TWD 的預期貢獻

**UI 驗收要點（Gemini）：**
- ResourceRequest 清單顯示 `overdue` 狀態（紅色標示）+ 逾期天數
- 依賴此 request 的 Proposal 全部顯示 `blocked_pending_resource`
- DailyOperatingReport 的 blockers 欄顯示此逾期請求

---

### EC-R02：政澔回報 connector 還是 needs_setup

**觸發條件：**
政澔完成確認後，回報：「GA4 事件標籤確認失敗，BrandSheetConnector 狀態仍為 `needs_setup`，原因：官網缺少 purchase 事件追蹤代碼」。

**預期系統行為：**

1. ResourceRequest rr-muz-002 狀態更新為 `in_progress_blocked`，附政澔的阻塞原因
2. Data Attribution Agent 收到通知：「GA4 data source 仍為 `needs_setup`，週報歸因數據不完整」
3. 歸因週報草稿標記「GA4 purchase 事件缺失，本期不可歸因率可能 > 30%」，狀態設為 🟡 flag
4. Revenue Commander Agent 記錄：「策略數據不完整，本週歸因報告信心度 = low」
5. 新的 ResourceRequest 自動產出，指派給政澔：「安裝 GA4 purchase event 追蹤代碼，截止 [N+3 天]」
6. DailyOperatingReport 記錄：政澔 connector 受阻，影響數據信心度

**錯誤行為（不可出現）：**
- connector 仍為 `needs_setup`，但 Data Attribution Agent 仍輸出「已完成歸因」報告
- 系統沒有產出新的 ResourceRequest，讓政澔知道下一步要做什麼
- 不可歸因率超過 30% 但沒有警報

**UI 驗收要點（Gemini）：**
- 資料來源狀態欄中，GA4 顯示 `needs_setup`（橘色警示）
- 週報草稿顯示「不可歸因率警告：XX%，超過 30% 閾值，請查看補救建議」
- 政澔的 Resource Request Queue 顯示新的技術任務

---

### EC-R03：Google Sheet 欄位 mapping 缺失

**觸發條件：**
Data Attribution Agent 嘗試從木酢 Google Sheet 的 `daily_summary` tab 讀取數據，但發現 Sheet 中的欄位名稱與 `BrandSheetReadConfig.fieldMapping` 不符（例：Sheet 標題列為「訂購金額」，但 mapping 設定為 `order_amount`）。

**預期系統行為：**

1. BrandRawImport 記錄狀態設為 `rejected`，附欄位不符說明
2. Data Attribution Agent 標記該次讀取為失敗：`import_status: field_mapping_mismatch`
3. 通知政澔：「daily_summary tab 欄位 mapping 不符，以下欄位無法匹配：[列表]，請更新 BrandSheetReadConfig 或調整 Sheet 欄位名稱」
4. ResourceRequest 自動產出，指派政澔：「修正 Sheet mapping，截止 [日期]」
5. 該日數據缺失：GMV 無法更新，Revenue Commander 標記當日進度為「數據未到位」
6. DailyOperatingReport 中「數據缺失」被列為 blocker

**注意：系統應能區分：**
- 欄位 mapping 錯誤（政澔修 config）vs. Sheet 本身欄位名稱改了（Sophia 確認是否刻意更名）

**錯誤行為（不可出現）：**
- 欄位 mapping 缺失，但 Data Attribution Agent 仍輸出部分歸因數據（可能數據錯誤）
- 系統沒有通知政澔，問題被靜默忽略
- Revenue Commander 用舊數據持續更新進度，造成進度數字失真

**UI 驗收要點（Gemini）：**
- 資料來源清單中，該 BrandDataSource 顯示「最後同步失敗」+ 失敗原因
- Agent Team 狀態中，Data Attribution Agent 顯示 `blocked`
- 政澔 Resource Request Queue 中有修正 mapping 的任務

---

### EC-R04：蝦皮 / 官網資料互相衝突

**觸發條件：**
同一天的銷售數據，蝦皮報表顯示 GMV = 45,000 TWD，官網後台顯示 GMV = 62,000 TWD，兩者差距 > 20%（超過合理誤差範圍）。

**預期系統行為：**

1. Data Attribution Agent 偵測到同期數據衝突，標記 `data_conflict: source_mismatch`
2. 歸因計算暫停：不使用衝突數據更新 `BrandNormalizedMetric`
3. 通知政澔：「蝦皮與官網 GMV 數據衝突（差距 38%），請確認哪個來源為 transaction_truth」
4. 附上每個 data source 的 `trustLevel`：官網為 `high`（transaction_truth），蝦皮為 `medium`（marketplace_sales）
5. 若衝突在 12 小時內未解決，Data Attribution Agent 採用 trustLevel = high 的來源（官網）作為臨時基準，並在報告中標注「使用官網數據作為 transaction_truth，蝦皮數據待確認」
6. 政澔確認後，選擇正確來源並觸發數據重新計算

**規則依據：** 官網為 `role: transaction_truth`，蝦皮為 `role: marketplace_sales`，來源優先序固定。

**錯誤行為（不可出現）：**
- 系統在兩個衝突數據中隨機選一個，未通知任何人
- 衝突超過 12 小時，系統仍不使用任何數據，造成 Revenue Commander 無法更新進度
- 政澔未被通知，問題只停留在 Data Attribution Agent 的內部記錄

**UI 驗收要點（Gemini）：**
- 資料來源欄顯示「衝突警告：蝦皮 vs 官網 GMV 差距 38%」（橘色）
- Agent Team 中 Data Attribution Agent 顯示 `blocked_data_conflict`
- 政澔 Resource Request 顯示「確認 transaction truth 來源」

---

### EC-R05：名單到位但黑名單未確認

**觸發條件：**
Sophia 回報名單已到位（ResourceRequest rr-muz-001 標記為 `completed`），但 Compliance Agent 在檢查發送計畫時，發現「名單黑名單確認」步驟仍為 `pending`（藝嘉尚未完成核對）。

**預期系統行為：**

1. Compliance Agent 的黑名單核對邏輯與名單到位邏輯為獨立步驟，缺一不可
2. 名單到位（Sophia `completed`）但黑名單未確認（藝嘉 `pending`）→ 發送計畫狀態仍為 `blocked_blacklist_pending`
3. 通知藝嘉：「名單已到位，黑名單確認待你完成，影響喚醒計畫 [N] 個提案」
4. 藝嘉確認黑名單後：提案解鎖，可進入發送計畫
5. 藝嘉確認發現問題（有退訂戶）：觸發 EC-A03 的 🔴 block 流程

**關鍵邏輯：**
```
名單授權 (Sophia) ≠ 黑名單確認 (藝嘉)
兩者均為 completed 才能解鎖發送計畫
```

**錯誤行為（不可出現）：**
- Sophia 回報名單 `completed`，系統自動解鎖發送計畫，未等藝嘉確認黑名單
- 藝嘉收不到「名單到位，請確認黑名單」的通知
- 發送計畫在名單授權 + 黑名單確認任一缺失時進入執行佇列

**UI 驗收要點（Gemini）：**
- 發送計畫狀態顯示雙步驟：「名單授權 ✅ 已完成 / 黑名單確認 ⏳ 待藝嘉」
- 兩步驟均完成後，「開始排程發送」按鈕才解鎖
- 藝嘉 Review Queue 顯示「名單已到位，請確認黑名單」

---

## 3. DailyOperatingReport 驗收規則

`DailyOperatingReport` 由 Revenue Commander Agent 每日 22:00 自動產出。以下是 Codex 測試與 UI 驗收共用的完整規則。

### 3.1 必填欄位與格式要求

| 欄位 | 類型 | 必填 | 驗收規則 |
|---|---|---|---|
| `brandId` | string | ✅ | 必須對應已知品牌 |
| `date` | string (YYYY-MM-DD) | ✅ | 必須為今日日期 |
| `revenueProgress.goal` | number | ✅ | 必須 > 0 |
| `revenueProgress.currentGMV` | number | ✅ | 可為 0，但不可缺失 |
| `revenueProgress.gap` | number | ✅ | 必須 = goal - currentGMV |
| `revenueProgress.daysRemaining` | number | ✅ | 必須 ≥ 0 |
| `actionsTaken` | string[] | ✅ | 必須有至少 1 筆 |
| `blockers` | array | ✅ | 可為空陣列，但不可缺失欄位本身 |
| `humanResourcesNeeded` | string[] | ✅ | 可為空陣列，但不可缺失 |
| `nextActions` | string[] | ✅ | 必須有至少 1 筆 |

### 3.2 必須列營收進度

驗收條件：
- `revenueProgress.goal` 必須對應當月 `RevenueGoal.amount`
- `revenueProgress.currentGMV` 必須由最新的 `BrandNormalizedMetric` 計算
- `revenueProgress.gap` 必須 = `goal - currentGMV`（不可手動填入，必須由系統計算）
- 若當日無新的數據入庫，`currentGMV` 保持前一日數值，並在報告標注「今日數據待更新」

**不可接受的報告：**
```
revenueProgress: { goal: 300000 }   ← 缺少 currentGMV、gap、daysRemaining
```

### 3.3 必須列 Actions Taken

驗收條件：
- 每筆 action 描述必須包含：動作描述 + 執行 Agent（或執行人）
- 不可只寫「Agent 運行」等無意義描述
- 若當日無任何 action（例如全部 blocked），必須明確寫出「今日無新 action 執行，原因：[N 個 proposal 均在等待 approval]」

**可接受的格式：**
```
"Revenue Commander Agent：拆解目標缺口，產出 3 個策略方向"
"Compliance Agent：掃描 3 個提案，ap-muz-002 標記 🟡 flag"
```

**不可接受的格式：**
```
"Agents ran"
"System processed"
"自動執行完成"
```

### 3.4 必須列 Blockers

驗收條件：
- 每筆 blocker 必須包含：描述 + 阻塞原因 + 指派對象 + 截止日期 + 預期影響金額（若可估）
- 若無 blockers，可為空陣列 `[]`，但報告正文必須明確說明「今日無新 blockers」
- 不可把「仍在執行中」的事項誤標為 blocker

**可接受的格式：**
```json
{
  "description": "ap-muz-001 發送名單黑名單未核對",
  "blockedBy": "resource_request_rr-muz-001",
  "assignedTo": "sophia",
  "deadline": "2026-05-04",
  "estimatedImpact": 72000
}
```

### 3.5 必須列 Next Actions

驗收條件：
- 每筆 next action 必須包含：具體行動描述 + 前提條件（若有）+ 負責方（Agent 或人類）
- 至少 1 筆，即使全部被 blocked 也要列出「等 [資源] 到位後的下一步」
- 不可只列「繼續執行」等無意義描述

**可接受的格式：**
```
"等 Sophia 確認名單授權後（截止 2026-05-04），ap-muz-001 進入發送計畫（Member Reactivation Agent）"
"等藝嘉審查 ap-muz-002 後（截止 2026-05-03），拆版本草稿送 Jacky 最終確認"
```

### 3.6 必須明確指出誰被要求做什麼

驗收條件：
- `humanResourcesNeeded` 中每筆必須包含：人名（角色）+ 具體任務 + 截止日期
- 不可只寫「有些事情需要人工確認」
- 若同一個人有多個任務，必須分別列出，不可合併成「Sophia：多個任務」

**可接受的格式：**
```
"Sophia：名單授權確認（截止 2026-05-04）"
"藝嘉：ap-muz-002 防蚊版本確認（截止 2026-05-03）"
"政澔：GA4 事件標籤安裝（截止 2026-05-06）"
```

---

## 4. Manual QA Script

本 script 可由 Gemini（UI 操作）或 Codex（整合測試）使用。每個步驟有預期結果與驗收標準。

### Step 1：Jacky 設定 RevenueGoal

**操作：**
```
Actor: Jacky
Action: 在 /brands/brand-muzopet/agent-team 設定 RevenueGoal
Input:
  amount: 300000
  currency: twd
  period: 2026-05
  periodStart: 2026-05-01
  periodEnd: 2026-05-31
  note: "優先做回購喚醒，不做大促銷感"
```

**預期結果：**
- RevenueGoal 儲存成功，brandId 正確
- Agent Team run 被觸發
- UI 顯示進度條：「目標 300,000 TWD / 目前 120,000 TWD / 缺口 180,000 TWD / 剩 29 天」
- trace log 記錄：`revenue_goal_created` + `agent_team_run_triggered`

**驗收失敗條件：**
- RevenueGoal 沒有 brandId
- 進度條顯示 0 而非 120,000
- Agent Team run 未被觸發

---

### Step 2：Revenue Commander 拆 3 條策略

**操作：**
```
Actor: Revenue Commander Agent（自動）
Trigger: revenue_goal_created 事件
```

**預期結果：**
- 產出 3 個策略方向，各含：title, direction_id, expectedContribution, priority, riskLevel
- 策略 A 預期貢獻最高（+120,000），priority = P1
- 策略 C 貢獻最低（+15,000），priority = P3
- UI 顯示策略方向清單，各有 riskLevel 標記

**驗收失敗條件：**
- 策略方向少於 3 個
- 三個策略預期貢獻之和 < 目標缺口（< 180,000）
- 沒有 priority 排序

---

### Step 3：Member Reactivation 提出 3 個 proposal

**操作：**
```
Actor: Member Reactivation Agent（自動）
Trigger: 策略方向 A approved by Revenue Commander
```

**預期結果：**
- 產出 3 個 ActionProposal：ap-muz-001（沉睡戶 LINE）、ap-muz-002（高頻戶防蚊）、ap-muz-003（流失戶 EDM）
- 每個含：title, targetSegment, channel, expectedRevenueImpact, riskLevel, requiredApprovalRole, status
- ap-muz-001 / 003 status = `pending_compliance_review`
- ap-muz-002 status = `pending_compliance_review`

**驗收失敗條件：**
- Proposal 缺少任何必填欄位
- riskLevel 缺失（不可 null / undefined）
- requiredApprovalRole 為空

---

### Step 4：Compliance 擋下一個 proposal（ap-muz-002 防蚊 flag）

**操作：**
```
Actor: Compliance & Brand Reviewer Agent（自動）
Trigger: ActionProposal created（ap-muz-002）
```

**預期結果：**
- ap-muz-001 → 🟢 pass（但有 blacklist_pending blocker）
- ap-muz-002 → 🟡 flag，標記 `compliance_flag: product_applicability_ambiguous`
- ap-muz-003 → 🟢 pass（但有 blacklist_pending blocker）
- 通知送達藝嘉：「ap-muz-002 防蚊場景模糊，請確認」
- 通知送達 Jacky：「ap-muz-002 含防蚊主題，中風險，等藝嘉審查後送你確認」
- UI：ap-muz-002 在 Proposal 清單顯示 🟡 + 「適用對象模糊」說明

**驗收失敗條件：**
- ap-muz-002 被 🟢 pass（漏判）
- ap-muz-002 被 🔴 block（誤判，防蚊混用是 flag 不是 block）
- 藝嘉未收到通知

---

### Step 5：Sophia 收到 ResourceRequest（名單授權）

**操作：**
```
Actor: Resource Request Agent（自動）
Trigger: ap-muz-001/002/003 均有 blacklist_pending
```

**預期結果：**
- ResourceRequest rr-muz-001 產出，assignee = sophia
- 內容：名單授權確認，截止 2026-05-04，影響 3 個 proposal
- Sophia 的 Resource Request Queue 顯示此筆，含截止日期與影響說明
- Jacky 的 Resource Request 摘要也出現此筆（Jacky 是 resource overview 的觀察者）

**驗收失敗條件：**
- ResourceRequest 沒有 assignee（或 assignee 不是 sophia）
- ResourceRequest 沒有截止日期
- 影響說明缺少金額（~120,000 TWD）

---

### Step 6：政澔收到 connector task

**操作：**
```
Actor: Resource Request Agent（自動）
Trigger: Data Attribution Agent 偵測到 GA4 connector = needs_setup
```

**預期結果：**
- ResourceRequest rr-muz-002 產出，assignee = jeng_hao（政澔）
- 內容：GA4 事件標籤確認，截止 2026-05-06
- 政澔的 Resource Request Queue 顯示此筆
- 政澔可以將此 request 標記為：`in_progress` / `completed` / `blocked`

**驗收失敗條件：**
- ResourceRequest assignee 不是政澔
- 政澔無法在 UI 更新 request 狀態
- 完成後系統未解鎖依賴此 request 的後續流程

---

### Step 7：藝嘉 review 一個 proposal（ap-muz-002）

**操作：**
```
Actor: 藝嘉
Action: 在 Approval Queue 中查看 ap-muz-002，選擇 needs_revision
Note: "防蚊商品適用對象須拆成兩版本：毛孩防蚊版（貓狗適用）與居家環境防蚊版（人用），各加適用說明"
```

**預期結果：**
- ap-muz-002 狀態更新為 `needs_revision`
- Content & Offer Agent 收到通知 + 藝嘉的修改說明
- trace log 記錄：`revision_requested`，actorId = yijia, fromStatus = pending_review, toStatus = needs_revision
- Jacky Approval Queue 中 ap-muz-002 的狀態更新為「等待修改中，非 pending」

**驗收失敗條件：**
- 藝嘉 note 沒有儲存
- trace log 缺失
- Jacky Approval Queue 中 ap-muz-002 仍顯示「待你確認」（應顯示「等待修改」）

---

### Step 8：Jacky approve / reject 一個高風險 proposal

**操作（approve）：**
```
Actor: Jacky
Action: 在 Approval Queue 查看策略方向 A（會員喚醒），選擇 approve
Note: "確認方向 A 為本月主力，重申不做促銷感，包故事感"
```

**預期結果（approve）：**
- 策略方向 A 狀態更新為 `approved`
- Revenue Commander Agent 收到通知，方向 A 解鎖
- ap-muz-001 / ap-muz-003（依賴方向 A）的 blockers 中「等待策略確認」移除
- trace log 記錄：`strategy_approved`，actorId = jacky

**操作（reject）：**
```
Actor: Jacky
Action: 在 Approval Queue 查看一個含折扣承諾的提案，選擇 reject
Note: "不做折扣，改用加購故事感，陳總不喜歡促銷感"
```

**預期結果（reject）：**
- 提案狀態更新為 `rejected`，附 Jacky 的理由
- Content & Offer Agent 收到通知 + Jacky 的說明
- 提案在 UI 顯示 `rejected` + 理由文字，不可重新進入 active 流程
- trace log 記錄：`proposal_rejected`，actorId = jacky, reason 有記錄

**驗收失敗條件：**
- approve / reject 後提案狀態未更新
- trace log 缺失 actorId 或 reason
- rejected 提案仍出現在「待執行」清單

---

### Step 9：DailyOperatingReport 更新並通過驗收

**操作：**
```
Actor: Revenue Commander Agent（自動）
Trigger: 每日 22:00 或手動觸發（測試用）
```

**預期結果：**
- 產出一份符合 Section 3 所有規則的 DailyOperatingReport
- UI 的 Daily Report 區顯示：進度條 / 今日行動清單 / blockers 清單 / 明日行動清單
- Jacky 和藝嘉在 15 分鐘內可以理解今天的執行狀態

**詳細驗收（按 Section 3 規則逐一核對）：**

```
□ revenueProgress.goal = 300000
□ revenueProgress.currentGMV ≤ 300000（由 BrandNormalizedMetric 讀入）
□ revenueProgress.gap = goal - currentGMV（計算正確）
□ revenueProgress.daysRemaining ≥ 0
□ actionsTaken 至少 1 筆，每筆含 Agent 名稱
□ blockers：每筆含 description / assignedTo / deadline
□ humanResourcesNeeded：每筆含人名 / 任務 / 截止日期
□ nextActions 至少 1 筆，含前提條件說明
```

---

## 5. Codex 測試建議

以下測試建議供 Codex 在實作 domain model + approval logic 時使用。

### 5.1 Approval Policy Tests

**test: medium riskLevel → 藝嘉 review queue**
```
input: ActionProposal { riskLevel: "medium" }
expect: proposal.requiredApprovalRole 包含 "reviewer_yijia"
expect: proposal 進入藝嘉 review queue，不直接進入 Jacky queue
```

**test: high riskLevel → Jacky approval queue**
```
input: ActionProposal { riskLevel: "high" }
expect: proposal.requiredApprovalRole 包含 "jacky"
expect: proposal 進入 Jacky approval queue
```

**test: 醫療宣稱 → 🔴 block，Jacky 不能直接 approve**
```
input: ActionProposal { draftContent: "木酢液可治療毛孩皮膚病" }
expect: ComplianceFlag { result: "block", flagType: "medical_claim" }
expect: proposal.status = "blocked_medical_claim"
expect: Jacky approval queue 中不出現此提案的 approve 按鈕
```

**test: LINE 超頻 → Jacky 可授權例外**
```
input: 本月已發 2 次 LINE push，新提案 riskLevel = "medium", channel = "line_oa"
expect: ComplianceFlag { result: "flag", flagType: "line_frequency_exceeded" }
expect: 提案進入 Jacky approval queue（Jacky 有例外授權權）
expect: 提案狀態 = "pending_jacky_approval"（不是 "blocked"）
```

**test: 退訂戶在名單 → 🔴 block，不進入 approved**
```
input: 名單含退訂戶 5 筆
expect: ComplianceFlag { result: "block", flagType: "blacklist_violation" }
expect: 發送計畫 status = "blocked_blacklist_violation"
expect: Jacky approve 此提案不會解鎖（黑名單問題不是 Jacky 可授權的例外）
```

---

### 5.2 Risk Routing Tests

**test: 策略方向改變 → 同時通知 Jacky + Sophia**
```
input: ActionProposal { flags: ["strategy_change"] }
expect: 通知 Jacky（決策）+ Sophia（客戶關係確認）
expect: 不只通知藝嘉
```

**test: 客訴 / 法律威脅 → Sophia + Jacky，不進入正常 approval 流程**
```
input: ActionProposal { draftContent: "若不處理將提起消費者保護申訴" }
expect: ComplianceFlag { result: "block", flagType: "legal_threat_detected" }
expect: 通知 Sophia + Jacky
expect: 提案不進入任何正常 approval queue
```

**test: 防蚊文案 → 藝嘉 + 之後 Jacky（順序正確）**
```
input: ActionProposal { flags: ["product_applicability_ambiguous"], draftContent: "防蚊..." }
expect: 先進入藝嘉 review queue
expect: 藝嘉 approve 後，才進入 Jacky approval queue
expect: 不能跳過藝嘉直接讓 Jacky 確認
```

---

### 5.3 ResourceRequest 指派路由 Tests

**test: 名單 / 資料授權 → Sophia**
```
input: ResourceRequest { resourceType: "data_authorization" }
expect: assignee = "sophia"
```

**test: connector / 技術任務 → 政澔**
```
input: ResourceRequest { resourceType: "technical_setup" }
expect: assignee = "jeng_hao"
```

**test: 高風險策略確認 → Jacky**
```
input: ResourceRequest { resourceType: "strategy_approval" }
expect: assignee = "jacky"
```

**test: 客戶端聯繫 → Sophia**
```
input: ResourceRequest { resourceType: "client_contact" }
expect: assignee = "sophia"
```

**test: 未知 resourceType → 系統報錯，不 default 指派**
```
input: ResourceRequest { resourceType: "unknown_type" }
expect: 系統拋出錯誤，不自動指派任何人
expect: 不靜默失敗
```

---

### 5.4 Revenue Progress Calculation Tests

**test: gap 計算正確**
```
input: RevenueGoal.amount = 300000, currentGMV = 120000
expect: gap = 180000
expect: dailyRunRate = gap / daysRemaining（四捨五入）
```

**test: 目標已達成（currentGMV ≥ goal）**
```
input: RevenueGoal.amount = 300000, currentGMV = 305000
expect: gap = -5000（負數表示超標）
expect: revenueProgress.status = "goal_reached"
expect: 不產出新的策略方向建議（無需繼續）
```

**test: 剩餘天數為 0（月底）**
```
input: daysRemaining = 0, gap = 50000（未達標）
expect: revenueProgress.status = "goal_missed"
expect: Revenue Commander 不產出新提案，只產出結算報告
```

**test: 數據未到位（BrandNormalizedMetric 為空）**
```
input: 當日無 BrandRawImport，BrandNormalizedMetric 未更新
expect: revenueProgress.currentGMV = 前一日數值（不歸零）
expect: DailyOperatingReport 標注「今日數據待更新」
expect: Revenue Commander 不使用 0 重新計算缺口
```

---

### 5.5 DailyOperatingReport Completeness Tests

**test: 正常報告格式完整**
```
input: 有 RevenueGoal、有 ActionProposals、有 blockers、有 ResourceRequests
expect: report 包含所有 Section 3 規定的必填欄位
expect: actionsTaken.length ≥ 1
expect: nextActions.length ≥ 1
expect: blockers 中每筆有 description, assignedTo, deadline
```

**test: 全部 blocked 時也要有 nextActions**
```
input: 所有 ActionProposal 均為 blocked 狀態
expect: nextActions 不為空
expect: nextActions 內容為「等 [資源] 到位後的下一步」
expect: 不是「無 next actions」
```

**test: 無 blockers 時 blockers 為空陣列**
```
input: 所有 ActionProposal 均為 approved 或 completed
expect: report.blockers = []（空陣列，不是 null 也不是 undefined）
expect: report.humanResourcesNeeded = []（同上）
```

**test: 同一人有多個 humanResourcesNeeded 時分別列出**
```
input: Sophia 被要求 2 件事（名單確認 + 客戶聯繫）
expect: humanResourcesNeeded 包含 2 筆（分別列）
expect: 不合併成「Sophia: 多個任務」
```
