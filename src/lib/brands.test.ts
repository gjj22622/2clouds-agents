import { describe, expect, it } from "vitest";
import {
  buildBrandOperatingContext,
  canEnterBrandApp,
  getBrandDataSourceRegistry,
  getNormalizedMetricsForDataSource,
  getRevenueSignalsForBrandTask,
  shouldEnableBrandConnector,
  shouldShowBrandInCommandCenter,
} from "./brands";
import {
  brandBrains,
  brandDataSources,
  brandMemberAssignments,
  brandNormalizedMetrics,
  brandRawImports,
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
      dataSources: brandDataSources,
      memberAssignments: brandMemberAssignments,
      users,
    });

    expect(context.brand.name).toBe("2clouds Demo Brand");
    expect(context.brain.brandId).toBe(context.brand.id);
    expect(context.assignedMembers.map((member) => member.id)).toEqual([
      reviewerUser.id,
      currentUser.id,
    ]);
    expect(
      context.memberAssignments.every(
        (assignment) => assignment.status === "active",
      ),
    ).toBe(true);
    expect(context.tasks.length).toBeGreaterThan(0);
    expect(context.dataSources).toHaveLength(0);
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
      dataSources: brandDataSources,
      memberAssignments: brandMemberAssignments,
      users,
    });

    expect(context.brand.name).toBe("木酢寵物達人");
    expect(context.brand.ownerUserId).toBe(reviewerUser.id);
    expect(context.assignedMembers.map((member) => member.id)).toEqual([
      reviewerUser.id,
      currentUser.id,
    ]);
    expect(context.tasks).toHaveLength(3);
    expect(context.dataSources.map((source) => source.system)).toEqual([
      "website",
      "shopee",
      "ga4",
      "meta_ads",
      "google_ads",
      "line",
    ]);
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
        dataSources: brandDataSources,
        memberAssignments: brandMemberAssignments,
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
      dataSources: brandDataSources,
      memberAssignments: brandMemberAssignments,
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

  it("returns the MuzoPet data source registry with sync status and trust", () => {
    const registry = getBrandDataSourceRegistry({
      brandId: "brand-muzopet",
      dataSources: brandDataSources,
    });

    expect(registry).toHaveLength(6);
    expect(registry.map((source) => source.name)).toEqual([
      "官網銷售",
      "蝦皮銷售",
      "Google Analytics 4",
      "Meta Ads",
      "Google Ads",
      "LINE Ads / LINE OA",
    ]);
    expect(registry.every((source) => source.lastSyncedAt)).toBe(true);
    expect(registry.find((source) => source.system === "website")?.trustLevel).toBe(
      "high",
    );
  });

  it("links normalized metrics to their raw import and data source", () => {
    const websiteSource = brandDataSources.find(
      (source) => source.id === "datasource-muzopet-website",
    );

    expect(websiteSource).toBeDefined();

    const metrics = getNormalizedMetricsForDataSource({
      dataSource: websiteSource!,
      rawImports: brandRawImports,
      normalizedMetrics: brandNormalizedMetrics,
    });

    expect(metrics).toHaveLength(1);
    expect(metrics[0]?.metricKey).toBe("gmv");
    expect(metrics[0]?.rawImportId).toBe(
      "raw-muzopet-website-orders-2026-05-01",
    );
  });

  it("evaluates brand lifecycle visibility and connector activation", () => {
    expect(
      shouldShowBrandInCommandCenter({ operatingStage: "active" }),
    ).toBe(true);
    expect(
      shouldShowBrandInCommandCenter({ operatingStage: "paused" }),
    ).toBe(true);
    expect(
      shouldShowBrandInCommandCenter({ operatingStage: "archived" }),
    ).toBe(false);

    expect(shouldEnableBrandConnector({ operatingStage: "active" })).toBe(true);
    expect(shouldEnableBrandConnector({ operatingStage: "resumed" })).toBe(true);
    expect(shouldEnableBrandConnector({ operatingStage: "paused" })).toBe(false);
    expect(shouldEnableBrandConnector({ operatingStage: "archived" })).toBe(false);
  });

  it("requires active member assignment before entering a Brand App", () => {
    const brand = clientBrands.find((candidate) => candidate.id === "brand-muzopet");

    expect(brand).toBeDefined();
    expect(
      canEnterBrandApp({
        brand: brand!,
        memberId: currentUser.id,
        memberAssignments: brandMemberAssignments,
      }),
    ).toBe(true);
    expect(
      canEnterBrandApp({
        brand: brand!,
        memberId: "unassigned-user",
        memberAssignments: brandMemberAssignments,
      }),
    ).toBe(false);
    expect(
      canEnterBrandApp({
        brand: { id: "brand-muzopet", operatingStage: "archived" },
        memberId: currentUser.id,
        memberAssignments: brandMemberAssignments,
        isAdmin: true,
      }),
    ).toBe(false);
    expect(
      canEnterBrandApp({
        brand: { id: "brand-other-demo", operatingStage: "active" },
        memberId: currentUser.id,
        memberAssignments: brandMemberAssignments,
      }),
    ).toBe(false);
  });
});
