import type {
  CertificationProgress,
  DecisionPrompt,
  NewcomerDashboard,
  ReviewDecision,
  ReviewDimension,
  Role,
  TaskStatus,
  TraceLog,
  TrainingTask,
  TrainingTaskAssignment,
  User,
} from "./domain";

const REVIEW_NOTE_DIMENSION_PATTERNS: Record<ReviewDimension, RegExp> = {
  structure: /\bstructure\b|\[structure\]|【structure】|結構|格式|輸出項目/i,
  brand: /\bbrand\b|\[brand\]|【brand】|品牌|語氣|品牌腦/i,
  compliance:
    /\bcompliance\b|\[compliance\]|【compliance】|合規|承諾|敏感|法規|風險詞/i,
};

const REVIEW_NOTE_DIRECTION_PATTERN =
  /建議|請|需要|修改|調整|改為|補上|移除|對照|revise|change|update|add|remove/i;

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

export function getReviewerNoteDimensions(
  reviewerNote: string,
): ReviewDimension[] {
  return Object.entries(REVIEW_NOTE_DIMENSION_PATTERNS)
    .filter(([, pattern]) => pattern.test(reviewerNote))
    .map(([dimension]) => dimension as ReviewDimension);
}

export function validateRevisionReviewerNote(reviewerNote?: string): {
  valid: boolean;
  reasons: string[];
  dimensions: ReviewDimension[];
} {
  const normalizedNote =
    typeof reviewerNote === "string" ? reviewerNote.trim() : "";
  const reasons: string[] = [];

  if (!normalizedNote) {
    return {
      valid: false,
      reasons: ["Revision reviewerNote is required."],
      dimensions: [],
    };
  }

  const dimensions = getReviewerNoteDimensions(normalizedNote);

  if (dimensions.length === 0) {
    reasons.push(
      "Revision reviewerNote must name at least one review dimension: structure, brand, or compliance.",
    );
  }

  if (normalizedNote.length < 24) {
    reasons.push("Revision reviewerNote must describe a concrete issue.");
  }

  if (!REVIEW_NOTE_DIRECTION_PATTERN.test(normalizedNote)) {
    reasons.push("Revision reviewerNote must include an actionable revision direction.");
  }

  return {
    valid: reasons.length === 0,
    reasons,
    dimensions,
  };
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
  needs_revision: "revision_requested",
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

export function applyReviewerReviewDecision(params: {
  assignment: TrainingTaskAssignment;
  reviewerId: string;
  decision: ReviewDecision;
  reviewerNote?: string;
  reviewerScore?: number;
  now?: Date;
}): { assignment: TrainingTaskAssignment; traceLog: TraceLog } {
  if (params.assignment.status !== "submitted") {
    throw new Error(
      `Reviewer can only review submitted assignments, received ${params.assignment.status}`,
    );
  }

  if (
    !getAvailableActorTransitions(params.assignment.status, "reviewer").includes(
      params.decision,
    )
  ) {
    throw new Error(`Invalid reviewer decision ${params.decision}`);
  }

  if (
    params.reviewerScore !== undefined &&
    (params.reviewerScore < 0 || params.reviewerScore > 100)
  ) {
    throw new Error("Reviewer score must be between 0 and 100");
  }

  if (params.decision === "needs_revision") {
    const noteValidation = validateRevisionReviewerNote(params.reviewerNote);

    if (!noteValidation.valid) {
      throw new Error(noteValidation.reasons.join(" "));
    }
  }

  const now = params.now ?? new Date();
  const result = applyTaskStatusTransition({
    assignment: params.assignment,
    actorId: params.reviewerId,
    toStatus: params.decision,
    now,
  });

  return {
    assignment: {
      ...result.assignment,
      reviewerId: params.reviewerId,
      reviewerNote: params.reviewerNote,
      reviewerScore: params.reviewerScore,
      reviewedAt: now.toISOString(),
    },
    traceLog: result.traceLog,
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
    assignments.find(({ assignment }) => assignment.status === "needs_revision") ??
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
