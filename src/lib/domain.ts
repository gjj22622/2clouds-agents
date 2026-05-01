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
  operatingStage: "onboarding" | "active" | "paused";
  positioning: string;
  primaryGoal: string;
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
  assignedMembers: User[];
  tasks: BrandTask[];
  revenueSignals: RevenueSignal[];
  seniorMemberActivities: SeniorMemberActivity[];
};
