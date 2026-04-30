import { describe, expect, it } from "vitest";
import {
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

    expect(log.action).toBe("task_status_changed");
    expect(log.createdAt).toBe("2026-04-30T12:00:00.000Z");
  });
});
