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
