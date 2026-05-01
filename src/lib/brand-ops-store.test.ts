import { describe, expect, it } from "vitest";
import { createBrandOpsStore } from "./brand-ops-store";

describe("brand ops store", () => {
  it("updates a demo brand task status and records the activity on the task", () => {
    const store = createBrandOpsStore();

    const result = store.applyBrandOperation("brand-2clouds-demo", {
      kind: "task_status",
      taskId: "brand-task-demo-proof-note",
      status: "reviewing",
      note: "Ready for reviewer review.",
    });

    expect(result.task?.status).toBe("reviewing");
    expect(result.activity?.activityType).toBe("review");
    expect(result.activity?.summary).toContain("queued → reviewing");

    const context = store.getBrandOperatingContext("brand-2clouds-demo");
    const task = context.tasks.find(
      (candidate) => candidate.id === "brand-task-demo-proof-note",
    );

    expect(task?.status).toBe("reviewing");
    expect(task?.seniorMemberActivityIds[0]).toBe(result.activity?.id);
    expect(context.seniorMemberActivities[0]?.id).toBe(result.activity?.id);
  });

  it("writes a task note as a traceable activity", () => {
    const store = createBrandOpsStore();

    const result = store.applyBrandOperation("brand-2clouds-demo", {
      kind: "task_note",
      taskId: "brand-task-demo-content-angle",
      note: "補上 demo brand 的 CTA 版本。",
    });

    expect(result.activity?.activityType).toBe("note");
    expect(result.activity?.summary).toBe("補上 demo brand 的 CTA 版本。");

    const context = store.getBrandOperatingContext("brand-2clouds-demo");
    const task = context.tasks.find(
      (candidate) => candidate.id === "brand-task-demo-content-angle",
    );

    expect(task?.seniorMemberActivityIds[0]).toBe(result.activity?.id);
    expect(context.seniorMemberActivities[0]?.activityType).toBe("note");
  });

  it("adds a revenue signal and blocks cross-brand task ids", () => {
    const store = createBrandOpsStore();

    const result = store.applyBrandOperation("brand-2clouds-demo", {
      kind: "revenue_signal",
      taskId: "brand-task-demo-proof-note",
      type: "upsell",
      label: "Demo upsell signal",
      value: "The demo brand has a new upsell signal tied to a proof note.",
      confidence: "medium",
    });

    expect(result.revenueSignal?.brandId).toBe("brand-2clouds-demo");
    expect(result.revenueSignal?.type).toBe("upsell");

    const context = store.getBrandOperatingContext("brand-2clouds-demo");
    const task = context.tasks.find(
      (candidate) => candidate.id === "brand-task-demo-proof-note",
    );

    expect(task?.revenueSignalIds[0]).toBe(result.revenueSignal?.id);
    expect(context.revenueSignals[0]?.id).toBe(result.revenueSignal?.id);

    expect(() =>
      store.applyBrandOperation("brand-2clouds-demo", {
        kind: "task_note",
        taskId: "brand-task-other",
        note: "Should not be accepted.",
      }),
    ).toThrow("was not found");
  });
});
