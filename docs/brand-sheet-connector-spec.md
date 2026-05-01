# 品牌日報 Google Sheet Connector 規格 v1

本文件定義 2clouds Brand App 如何把品牌客戶的日報 Google Sheet，透過統一的 Connector 格式，轉成平台可操作的 `RevenueSignal`、`BrandTask` 與 `SeniorMemberActivity`，並把平台的任務進度、reviewer 備註與訊號紀錄回填到 Sheet 指定分頁。

**木酢寵物達人是第一個試點品牌，但 Connector 格式設計為可套用到任何品牌。**

> 這輪規格不串接真實 Google Sheets API，不新增外部套件。所有 API 呼叫路徑都保留介面佔位，可在後續 Phase 串接 `@googleapis/sheets` 或 `google-spreadsheet`。

---

## 1. 設計目標

品牌方（例如木酢寵物達人）通常已有自己維護的日報 Google Sheet，每天或每週由 Sophia / 客戶窗口填入各通路數字。本規格的目標是：

| 目標 | 說明 |
|---|---|
| 不強迫品牌改變工具 | Sheet 格式由品牌方維護，平台只讀不干預 |
| 資料進入平台前先標準化 | Sheet → RawImport → NormalizedMetric → 才進 RevenueSignal |
| 回填讓品牌看到平台輸出 | 任務進度、Reviewer 備註、營收訊號寫回 Sheet |
| 不替代人工判斷 | 高風險訊號與回填動作要 reviewer 確認 |

---

## 2. 與現有資料架構的關係

Google Sheet Connector 插入在 `muzopet-data-architecture.md` 的 **Sources → Raw Layer** 之間：

```text
品牌日報 Google Sheet
        │
        ▼
BrandSheetConnector（per-brand 設定）
        │
        ▼ 讀取
BrandRawImport（importMethod: "google_sheets"，connectorId 綁定）
        │
        ▼ 標準化
BrandNormalizedMetric（metricKey: gmv / orders / sessions / spend / line_clicks）
        │
        ▼ 規則判斷
RevenueSignal（由 Sophia 或系統規則產生）
        │
        ▼ 任務化
BrandTask（新人今天要做什麼）
        │
        ▼ 品管
SeniorMemberActivity / ReviewerRule / Trace
        │
        ▼ 回填
BrandSheetWritebackConfig → 品牌日報 Sheet 回填分頁
```

現有的 `BrandRawImport` 已新增：
- `importMethod?: "manual" | "google_sheets" | "api"` — 追蹤資料怎麼進來
- `connectorId?: string` — 連回到哪個 BrandSheetConnector
- `payloadKind` 新增 `"sheet_summary"` — 對應 Sheet 摘要列讀取

---

## 3. 通用 Connector 設定格式

每個品牌可以有一個或多個 `BrandSheetConnector`。每個 Connector 包含：

### 3.1 BrandSheetConnector（頂層設定）

```typescript
type BrandSheetConnector = {
  id: string;               // 唯一 ID，例如 "connector-muzopet-daily-report"
  brandId: string;          // 對應哪個品牌
  sheetId: string;          // Google Sheets spreadsheet ID
  label: string;            // 人類可讀名稱，例如 "木酢寵物達人日報表"
  status:
    | "active"              // 可以讀取和回填
    | "paused"              // 暫停，不自動觸發
    | "needs_setup";        // 尚未填入 sheetId 或 mapping
  readConfigs: BrandSheetReadConfig[];
  writebackConfigs: BrandSheetWritebackConfig[];
  createdAt: string;
  updatedAt: string;
};
```

### 3.2 BrandSheetReadConfig（讀取分頁設定）

每個要讀取的 Sheet 分頁對應一個 `BrandSheetReadConfig`：

```typescript
type BrandSheetReadConfig = {
  id: string;
  tabName: string;           // 分頁名稱（必須與實際 Sheet 一致）
  tabKind:
    | "daily_summary"        // 多通路合併日報
    | "orders"               // 純訂單明細
    | "campaign_spend"       // 廣告花費
    | "line_report"          // LINE OA / LINE Ads 報告
    | "shopee_report"        // 蝦皮後台報告
    | "custom";              // 品牌自定義分頁
  dataSourceId: string;      // 連回 BrandDataSource（決定信任等級與用途）
  headerRow: number;         // 標題列行號（通常為 1）
  dataStartRow: number;      // 資料起始行號（通常為 2）
  fieldMapping: BrandSheetFieldMapping[];
  triggerKind: "manual" | "scheduled";
  lastReadAt?: string;
};
```

### 3.3 BrandSheetFieldMapping（欄位對應）

**欄位定位使用 header 名稱，不使用 A/B/C 字母**，以防品牌方調整欄序後 mapping 失效：

```typescript
type BrandSheetFieldMapping = {
  column: string;            // Sheet 標題名稱，例如 "官網GMV"
  platformField: string;     // 對應 BrandNormalizedMetric.metricKey 或語意標籤
  unit?: "twd" | "count" | "ratio";
  required: boolean;
  notes?: string;
};
```

`platformField` 保留值：
| platformField | 用途 | 對應 metricKey |
|---|---|---|
| `date` | 資料日期，轉成 occurredAt | 特殊欄位，不產生 metric |
| `gmv` | 成交金額 | `gmv` |
| `orders` | 訂單數 | `orders` |
| `sessions` | GA4 session | `sessions` |
| `spend` | 廣告花費 | `spend` |
| `clicks` | 廣告點擊 | `clicks` |
| `roas` | 廣告投報率 | `roas` |
| `line_clicks` | LINE 推播點擊 | `line_clicks` |
| `category_label` | 商品類別（自由文字，備存 payload） | 不產生 metric |
| `campaign_label` | 廣告活動名稱（備存 payload） | 不產生 metric |

### 3.4 BrandSheetWritebackConfig（回填分頁設定）

```typescript
type BrandSheetWritebackConfig = {
  id: string;
  tabName: string;
  writebackKind:
    | "task_status"          // BrandTask 狀態變更
    | "revenue_signal"       // RevenueSignal 觀察記錄
    | "reviewer_note"        // reviewer pass / needs_revision + 備註
    | "trace_log"            // SeniorMemberActivity 操作脈絡
    | "daily_summary";       // 平台產生的每日指標摘要
  headerRow: number;
  dataStartRow: number;
  fieldMapping: BrandSheetFieldMapping[];
  triggerKind: "manual" | "on_review" | "daily";
  requiresReviewerApproval: boolean;
};
```

---

## 4. 讀取流程

```text
[觸發] 手動（Phase 1）或排程（Phase 2）
        │
        ▼
Step 1  讀取 Sheet 指定分頁
        · 對照 headerRow 找到各欄位
        · 逐列讀取 dataStartRow 以後的資料

        │
        ▼
Step 2  建立 BrandRawImport
        · payloadKind = "sheet_summary"（合併日報）或對應 tabKind
        · importMethod = "google_sheets"
        · connectorId = connector id
        · status = "received"
        · recordCount = 本次讀取列數

        │
        ▼
Step 3  標準化為 BrandNormalizedMetric
        · 依 fieldMapping 轉換欄位
        · 必填欄位缺值 → BrandRawImport.status = "rejected"，記入 BrandSheetSyncLog
        · 數值欄位解析失敗 → 標記 confidence = "low"
        · BrandRawImport.status = "normalized"

        │
        ▼
Step 4  規則判斷，產生 RevenueSignal（候選）
        · 依下方「自動 vs. 人工確認」規則決定是否需要 reviewer 確認
        · 自動通過：建立 RevenueSignal，confidence 從 metric 繼承
        · 需確認：建立 BrandSheetSyncLog（status = "pending_review"），等待 reviewer

        │
        ▼
Step 5  BrandTask 更新（選）
        · 如果有符合條件的 BrandTask，更新 revenueSignalIds
        · 建立 SeniorMemberActivity（activityType = "note"，記錄自動產生脈絡）
```

---

## 5. 回填流程

```text
[觸發] 手動（任何時間）或 on_review（reviewer 完成操作時）
        │
        ▼
Step 1  收集待回填資料
        · task_status：從 brandOpsStore 讀取最新 BrandTask 狀態
        · revenue_signal：讀取品牌的 RevenueSignal 清單
        · reviewer_note：讀取 SeniorMemberActivity（type = "review"）
        · trace_log：讀取最近的操作紀錄

        │
        ▼
Step 2  requiresReviewerApproval 檢查
        · 若為 true → reviewer 必須在 Brand App 確認後才能觸發回填
        · 若為 false → 可直接執行

        │
        ▼
Step 3  寫入 Sheet 指定分頁
        · 依 writebackKind 對應分頁
        · 每次回填不覆蓋，追加新列（append）
        · 建立 BrandSheetSyncLog（direction = "writeback"）

        │
        ▼
Step 4  記錄結果
        · BrandSheetSyncLog.status = "success" / "partial" / "failed"
        · 失敗原因存入 reviewerNote 欄位
```

---

## 6. 木酢寵物達人日報 v1 Connector 設定

完整設定見 `src/lib/sheet-connectors/muzopet.ts`。以下為結構摘要：

### 6.1 讀取分頁（3 個）

| readConfig id | tabName（佔位） | tabKind | dataSourceId |
|---|---|---|---|
| `read-muzopet-daily-summary` | `__DAILY_SUMMARY_TAB__` | `daily_summary` | `datasource-muzopet-website` |
| `read-muzopet-shopee-report` | `__SHOPEE_REPORT_TAB__` | `shopee_report` | `datasource-muzopet-shopee` |
| `read-muzopet-line-report` | `__LINE_REPORT_TAB__` | `line_report` | `datasource-muzopet-line` |

**日報合併分頁（daily_summary）mapping 欄位：**

| Sheet 標題（佔位） | platformField | unit | required |
|---|---|---|---|
| 日期 | date | — | ✓ |
| 官網GMV | gmv | twd | ✓ |
| 官網訂單數 | orders | count | ✓ |
| 蝦皮GMV | gmv | twd | — |
| 蝦皮訂單數 | orders | count | — |
| GA會話數 | sessions | count | — |
| Meta廣告花費 | spend | twd | — |
| Google廣告花費 | spend | twd | — |
| LINE推播點擊 | line_clicks | count | — |

> ⚠️ `tabName` 與 `column` 欄位均為佔位。導入時由 Sophia 填入實際 Sheet 分頁名稱與標題名稱，再把 `status` 從 `"needs_setup"` 改為 `"active"`。

### 6.2 回填分頁（3 個）

| writebackConfig id | tabName（佔位） | writebackKind | requiresReviewerApproval |
|---|---|---|---|
| `writeback-muzopet-task-status` | `__PLATFORM_OUTPUT_TAB__` | `task_status` | ✗ |
| `writeback-muzopet-reviewer-note` | `__REVIEWER_NOTES_TAB__` | `reviewer_note` | ✓ |
| `writeback-muzopet-revenue-signal` | `__REVENUE_SIGNALS_TAB__` | `revenue_signal` | ✓ |

---

## 7. 自動 vs. 人工確認資料分界

| 動作 | 自動處理 | 需 reviewer 確認 |
|---|---|---|
| BrandRawImport 建立 | ✓ | — |
| BrandNormalizedMetric 建立 | ✓ | — |
| 欄位缺值記錄（非必填） | ✓ | — |
| 必填欄位缺值 → 標記 rejected | ✓（不中斷流程） | — |
| RevenueSignal 建立（confidence = high，數值來源明確） | ✓ | — |
| RevenueSignal 建立（confidence = medium/low） | 建立候選，狀態 pending_review | ✓ |
| BrandTask 連結更新（revenueSignalIds） | ✓（如有符合任務） | — |
| 回填 task_status | ✓（triggerKind = manual） | — |
| 回填 reviewer_note | — | ✓ |
| 回填 revenue_signal | — | ✓ |
| 寄送任何對外通訊（Email / LINE / 推播） | — | ✓（超出本規格） |

**核心原則：平台不直接把 Sheet 資料變成對外動作。所有涉及品牌客戶可見的內容，都必須先過 reviewer。**

---

## 8. Brand App UI 同步狀態顯示規格

`/brands/[brandId]` 頁面在「數據來源與營收訊號」區塊應顯示：

### 8.1 同步狀態（每個 readConfig）

| 狀態 | 顯示 | 說明 |
|---|---|---|
| `needs_setup` | ⬜ 待設定 | sheetId 或 tabName 尚未填入 |
| `active`（未讀取過） | 🟡 可讀取 | 設定完成，尚無讀取記錄 |
| `active`（讀取成功） | 🟢 已同步：`lastReadAt` | 顯示最後讀取時間 |
| `active`（部分成功） | 🟠 部分讀取 | 有 rejected 記錄，顯示筆數 |
| `active`（讀取失敗） | 🔴 讀取失敗 | 顯示錯誤摘要 |
| `paused` | ⬛ 已暫停 | — |

### 8.2 回填狀態（每個 writebackConfig）

| 狀態 | 顯示 |
|---|---|
| 從未觸發 | 灰色：未回填 |
| 等待 reviewer | 黃色：等待確認回填 |
| 回填成功 | 綠色：已回填（時間） |
| 回填失敗 | 紅色：回填失敗（原因） |

### 8.3 異常狀態提示（優先顯示）

以下情況應在 Brand App 頂部顯示 banner 或警示：

- Connector status = `needs_setup`：顯示「尚未完成 Sheet 連接設定，請聯繫政澔」
- 讀取失敗超過 2 次：顯示「日報讀取連續失敗，需確認 Sheet 格式」
- 有 `pending_review` 的 SyncLog 超過 24 小時：顯示「有營收訊號等待 reviewer 確認」
- 回填失敗：顯示「回填到 Sheet 失敗，請確認分頁名稱」

---

## 9. 實作階段

### Phase 1（目前）：佔位設定 + 手動觸發

- `BrandSheetConnector` 設定建立，`status = "needs_setup"`
- 所有 tabName / sheetId 為佔位
- 不實際呼叫 Google Sheets API
- Brand App 顯示「待設定」狀態
- Sophia 可在 Brand App 看到 Connector 設定預覽

### Phase 2：API 串接 + 手動觸發讀取

- Sophia 填入實際 sheetId 與 tabName
- 串接 Google Sheets API（建議使用 `@googleapis/sheets`，Auth 用 Service Account）
- 建立 `GET /api/brands/[brandId]/sheet-sync` endpoint
- 手動觸發讀取 → 建立 BrandRawImport → 產生 BrandNormalizedMetric
- 產生 RevenueSignal（候選）
- Brand App 顯示同步狀態

### Phase 3：自動觸發 + 回填

- 設定定時讀取（Cron 或 Zeabur 排程）
- reviewer 確認後自動回填 reviewer_note 與 revenue_signal
- BrandSheetSyncLog 持久化（目前為 runtime only）

---

## 10. 驗收標準（Phase 2 完成時）

完成 Phase 2 串接後，系統應能回答：

```text
1. 木酢今日官網與蝦皮的 GMV 和訂單數是多少？
2. 今日 LINE 推播點擊了幾次？
3. 這些數字產生了哪些 RevenueSignal？
4. 哪些訊號等待 reviewer 確認？
5. 哪些任務的 revenueSignalIds 因為本次讀取而更新？
6. 最近一次回填是什麼時間、回填了什麼？
```

Phase 2 不要求精準歸因。目標是讓 Sophia 填完 Sheet 後，不需要再手動進平台建立訊號，平台自動處理到「等待 reviewer 確認」這一步。

---

## 11. 新品牌導入 Connector 的 SOP

任何新品牌要導入 Sheet Connector，依序完成：

1. **Sophia 確認 sheetId**：取得 Google Sheets URL 中的 spreadsheet ID
2. **確認分頁名稱**：確認日報、蝦皮報告、LINE 報告各自的 tab name
3. **確認欄位標題**：確認每個分頁的欄位名稱（header 名稱，非字母）
4. **政澔更新 Connector 設定**：把佔位替換成實際值，`status` 改為 `"active"`
5. **Sophia 觸發第一次讀取**：在 Brand App 手動觸發，驗證讀取結果
6. **藝嘉確認 RevenueSignal**：確認候選訊號是否合規，通過後正式建立
7. **確認回填分頁**：建立 Sheet 回填分頁，確認欄位與格式
