import type {
  BrandBrain,
  BrandDataSource,
  BrandNormalizedMetric,
  BrandRawImport,
  BrandTask,
  ClientBrand,
  RevenueSignal,
  SeniorMemberActivity,
} from "../domain";

export const muzopetBrandId = "brand-muzopet";

export const muzopetBrand: ClientBrand = {
  id: muzopetBrandId,
  name: "木酢寵物達人",
  industry: "寵物清潔與居家植萃清潔",
  ownerUserId: "user-reviewer-yijia",
  assignedMemberIds: ["user-reviewer-yijia", "user-newcomer-01"],
  operatingStage: "active",
  positioning:
    "以木酢液為核心的毛孩家庭植萃清潔品牌，延伸到環境除臭、布料清潔、肌膚養護與防蚊。",
  primaryGoal:
    "把 20 萬家庭資料庫、官網商品矩陣與短影音流量接成可追蹤的回購、加購與轉單流程。",
};

export const muzopetBrandBrain: BrandBrain = {
  id: "brand-brain-muzopet",
  brandId: muzopetBrandId,
  voice:
    "務實、真誠、行動派；先講能落地的營收與曝光，再講品牌故事，語氣可直接但不能硬銷。",
  audience:
    "養狗、養貓、重視安全無毒清潔的家庭，以及在意循環永續與 ESG 脈絡的合作夥伴。",
  offer:
    "木酢液、寵物清潔、環境除臭、布料清潔、肌膚養護與防蚊的植萃清潔商品與循環故事。",
  taboos: [
    "不要承諾治療、根治、醫療或絕對功效。",
    "不要把產品說成單純低價促銷品，品牌故事與循環脈絡要保留。",
    "不要用恐嚇式話術或過度誇張的效果描述。",
  ],
  channelRules: [
    "商品文案先講使用場景，再講成分與規格。",
    "環境清潔與布料清潔要對應除臭、抗菌、去味的日常痛點。",
    "狗用、貓用、人用防蚊必須區分，不可混用。",
    "短影音與客服話術都要保留『一起賺錢』的夥伴感，但不能像硬銷。",
  ],
  escalationRules: [
    "健康、過敏、皮膚異常、傷口與就醫相關問題要轉人工或獸醫。",
    "涉及功效承諾、法規字眼、品牌授權或價格策略時要升級。",
    "當商品分類或目標客群出現衝突時，先問藝嘉再定稿。",
  ],
  updatedAt: "2026-05-01T00:00:00.000Z",
};

export const muzopetDataSources: BrandDataSource[] = [
  {
    id: "datasource-muzopet-website",
    brandId: muzopetBrandId,
    system: "website",
    name: "官網銷售",
    role: "transaction_truth",
    status: "manual_import_ready",
    lastSyncedAt: "2026-05-01T08:10:00.000Z",
    trustLevel: "high",
    notes: "訂單、商品、客戶、折扣與付款狀態的第一交易真相來源。",
  },
  {
    id: "datasource-muzopet-shopee",
    brandId: muzopetBrandId,
    system: "shopee",
    name: "蝦皮銷售",
    role: "marketplace_sales",
    status: "manual_import_ready",
    lastSyncedAt: "2026-05-01T08:20:00.000Z",
    trustLevel: "high",
    notes: "第二交易通路；蝦皮訂單不可與官網訂單混成同一筆。",
  },
  {
    id: "datasource-muzopet-ga4",
    brandId: muzopetBrandId,
    system: "ga4",
    name: "Google Analytics 4",
    role: "behavior",
    status: "mock_ready",
    lastSyncedAt: "2026-05-01T08:30:00.000Z",
    trustLevel: "medium",
    notes: "行為與漏斗來源；purchase event 只能輔助比對，不覆蓋訂單資料。",
  },
  {
    id: "datasource-muzopet-meta-ads",
    brandId: muzopetBrandId,
    system: "meta_ads",
    name: "Meta Ads",
    role: "ad_spend",
    status: "mock_ready",
    lastSyncedAt: "2026-05-01T08:40:00.000Z",
    trustLevel: "medium",
    notes: "投放成本與素材來源；平台 conversion 不直接當未去重營收。",
  },
  {
    id: "datasource-muzopet-google-ads",
    brandId: muzopetBrandId,
    system: "google_ads",
    name: "Google Ads",
    role: "ad_spend",
    status: "mock_ready",
    lastSyncedAt: "2026-05-01T08:50:00.000Z",
    trustLevel: "medium",
    notes: "搜尋意圖與成本來源；保留 keyword/search term 判斷，不與 Meta 混用。",
  },
  {
    id: "datasource-muzopet-line",
    brandId: muzopetBrandId,
    system: "line",
    name: "LINE Ads / LINE OA",
    role: "member_reactivation",
    status: "manual_import_ready",
    lastSyncedAt: "2026-05-01T09:00:00.000Z",
    trustLevel: "medium",
    notes: "會員喚醒與再行銷來源；能對到會員、手機或 coupon 時優先標記 retention。",
  },
];

export const muzopetRawImports: BrandRawImport[] = [
  {
    id: "raw-muzopet-website-orders-2026-05-01",
    brandId: muzopetBrandId,
    dataSourceId: "datasource-muzopet-website",
    importedAt: "2026-05-01T08:10:00.000Z",
    payloadKind: "orders",
    recordCount: 128,
    status: "normalized",
  },
  {
    id: "raw-muzopet-line-summary-2026-05-01",
    brandId: muzopetBrandId,
    dataSourceId: "datasource-muzopet-line",
    importedAt: "2026-05-01T09:00:00.000Z",
    payloadKind: "summary",
    recordCount: 6,
    status: "normalized",
  },
];

export const muzopetNormalizedMetrics: BrandNormalizedMetric[] = [
  {
    id: "metric-muzopet-website-gmv-2026-05-01",
    brandId: muzopetBrandId,
    dataSourceId: "datasource-muzopet-website",
    rawImportId: "raw-muzopet-website-orders-2026-05-01",
    metricKey: "gmv",
    value: 186420,
    unit: "twd",
    occurredAt: "2026-05-01T08:10:00.000Z",
    confidence: "high",
  },
  {
    id: "metric-muzopet-line-clicks-2026-05-01",
    brandId: muzopetBrandId,
    dataSourceId: "datasource-muzopet-line",
    rawImportId: "raw-muzopet-line-summary-2026-05-01",
    metricKey: "line_clicks",
    value: 842,
    unit: "count",
    occurredAt: "2026-05-01T09:00:00.000Z",
    confidence: "medium",
  },
];

export const muzopetRevenueSignals: RevenueSignal[] = [
  {
    id: "signal-muzopet-member-database",
    brandId: muzopetBrandId,
    type: "lead",
    label: "20 萬家庭資料庫回購入口",
    value:
      "內部脈絡與品牌對外敘述都指向 20 萬家庭資料庫，可優先做會員喚醒與回購分群。",
    confidence: "high",
    observedAt: "2026-05-01T08:00:00.000Z",
  },
  {
    id: "signal-muzopet-category-cluster",
    brandId: muzopetBrandId,
    type: "retention",
    label: "狗貓＋環境清潔＋肌膚養護多線並進",
    value:
      "官網同時有狗狗、貓咪、環境/用品清潔、肌膚養護與防蚊類別，適合做組合包與交叉銷售。",
    confidence: "high",
    observedAt: "2026-05-01T08:30:00.000Z",
  },
  {
    id: "signal-muzopet-seasonal-upsell",
    brandId: muzopetBrandId,
    type: "upsell",
    label: "防蚊與外出場景的季節性加購",
    value:
      "狗用防蚊與人用防蚊並列，外出季可以把防蚊、除臭與洗毛精一起推成加購組合。",
    confidence: "medium",
    observedAt: "2026-05-01T09:00:00.000Z",
  },
];

export const muzopetSeniorMemberActivities: SeniorMemberActivity[] = [
  {
    id: "activity-muzopet-wakeup-handoff",
    brandId: muzopetBrandId,
    userId: "user-reviewer-yijia",
    activityType: "handoff",
    summary:
      "藝嘉先要求把 20 萬家庭資料庫、官網類別與品牌語氣對齊，才能開始第一波會員喚醒素材。",
    relatedBrandTaskIds: [
      "brand-task-muzopet-member-wakeup",
      "brand-task-muzopet-category-map",
    ],
    createdAt: "2026-05-01T09:30:00.000Z",
  },
  {
    id: "activity-muzopet-redline-review",
    brandId: muzopetBrandId,
    userId: "user-reviewer-yijia",
    activityType: "review",
    summary:
      "針對健康、過敏、獸醫與療效承諾設立固定紅線，客服與內容都先過這關。",
    relatedBrandTaskIds: ["brand-task-muzopet-redline-guide"],
    createdAt: "2026-05-01T10:00:00.000Z",
  },
  {
    id: "activity-muzopet-channel-strategy",
    brandId: muzopetBrandId,
    userId: "user-reviewer-yijia",
    activityType: "strategy",
    summary:
      "短影音、蝦皮與官網要共用同一套品牌口吻，但商品頁必須先講場景再講成分。",
    relatedBrandTaskIds: [
      "brand-task-muzopet-member-wakeup",
      "brand-task-muzopet-redline-guide",
    ],
    createdAt: "2026-05-01T10:30:00.000Z",
  },
];

export const muzopetBrandTasks: BrandTask[] = [
  {
    id: "brand-task-muzopet-member-wakeup",
    brandId: muzopetBrandId,
    title: "整理 20 萬家庭會員的回購喚醒分群",
    status: "in_progress",
    ownerUserId: "user-newcomer-01",
    expectedOutcome:
      "把狗/貓、環境清潔、肌膚養護、防蚊四個場景對到可回購名單與第一波訊息。",
    revenueSignalIds: [
      "signal-muzopet-member-database",
      "signal-muzopet-category-cluster",
    ],
    seniorMemberActivityIds: [
      "activity-muzopet-wakeup-handoff",
      "activity-muzopet-channel-strategy",
    ],
  },
  {
    id: "brand-task-muzopet-category-map",
    brandId: muzopetBrandId,
    title: "建立官網類別到商品的主推對照表",
    status: "queued",
    ownerUserId: "user-newcomer-01",
    expectedOutcome:
      "讓每個 category 下面的主打 SKU、組合與禁忌都能被新人快速讀出。",
    revenueSignalIds: ["signal-muzopet-category-cluster"],
    seniorMemberActivityIds: ["activity-muzopet-wakeup-handoff"],
  },
  {
    id: "brand-task-muzopet-redline-guide",
    brandId: muzopetBrandId,
    title: "整理客服轉單與健康紅線",
    status: "reviewing",
    ownerUserId: "user-newcomer-01",
    expectedOutcome:
      "把健康問題、過敏、退貨與高敏感字詞的升級條件寫清楚，讓內容與客服一致。",
    revenueSignalIds: ["signal-muzopet-seasonal-upsell"],
    seniorMemberActivityIds: [
      "activity-muzopet-redline-review",
      "activity-muzopet-channel-strategy",
    ],
  },
];
