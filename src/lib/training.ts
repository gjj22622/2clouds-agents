import type {
  CertificationProgress,
  Role,
  TaskStatus,
  TraceLog,
  TrainingTask,
  TrainingTaskAssignment,
} from "./domain";

// All valid task status transitions, independent of actor role.
const VALID_TRANSITIONS = new Set<string>([
  "not_started→in_progress",
  "in_progress→submitted",
  "submitted→reviewed",
  "submitted→needs_revision",
  "needs_revision→in_progress",
]);

export function canTransitionTaskStatus(
  fromStatus: TaskStatus,
  toStatus: TaskStatus,
): boolean {
  return VALID_TRANSITIONS.has(`${fromStatus}→${toStatus}`);
}

// Transitions available to each role. Reviewers act on submitted tasks;
// newcomers move their own tasks forward or pick up revisions.
const ACTOR_TRANSITIONS: Record<Role, Partial<Record<TaskStatus, TaskStatus[]>>> = {
  newcomer: {
    not_started: ["in_progress"],
    in_progress: ["submitted"],
    needs_revision: ["in_progress"],
  },
  reviewer: {
    submitted: ["reviewed", "needs_revision"],
  },
  admin: {
    not_started: ["in_progress"],
    in_progress: ["submitted"],
    submitted: ["reviewed", "needs_revision"],
    needs_revision: ["in_progress", "reviewed"],
  },
};

export function getAvailableActorTransitions(
  status: TaskStatus,
  role: Role,
): TaskStatus[] {
  return ACTOR_TRANSITIONS[role]?.[status] ?? [];
}

export function createStatusTraceLog(params: {
  assignmentId: string;
  actorId: string;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
  now?: Date;
}): TraceLog {
  return {
    id: `trace-${params.assignmentId}-${params.toStatus}-${params.now?.getTime() ?? Date.now()}`,
    assignmentId: params.assignmentId,
    actorId: params.actorId,
    action: "task_status_changed",
    fromStatus: params.fromStatus,
    toStatus: params.toStatus,
    createdAt: (params.now ?? new Date()).toISOString(),
  };
}

export function calculateCertificationProgress(params: {
  userId: string;
  targetPoints: number;
  assignments: TrainingTaskAssignment[];
  tasks: TrainingTask[];
}): CertificationProgress {
  const taskPoints = new Map(params.tasks.map((task) => [task.id, task.basePoints]));
  const userAssignments = params.assignments.filter(
    (assignment) => assignment.userId === params.userId,
  );

  const reviewedPoints = userAssignments
    .filter((assignment) => assignment.status === "reviewed")
    .reduce((sum, assignment) => sum + (taskPoints.get(assignment.taskId) ?? 0), 0);

  // needs_revision is excluded: reviewer rejected the submission, it does not count yet.
  const submittedPoints = userAssignments
    .filter(
      (assignment) =>
        assignment.status === "submitted" || assignment.status === "reviewed",
    )
    .reduce((sum, assignment) => sum + (taskPoints.get(assignment.taskId) ?? 0), 0);

  return {
    userId: params.userId,
    targetPoints: params.targetPoints,
    reviewedPoints,
    submittedPoints,
    percent: Math.min(100, Math.round((reviewedPoints / params.targetPoints) * 100)),
  };
}
