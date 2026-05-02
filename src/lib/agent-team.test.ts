import { describe, expect, it } from "vitest";
import {
  buildMuzopetAgentTeamCockpit,
  calculateRevenueGoalProgress,
  getApprovalRolesForRisk,
  getResourceOwnerRole,
  isDailyOperatingReportComplete,
  muzopetRevenueGoal,
} from "./agent-team";
import type { DailyOperatingReport } from "./domain";

describe("calculateRevenueGoalProgress", () => {
  it("calculates current progress, gap, and capped percentage", () => {
    const progress = calculateRevenueGoalProgress(muzopetRevenueGoal);

    expect(progress.targetAmount).toBe(300000);
    expect(progress.currentAmount).toBe(120000);
    expect(progress.gapAmount).toBe(180000);
    expect(progress.percent).toBe(40);
  });

  it("caps progress at 100% when current amount exceeds target", () => {
    const progress = calculateRevenueGoalProgress({
      ...muzopetRevenueGoal,
      currentAmount: 420000,
    });

    expect(progress.gapAmount).toBe(0);
    expect(progress.percent).toBe(100);
  });
});

describe("getApprovalRolesForRisk", () => {
  it("routes low-risk actions to Yijia review", () => {
    expect(
      getApprovalRolesForRisk({
        riskLevel: "low",
        actionType: "edm",
      }),
    ).toEqual(["yijia"]);
  });

  it("routes high-risk actions to Yijia and Jacky", () => {
    expect(
      getApprovalRolesForRisk({
        riskLevel: "high",
        actionType: "line_push",
      }),
    ).toEqual(["yijia", "jacky"]);
  });

  it("routes line frequency and blacklist flags to the correct humans", () => {
    expect(
      getApprovalRolesForRisk({
        riskLevel: "medium",
        actionType: "line_push",
        flags: ["line_frequency_exceeded", "blacklist_check_required"],
      }),
    ).toEqual(["yijia", "jacky", "sophia"]);
  });

  it("routes strategy changes to Jacky and Sophia even when risk is medium", () => {
    expect(
      getApprovalRolesForRisk({
        riskLevel: "medium",
        actionType: "strategy_change",
      }),
    ).toEqual(["yijia", "jacky", "sophia"]);
  });
});

describe("getResourceOwnerRole", () => {
  it("routes customer list access to Sophia", () => {
    expect(getResourceOwnerRole("customer_list")).toBe("sophia");
  });

  it("routes blacklist checks to Yijia", () => {
    expect(getResourceOwnerRole("blacklist_check")).toBe("yijia");
  });

  it("routes connector setup to Zhenghao", () => {
    expect(getResourceOwnerRole("connector_setup")).toBe("zhenghao");
  });
});

describe("isDailyOperatingReportComplete", () => {
  const completeReport = buildMuzopetAgentTeamCockpit().dailyOperatingReport;

  it("requires progress, actions, blockers, resource needs, and next actions", () => {
    expect(isDailyOperatingReportComplete(completeReport)).toBe(true);
  });

  it("rejects reports missing human resource requests", () => {
    const incompleteReport: DailyOperatingReport = {
      ...completeReport,
      resourceNeeds: [],
    };

    expect(isDailyOperatingReportComplete(incompleteReport)).toBe(false);
  });
});

describe("buildMuzopetAgentTeamCockpit", () => {
  it("builds the shared cockpit resource for the UI", () => {
    const cockpit = buildMuzopetAgentTeamCockpit();

    expect(cockpit.revenueGoal.brandId).toBe("brand-muzopet");
    expect(cockpit.agentTeam.agents).toHaveLength(6);
    expect(cockpit.actionProposals).toHaveLength(3);
    expect(cockpit.resourceRequests.map((request) => request.ownerRole)).toEqual([
      "sophia",
      "yijia",
      "zhenghao",
    ]);
    expect(cockpit.dailyOperatingReport.revenueProgress.percent).toBe(40);
  });
});
