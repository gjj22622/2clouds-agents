export type Role = "newcomer" | "reviewer" | "admin";

export type TaskStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "needs_revision"
  | "reviewed";

export type User = {
  id: string;
  name: string;
  role: Role;
  title: string;
};

export type BrainType = "jacky" | "member" | "brand" | "method";

export type Brain = {
  id: string;
  name: string;
  type: BrainType;
  owner: string;
  summary: string;
  coverage: string[];
};

export type KnowledgeNode = {
  id: string;
  title: string;
  domain: string;
  summary: string;
  source: string;
};

export type TrainingTask = {
  id: string;
  title: string;
  module: string;
  stage: 1 | 2 | 3 | 4 | 5 | 6;
  brief: string;
  expectedOutput: string;
  recommendedBrainIds: string[];
  recommendedKnowledgeNodeIds: string[];
  basePoints: number;
};

export type TrainingTaskAssignment = {
  id: string;
  taskId: string;
  userId: string;
  status: TaskStatus;
  reviewerNote?: string;
  reviewerScore?: number;
  reviewerId?: string;
  reviewedAt?: string;
};

export type ReviewDecision = "reviewed" | "needs_revision";

export type ReviewDimension = "structure" | "brand" | "compliance";

export type DecisionPrompt = {
  taskId: string;
  problemFraming: string;
  recommendedModel: string;
  relatedKnowledgeNodeIds: string[];
  suggestedNextStep: string;
  escalationCondition: string;
};

export type TraceLog = {
  id: string;
  assignmentId: string;
  actorId: string;
  action: string;
  fromStatus?: TaskStatus;
  toStatus?: TaskStatus;
  createdAt: string;
};

export type CertificationProgress = {
  userId: string;
  targetPoints: number;
  reviewedPoints: number;
  submittedPoints: number;
  percent: number;
};

export type TrainingTaskAssignmentSummary = {
  assignment: TrainingTaskAssignment;
  task: TrainingTask;
};

export type NewcomerDashboard = {
  user: User;
  progress: CertificationProgress;
  assignments: TrainingTaskAssignmentSummary[];
  activeAssignment: TrainingTaskAssignment;
  activeTask: TrainingTask;
  decisionPrompt: DecisionPrompt;
  latestTraceLog?: TraceLog;
};

export type BrandOperatingStage =
  | "onboarding"
  | "active"
  | "paused"
  | "resumed"
  | "archived";

export type ClientBrand = {
  id: string;
  name: string;
  industry: string;
  ownerUserId: string;
  assignedMemberIds: string[];
  operatingStage: BrandOperatingStage;
  positioning: string;
  primaryGoal: string;
};

// ─── Brand & Member Lifecycle ─────────────────────────────────────────────────

export type BrandMemberAssignmentStatus =
  | "invited"      // 已指派但尚未完成品牌速查卡
  | "active"       // 正常工作中
  | "paused"       // 暫停（例如請假），任務已轉派
  | "offboarded"   // 已離開平台，指派記錄保留
  | "reassigned"   // 此指派已結束，任務移轉給他人（成員仍在平台）
  | "reactivated"  // 從 paused 恢復工作
  | "revoked";     // 舊版撤權狀態，保留給既有測試與遷移

export type BrandMemberRole =
  | "newcomer_trainee"  // 新人，只看自己的任務
  | "reviewer"          // 品管員，看全品牌任務
  | "lead";             // 資深成員，可建立任務與訊號

export type BrandMemberAssignment = {
  id: string;
  brandId: string;
  memberId: string;
  role: BrandMemberRole;
  status: BrandMemberAssignmentStatus;
  assignedAt: string;
  assignedBy: string;
  validUntil?: string;
  pausedAt?: string;
  pausedReason?: string;
  resumedAt?: string;
  offboardedAt?: string;
  offboardedReason?: string;
  reassignedTo?: string;    // 任務轉派對象 userId
  updatedAt?: string;
};

export type BrandLifecycleEvent = {
  id: string;
  brandId: string;
  fromStage: BrandOperatingStage | null;  // null = 品牌初建
  toStage: BrandOperatingStage;
  eventType: "created" | "activated" | "paused" | "resumed" | "archived";
  actorId: string;
  reason?: string;
  note?: string;
  createdAt?: string;
  occurredAt?: string;
};

export type MemberLifecycleEvent = {
  id: string;
  brandId: string;
  memberId: string;
  assignmentId: string;
  fromStatus: BrandMemberAssignmentStatus | null;
  toStatus: BrandMemberAssignmentStatus;
  eventType:
    | "assigned"
    | "paused"
    | "resumed"
    | "revoked"
    | "offboarded"
    | "reassigned"
    | "reactivated";
  actorId: string;
  createdAt?: string;
  occurredAt?: string;
  note?: string;
  reason?: string;
  taskReassignments?: Array<{ taskId: string; newOwnerId: string }>;
};

export type BrandBrain = {
  id: string;
  brandId: string;
  voice: string;
  audience: string;
  offer: string;
  taboos: string[];
  channelRules: string[];
  escalationRules: string[];
  updatedAt: string;
};

export type BrandTaskStatus = "queued" | "in_progress" | "reviewing" | "done";

export type BrandTask = {
  id: string;
  brandId: string;
  title: string;
  status: BrandTaskStatus;
  ownerUserId: string;
  expectedOutcome: string;
  revenueSignalIds: string[];
  seniorMemberActivityIds: string[];
};

export type RevenueSignal = {
  id: string;
  brandId: string;
  type: "lead" | "conversion" | "retention" | "upsell";
  label: string;
  value: string;
  confidence: "low" | "medium" | "high";
  observedAt: string;
};

export type BrandDataSourceSystem =
  | "website"
  | "shopee"
  | "ga4"
  | "meta_ads"
  | "google_ads"
  | "line";

export type BrandDataSource = {
  id: string;
  brandId: string;
  system: BrandDataSourceSystem;
  name: string;
  role: "transaction_truth" | "marketplace_sales" | "behavior" | "ad_spend" | "member_reactivation";
  status: "mock_ready" | "manual_import_ready" | "needs_setup" | "paused";
  lastSyncedAt?: string;
  trustLevel: "low" | "medium" | "high";
  notes: string;
};

export type BrandRawImport = {
  id: string;
  brandId: string;
  dataSourceId: string;
  importedAt: string;
  payloadKind: "orders" | "events" | "campaign_spend" | "members" | "summary" | "sheet_summary";
  recordCount: number;
  status: "received" | "normalized" | "rejected";
  importMethod?: "manual" | "google_sheets" | "api";
  connectorId?: string;
};

export type BrandNormalizedMetric = {
  id: string;
  brandId: string;
  dataSourceId: string;
  rawImportId?: string;
  metricKey: "gmv" | "orders" | "sessions" | "spend" | "clicks" | "roas" | "line_clicks";
  value: number;
  unit: "twd" | "count" | "ratio";
  occurredAt: string;
  confidence: RevenueSignal["confidence"];
};

export type SeniorMemberActivity = {
  id: string;
  brandId: string;
  userId: string;
  activityType: "strategy" | "review" | "client_contact" | "handoff" | "note";
  summary: string;
  relatedBrandTaskIds: string[];
  createdAt: string;
};

export type BrandOperatingContext = {
  brand: ClientBrand;
  brain: BrandBrain;
  memberAssignments: BrandMemberAssignment[];
  assignedMembers: User[];
  dataSources: BrandDataSource[];
  tasks: BrandTask[];
  revenueSignals: RevenueSignal[];
  seniorMemberActivities: SeniorMemberActivity[];
};

// ─── Brand Revenue Operating Agent Team ───────────────────────────────────────

export type RevenueGoalStatus = "draft" | "active" | "paused" | "completed";

export type RevenueGoal = {
  id: string;
  brandId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  currency: "twd";
  periodStart: string;
  periodEnd: string;
  status: RevenueGoalStatus;
  createdBy: string;
  createdAt: string;
};

export type RevenueGoalProgress = {
  goalId: string;
  targetAmount: number;
  currentAmount: number;
  gapAmount: number;
  percent: number;
};

export type AgentTeamOperatingMode = "mock" | "supervised" | "autonomous";

export type AgentStatus = "running" | "ready" | "blocked" | "needs_approval";

export type AgentTeamRole =
  | "revenue_commander"
  | "member_reactivation"
  | "content_offer"
  | "compliance_brand_reviewer"
  | "data_attribution"
  | "resource_request";

export type AgentTeamMember = {
  id: string;
  role: AgentTeamRole;
  name: string;
  status: AgentStatus;
  todayTask: string;
};

export type AgentTeam = {
  id: string;
  brandId: string;
  goalId: string;
  operatingMode: AgentTeamOperatingMode;
  agents: AgentTeamMember[];
  approvalPolicy: string;
};

export type AgentRunStatus =
  | "queued"
  | "running"
  | "completed"
  | "blocked"
  | "needs_approval";

export type AgentRun = {
  id: string;
  brandId: string;
  goalId: string;
  agentId: string;
  status: AgentRunStatus;
  input: string;
  output: string;
  proposedActionIds: string[];
  requiredResourceRequestIds: string[];
  createdAt: string;
};

export type RiskLevel = "low" | "medium" | "high" | "blocked";

export type ApprovalRole = "yijia" | "jacky" | "sophia" | "zhenghao";

export type ActionProposalStatus =
  | "draft"
  | "pending_compliance_review"
  | "flagged"
  | "blocked"
  | "pending_approval"
  | "approved"
  | "rejected";

export type ActionProposal = {
  id: string;
  brandId: string;
  goalId: string;
  proposedByAgentId: string;
  title: string;
  actionType:
    | "line_push"
    | "edm"
    | "shopee_message"
    | "content_post"
    | "strategy_change"
    | "data_report";
  expectedRevenueImpact: number;
  riskLevel: RiskLevel;
  requiredApprovalRoles: ApprovalRole[];
  status: ActionProposalStatus;
  blockerReason?: string;
};

export type ResourceRequestStatus =
  | "pending"
  | "in_progress"
  | "blocked"
  | "overdue"
  | "completed"
  | "completed_denied";

export type ResourceRequest = {
  id: string;
  brandId: string;
  goalId: string;
  requestedByAgentId: string;
  resourceType:
    | "customer_list"
    | "blacklist_check"
    | "connector_setup"
    | "content_asset"
    | "client_approval";
  title: string;
  reason: string;
  blockerLevel: "low" | "medium" | "high";
  ownerRole: ApprovalRole;
  status: ResourceRequestStatus;
  dueAt?: string;
};

export type DailyOperatingReport = {
  id: string;
  brandId: string;
  goalId: string;
  date: string;
  revenueProgress: RevenueGoalProgress;
  actionsTaken: string[];
  blockers: string[];
  resourceNeeds: string[];
  nextActions: string[];
};

export type AgentTeamCockpit = {
  revenueGoal: RevenueGoal;
  progress: RevenueGoalProgress;
  agentTeam: AgentTeam;
  actionProposals: ActionProposal[];
  resourceRequests: ResourceRequest[];
  dailyOperatingReport: DailyOperatingReport;
};

// ─── Google Sheets Connector ──────────────────────────────────────────────────

export type BrandSheetFieldMapping = {
  column: string;
  platformField: string;
  unit?: BrandNormalizedMetric["unit"];
  required: boolean;
  notes?: string;
};

export type BrandSheetReadTabKind =
  | "daily_summary"
  | "orders"
  | "campaign_spend"
  | "line_report"
  | "shopee_report"
  | "custom";

export type BrandSheetWritebackKind =
  | "task_status"
  | "revenue_signal"
  | "reviewer_note"
  | "trace_log"
  | "daily_summary";

export type BrandSheetReadConfig = {
  id: string;
  tabName: string;
  tabKind: BrandSheetReadTabKind;
  dataSourceId: string;
  headerRow: number;
  dataStartRow: number;
  fieldMapping: BrandSheetFieldMapping[];
  triggerKind: "manual" | "scheduled";
  lastReadAt?: string;
};

export type BrandSheetWritebackConfig = {
  id: string;
  tabName: string;
  writebackKind: BrandSheetWritebackKind;
  headerRow: number;
  dataStartRow: number;
  fieldMapping: BrandSheetFieldMapping[];
  triggerKind: "manual" | "on_review" | "daily";
  requiresReviewerApproval: boolean;
};

export type BrandSheetConnector = {
  id: string;
  brandId: string;
  sheetId: string;
  label: string;
  status: "active" | "paused" | "needs_setup";
  readConfigs: BrandSheetReadConfig[];
  writebackConfigs: BrandSheetWritebackConfig[];
  createdAt: string;
  updatedAt: string;
};

export type BrandSheetSyncLog = {
  id: string;
  brandId: string;
  connectorId: string;
  readConfigId?: string;
  writebackConfigId?: string;
  direction: "read" | "writeback";
  status: "success" | "partial" | "failed" | "pending_review";
  recordsProcessed: number;
  recordsRejected: number;
  requiresReviewerAction: boolean;
  reviewerNote?: string;
  createdAt: string;
};
