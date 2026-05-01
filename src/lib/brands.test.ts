import { describe, expect, it } from "vitest";
import {
  buildBrandOperatingContext,
  getRevenueSignalsForBrandTask,
} from "./brands";
import {
  brandBrains,
  brandTasks,
  clientBrands,
  currentUser,
  revenueSignals,
  reviewerUser,
  seniorMemberActivities,
} from "./seed";

const users = [currentUser, reviewerUser];

describe("brand operating context", () => {
  it("keeps the demo and MuzoPet brands visible in runtime data", () => {
    expect(clientBrands.map((brand) => brand.id)).toEqual([
      "brand-2clouds-demo",
      "brand-muzopet",
    ]);
  });

  it("builds the operating context for a client brand", () => {
    const context = buildBrandOperatingContext({
      brandId: "brand-2clouds-demo",
      brands: clientBrands,
      brandBrains,
      brandTasks,
      revenueSignals,
      seniorMemberActivities,
      users,
    });

    expect(context.brand.name).toBe("2clouds Demo Brand");
    expect(context.brain.brandId).toBe(context.brand.id);
    expect(context.assignedMembers.map((member) => member.id)).toEqual([
      reviewerUser.id,
      currentUser.id,
    ]);
    expect(context.tasks.length).toBeGreaterThan(0);
    expect(context.revenueSignals.length).toBeGreaterThan(0);
    expect(context.seniorMemberActivities.length).toBeGreaterThan(0);
  });

  it("builds the operating context for brand-muzopet", () => {
    const context = buildBrandOperatingContext({
      brandId: "brand-muzopet",
      brands: clientBrands,
      brandBrains,
      brandTasks,
      revenueSignals,
      seniorMemberActivities,
      users,
    });

    expect(context.brand.name).toBe("木酢寵物達人");
    expect(context.brand.ownerUserId).toBe(reviewerUser.id);
    expect(context.assignedMembers.map((member) => member.id)).toEqual([
      reviewerUser.id,
      currentUser.id,
    ]);
    expect(context.tasks).toHaveLength(3);
    expect(context.revenueSignals).toHaveLength(3);
    expect(context.seniorMemberActivities).toHaveLength(3);
    expect(context.brain.brandId).toBe("brand-muzopet");
  });

  it("links a brand task to its revenue signal", () => {
    const task = brandTasks.find(
      (candidate) => candidate.id === "brand-task-demo-content-angle",
    );

    expect(task).toBeDefined();

    const linkedSignals = getRevenueSignalsForBrandTask({
      task: task!,
      revenueSignals,
    });

    expect(linkedSignals).toHaveLength(1);
    expect(linkedSignals[0]?.id).toBe("signal-demo-qualified-consult");
    expect(linkedSignals[0]?.type).toBe("lead");
  });

  it("rejects an unknown brand id", () => {
    expect(() =>
      buildBrandOperatingContext({
        brandId: "missing-brand",
        brands: clientBrands,
        brandBrains,
        brandTasks,
        revenueSignals,
        seniorMemberActivities,
        users,
      }),
    ).toThrow("Brand missing-brand was not found");
  });

  it("keeps another brand's tasks and revenue signals out of the context", () => {
    const context = buildBrandOperatingContext({
      brandId: "brand-2clouds-demo",
      brands: clientBrands,
      brandBrains,
      brandTasks: [
        ...brandTasks,
        {
          id: "brand-task-other",
          brandId: "brand-other-demo",
          title: "Other brand task",
          status: "queued",
          ownerUserId: currentUser.id,
          expectedOutcome: "This should not appear in the 2clouds demo brand app.",
          revenueSignalIds: ["signal-other"],
          seniorMemberActivityIds: [],
        },
      ],
      revenueSignals: [
        ...revenueSignals,
        {
          id: "signal-other",
          brandId: "brand-other-demo",
          type: "lead",
          label: "Other brand lead",
          value: "This signal belongs to another brand.",
          confidence: "high",
          observedAt: "2026-05-01T13:00:00.000Z",
        },
      ],
      seniorMemberActivities,
      users,
    });

    expect(context.tasks.some((task) => task.brandId !== context.brand.id)).toBe(
      false,
    );
    expect(
      context.revenueSignals.some(
        (signal) => signal.brandId !== context.brand.id,
      ),
    ).toBe(false);
  });
});
