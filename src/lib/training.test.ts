import { describe, expect, it } from "vitest";
import {
  applyTaskStatusTransition,
  buildNewcomerDashboard,
  calculateCertificationProgress,
  canTransitionTaskStatus,
  createStatusTraceLog,
} from "./training";

const tasks = [
  {
    id: "task-a",
    title: "A",
    module: "M",
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
    brief: "Brief",
    expectedOutput: "Output",
    recommendedBrainIds: [],
    recommendedKnowledgeNodeIds: [],
    basePoints: 25,
  },
];

describe("training domain logic", () => {
  it("allows forward task status transitions only", () => {
    expect(canTransitionTaskStatus("not_started", "submitted")).toBe(true);
    expect(canTransitionTaskStatus("submitted", "in_progress")).toBe(false);
    expect(canTransitionTaskStatus("submitted", "submitted")).toBe(false);
  });

  it("calculates reviewed progress toward 60 points", () => {
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

  it("creates a trace log for status changes", () => {
    const log = createStatusTraceLog({
      assignmentId: "a1",
      actorId: "u1",
      fromStatus: "not_started",
      toStatus: "in_progress",
      now: new Date("2026-04-30T12:00:00.000Z"),
    });

    expect(log.action).toBe("task_started");
    expect(log.createdAt).toBe("2026-04-30T12:00:00.000Z");
  });

  it("applies a valid transition and emits the trace event for the new status", () => {
    const result = applyTaskStatusTransition({
      assignment: { id: "a1", taskId: "task-a", userId: "u1", status: "not_started" },
      actorId: "u1",
      toStatus: "submitted",
      now: new Date("2026-04-30T12:00:00.000Z"),
    });

    expect(result.assignment.status).toBe("submitted");
    expect(result.traceLog.action).toBe("task_submitted");
    expect(result.traceLog.fromStatus).toBe("not_started");
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
});
