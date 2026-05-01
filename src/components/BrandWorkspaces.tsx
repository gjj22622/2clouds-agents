import Link from "next/link";
import { notFound } from "next/navigation";
import { getRevenueSignalsForBrandTask } from "@/lib/brands";
import { brandOpsStore } from "@/lib/brand-ops-store";
import { BrandOpsPanel } from "@/components/BrandOpsPanel";
import {
  clientBrands,
  currentUser,
  reviewerUser,
} from "@/lib/seed";
import type {
  BrandOperatingContext,
  BrandTaskStatus,
  RevenueSignal,
  SeniorMemberActivity,
} from "@/lib/domain";

const users = [currentUser, reviewerUser];
const MUZO_BRAND_ID = "brand-muzopet";

const stageLabels = {
  onboarding: "導入中",
  active: "營運中",
  paused: "暫停",
} as const;

const brandTaskStatusLabels: Record<BrandTaskStatus, string> = {
  queued: "排程中",
  in_progress: "進行中",
  reviewing: "待審",
  done: "完成",
};

const revenueSignalTypeLabels: Record<RevenueSignal["type"], string> = {
  lead: "線索",
  conversion: "轉換",
  retention: "回購",
  upsell: "加購",
};

const activityTypeLabels: Record<SeniorMemberActivity["activityType"], string> = {
  strategy: "策略",
  review: "審查",
  client_contact: "客戶接觸",
  handoff: "交接",
  note: "備註",
};

const muzoOperationalFocus = [
  {
    label: "狗狗",
    detail: "日常清潔、除臭、照護情境的入口。",
  },
  {
    label: "貓咪",
    detail: "溫和配方與居家環境維護的入口。",
  },
  {
    label: "環境 / 用品清潔",
    detail: "地板、窩墊、外出用品與空間清潔。",
  },
  {
    label: "肌膚養護",
    detail: "低敏照護與換季保養的內容入口。",
  },
  {
    label: "防蚊",
    detail: "戶外與季節性使用情境。",
  },
  {
    label: "會員福利",
    detail: "回購、喚醒、分眾訊息與促購節奏。",
  },
  {
    label: "知識分享",
    detail: "FAQ、內容教育與品牌信任堆疊。",
  },
  {
    label: "ESG 企業合作",
    detail: "循環經濟、地方創生與企業合作提案。",
  },
] as const;

const muzoChannelFocus = ["官網", "Facebook", "蝦皮", "LINE", "TikTok / 短影音"] as const;

const muzoDataSources = [
  {
    id: "shop",
    label: "官網銷售",
    role: "交易真相來源",
    data: "訂單、商品、客戶、折扣、付款狀態、回購",
    note: "不要只看 GA purchase 當營收真相",
    signalType: "conversion" as const,
  },
  {
    id: "shopee",
    label: "蝦皮銷售",
    role: "第二交易通路",
    data: "訂單、SKU、活動、商品排行",
    note: "不要與官網訂單混成同一筆",
    signalType: "conversion" as const,
  },
  {
    id: "ga",
    label: "Google Analytics",
    role: "行為與漏斗來源",
    data: "session、source/medium、landing page、add_to_cart、checkout、purchase event",
    note: "不要直接當最終營收",
    signalType: "lead" as const,
  },
  {
    id: "meta",
    label: "Meta Ads",
    role: "投放成本與素材來源",
    data: "campaign、ad set、ad、spend、impressions、clicks、conversion",
    note: "不要把 Meta purchase 當未去重訂單",
    signalType: "lead" as const,
  },
  {
    id: "google-ads",
    label: "Google Ads",
    role: "搜尋意圖與成本來源",
    data: "campaign、keyword、search term、spend、clicks、conversion",
    note: "不要和 Meta 用同一套素材判斷",
    signalType: "lead" as const,
  },
  {
    id: "line",
    label: "LINE Ads / LINE OA",
    role: "會員喚醒與再行銷來源",
    data: "推播、開啟、點擊、好友、分眾、喚醒活動",
    note: "不要和廣告新客流量混為一談",
    signalType: "retention" as const,
  },
] as const;

const muzoDataArchitecturePhases = [
  {
    phase: "Phase 1",
    label: "手動匯入與營運訊號",
    status: "目前階段",
    items: ["允許 CSV / 報表手動匯入", "先建立 RevenueSignal", "支援官網、蝦皮、GA、Meta、Google Ads、LINE 摘要資料"],
  },
  {
    phase: "Phase 2",
    label: "標準化資料表",
    status: "下一步",
    items: ["建立 brand_order", "建立 brand_channel_event", "建立 brand_campaign_spend", "建立 brand_customer_identity"],
  },
  {
    phase: "Phase 3",
    label: "API Connector",
    status: "規劃中",
    items: ["串官網訂單 API", "串 GA4 Data API", "串 Meta / Google Ads API", "串 LINE Ads / OA API"],
  },
] as const;

const muzoDataQuestions = [
  "本週官網與蝦皮各自賣了什麼？",
  "哪些廣告花費帶來有效流量？",
  "哪些 LINE / 會員動作可能帶來回購？",
  "哪些商品類別值得做內容或活動？",
  "新人今天應該做哪個任務？",
  "reviewer 要用哪些規則判斷這個任務是否可用？",
] as const;

const muzoBrainFallback = {
  voice:
    "務實、真誠、行動派；先講使用情境，再講產品與合作，不做誇張療效承諾。",
  audience:
    "有狗貓的家庭、重視天然與低敏的飼主，以及想把 ESG 故事做成合作方案的企業窗口。",
  offer:
    "以木酢液與 REWOOD 循環經濟串起寵物清潔保養、居家環境清潔、會員回購與企業合作。",
  taboos: [
    "禁止宣稱治療、預防或消滅疾病與害蟲。",
    "禁止未經驗證的功效保證與 100% 有效說法。",
    "禁止把健康與合規問題包裝成一般客服話術。",
  ],
  channelRules: [
    "官網先講使用情境，再接商品與 FAQ。",
    "會員訊息以回購、喚醒與分眾為主，不用硬促銷語氣。",
    "ESG 與企業合作內容要講循環、地方創生與實際案例。",
  ],
  escalationRules: [
    "涉及寵物健康、療效、過敏或獸醫問題時升級。",
    "涉及價格承諾、退貨條件或合約條款變更時升級。",
    "涉及新的產品聲稱或競品比較時升級。",
  ],
  updatedAt: "2026-05-01T08:00:00.000Z",
} as const;

const muzoDirectoryFallback = {
  id: MUZO_BRAND_ID,
  href: `/brands/${MUZO_BRAND_ID}`,
  name: "木酢寵物達人",
  industry: "寵物護理 / 居家清潔 / ESG",
  statusLabel: "營運中",
  summary:
    "官網可見的營運輪廓已接入：狗狗、貓咪、環境 / 用品清潔、肌膚養護、防蚊、會員福利、知識分享、ESG 企業合作。",
  goal: "把會員喚醒、營收歸因與客服轉單接成可追蹤的營收路徑。",
  badges: [
    "主品牌之一",
    "木酢達人 / REWOOD",
    "20 萬+ 會員池",
    "循環經濟",
  ],
  metrics: [
    {
      label: "品牌腦摘要",
      value: "1 組",
      detail: "voice / audience / offer / taboos",
    },
    {
      label: "營運模組",
      value: "8 軸",
      detail: "狗貓、清潔、養護、防蚊、會員、知識、ESG",
    },
    {
      label: "主通路",
      value: "5 類",
      detail: "官網 / FB / 蝦皮 / LINE / 短影音",
    },
  ],
  primaryAction: "進入木酢 Brand App",
} as const;

const muzoTasksFallback = [
  {
    id: "brand-muzopet-task-member-warmup",
    title: "整理會員喚醒 Agent 的分群入口",
    status: "in_progress" as const,
    owner: "Sophia",
    expectedOutcome:
      "把 20 萬會員池切成沉睡 / 高頻 / 流失三群，對應 LINE、EDM 與蝦皮訊息版本。",
    revenueSignalIds: ["brand-muzopet-signal-membership-pool"],
    activityIds: ["brand-muzopet-activity-founder-brief"],
  },
  {
    id: "brand-muzopet-task-attribution",
    title: "補齊營收歸因欄位與短鏈規則",
    status: "reviewing" as const,
    owner: "阿良",
    expectedOutcome:
      "每週五能直接看出來源渠道、內容與 Agent ROI，並保留 UTM、短鏈與時間窗。",
    revenueSignalIds: ["brand-muzopet-signal-attribution"],
    activityIds: ["brand-muzopet-activity-esg-pipeline"],
  },
  {
    id: "brand-muzopet-task-service-routing",
    title: "更新客服轉單 FAQ 與紅線詞",
    status: "queued" as const,
    owner: "藝嘉",
    expectedOutcome:
      "毛孩健康問題強制轉人工，其他猶豫訊息能先推對 SKU 與使用情境。",
    revenueSignalIds: ["brand-muzopet-signal-service-intent"],
    activityIds: ["brand-muzopet-activity-compliance-note"],
  },
] as const;

const muzoRevenueSignalsFallback = [
  {
    id: "brand-muzopet-signal-membership-pool",
    type: "retention" as const,
    label: "20 萬+ 會員資料庫",
    value: "會員池是木酢最短見金的第一層路徑，適合做回購喚醒與分群推送。",
    confidence: "high" as const,
    nextAction: "先切狗 / 貓、首次 / 回購、沉睡 / 流失三個分群。",
  },
  {
    id: "brand-muzopet-signal-attribution",
    type: "conversion" as const,
    label: "官網 / 蝦皮 / FB / TikTok 轉單鏈",
    value:
      "訂單來源需要靠 UTM、短鏈與時間窗一起補齊，才能把內容與營收接起來。",
    confidence: "medium" as const,
    nextAction: "每支內容都要先帶來源標籤，再進歸因流程。",
  },
  {
    id: "brand-muzopet-signal-service-intent",
    type: "lead" as const,
    label: "客服轉單與猶豫訊號",
    value:
      "顧客常先問適用情境、尺寸與使用方式，再決定是否購買或加購。",
    confidence: "medium" as const,
    nextAction: "把 FAQ、猶豫詞典與紅線詞一起管理。",
  },
] as const;

const muzoActivitiesFallback = [
  {
    id: "brand-muzopet-activity-founder-brief",
    actor: "陳偉誠",
    activityType: "strategy" as const,
    summary:
      "確認短影音、AI 文案與品牌資料要一起餵給模型，讓內容更有溫度也更貼近營運。",
    createdAt: "2026-04-21T09:30:00.000Z",
    relatedTaskIds: ["brand-muzopet-task-member-warmup"],
  },
  {
    id: "brand-muzopet-activity-esg-pipeline",
    actor: "阿良",
    activityType: "handoff" as const,
    summary:
      "把 FB、蝦皮與 TikTok 的素材發布權與後續追蹤節點整理成可交接的營收路徑。",
    createdAt: "2026-04-21T11:00:00.000Z",
    relatedTaskIds: ["brand-muzopet-task-attribution"],
  },
  {
    id: "brand-muzopet-activity-compliance-note",
    actor: "藝嘉",
    activityType: "review" as const,
    summary:
      "提醒寵物健康宣稱與療效描述都要先升級，客服與內容話術不能混用。",
    createdAt: "2026-04-21T13:15:00.000Z",
    relatedTaskIds: ["brand-muzopet-task-service-routing"],
  },
] as const;

type MuzoTask = {
  activityIds: string[];
  expectedOutcome: string;
  id: string;
  ownerLabel: string;
  revenueSignalIds: string[];
  status: BrandTaskStatus;
  title: string;
};

type MuzoSignal = {
  confidence: RevenueSignal["confidence"];
  id: string;
  label: string;
  nextAction: string;
  type: RevenueSignal["type"];
  value: string;
};

type MuzoActivity = {
  activityType: SeniorMemberActivity["activityType"];
  actorLabel: string;
  createdAt: string;
  id: string;
  relatedTaskIds: string[];
  summary: string;
};

type MuzoWorkspace = {
  activities: MuzoActivity[];
  brand: {
    id: string;
    name: string;
    owner: string;
    positioning: string;
    primaryGoal: string;
    scope: string;
    statusLabel: string;
  };
  brain: {
    audience: string;
    channelRules: readonly string[];
    escalationRules: readonly string[];
    offer: string;
    taboos: readonly string[];
    updatedAt: string;
    voice: string;
  };
  channels: readonly string[];
  directory: ReturnType<typeof buildBrandCardFromContext> | typeof muzoDirectoryFallback;
  focusAreas: readonly {
    detail: string;
    label: string;
  }[];
  signals: MuzoSignal[];
  tasks: MuzoTask[];
};

function getMuzoNextAction(type: RevenueSignal["type"]) {
  switch (type) {
    case "lead":
      return "把 FAQ、猶豫詞典與紅線詞一起管理。";
    case "conversion":
      return "每支內容都要先帶來源標籤，再進歸因流程。";
    case "retention":
      return "先切狗 / 貓、首次 / 回購、沉睡 / 流失三個分群。";
    case "upsell":
      return "把加購 SKU 與會員福利綁在一起。";
  }
}

function userName(userId: string) {
  return users.find((user) => user.id === userId)?.name ?? userId;
}

function safeBuildBrandContexts(): BrandOperatingContext[] {
  return clientBrands.flatMap((brand) => {
    try {
      return [brandOpsStore.getBrandOperatingContext(brand.id)];
    } catch {
      return [];
    }
  });
}

function buildBrandCardFromContext(context: BrandOperatingContext) {
  const isFeatured = context.brand.id === MUZO_BRAND_ID;
  return {
    id: context.brand.id,
    href: `/brands/${context.brand.id}`,
    name: context.brand.name,
    industry: context.brand.industry,
    statusLabel: stageLabels[context.brand.operatingStage],
    statusTone:
      context.brand.operatingStage === "active"
        ? ("reviewed" as const)
        : context.brand.operatingStage === "onboarding"
          ? ("in_progress" as const)
          : ("not_started" as const),
    summary: isFeatured
      ? muzoDirectoryFallback.summary
      : context.brand.positioning,
    goal: isFeatured ? muzoDirectoryFallback.goal : context.brand.primaryGoal,
    badges: isFeatured
      ? [...muzoDirectoryFallback.badges]
      : [
          `${context.assignedMembers.length} 位成員`,
          `${context.tasks.length} 個任務`,
          `${context.revenueSignals.length} 個訊號`,
        ],
    metrics: isFeatured
      ? [...muzoDirectoryFallback.metrics]
      : [
          {
            label: "成員",
            value: `${context.assignedMembers.length} 人`,
            detail: "已指派的工作夥伴",
          },
          {
            label: "任務",
            value: `${context.tasks.length} 個`,
            detail: "品牌工作區可見任務",
          },
          {
            label: "訊號",
            value: `${context.revenueSignals.length} 條`,
            detail: "營收觀察與回購線索",
          },
        ],
    primaryAction: isFeatured ? muzoDirectoryFallback.primaryAction : "進入品牌工作區",
    featured: isFeatured,
  };
}

function getMuzoContext(): BrandOperatingContext | null {
  const brand = clientBrands.find((candidate) => candidate.id === MUZO_BRAND_ID);

  if (!brand) {
    return null;
  }

  try {
    return brandOpsStore.getBrandOperatingContext(MUZO_BRAND_ID);
  } catch {
    return null;
  }
}

function buildMuzoWorkspace() {
  const context = getMuzoContext();
  const tasks: MuzoTask[] = context?.tasks.length
    ? context.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        ownerLabel: userName(task.ownerUserId),
        expectedOutcome: task.expectedOutcome,
        revenueSignalIds: task.revenueSignalIds,
        activityIds: task.seniorMemberActivityIds,
      }))
    : muzoTasksFallback.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        ownerLabel: task.owner,
        expectedOutcome: task.expectedOutcome,
        revenueSignalIds: [...task.revenueSignalIds],
        activityIds: [...task.activityIds],
      }));
  const signals: MuzoSignal[] = context?.revenueSignals.length
    ? context.revenueSignals.map((signal) => ({
        id: signal.id,
        type: signal.type,
        label: signal.label,
        value: signal.value,
        confidence: signal.confidence,
        nextAction: getMuzoNextAction(signal.type),
      }))
    : muzoRevenueSignalsFallback.map((signal) => ({
        id: signal.id,
        type: signal.type,
        label: signal.label,
        value: signal.value,
        confidence: signal.confidence,
        nextAction: signal.nextAction,
      }));
  const activities: MuzoActivity[] = context?.seniorMemberActivities.length
    ? context.seniorMemberActivities.map((activity) => ({
        id: activity.id,
        actorLabel: userName(activity.userId),
        activityType: activity.activityType,
        summary: activity.summary,
        createdAt: activity.createdAt,
        relatedTaskIds: activity.relatedBrandTaskIds,
      }))
    : muzoActivitiesFallback.map((activity) => ({
        id: activity.id,
        actorLabel: activity.actor,
        activityType: activity.activityType,
        summary: activity.summary,
        createdAt: activity.createdAt,
        relatedTaskIds: [...activity.relatedTaskIds],
      }));

  return {
    brand: {
      id: context?.brand.id ?? MUZO_BRAND_ID,
      name: context?.brand.name ?? "木酢寵物達人",
      statusLabel: context
        ? stageLabels[context.brand.operatingStage]
        : muzoDirectoryFallback.statusLabel,
      positioning:
        context?.brand.positioning ??
        "木酢寵物達人 Brand App：把狗貓清潔、會員經營、知識分享與 ESG 企業合作接成獨立工作區。",
      primaryGoal:
        context?.brand.primaryGoal ??
        "把會員喚醒、營收歸因與客服轉單接成可追蹤的營收路徑。",
      owner: "盛發生物科技有限公司 / 陳偉誠",
      scope: "官網 / Facebook / 蝦皮 / LINE / TikTok",
    },
    brain: {
      voice: context?.brain.voice ?? muzoBrainFallback.voice,
      audience: context?.brain.audience ?? muzoBrainFallback.audience,
      offer: context?.brain.offer ?? muzoBrainFallback.offer,
      taboos: context?.brain.taboos ?? [...muzoBrainFallback.taboos],
      channelRules:
        context?.brain.channelRules ?? [...muzoBrainFallback.channelRules],
      escalationRules:
        context?.brain.escalationRules ?? [...muzoBrainFallback.escalationRules],
      updatedAt: context?.brain.updatedAt ?? muzoBrainFallback.updatedAt,
    },
    tasks,
    signals,
    activities,
    focusAreas: [...muzoOperationalFocus],
    channels: [...muzoChannelFocus],
    directory: context ? buildBrandCardFromContext(context) : muzoDirectoryFallback,
  };
}

function formatActivityTime(iso: string) {
  return new Date(iso).toLocaleString("zh-TW", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function GenericBrandWorkspace({ context }: { context: BrandOperatingContext }) {
  return (
    <div className="page-grid">
      <div className="stack">
        <header className="section">
          <div className="section-header">
            <div>
              <div className="eyebrow">Brand App · {context.brand.id}</div>
              <h1>{context.brand.name}</h1>
              <p>{context.brand.positioning}</p>
            </div>
            <span className="badge reviewed">
              {stageLabels[context.brand.operatingStage]}
            </span>
          </div>

          <div className="metric-grid">
            <div className="metric">
              <span className="metric-value">{context.assignedMembers.length}</span>
              <span className="metric-label">指派成員</span>
            </div>
            <div className="metric">
              <span className="metric-value">{context.tasks.length}</span>
              <span className="metric-label">日常任務</span>
            </div>
            <div className="metric">
              <span className="metric-value">{context.revenueSignals.length}</span>
              <span className="metric-label">營收訊號</span>
            </div>
          </div>
        </header>

        <section className="section">
          <div className="section-header">
            <div>
              <div className="eyebrow">Brand Brain</div>
              <h2>品牌腦模組</h2>
              <p>此區只載入 {context.brand.name} 的品牌腦，不與其他品牌共用。</p>
            </div>
          </div>

          <div className="stack">
            <div className="decision-block">
              <h3>定位與受眾</h3>
              <p>{context.brain.audience}</p>
              <p>{context.brain.offer}</p>
            </div>
            <div className="decision-block">
              <h3>語氣規範</h3>
              <p>{context.brain.voice}</p>
            </div>
            <div className="decision-block">
              <h3>禁忌與升級</h3>
              <div className="meta-row">
                {[...context.brain.taboos, ...context.brain.escalationRules].map(
                  (rule) => (
                    <span className="badge" key={rule}>
                      {rule}
                    </span>
                  ),
                )}
              </div>
            </div>
            <div className="decision-block">
              <h3>頻道規則</h3>
              <div className="meta-row">
                {context.brain.channelRules.map((rule) => (
                  <span className="badge" key={rule}>
                    {rule}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <header className="section-header">
            <div>
              <div className="eyebrow">Daily Tasks</div>
              <h2>日常任務</h2>
              <p>任務、營收訊號與資深成員活動都以 brandId 綁定。</p>
            </div>
          </header>
          <div className="card-list">
            {context.tasks.map((task) => {
              const linkedSignals = getRevenueSignalsForBrandTask({
                task,
                revenueSignals: context.revenueSignals,
              });
              const linkedActivities = context.seniorMemberActivities.filter(
                (activity) => task.seniorMemberActivityIds.includes(activity.id),
              );

              return (
                <article className="task-card" key={task.id}>
                  <div className="section-header" style={{ marginBottom: 0 }}>
                    <div>
                      <div className="eyebrow">Owner · {userName(task.ownerUserId)}</div>
                      <h3>{task.title}</h3>
                    </div>
                    <span className={`badge ${task.status}`}>{brandTaskStatusLabels[task.status]}</span>
                  </div>
                  <p>{task.expectedOutcome}</p>
                  <div className="meta-row">
                    {linkedSignals.map((signal) => (
                      <span className="badge submitted" key={signal.id}>
                        {signal.label}
                      </span>
                    ))}
                    {linkedActivities.map((activity) => (
                      <span className="badge" key={activity.id}>
                        {activity.activityType}: {userName(activity.userId)}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="stack">
        <section className="section">
          <div className="eyebrow">Member Assignment</div>
          <h2>成員指派</h2>
          <div className="card-list">
            {context.assignedMembers.map((member) => (
              <div className="brain-card" key={member.id}>
                <div className="section-header" style={{ marginBottom: 0 }}>
                  <div>
                    <h3>{member.name}</h3>
                    <p>{member.title}</p>
                  </div>
                  <span className="badge">{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="eyebrow">Revenue Signals</div>
          <h2>營收訊號</h2>
          <div className="card-list">
            {context.revenueSignals.map((signal) => (
              <div className="brain-card" key={signal.id}>
                <div className="meta-row">
                  <span className="badge submitted">{revenueSignalTypeLabels[signal.type]}</span>
                  <span className="badge">{signal.confidence}</span>
                </div>
                <h3>{signal.label}</h3>
                <p>{signal.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="eyebrow">Senior Activity</div>
          <h2>資深成員活動</h2>
          <div className="trace-list">
            {context.seniorMemberActivities.map((activity) => (
              <div className="trace-row active" key={activity.id}>
                <div className="trace-content">
                  <div className="trace-meta">
                    <span className="trace-label">{userName(activity.userId)}</span>
                    <time className="trace-time">
                      {new Date(activity.createdAt).toLocaleString("zh-TW", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  <p>{activity.summary}</p>
                  <span className="badge" style={{ width: "fit-content" }}>
                    {activity.activityType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

function MuzoBrandWorkspace() {
  const workspace = buildMuzoWorkspace();

  return (
    <div className="brand-app-shell">
      <aside className="brand-app-sidebar">
        <div className="brand-sidebar-card">
          <div className="meta-row" style={{ marginBottom: 12 }}>
            <span className="brand-badge">主品牌</span>
            <span className="badge reviewed">{workspace.brand.statusLabel}</span>
          </div>
          <h2 style={{ marginBottom: 8 }}>{workspace.brand.name}</h2>
          <p>{workspace.brand.positioning}</p>
          <div className="brand-sidebar-note">
            <div className="signal-label">主題範圍</div>
            <p>{workspace.brand.primaryGoal}</p>
          </div>
        </div>

        <nav className="brand-module-nav" aria-label="木酢工作區模組">
          <a href="#brand-brain" className="active">
            品牌腦摘要
          </a>
          <a href="#brand-operations">產品 / 通路重點</a>
          <a href="#brand-tasks">品牌任務</a>
          <a href="#brand-signals">營收訊號</a>
          <a href="#brand-activity">資深成員活動</a>
          <a href="#brand-datasources">數據來源架構</a>
          <a href="#brand-ops">營運寫入</a>
        </nav>

        <div className="brand-sidebar-card">
          <div className="signal-label">品牌腦更新</div>
          <div className="signal-value">已接入</div>
          <p style={{ marginTop: 8 }}>{workspace.brain.voice}</p>
        </div>

        <div className="brand-sidebar-card">
          <div className="signal-label">操作提示</div>
          <div className="brand-workspace-note">
            <p>健康、療效、過敏與獸醫問題先升級。</p>
            <p>會員訊息先分群，再發送。</p>
            <p>歸因欄位要保留 UTM、短鏈與時間窗。</p>
          </div>
        </div>

        <Link className="secondary-button" href="/brands">
          回品牌目錄
        </Link>
      </aside>

      <main className="brand-app-main">
        <header className="brand-hero">
          <div className="brand-hero-copy">
            <div className="eyebrow">Brand App · {workspace.brand.id}</div>
            <h1>{workspace.brand.name}</h1>
            <p>{workspace.brand.positioning}</p>
            <div className="meta-row">
              <span className="badge reviewed">{workspace.brand.statusLabel}</span>
              <span className="badge">{workspace.brand.owner}</span>
              <span className="badge">{workspace.brand.scope}</span>
            </div>
          </div>

          <div className="brand-hero-side">
            <div className="signal-card">
              <div className="signal-label">品牌腦摘要</div>
              <div className="signal-value">1 組</div>
              <p>voice / audience / offer / taboos 已就位，品牌工作區只看這一組。</p>
            </div>
            <div className="signal-card">
              <div className="signal-label">工作入口</div>
              <div className="signal-value">4 類</div>
              <p>任務、營收訊號、資深活動與產品 / 通路重點都在這裡。</p>
            </div>
          </div>
        </header>

        <section className="section" id="brand-brain">
          <div className="section-header">
            <div>
              <div className="eyebrow">Brand Brain</div>
              <h2>品牌腦摘要</h2>
              <p>這裡不是素材庫，是木酢寵物達人能直接操作的決策層。</p>
            </div>
            <span className="badge reviewed">已接入品牌腦</span>
          </div>

          <div className="brand-brain-grid">
            <div className="brain-card">
              <div className="signal-label">語氣</div>
              <p>{workspace.brain.voice}</p>
            </div>
            <div className="brain-card">
              <div className="signal-label">受眾 / 供給</div>
              <p>{workspace.brain.audience}</p>
              <p>{workspace.brain.offer}</p>
            </div>
            <div className="brain-card">
              <div className="signal-label">禁忌與升級</div>
              <div className="brand-chip-grid">
                {workspace.brain.taboos.map((item) => (
                  <span className="badge" key={item}>
                    {item}
                  </span>
                ))}
                {workspace.brain.escalationRules.map((item) => (
                  <span className="badge submitted" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="brain-card">
              <div className="signal-label">頻道規則</div>
              <div className="brand-chip-grid">
                {workspace.brain.channelRules.map((item) => (
                  <span className="badge" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="brand-operations">
          <div className="section-header">
            <div>
              <div className="eyebrow">Operating Footprint</div>
              <h2>產品 / 通路重點</h2>
              <p>木酢官網可見的營運輪廓，直接攤平給 Brand App 使用。</p>
            </div>
            <span className="badge">官網 / FB / 蝦皮 / LINE / 短影音</span>
          </div>

          <div className="brand-focus-grid">
            {workspace.focusAreas.map((focus) => (
              <article className="brand-focus-card" key={focus.label}>
                <h3>{focus.label}</h3>
                <p>{focus.detail}</p>
              </article>
            ))}
          </div>

          <div className="brand-channel-strip">
            {workspace.channels.map((channel) => (
              <span className="badge" key={channel}>
                {channel}
              </span>
            ))}
          </div>
        </section>

        <section className="section" id="brand-tasks">
          <div className="section-header">
            <div>
              <div className="eyebrow">Brand Tasks</div>
              <h2>品牌任務</h2>
              <p>這三件事對應木酢現在最短見金的工作順序。</p>
            </div>
            <span className="badge">3 個可操作任務</span>
          </div>

          <div className="card-list">
            {workspace.tasks.map((task) => {
              const linkedSignals = workspace.signals.filter((signal) =>
                task.revenueSignalIds.includes(signal.id),
              );
              const linkedActivities = workspace.activities.filter((activity) =>
                task.activityIds.includes(activity.id),
              );

              return (
                <article className="task-card" key={task.id}>
                  <div className="section-header" style={{ marginBottom: 0 }}>
                    <div>
                      <div className="eyebrow">Owner · {task.ownerLabel}</div>
                      <h3>{task.title}</h3>
                    </div>
                    <span className={`badge ${task.status}`}>
                      {brandTaskStatusLabels[task.status]}
                    </span>
                  </div>
                  <p>{task.expectedOutcome}</p>
                  <div className="meta-row">
                    {linkedSignals.map((signal) => (
                      <span className="badge submitted" key={signal.id}>
                        {signal.label}
                      </span>
                    ))}
                    {linkedActivities.map((activity) => (
                      <span className="badge" key={activity.id}>
                        {activity.actorLabel}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section" id="brand-signals">
          <div className="section-header">
            <div>
              <div className="eyebrow">Revenue Signals</div>
              <h2>營收訊號</h2>
              <p>這些不是抽象指標，而是會直接影響下一波操作的訊號。</p>
            </div>
            <span className="badge reviewed">已對齊漏斗</span>
          </div>

          <div className="brand-signal-grid">
            {workspace.signals.map((signal) => (
              <article className="signal-card" key={signal.id}>
                <div className="meta-row">
                  <span className="badge submitted">
                    {revenueSignalTypeLabels[signal.type]}
                  </span>
                  <span className="badge">{signal.confidence}</span>
                </div>
                <h3>{signal.label}</h3>
                <p>{signal.value}</p>
                <div className="signal-label">下一步</div>
                <p>{signal.nextAction}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="brand-activity">
          <div className="section-header">
            <div>
              <div className="eyebrow">Senior Activity</div>
              <h2>資深成員活動</h2>
              <p>這是 Brand App 的操作脈絡，不是單純的訊息紀錄。</p>
            </div>
            <span className="badge">最近 3 筆</span>
          </div>

          <div className="brand-activity-list">
            {workspace.activities.map((activity) => (
              <article className="brand-activity-item" key={activity.id}>
                <div className="trace-meta">
                  <span className="trace-label">{activity.actorLabel}</span>
                  <span className="badge">{activityTypeLabels[activity.activityType]}</span>
                  <time className="trace-time">{formatActivityTime(activity.createdAt)}</time>
                </div>
                <p>{activity.summary}</p>
                <div className="meta-row">
                  {activity.relatedTaskIds.map((taskId) => (
                    <span className="badge submitted" key={taskId}>
                      {taskId}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="brand-datasources">
          <div className="section-header">
            <div>
              <div className="eyebrow">Data Architecture</div>
              <h2>數據來源與營收訊號</h2>
              <p>
                目標不是集中展示報表，而是把木酢的數據轉成可操作訊號，讓新人、reviewer 與資深成員回答同一個問題：
                哪些動作正在對木酢的營收產生貢獻？
              </p>
            </div>
            <span className="badge">6 個來源</span>
          </div>

          <div className="brand-focus-grid">
            {muzoDataSources.map((source) => (
              <article className="brand-focus-card" key={source.id}>
                <div className="meta-row" style={{ marginBottom: 8 }}>
                  <span className="badge submitted">{source.signalType}</span>
                </div>
                <h3>{source.label}</h3>
                <div className="signal-label">{source.role}</div>
                <p>{source.data}</p>
                <div className="signal-label" style={{ marginTop: 8 }}>注意</div>
                <p>{source.note}</p>
              </article>
            ))}
          </div>

          <div className="stack" style={{ marginTop: 24, gap: 12 }}>
            <div className="section-header">
              <div>
                <div className="eyebrow">Implementation Phases</div>
                <h3>實作階段</h3>
              </div>
            </div>
            <div className="brand-brain-grid">
              {muzoDataArchitecturePhases.map((phase) => (
                <div className="brain-card" key={phase.phase}>
                  <div className="meta-row" style={{ marginBottom: 8 }}>
                    <span className="badge">{phase.phase}</span>
                    <span className={`badge ${phase.status === "目前階段" ? "reviewed" : ""}`}>
                      {phase.status}
                    </span>
                  </div>
                  <div className="signal-label">{phase.label}</div>
                  <div className="brand-chip-grid" style={{ marginTop: 8 }}>
                    {phase.items.map((item) => (
                      <span className="badge" key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="decision-block" style={{ marginTop: 24 }}>
            <div className="signal-label">第一版驗收標準：平台應該能回答</div>
            <div className="brand-chip-grid" style={{ marginTop: 12 }}>
              {muzoDataQuestions.map((question, i) => (
                <span className="badge" key={question}>
                  {i + 1}. {question}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="brand-ops">
          <BrandOpsPanel
            brandId={workspace.brand.id}
            tasks={workspace.tasks.map((task) => ({
              id: task.id,
              brandId: workspace.brand.id,
              title: task.title,
              status: task.status,
              ownerUserId: task.ownerLabel,
              expectedOutcome: task.expectedOutcome,
              revenueSignalIds: task.revenueSignalIds,
              seniorMemberActivityIds: task.activityIds,
            }))}
          />
        </section>
      </main>
    </div>
  );
}

export function BrandWorkspace({ brandId }: { brandId: string }) {
  if (brandId === MUZO_BRAND_ID) {
    return <MuzoBrandWorkspace />;
  }

  const brand = clientBrands.find((candidate) => candidate.id === brandId);

  if (!brand) {
    notFound();
  }

  let context: BrandOperatingContext;

  try {
    context = brandOpsStore.getBrandOperatingContext(brandId);
  } catch {
    notFound();
  }

  return <GenericBrandWorkspace context={context} />;
}

export function BrandsCommandCenter() {
  const contexts = safeBuildBrandContexts();
  const featuredContext = contexts.find((context) => context.brand.id === MUZO_BRAND_ID);
  const featuredCard = featuredContext
    ? buildBrandCardFromContext(featuredContext)
    : muzoDirectoryFallback;
  const otherCards = contexts
    .filter((context) => context.brand.id !== MUZO_BRAND_ID)
    .map((context) => buildBrandCardFromContext(context));
  const spotlightTaskCount = featuredContext
    ? featuredContext.tasks.length
    : muzoTasksFallback.length;
  const spotlightSignalCount = featuredContext
    ? featuredContext.revenueSignals.length
    : muzoRevenueSignalsFallback.length;
  const spotlightActivityCount = featuredContext
    ? featuredContext.seniorMemberActivities.length
    : muzoActivitiesFallback.length;

  return (
    <div className="stack">
      <header className="command-center-header">
        <div className="eyebrow">2clouds Command Center</div>
        <h1>品牌目錄</h1>
        <p>
          這裡是双云的品牌總覽，不是混在一起的素材牆。木酢寵物達人是主品牌之一，
          直接帶你進入獨立 Brand App 工作區。
        </p>

        <div className="brand-directory-summary">
          <div className="metric">
            <span className="metric-value">主品牌</span>
            <span className="metric-label">木酢寵物達人</span>
          </div>
          <div className="metric">
            <span className="metric-value">{spotlightTaskCount}</span>
            <span className="metric-label">品牌任務</span>
          </div>
          <div className="metric">
            <span className="metric-value">{spotlightSignalCount}</span>
            <span className="metric-label">營收訊號</span>
          </div>
          <div className="metric">
            <span className="metric-value">{spotlightActivityCount}</span>
            <span className="metric-label">資深活動</span>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="section-header">
          <div>
            <div className="eyebrow">主品牌</div>
            <h2>木酢寵物達人</h2>
            <p>這個工作區直接把官網可見營運輪廓、會員路徑與 ESG 合作帶進來。</p>
          </div>
          <span className="badge reviewed">{featuredCard.statusLabel}</span>
        </div>

        <div className="brand-directory-feature">
          <div className="brand-directory-feature-grid">
            <div className="brand-directory-feature-copy">
              <div className="meta-row" style={{ marginBottom: 12 }}>
                {featuredCard.badges.map((badge) => (
                  <span className="brand-badge" key={badge}>
                    {badge}
                  </span>
                ))}
              </div>
              <h3>{featuredCard.name}</h3>
              <p>{featuredCard.summary}</p>
              <p>{featuredCard.goal}</p>
              <div className="meta-row">
                <Link className="button" href={featuredCard.href}>
                  {featuredCard.primaryAction}
                </Link>
                <span className="badge">{featuredCard.industry}</span>
              </div>
            </div>

            <div className="brand-directory-feature-side">
              {featuredCard.metrics.map((metric) => (
                <div className="signal-card" key={metric.label}>
                  <div className="signal-label">{metric.label}</div>
                  <div className="signal-value">{metric.value}</div>
                  <p>{metric.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <div className="eyebrow">Other Workspaces</div>
            <h2>其他品牌工作區</h2>
            <p>如果你要切到別的品牌，這裡的卡片會保留它自己的 context。</p>
          </div>
        </div>

        {otherCards.length > 0 ? (
          <div className="brand-directory-grid">
            {otherCards.map((card) => (
              <Link className="task-card" href={card.href} key={card.id}>
                <div className="section-header" style={{ marginBottom: 0 }}>
                  <div>
                    <div className="eyebrow">{card.industry}</div>
                    <h3>{card.name}</h3>
                  </div>
                  <span className={`badge ${card.statusTone}`}>{card.statusLabel}</span>
                </div>

                <p>{card.summary}</p>
                <p>{card.goal}</p>

                <div className="meta-row">
                  {card.badges.map((badge) => (
                    <span className="badge" key={badge}>
                      {badge}
                    </span>
                  ))}
                </div>

                <div className="brand-directory-metrics">
                  {card.metrics.map((metric) => (
                    <div className="metric" key={metric.label}>
                      <span className="metric-value">{metric.value}</span>
                      <span className="metric-label">{metric.label}</span>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty">目前只有木酢寵物達人和品牌導向的工作入口。</div>
        )}
      </section>
    </div>
  );
}
