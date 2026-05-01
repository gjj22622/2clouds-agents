import type { BrandSheetConnector } from "../domain";

// Phase 1: 木酢寵物達人日報 Google Sheet Connector
//
// sheetId 為佔位，導入時由 Sophia 填入實際 Google Sheets spreadsheet ID。
// tabName 為佔位，對應實際分頁名稱後才能啟動讀取。
// column 欄位對應 Sheet 欄位標題（header 名稱），不使用 A/B/C 字母定位，
// 以避免日後品牌方調整欄序導致 mapping 失效。

export const muzopetSheetConnector: BrandSheetConnector = {
  id: "connector-muzopet-daily-report",
  brandId: "brand-muzopet",
  sheetId: "__PLACEHOLDER_FILL_WITH_REAL_SHEET_ID__",
  label: "木酢寵物達人日報表",
  status: "needs_setup",
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",

  readConfigs: [
    {
      id: "read-muzopet-daily-summary",
      tabName: "__DAILY_SUMMARY_TAB__",
      tabKind: "daily_summary",
      dataSourceId: "datasource-muzopet-website",
      headerRow: 1,
      dataStartRow: 2,
      triggerKind: "manual",
      fieldMapping: [
        {
          column: "日期",
          platformField: "date",
          required: true,
          notes: "YYYY-MM-DD 格式；用於 occurredAt",
        },
        {
          column: "官網GMV",
          platformField: "gmv",
          unit: "twd",
          required: true,
          notes: "官網當日成交金額（含折扣後）；對應 datasource-muzopet-website",
        },
        {
          column: "官網訂單數",
          platformField: "orders",
          unit: "count",
          required: true,
          notes: "官網當日訂單筆數",
        },
        {
          column: "蝦皮GMV",
          platformField: "gmv",
          unit: "twd",
          required: false,
          notes: "蝦皮當日成交金額；對應 datasource-muzopet-shopee；不與官網混計",
        },
        {
          column: "蝦皮訂單數",
          platformField: "orders",
          unit: "count",
          required: false,
          notes: "蝦皮當日訂單筆數",
        },
        {
          column: "GA會話數",
          platformField: "sessions",
          unit: "count",
          required: false,
          notes: "GA4 session 總數；對應 datasource-muzopet-ga4",
        },
        {
          column: "Meta廣告花費",
          platformField: "spend",
          unit: "twd",
          required: false,
          notes: "Meta Ads 當日廣告費用；對應 datasource-muzopet-meta-ads",
        },
        {
          column: "Google廣告花費",
          platformField: "spend",
          unit: "twd",
          required: false,
          notes: "Google Ads 當日廣告費用；對應 datasource-muzopet-google-ads",
        },
        {
          column: "LINE推播點擊",
          platformField: "line_clicks",
          unit: "count",
          required: false,
          notes: "LINE OA 推播點擊次數；對應 datasource-muzopet-line",
        },
      ],
    },
    {
      id: "read-muzopet-shopee-report",
      tabName: "__SHOPEE_REPORT_TAB__",
      tabKind: "shopee_report",
      dataSourceId: "datasource-muzopet-shopee",
      headerRow: 1,
      dataStartRow: 2,
      triggerKind: "manual",
      fieldMapping: [
        {
          column: "日期",
          platformField: "date",
          required: true,
        },
        {
          column: "蝦皮成交金額",
          platformField: "gmv",
          unit: "twd",
          required: true,
          notes: "蝦皮後台「訂單報表」匯出",
        },
        {
          column: "蝦皮訂單數",
          platformField: "orders",
          unit: "count",
          required: true,
        },
        {
          column: "商品類別",
          platformField: "category_label",
          required: false,
          notes: "自由文字；轉成 BrandRawImport payload 備存",
        },
      ],
    },
    {
      id: "read-muzopet-line-report",
      tabName: "__LINE_REPORT_TAB__",
      tabKind: "line_report",
      dataSourceId: "datasource-muzopet-line",
      headerRow: 1,
      dataStartRow: 2,
      triggerKind: "manual",
      fieldMapping: [
        {
          column: "日期",
          platformField: "date",
          required: true,
        },
        {
          column: "推播名稱",
          platformField: "campaign_label",
          required: false,
          notes: "LINE OA 推播活動名稱",
        },
        {
          column: "推播開啟數",
          platformField: "opens",
          unit: "count",
          required: false,
        },
        {
          column: "推播點擊數",
          platformField: "line_clicks",
          unit: "count",
          required: true,
        },
        {
          column: "好友總數",
          platformField: "friends",
          unit: "count",
          required: false,
        },
      ],
    },
  ],

  writebackConfigs: [
    {
      id: "writeback-muzopet-task-status",
      tabName: "__PLATFORM_OUTPUT_TAB__",
      writebackKind: "task_status",
      headerRow: 1,
      dataStartRow: 2,
      triggerKind: "manual",
      requiresReviewerApproval: false,
      fieldMapping: [
        {
          column: "任務ID",
          platformField: "task_id",
          required: true,
        },
        {
          column: "任務標題",
          platformField: "task_title",
          required: true,
        },
        {
          column: "目前狀態",
          platformField: "task_status",
          required: true,
        },
        {
          column: "最後備註",
          platformField: "latest_note",
          required: false,
        },
        {
          column: "更新時間",
          platformField: "updated_at",
          required: true,
        },
      ],
    },
    {
      id: "writeback-muzopet-reviewer-note",
      tabName: "__REVIEWER_NOTES_TAB__",
      writebackKind: "reviewer_note",
      headerRow: 1,
      dataStartRow: 2,
      triggerKind: "on_review",
      requiresReviewerApproval: true,
      fieldMapping: [
        {
          column: "任務ID",
          platformField: "task_id",
          required: true,
        },
        {
          column: "Reviewer備註",
          platformField: "reviewer_note",
          required: true,
        },
        {
          column: "決定",
          platformField: "review_decision",
          required: true,
          notes: "pass / needs_revision",
        },
        {
          column: "決定時間",
          platformField: "reviewed_at",
          required: true,
        },
      ],
    },
    {
      id: "writeback-muzopet-revenue-signal",
      tabName: "__REVENUE_SIGNALS_TAB__",
      writebackKind: "revenue_signal",
      headerRow: 1,
      dataStartRow: 2,
      triggerKind: "on_review",
      requiresReviewerApproval: true,
      fieldMapping: [
        {
          column: "訊號ID",
          platformField: "signal_id",
          required: true,
        },
        {
          column: "訊號類型",
          platformField: "signal_type",
          required: true,
          notes: "lead / conversion / retention / upsell",
        },
        {
          column: "訊號標題",
          platformField: "signal_label",
          required: true,
        },
        {
          column: "觀察內容",
          platformField: "signal_value",
          required: true,
        },
        {
          column: "信心度",
          platformField: "confidence",
          required: true,
          notes: "low / medium / high",
        },
        {
          column: "觀察時間",
          platformField: "observed_at",
          required: true,
        },
      ],
    },
  ],
};
