import { describe, expect, it } from "vitest";
import {
  buildBrandOperatingContext,
  getRevenueSignalsForBrandTask,
} from "./brands";
import {
  brandBrains,
  brandTasks,
  clientBrands,
  revenueSignals,
  seniorMemberActivities,
} from "./seed";

describe("brand operating context", () => {
  it("builds the operating context for a client brand", () => {
    const context = buildBrandOperatingContext({
      brandId: "brand-2clouds-demo",
      brands: clientBrands,
      brandBrains,
      brandTasks,
      revenueSignals,
      seniorMemberActivities,
    });

    expect(context.brand.name).toBe("2clouds Demo Brand");
    expect(context.brain.brandId).toBe(context.brand.id);
    expect(context.tasks.length).toBeGreaterThan(0);
    expect(context.revenueSignals.length).toBeGreaterThan(0);
    expect(context.seniorMemberActivities.length).toBeGreaterThan(0);
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
      }),
    ).toThrow("Brand missing-brand was not found");
  });
});
