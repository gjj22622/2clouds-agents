import type {
  CertificationProgress,
  DecisionPrompt,
  NewcomerDashboard,
  TaskStatus,
  TraceLog,
  TrainingTask,
  TrainingTaskAssignment,
  User,
} from "./domain";

const statusOrder: Record<TaskStatus, number> = {
  not_started: 0,
  in_progress: 1,
  submitted: 2,
  reviewed: 3,
};

export function canTransitionTaskStatus(
  fromStatus: TaskStatus,
  toStatus: TaskStatus,
) {
  return statusOrder[toStatus] > statusOrder[fromStatus];
}

export function createStatusTraceLog(params: {
  assignmentId: string;
  actorId: string;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
  now?: Date;
}): TraceLog {
  const now = params.now ?? new Date();

  return {
    id: `trace-${params.assignmentId}-${params.toStatus}-${now.getTime()}`,
    assignmentId: params.assignmentId,
    actorId: params.actorId,
    action: statusTraceActions[params.toStatus],
    fromStatus: params.fromStatus,
    toStatus: params.toStatus,
    createdAt: now.toISOString(),
  };
}

const statusTraceActions: Record<TaskStatus, string> = {
  not_started: "task_status_reset",
  in_progress: "task_started",
  submitted: "task_submitted",
  reviewed: "review_created",
};

export function applyTaskStatusTransition(params: {
  assignment: TrainingTaskAssignment;
  actorId: string;
  toStatus: TaskStatus;
  now?: Date;
}): { assignment: TrainingTaskAssignment; traceLog: TraceLog } {
  if (!canTransitionTaskStatus(params.assignment.status, params.toStatus)) {
    throw new Error(
      `Invalid task status transition from ${params.assignment.status} to ${params.toStatus}`,
    );
  }

  return {
    assignment: {
      ...params.assignment,
      status: params.toStatus,
    },
    traceLog: createStatusTraceLog({
      assignmentId: params.assignment.id,
      actorId: params.actorId,
      fromStatus: params.assignment.status,
      toStatus: params.toStatus,
      now: params.now,
    }),
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

export function buildNewcomerDashboard(params: {
  user: User;
  targetPoints: number;
  assignments: TrainingTaskAssignment[];
  tasks: TrainingTask[];
  decisionPrompts: DecisionPrompt[];
  traceLogs: TraceLog[];
}): NewcomerDashboard {
  const assignments = params.assignments
    .filter((assignment) => assignment.userId === params.user.id)
    .map((assignment) => {
      const task = params.tasks.find((candidate) => candidate.id === assignment.taskId);

      if (!task) {
        throw new Error(`Missing training task for assignment ${assignment.id}`);
      }

      return { assignment, task };
    });

  const active =
    assignments.find(({ assignment }) => assignment.status === "in_progress") ??
    assignments.find(({ assignment }) => assignment.status === "not_started") ??
    assignments[0];

  if (!active) {
    throw new Error(`No training assignments found for user ${params.user.id}`);
  }

  const decisionPrompt = params.decisionPrompts.find(
    (prompt) => prompt.taskId === active.task.id,
  );

  if (!decisionPrompt) {
    throw new Error(`Missing decision prompt for task ${active.task.id}`);
  }

  const latestTraceLog = params.traceLogs
    .filter((traceLog) =>
      assignments.some(
        ({ assignment }) => assignment.id === traceLog.assignmentId,
      ),
    )
    .toSorted(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    )[0];

  return {
    user: params.user,
    progress: calculateCertificationProgress({
      userId: params.user.id,
      targetPoints: params.targetPoints,
      assignments: params.assignments,
      tasks: params.tasks,
    }),
    assignments,
    activeAssignment: active.assignment,
    activeTask: active.task,
    decisionPrompt,
    latestTraceLog,
  };
}
