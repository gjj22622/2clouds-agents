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

export type BrandOperatingStage =
  | "onboarding"
  | "active"
  | "paused"
  | "resumed"
  | "archived";

export type BrandLifecycleEvent = {
  id: string;
  brandId: string;
  fromStage?: BrandOperatingStage;
  toStage: BrandOperatingStage;
  eventType: "created" | "activated" | "paused" | "resumed" | "archived";
  actorId: string;
  occurredAt: string;
  note?: string;
};

export type BrandMemberRole = "newcomer_trainee" | "reviewer" | "lead";

export type BrandMemberAssignmentStatus = "active" | "paused" | "revoked";

export type BrandMemberAssignment = {
  id: string;
  brandId: string;
  memberId: string;
  role: BrandMemberRole;
  status: BrandMemberAssignmentStatus;
  assignedAt: string;
  assignedBy: string;
  validUntil?: string;
};

export type MemberLifecycleEvent = {
  id: string;
  brandId: string;
  memberId: string;
  assignmentId: string;
  fromStatus?: BrandMemberAssignmentStatus;
  toStatus: BrandMemberAssignmentStatus;
  eventType: "assigned" | "paused" | "resumed" | "revoked";
  actorId: string;
  occurredAt: string;
  note?: string;
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
