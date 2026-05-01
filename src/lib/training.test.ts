import { describe, expect, it } from "vitest";
import {
  applyTaskStatusTransition,
  buildNewcomerDashboard,
  calculateCertificationProgress,
  canTransitionTaskStatus,
  createStatusTraceLog,
  getAvailableActorTransitions,
} from "./training";

const tasks = [
  {
    id: "task-a",
    title: "A",
    module: "M",
    stage: 1 as const,
    brief: "Brief",
    expectedOutput: "Output",
    recommendedBrainIds: [],
    recommendedKnowledgeNodeIds: [],
    basePoints: 15,
  },
  {
    id: "task-b",
    title: "B",
    module: "M",
    stage: 3 as const,
    brief: "Brief",
    expectedOutput: "Output",
    recommendedBrainIds: [],
    recommendedKnowledgeNodeIds: [],
    basePoints: 25,
  },
];

describe("canTransitionTaskStatus", () => {
  it("allows newcomer forward transitions", () => {
    expect(canTransitionTaskStatus("not_started", "in_progress")).toBe(true);
    expect(canTransitionTaskStatus("in_progress", "submitted")).toBe(true);
  });

  it("allows reviewer transitions from submitted", () => {
    expect(canTransitionTaskStatus("submitted", "reviewed")).toBe(true);
    expect(canTransitionTaskStatus("submitted", "needs_revision")).toBe(true);
  });

  it("allows revision pickup", () => {
    expect(canTransitionTaskStatus("needs_revision", "in_progress")).toBe(true);
  });

  it("blocks skipping states", () => {
    expect(canTransitionTaskStatus("not_started", "submitted")).toBe(false);
    expect(canTransitionTaskStatus("not_started", "reviewed")).toBe(false);
  });

  it("blocks backward transitions", () => {
    expect(canTransitionTaskStatus("submitted", "in_progress")).toBe(false);
    expect(canTransitionTaskStatus("reviewed", "submitted")).toBe(false);
  });
});

describe("getAvailableActorTransitions", () => {
  it("newcomer can start and submit a task", () => {
    expect(getAvailableActorTransitions("not_started", "newcomer")).toEqual(["in_progress"]);
    expect(getAvailableActorTransitions("in_progress", "newcomer")).toEqual(["submitted"]);
  });

  it("newcomer can pick up a revision", () => {
    expect(getAvailableActorTransitions("needs_revision", "newcomer")).toEqual(["in_progress"]);
  });

  it("newcomer cannot act on submitted or reviewed tasks", () => {
    expect(getAvailableActorTransitions("submitted", "newcomer")).toEqual([]);
    expect(getAvailableActorTransitions("reviewed", "newcomer")).toEqual([]);
  });

  it("reviewer can pass or send back a submitted task", () => {
    const transitions = getAvailableActorTransitions("submitted", "reviewer");
    expect(transitions).toContain("reviewed");
    expect(transitions).toContain("needs_revision");
  });

  it("reviewer cannot act on not_started or in_progress tasks", () => {
    expect(getAvailableActorTransitions("not_started", "reviewer")).toEqual([]);
    expect(getAvailableActorTransitions("in_progress", "reviewer")).toEqual([]);
  });
});

describe("calculateCertificationProgress", () => {
  it("counts only reviewed tasks toward official progress", () => {
    const progress = calculateCertificationProgress({
      userId: "u1",
      targetPoints: 60,
      tasks,
      assignments: [
        { id: "a1", taskId: "task-a", userId: "u1", status: "reviewed" },
        { id: "a2", taskId: "task-b", userId: "u1", status: "submitted" },
      ],
    });

    expect(progress.reviewedPoints).toBe(15);
    expect(progress.submittedPoints).toBe(40);
    expect(progress.percent).toBe(25);
  });

  it("excludes needs_revision tasks from submitted points", () => {
    const progress = calculateCertificationProgress({
      userId: "u1",
      targetPoints: 60,
      tasks,
      assignments: [
        { id: "a1", taskId: "task-a", userId: "u1", status: "reviewed" },
        { id: "a2", taskId: "task-b", userId: "u1", status: "needs_revision" },
      ],
    });

    // task-b is needs_revision, not counted in submittedPoints
    expect(progress.reviewedPoints).toBe(15);
    expect(progress.submittedPoints).toBe(15);
    expect(progress.percent).toBe(25);
  });

  it("caps progress at 100%", () => {
    const progress = calculateCertificationProgress({
      userId: "u1",
      targetPoints: 10,
      tasks,
      assignments: [
        { id: "a1", taskId: "task-a", userId: "u1", status: "reviewed" },
        { id: "a2", taskId: "task-b", userId: "u1", status: "reviewed" },
      ],
    });

    expect(progress.percent).toBe(100);
  });
});

describe("createStatusTraceLog", () => {
  it("creates a trace log for status changes", () => {
    const log = createStatusTraceLog({
      assignmentId: "a1",
      actorId: "u1",
      fromStatus: "not_started",
      toStatus: "in_progress",
      now: new Date("2026-04-30T12:00:00.000Z"),
    });

    expect(log.action).toBe("task_started");
    expect(log.fromStatus).toBe("not_started");
    expect(log.toStatus).toBe("in_progress");
    expect(log.createdAt).toBe("2026-04-30T12:00:00.000Z");
  });

  it("applies a valid transition and emits the trace event for the new status", () => {
    const result = applyTaskStatusTransition({
      assignment: { id: "a1", taskId: "task-a", userId: "u1", status: "in_progress" },
      actorId: "u1",
      toStatus: "submitted",
      now: new Date("2026-04-30T12:00:00.000Z"),
    });

    expect(result.assignment.status).toBe("submitted");
    expect(result.traceLog.action).toBe("task_submitted");
    expect(result.traceLog.fromStatus).toBe("in_progress");
    expect(result.traceLog.toStatus).toBe("submitted");
  });

  it("rejects backward or duplicate transitions before creating trace", () => {
    expect(() =>
      applyTaskStatusTransition({
        assignment: { id: "a1", taskId: "task-a", userId: "u1", status: "submitted" },
        actorId: "u1",
        toStatus: "in_progress",
      }),
    ).toThrow("Invalid task status transition");
  });

  it("builds the newcomer dashboard resource from seed-like inputs", () => {
    const dashboard = buildNewcomerDashboard({
      user: { id: "u1", name: "User", role: "newcomer", title: "Trainee" },
      targetPoints: 60,
      tasks,
      assignments: [
        { id: "a1", taskId: "task-a", userId: "u1", status: "reviewed" },
        { id: "a2", taskId: "task-b", userId: "u1", status: "in_progress" },
      ],
      decisionPrompts: [
        {
          taskId: "task-b",
          problemFraming: "Frame the problem.",
          recommendedModel: "Model",
          relatedKnowledgeNodeIds: [],
          suggestedNextStep: "Next step",
          escalationCondition: "Escalate when blocked.",
        },
      ],
      traceLogs: [
        {
          id: "trace-old",
          assignmentId: "a1",
          actorId: "u1",
          action: "review_created",
          createdAt: "2026-04-29T12:00:00.000Z",
        },
        {
          id: "trace-new",
          assignmentId: "a2",
          actorId: "u1",
          action: "task_started",
          createdAt: "2026-04-30T12:00:00.000Z",
        },
      ],
    });

    expect(dashboard.activeTask.id).toBe("task-b");
    expect(dashboard.progress.reviewedPoints).toBe(15);
    expect(dashboard.latestTraceLog?.id).toBe("trace-new");
  });

  it("creates a trace log for needs_revision", () => {
    const log = createStatusTraceLog({
      assignmentId: "a2",
      actorId: "reviewer-01",
      fromStatus: "submitted",
      toStatus: "needs_revision",
      now: new Date("2026-05-01T09:00:00.000Z"),
    });

    expect(log.action).toBe("revision_requested");
    expect(log.toStatus).toBe("needs_revision");
    expect(log.actorId).toBe("reviewer-01");
  });
});
