import type {
  ActionProposal,
  AgentTeam,
  AgentTeamCockpit,
  ApprovalRole,
  DailyOperatingReport,
  ResourceRequest,
  RevenueGoal,
  RevenueGoalProgress,
  RiskLevel,
} from "./domain";

export const muzopetRevenueGoal: RevenueGoal = {
  id: "goal-muzopet-2026-05",
  brandId: "brand-muzopet",
  title: "木酢 5 月營收目標",
  targetAmount: 300000,
  currentAmount: 120000,
  currency: "twd",
  periodStart: "2026-05-01",
  periodEnd: "2026-05-31",
  status: "active",
  createdBy: "user-jacky",
  createdAt: "2026-05-02T09:12:00.000Z",
};

export const muzopetAgentTeam: AgentTeam = {
  id: "agent-team-muzopet-revenue-ops",
  brandId: "brand-muzopet",
  goalId: muzopetRevenueGoal.id,
  operatingMode: "supervised",
  approvalPolicy:
    "Low-risk actions can proceed after reviewer approval; medical, pricing, list, frequency, and strategy risks require human gates.",
  agents: [
    {
      id: "agent-revenue-commander",
      role: "revenue_commander",
      name: "Revenue Commander",
      status: "running",
      todayTask: "監控營收缺口並動態調整策略優先序",
    },
    {
      id: "agent-member-reactivation",
      role: "member_reactivation",
      name: "Member Reactivation",
      status: "needs_approval",
      todayTask: "沉睡戶 LINE 喚醒方案待藝嘉審核文案",
    },
    {
      id: "agent-content-offer",
      role: "content_offer",
      name: "Content & Offer",
      status: "ready",
      todayTask: "準備春夏外出防蚊組合加購草稿",
    },
    {
      id: "agent-compliance-brand",
      role: "compliance_brand_reviewer",
      name: "Compliance & Brand",
      status: "blocked",
      todayTask: "防蚊適用對象場景混用，等待人工分類建議",
    },
    {
      id: "agent-data-attribution",
      role: "data_attribution",
      name: "Data Attribution",
      status: "running",
      todayTask: "昨日 GMV 歸因計算中，不可歸因率 12%",
    },
    {
      id: "agent-resource-request",
      role: "resource_request",
      name: "Resource Request",
      status: "ready",
      todayTask: "彙整並發送名單授權與 GA4 標籤請求",
    },
  ],
};

export const muzopetActionProposals: ActionProposal[] = [
  {
    id: "ap-muz-001",
    brandId: "brand-muzopet",
    goalId: muzopetRevenueGoal.id,
    proposedByAgentId: "agent-member-reactivation",
    title: "沉睡戶 LINE OA 家庭場景喚醒波次",
    actionType: "line_push",
    expectedRevenueImpact: 72000,
    riskLevel: "medium",
    requiredApprovalRoles: ["yijia", "jacky"],
    status: "pending_compliance_review",
  },
  {
    id: "ap-muz-002",
    brandId: "brand-muzopet",
    goalId: muzopetRevenueGoal.id,
    proposedByAgentId: "agent-member-reactivation",
    title: "高頻戶 LINE 春夏外出防蚊加購組合",
    actionType: "line_push",
    expectedRevenueImpact: 32000,
    riskLevel: "high",
    requiredApprovalRoles: ["yijia", "jacky"],
    status: "flagged",
    blockerReason: "防蚊商品適用對象需要人工確認。",
  },
  {
    id: "ap-muz-003",
    brandId: "brand-muzopet",
    goalId: muzopetRevenueGoal.id,
    proposedByAgentId: "agent-member-reactivation",
    title: "流失戶 EDM 木酢森林循環故事喚醒",
    actionType: "edm",
    expectedRevenueImpact: 16000,
    riskLevel: "low",
    requiredApprovalRoles: ["yijia"],
    status: "pending_approval",
  },
];

export const muzopetResourceRequests: ResourceRequest[] = [
  {
    id: "rr-muz-001",
    brandId: "brand-muzopet",
    goalId: muzopetRevenueGoal.id,
    requestedByAgentId: "agent-resource-request",
    resourceType: "customer_list",
    title: "名單授權確認",
    reason: "確認陳總是否已授權 20 萬會員分群名單。",
    blockerLevel: "high",
    ownerRole: "sophia",
    status: "pending",
    dueAt: "2026-05-04",
  },
  {
    id: "rr-muz-002",
    brandId: "brand-muzopet",
    goalId: muzopetRevenueGoal.id,
    requestedByAgentId: "agent-resource-request",
    resourceType: "blacklist_check",
    title: "黑名單核對",
    reason: "沉睡戶名單發送前需排除退訂戶與毛孩過世戶。",
    blockerLevel: "high",
    ownerRole: "yijia",
    status: "pending",
    dueAt: "2026-05-03",
  },
  {
    id: "rr-muz-003",
    brandId: "brand-muzopet",
    goalId: muzopetRevenueGoal.id,
    requestedByAgentId: "agent-data-attribution",
    resourceType: "connector_setup",
    title: "GA4 事件標籤確認",
    reason: "確認官網加購與購買事件觸發，避免歸因報告信心度過低。",
    blockerLevel: "medium",
    ownerRole: "zhenghao",
    status: "in_progress",
    dueAt: "2026-05-05",
  },
];

export function calculateRevenueGoalProgress(
  goal: RevenueGoal,
): RevenueGoalProgress {
  return {
    goalId: goal.id,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    gapAmount: Math.max(0, goal.targetAmount - goal.currentAmount),
    percent:
      goal.targetAmount <= 0
        ? 0
        : Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)),
  };
}

export function getApprovalRolesForRisk(params: {
  riskLevel: RiskLevel;
  actionType: ActionProposal["actionType"];
  flags?: Array<
    | "line_frequency_exceeded"
    | "medical_claim"
    | "price_commitment"
    | "strategy_change"
    | "blacklist_check_required"
  >;
}): ApprovalRole[] {
  const roles = new Set<ApprovalRole>();

  if (params.riskLevel === "low" || params.riskLevel === "medium") {
    roles.add("yijia");
  }

  if (params.riskLevel === "high" || params.riskLevel === "blocked") {
    roles.add("yijia");
    roles.add("jacky");
  }

  if (params.actionType === "strategy_change") {
    roles.add("jacky");
    roles.add("sophia");
  }

  for (const flag of params.flags ?? []) {
    if (
      flag === "line_frequency_exceeded" ||
      flag === "medical_claim" ||
      flag === "price_commitment" ||
      flag === "strategy_change"
    ) {
      roles.add("jacky");
    }

    if (flag === "blacklist_check_required") {
      roles.add("yijia");
      roles.add("sophia");
    }
  }

  return [...roles];
}

export function getResourceOwnerRole(
  resourceType: ResourceRequest["resourceType"],
): ApprovalRole {
  const ownerByResourceType: Record<ResourceRequest["resourceType"], ApprovalRole> = {
    customer_list: "sophia",
    blacklist_check: "yijia",
    connector_setup: "zhenghao",
    content_asset: "sophia",
    client_approval: "sophia",
  };

  return ownerByResourceType[resourceType];
}

export function isDailyOperatingReportComplete(
  report: DailyOperatingReport,
): boolean {
  return (
    report.actionsTaken.length > 0 &&
    report.blockers.length > 0 &&
    report.resourceNeeds.length > 0 &&
    report.nextActions.length > 0 &&
    report.revenueProgress.targetAmount > 0
  );
}

export function buildMuzopetDailyOperatingReport(): DailyOperatingReport {
  const revenueProgress = calculateRevenueGoalProgress(muzopetRevenueGoal);

  return {
    id: "report-muzopet-2026-05-02",
    brandId: "brand-muzopet",
    goalId: muzopetRevenueGoal.id,
    date: "2026-05-02",
    revenueProgress,
    actionsTaken: [
      "月度營收目標已設定：+300,000 TWD，進度計算中",
      "完成 3 個 ActionProposal 產出，目前 2 個進入合規掃描",
      "自動計算沉睡戶分群（約 8,000 人），完成 LINE 文案草稿 A",
    ],
    blockers: [
      "ap-muz-002 防蚊場景適用對象不明，Compliance Agent 已攔截",
      "會員喚醒計畫因「名單黑名單」尚未核對，暫緩執行發送",
    ],
    resourceNeeds: [
      "Sophia：陳總會員名單存取授權（截止 5/4）",
      "藝嘉：防蚊文案適用對象標注確認（截止 5/3）",
    ],
    nextActions: [
      "完成 ap-muz-001 的 LINE 細部排版指引",
      "等 Sophia 資源到位後解鎖發送計畫",
      "更新昨日 GMV 累計進度儀表板",
    ],
  };
}

export function buildMuzopetAgentTeamCockpit(): AgentTeamCockpit {
  return {
    revenueGoal: muzopetRevenueGoal,
    progress: calculateRevenueGoalProgress(muzopetRevenueGoal),
    agentTeam: muzopetAgentTeam,
    actionProposals: muzopetActionProposals,
    resourceRequests: muzopetResourceRequests,
    dailyOperatingReport: buildMuzopetDailyOperatingReport(),
  };
}
