# 木酢寵物達人自主營運 Agent Team — Phase 2 Product Slice 規格

**版本：** v1.0 · 2026-05-02
**負責人：** Claude（產品規格）
**後續接手：** Gemini（UI skeleton）→ Codex（domain model + tests）

---

## 0. 一句話定位

> 以 Jacky 設定的月度營收目標為輸入，在品牌腦、合規紅線與人工 approval gate 的約束下，24 小時自動拆解策略、產出行動提案、請求必要人類資源，並每日回報執行進度的協作 Agent 系統。

本 Agent Team 不是單純文案產出工具。它的核心功能是**把一個月度財務目標拆解成每日可執行的行動序列**，同時讓人類決策者只在「不能省略的判斷點」才被打擾。

---

## 1. 為什麼這不是單純文案工具

單純文案工具的輸入是「寫一篇 LINE 訊息」，輸出是文字。本 Agent Team 的輸入是「+300,000 TWD」，輸出是：

1. 拆解後的策略方向（會員喚醒 / 加購 / 歸因補強）
2. 各方向的行動提案（ActionProposal）與預期營收影響
3. 每個提案的風險評估（riskLevel）與 approval 需求
4. 被 approve 的行動的執行追蹤與日報
5. 資源缺口的人類協作請求（ResourceRequest）

系統需要理解：目標缺口有多大？哪條策略線回報最快？哪些行動目前被什麼卡住？誰需要做什麼才能解鎖下一步？

---

## 2. 使用者故事

### 2.1 Jacky（老闆 / 高風險確認者）

> 身分：公司最終決策者，只看策略 + 高風險 + 授權問題，不逐字改文案。

**場景：**

```
Jacky 進入木酢品牌頁面
→ 看到本月 RevenueGoal（目標 +300,000 TWD）
→ 看到 Agent Team 的策略拆解（3 個方向 + 預期影響）
→ 看到 Approval Queue 裡等待自己確認的高風險提案
→ 看到 Resource Request 的摘要（Sophia / 政澔 各被要求什麼）
→ 對高風險提案做出 approve / reject 決策
→ 15 分鐘後離開，Agent Team 繼續執行
```

**需要 Jacky 確認的情況：**
- 優惠折扣幅度或限時承諾（價格策略）
- 策略方向重大改變（換通路、換主力商品線）
- 每月 LINE push 超過 2 次的授權
- Compliance Agent 標出的防蚊 / 健康功效相關文案
- 任何月度預算分配調整

### 2.2 藝嘉（木酢品牌 reviewer / 合規把關）

> 身分：木酢品牌的品管員，負責品牌語氣與合規邊界，是新人與高風險提案之間的第一道關卡。

**場景：**

```
藝嘉進入品牌頁面
→ 看到 Compliance & Brand Reviewer Agent 標出的疑點清單
→ 逐一審查：哪些是品牌語氣問題、哪些是合規風險
→ 通過的 proposal → 繼續往 Jacky approval queue 推
→ 有問題的 proposal → 標記 needs_revision，附說明
→ 發送名單送過來前 → 確認黑名單已核對
→ 文案上線前 → 最終語氣覆審
```

**藝嘉的 approval scope：**
- 文案上線前品牌語氣審查
- 發送名單黑名單確認（退訂戶 / 毛孩過世戶）
- 防蚊適用對象標注確認
- 紅線詞命中的逐案判斷

### 2.3 Sophia（客戶關係 / 資源窗口）

> 身分：客戶關係主管，負責處理需要動用客戶資源或授權的請求。

**場景：**

```
Sophia 收到 Resource Request Agent 的請求
→ 「需要木酢 20 萬會員名單中近 90 天回購分群（約 2 萬筆）」
→ 確認陳總是否已授權資料串接
→ 回報名單就緒狀態
→ 若有客戶端聯絡需求，Sophia 負責對接阿良（王志良）
```

**Sophia 的 scope：**
- 客戶資料授權確認（Google Sheet 串接 / 名單輸出）
- 客戶端聯絡事項協調
- 合約相關資源調度
- 月報時間節點確認

### 2.4 政澔（技術 / connector / 資料同步）

> 身分：技術負責人，處理所有需要 API 串接、connector 設定、資料同步的任務。

**場景：**

```
政澔收到 Resource Request Agent 的技術任務
→ 「木酢 Google Sheet Connector 需要新增蝦皮銷售報表讀取 tab」
→ 確認 Sheet ID 與欄位 mapping
→ 設定 BrandSheetReadConfig
→ 回報 connector 狀態（active / needs_setup）
→ 資料同步後回報 BrandRawImport 到位狀態
```

**政澔的 scope：**
- Google Sheet Connector 設定與測試
- 數據同步 debug
- API 串接技術任務
- 連接器狀態監控

---

## 3. Agent Team 組成

### 3.1 Revenue Commander Agent

**角色定位：** Agent Team 的總指揮，唯一有資格向 Jacky 呈報整體進度的 Agent。

**輸入：**
- `RevenueGoal`（目標金額 + 期間）
- 目前 `BrandNormalizedMetric`（累計 GMV）
- 上週 / 上月的策略執行結果

**輸出：**
- 策略方向拆解（3-5 個方向，每個含預期貢獻金額）
- 各方向的優先序
- 進度差距分析（缺口 vs. 剩餘天數 vs. 可用策略）
- `DailyOperatingReport`（每日回報）

**自動執行：**
- 計算目標缺口
- 根據歷史數據生成策略建議
- 更新進度儀表板

**需要 approval：**
- 策略方向重大調整（需要 Jacky）
- 月度預算重分配（需要 Jacky + Sophia）

---

### 3.2 Member Reactivation Agent

**角色定位：** 負責木酢 20 萬家庭會員資料庫的 RFM 分群、喚醒方案設計與發送計畫。

**輸入：**
- 會員分群標準（RFM：R/F/M 各閾值）
- `BrandBrain`（語氣規則、禁忌、頻道規則）
- 發送名單（由 Sophia 授權、政澔提供）

**輸出：**
- 三分群描述（沉睡 / 高頻 / 流失）+ 每群建議行動
- 喚醒 `ActionProposal`（含通路、預計觸達數、預期轉換率、riskLevel）
- 發送時程建議

**分群規則（硬性）：**
```
沉睡戶：R > 90 天, F ≥ 2 次
  → 行動：家庭場景回購故事 + 生活除臭場景
  → 通路：LINE OA / EDM
  → 禁忌：不做大促銷感，包故事感

高頻戶：F ≥ 4 次, R < 60 天
  → 行動：環境清潔 + 加購組合
  → 通路：LINE OA 限定推薦
  → 注意：LINE 每月上限 2 次

流失戶：R > 180 天
  → 行動：品牌故事喚醒，不直接促銷
  → 通路：EDM（不用 LINE，避免退訂）
  → 注意：確認退訂狀態後才進名單
```

**自動執行：**
- 計算分群
- 產出文案方向與建議
- 估算觸達數

**必須 approval：**
- 名單確認（退訂戶 / 毛孩過世戶核黑名單 → 藝嘉）
- 發送計畫最終確認（→ 藝嘉）
- 超出每月 2 次 LINE push 上限（→ Jacky）

---

### 3.3 Content & Offer Agent

**角色定位：** 負責根據策略方向產出文案草稿、優惠組合建議、素材清單。

**輸入：**
- 當前策略優先序（來自 Revenue Commander Agent）
- `BrandBrain`（voice / taboos / channelRules）
- 任務規格（分群、通路、字數限制）

**輸出：**
- 各通路文案草稿（LINE / FB / 蝦皮私訊）
- 優惠組合建議（符合品牌調性的加購組合）
- 圖片需求清單（素材 brief）
- `ActionProposal`（每篇草稿對應一個提案）

**字數規則：**
```
LINE：≤ 120 字 + 1 CTA + 1 圖片指引
FB：自然敘述，知識感 + 生活感
蝦皮私訊：≤ 200 字，含 1 CTA，正式語氣
```

**自動執行：**
- 依品牌腦規格產出草稿
- 標注使用的慣用詞與禁忌核查結果

**必須 approval：**
- 所有草稿上線前 → 藝嘉語氣覆審
- 防蚊相關文案 → 藝嘉 + Jacky
- 優惠折扣幅度涉及承諾 → Jacky

---

### 3.4 Compliance & Brand Reviewer Agent

**角色定位：** Agent Team 的內部品管閘門，在提案進入人工審查前先做機器掃描，減少藝嘉的重複勞動。

**輸入：**
- 所有其他 Agent 產出的 `ActionProposal`
- `BrandBrain.taboos`、`BrandBrain.escalationRules`
- 木酢紅線詞典（見 Section 6）

**輸出：**
- 每個提案的合規評估（pass / flag / block）
- 命中的紅線詞或風險類型
- 建議的升級對象（藝嘉 / Jacky / Sophia）
- 修改建議（若可自動建議）

**三色評估：**
```
🟢 pass：無紅線命中，語氣符合品牌腦，可進入藝嘉審查
🟡 flag：有潛在風險（語氣邊緣、防蚊適用對象模糊），需藝嘉確認
🔴 block：明確紅線命中（醫療宣稱 / 退訂戶名單未核 / 折扣承諾），自動攔截並通知藝嘉
```

**自動執行：**
- 紅線詞掃描（基於 BrandBrain.taboos）
- 語氣風格評估
- 發送名單黑名單核對標記

**必須 upgrade：**
- 🔴 block 一律通知藝嘉
- 毛孩健康 / 醫療相關命中 → 通知藝嘉 + Jacky
- 客訴 / 退款 / 法律威脅語意 → 立即通知 Sophia + Jacky

---

### 3.5 Data Attribution Agent

**角色定位：** 負責收集、歸因、報告所有數據，讓策略決策有據可依。

**輸入：**
- `BrandRawImport`（Google Sheet 原始數據）
- `BrandDataSource`（官網 / 蝦皮 / GA4 / Meta Ads / Google Ads / LINE）

**輸出：**
- `BrandNormalizedMetric`（GMV / 訂單數 / ROAS / LINE 點擊）
- 歸因週報草稿（Markdown 格式）
- 不可歸因率警報（> 30% 時標紅）

**歸因規則：**
```
主方法：Last-Click（點擊後 7 天窗口）
輔方法：U-Shape（首末各 40%，中間 20%）
個資：去識別化處理後歸因
不可歸因率警戒：> 30% 必須標紅並提補救方案
```

**自動執行：**
- 原始數據彙整（從 BrandRawImport 讀入）
- 歸因計算
- 進度儀表板更新
- 週報草稿產出

**必須 approval：**
- 週報對外發布 → 藝嘉確認
- 歸因方法更改 → Jacky 確認
- 數據串接新來源 → 政澔設定 + 陳總授權

---

### 3.6 Resource Request Agent

**角色定位：** 唯一對外溝通的 Agent，負責把所有「需要人類才能解鎖」的任務整理成清晰的請求，指派給正確的人。

**輸入：**
- 所有 Agent 的 blocked / needs_resource 狀態
- 每個資源請求的類型（名單 / 授權 / 技術任務 / 客戶聯絡）

**輸出：**
- `ResourceRequest`（每筆請求含：標題、所需資源、指派對象、截止時間、影響說明）
- Approval Queue（分別列出 Sophia / 政澔 / Jacky / 藝嘉的待辦）

**指派規則：**
```
名單 / 客戶資料授權 → Sophia
技術 / connector / API 串接 → 政澔
高風險策略確認 / 預算授權 → Jacky
品牌語氣 / 合規最終確認 → 藝嘉
客戶端窗口聯繫 → Sophia → 阿良（王志良）
```

**自動執行：**
- 彙整所有 blocked agent 的資源需求
- 整理成人類可閱讀的待辦清單
- 追蹤請求回應狀態

---

## 4. 24 小時營運 Loop

```
00:00–06:00  夜間數據彙整
  Data Attribution Agent
    ├── 讀入 Google Sheet 原始數據（BrandRawImport）
    ├── 計算昨日 GMV / 訂單 / 歸因
    └── 更新 BrandNormalizedMetric

06:00–09:00  早晨策略規劃
  Revenue Commander Agent
    ├── 計算本月累計 vs 目標缺口
    ├── 生成今日策略優先序
    └── 標記哪條線需要推進、哪條線被 block

  Member Reactivation Agent
    └── 評估今日是否有喚醒任務到期

09:00–12:00  提案生成
  Member Reactivation Agent
    └── 產出喚醒 ActionProposal（含 riskLevel）

  Content & Offer Agent
    └── 依策略優先序產出文案草稿

  Compliance & Brand Reviewer Agent
    └── 掃描所有新提案，標 🟢🟡🔴

  Resource Request Agent
    └── 彙整所有 blocked 狀態，整理 ResourceRequest

12:00–18:00  人工審查時段（核心決策窗口）
  藝嘉
    ├── 審查 🟡🔴 提案
    ├── 確認發送名單黑名單
    └── 語氣覆審通過的提案放行

  Jacky
    ├── 審批高風險提案（折扣承諾 / 策略改變）
    └── 授權必要資源

  Sophia
    └── 確認名單授權、客戶聯絡任務

  政澔
    └── 接收技術任務，回報 connector 狀態

18:00–22:00  執行與追蹤
  被 approve 的提案進入執行佇列
  Resource Request Agent 追蹤資源到位狀態

22:00–24:00  日報產出
  Revenue Commander Agent
    └── 產出 DailyOperatingReport
          ├── 今日策略進度
          ├── 執行了什麼
          ├── 什麼被 block / 需要人類資源
          └── 明日預計行動
```

---

## 5. 自動 vs. 人工 Approval 邊界

### 5.1 可自動執行（無需 approval）

| 行動 | 執行 Agent |
|---|---|
| 讀入 Google Sheet 原始數據 | Data Attribution |
| 計算 RFM 分群（不輸出名單）| Member Reactivation |
| 計算目標缺口與進度 | Revenue Commander |
| 生成策略方向建議 | Revenue Commander |
| 產出文案草稿（不發送）| Content & Offer |
| 紅線詞掃描與標記 | Compliance & Brand Reviewer |
| 計算歸因數據 | Data Attribution |
| 產出日報草稿 | Revenue Commander |
| 整理 ResourceRequest 清單 | Resource Request |
| 更新提案狀態（approved / rejected / blocked）| Revenue Commander |

### 5.2 必須人工 Approval

| 行動 | 誰 approve | 原因 |
|---|---|---|
| 文案上線前最終語氣覆審 | 藝嘉 | 品牌語氣紅線不能讓機器放行 |
| 發送名單黑名單最終確認 | 藝嘉 | 退訂戶 / 毛孩過世戶是客訴紅線 |
| 防蚊 / 健康功效相關文案 | 藝嘉 + Jacky | 合規邊界需人類判斷 |
| 優惠折扣幅度 / 限時承諾 | Jacky | 價格策略是老闆決策 |
| 每月 LINE push > 2 次授權 | Jacky | 已明定頻道規則 |
| 策略方向重大改變 | Jacky | 影響品牌定位 |
| 月度預算重分配 | Jacky + Sophia | 財務決策 |
| Google Sheet 串接授權（資料存取）| 政澔 + 陳總 | 客戶資料主權 |
| 客服訊息範本更新 | 阿良（王志良）| 合約約定的簽字權 |
| 對外發布週報 / 月報 | 藝嘉確認 | 對外文件需人類最終負責 |
| 客戶端聯繫事項 | Sophia | 客戶關係由人類主責 |

---

## 6. 木酢紅線（硬性攔截規則）

以下紅線一旦命中，Compliance & Brand Reviewer Agent 必須立即 block，不得進入後續執行流程，並觸發升級通知。

### 6.1 醫療宣稱

**紅線詞：** 治療 / 預防疾病 / 消滅跳蚤 / 消滅細菌 / 臨床證實 / 獸醫推薦 / 100% 有效 / 保證無副作用

**觸發行動：** 自動 block + 通知藝嘉 + 在 proposal 標注 `compliance_flag: medical_claim`

**例外：** 若文案明確標注「此為資訊說明，非醫療建議」，可降級為 🟡 flag，由藝嘉人工判斷

### 6.2 退訂戶 / 毛孩過世戶

**紅線條件：** 任何發送計畫的目標名單，若未包含「已核退訂名單」確認記錄

**觸發行動：** 發送計畫自動 block，Resource Request Agent 產出名單核查請求送藝嘉

**不可跳過：** 即使陳總授權大量發送，仍必須先核黑名單

### 6.3 價格與折扣承諾

**紅線詞：** 永遠八折 / 長期優惠 / 只要你是會員就有 X 折 / 保證不漲價

**觸發行動：** 自動 block + 通知 Jacky + 標注 `compliance_flag: price_commitment`

**可通過的寫法：** 限時活動（有明確結束日期）+ Jacky approved

### 6.4 客訴 / 退款 / 法律威脅

**觸發語意：** 要告 / 提告 / 律師函 / 消保官 / 退費不處理 / 客訴升級

**觸發行動：** 最高敏感等級，立即通知 Sophia + Jacky，不進入自動流程，等待人類指令

### 6.5 品牌定位或商品策略改變

**觸發條件：**
- Revenue Commander Agent 偵測到策略方向跨月重大改動（如：新增蝦皮直播、換主力商品線）
- Content & Offer Agent 產出的文案涉及未在 BrandBrain 登記的新商品或新受眾

**觸發行動：** 自動標注 `requires_jacky_approval: strategy_change`，提案進入 Jacky approval queue

---

## 7. 第一版 Mock Workflow

以下是 Phase 2 第一個可展示的 end-to-end mock，不含真實 API 呼叫。

### 場景：Jacky 輸入本月營收目標 +300,000 TWD

```
[Step 1] Jacky 在 Brand App 設定 RevenueGoal
  → amount: 300000, currency: "twd"
  → period: "2026-05", start: "2026-05-01", end: "2026-05-31"
  → current_gmv: 120000（截至 2026-05-02）

[Step 2] Revenue Commander Agent 計算缺口
  → 目標缺口：180,000 TWD / 剩餘 29 天
  → 日均需求：約 6,207 TWD/day
  → 策略方向建議：
      A. 會員喚醒（預期貢獻：+120,000） ← 優先
      B. 蝦皮加購組合（預期貢獻：+40,000）
      C. FB 知識內容引流（預期貢獻：+20,000，長期）

[Step 3] Member Reactivation Agent 產出喚醒提案
  → ActionProposal #1：沉睡戶 LINE 喚醒（約 8,000 人）
      riskLevel: medium
      需要：藝嘉審文案 + 名單黑名單確認
  → ActionProposal #2：流失戶 EDM 故事喚醒（約 5,000 人）
      riskLevel: low
      需要：藝嘉確認名單

[Step 4] Content & Offer Agent 產出 LINE 文案草稿
  → 草稿 A：家庭生活除臭場景（沉睡戶）
  → 草稿 B：春夏外出防蚊加購組合（高頻戶）
  → 草稿 B 包含「防蚊」→ 觸發 Compliance 標記

[Step 5] Compliance & Brand Reviewer Agent 掃描
  → 草稿 A：🟢 pass
  → 草稿 B：🟡 flag（「防蚊」適用對象須確認，狗 vs. 貓 vs. 人用場景混用）
  → 通知藝嘉確認草稿 B

[Step 6] Resource Request Agent 產出請求清單
  → Sophia：「需要 2 萬筆沉睡戶名單授權（陳總授權確認）」
  → 政澔：「Wood vinegar 官網 GA4 事件串接確認，需確認轉換事件標籤」

[Step 7] 人工 Approval Gate
  → 藝嘉：草稿 B 防蚊修改確認（要求拆成狗用/人用兩版本）
  → Jacky：查看 Approval Queue，批准策略方向 A + B，暫緩 C
  → Sophia：確認陳總名單授權

[Step 8] Daily Operating Report（當天收工）
  → 今日：策略方向已定，草稿 A pass，草稿 B needs_revision
  → Blockers：名單授權待 Sophia 確認 / 草稿 B 待藝嘉修改
  → 明日：草稿 B 修改後重審，名單到位後排定發送時間
```

---

## 8. 第一版不做事項

以下項目在 Phase 2 第一版明確排除，避免範疇蔓延：

| 不做項目 | 排除原因 |
|---|---|
| 真實串接 LINE OA API（自動發送）| Phase 3 範疇，需要 LINE 授權與正式 connector |
| 真實串接 Facebook Graph API | Phase 3 範疇 |
| 真實串接蝦皮 API | 尚未確認 API 授權 |
| AI 模型自動生成最終文案（無人審）| 品牌合規紅線要求人工覆審，永遠不做無人審自動發布 |
| 自動修改 BrandBrain.taboos 或 voice | 品牌知識庫更新必須 Jacky 確認，不允許 Agent 自改 |
| 客戶端 portal（陳總 / 阿良看的界面）| 不在本期 scope |
| 新人看到 Agent Team cockpit | Phase 2 僅限資深成員（Jacky / Sophia / 藝嘉 / 政澔）使用 |
| 跨品牌 Agent Team 共用 | 每個品牌的 Agent Team 是獨立配置，不共用紅線規則 |
| 真實月度預算追蹤（連財務系統）| 財務系統不在平台 scope |
| 自動歸因覆蓋率 > 30% 時自動補救 | 補救方案需要人類策略判斷，不自動執行 |

---

## 9. Phase 2 Acceptance Criteria

以下是 Phase 2 Agent Team slice 的可驗收條件：

### 9.1 RevenueGoal

- [ ] Jacky 可以在品牌頁面設定 `RevenueGoal`（金額 + 期間）
- [ ] 系統顯示目前進度（cumulative GMV vs 目標）
- [ ] 系統計算缺口金額與剩餘天數
- [ ] 每日更新進度（從 BrandNormalizedMetric 讀入）

### 9.2 Agent Team 策略拆解

- [ ] Revenue Commander Agent 可以把 RevenueGoal 拆成 3-5 個策略方向
- [ ] 每個策略方向有預期貢獻金額
- [ ] 策略方向有優先序
- [ ] Jacky 可以 approve / reject 每個策略方向

### 9.3 ActionProposal

- [ ] Agent Team 可以產出 `ActionProposal`
- [ ] 每個 ActionProposal 有：title / expected_revenue_impact / riskLevel / required_approval_role / status
- [ ] `riskLevel` 有三個等級：low / medium / high
- [ ] high riskLevel 的 proposal 自動進入 Jacky approval queue
- [ ] medium riskLevel 的 proposal 進入藝嘉 review queue
- [ ] 被 reject 的 proposal 有理由記錄

### 9.4 Compliance 紅線

- [ ] Compliance Agent 可以掃描 proposal 並標記 🟢🟡🔴
- [ ] 醫療宣稱紅線命中時自動 block
- [ ] 退訂戶名單未核黑名單時自動 block
- [ ] 🔴 block 時自動通知藝嘉

### 9.5 ResourceRequest

- [ ] Resource Request Agent 可以產出 `ResourceRequest`
- [ ] 每個 ResourceRequest 有：title / resource_type / assignee / deadline / impact
- [ ] ResourceRequest 可以指派給 Sophia / 政澔 / Jacky / 藝嘉
- [ ] assignee 看到自己的待辦清單

### 9.6 DailyOperatingReport

- [ ] 每日產出一份 `DailyOperatingReport`
- [ ] 包含：今日做了什麼 / 哪些被 block / 哪些需要人類資源 / 明日預計行動
- [ ] Jacky 和藝嘉可以在 15 分鐘內掌握 Agent Team 今天的執行狀態

### 9.7 Approval Queue

- [ ] 每個人類成員有獨立的 Approval Queue
- [ ] Queue 顯示等待自己確認的 proposal 與 resource request
- [ ] approve / reject 操作留下 trace log
- [ ] approve 後 proposal 狀態更新，unblock 對應 Agent

---

## 10. 下一個工程 Slice（給 Codex 的備忘）

Codex 完成 domain model 後，Phase 2 需要以下頁面與資料物件：

### 新增 Domain Types

```typescript
RevenueGoal
AgentTeam
AgentRun
ActionProposal         // 含 riskLevel / expected_revenue_impact / status
ResourceRequest        // 含 assignee / resource_type / deadline
DailyOperatingReport   // 含 actions_taken / blockers / human_resources_needed / next_actions
ComplianceFlag         // 含 flag_type / severity / triggered_by / recommended_action
ApprovalDecision       // 含 proposal_id / approver_id / decision / reason / decided_at
```

### 新增頁面

```
/brands/[id]/agent-team     Agent Team cockpit（Revenue Goal + 6 Agents + Proposals + Daily Report）
/brands/[id]/approvals      Approval Queue（分 Jacky / 藝嘉 / Sophia / 政澔）
/brands/[id]/resources      Resource Request list
```

### 新增 API Routes

```
POST /api/brands/[brandId]/revenue-goal          設定 RevenueGoal
GET  /api/brands/[brandId]/agent-team/status     Agent Team 狀態
POST /api/brands/[brandId]/proposals/[id]/approve   approve / reject ActionProposal
GET  /api/brands/[brandId]/daily-report/latest   今日 DailyOperatingReport
POST /api/brands/[brandId]/resources/[id]/complete  Resource Request 完成確認
```

---

## 11. 與現有 Phase 1 資料模型的銜接

| Phase 2 新概念 | 銜接到 Phase 1 的哪個 type |
|---|---|
| `RevenueGoal` | 新增，透過 `brandId` 連到 `ClientBrand` |
| `ActionProposal` | 延伸 `BrandTask`，加入 riskLevel 與 approval 欄位 |
| `ResourceRequest` | 延伸 `SeniorMemberActivity`（type: handoff），加入 assignee 與 deadline |
| `DailyOperatingReport` | 新增，彙整 `TraceLog` + `BrandTask` + `RevenueSignal` |
| `ComplianceFlag` | 延伸 `BrandBrain.escalationRules` 的機器化版本 |
| `ApprovalDecision` | 延伸 `TraceLog`，加入 approval 語意 |

---

## 12. 參考文件

- [木酢 Brand Pack 映射](./mujiso-brand-pack.md) — BrandBrain / ReviewerRule / 升級規則
- [Brand Onboarding Workflow](./brand-onboarding-workflow.md) — 新人任務分配路徑
- [品牌日報 Google Sheet Connector 規格](./brand-sheet-connector-spec.md) — 數據讀取與回填流程
- [三角色平台模擬（2026-05-02）](./platform-simulations/muzopet-three-role-platform-simulation-2026-05-02.md) — Agent Team 設計的場景背景
- [自主 Agent Team 模擬（2026-05-02）](./platform-simulations/muzopet-autonomous-agent-team-simulation-2026-05-02.md) — 本規格的具體執行場景
