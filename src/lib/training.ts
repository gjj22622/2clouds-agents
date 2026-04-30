import type {
  CertificationProgress,
  TaskStatus,
  TraceLog,
  TrainingTask,
  TrainingTaskAssignment,
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
  return statusOrder[toStatus] >= statusOrder[fromStatus];
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
