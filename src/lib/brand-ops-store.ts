import { randomUUID } from "node:crypto";
import { buildBrandOperatingContext } from "./brands";
import type {
  BrandOperatingContext,
  BrandTask,
  BrandTaskStatus,
  RevenueSignal,
  SeniorMemberActivity,
} from "./domain";
import {
  brandBrains as seedBrandBrains,
  brandTasks as seedBrandTasks,
  clientBrands,
  currentUser,
  revenueSignals as seedRevenueSignals,
  reviewerUser,
  seniorMemberActivities as seedSeniorMemberActivities,
} from "./seed";

const users = [currentUser, reviewerUser];

export class BrandOpsError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BrandOpsError";
    this.status = status;
  }
}

export type BrandTaskOperation =
  | {
      kind: "task_status";
      taskId: string;
      status: BrandTaskStatus;
      note?: string;
    }
  | {
      kind: "task_note";
      taskId: string;
      note: string;
    }
  | {
      kind: "revenue_signal";
      taskId?: string;
      type: RevenueSignal["type"];
      label: string;
      value: string;
      confidence: RevenueSignal["confidence"];
    };

export type BrandOperationResult = {
  context: BrandOperatingContext;
  activity?: SeniorMemberActivity;
  revenueSignal?: RevenueSignal;
  task?: BrandTask;
};

type BrandOpsState = {
  brandTasks: BrandTask[];
  revenueSignals: RevenueSignal[];
  seniorMemberActivities: SeniorMemberActivity[];
};

function cloneTask(task: BrandTask): BrandTask {
  return {
    ...task,
    revenueSignalIds: [...task.revenueSignalIds],
    seniorMemberActivityIds: [...task.seniorMemberActivityIds],
  };
}

function cloneRevenueSignal(signal: RevenueSignal): RevenueSignal {
  return { ...signal };
}

function cloneActivity(activity: SeniorMemberActivity): SeniorMemberActivity {
  return {
    ...activity,
    relatedBrandTaskIds: [...activity.relatedBrandTaskIds],
  };
}

function createInitialState(): BrandOpsState {
  return {
    brandTasks: seedBrandTasks.map(cloneTask),
    revenueSignals: seedRevenueSignals.map(cloneRevenueSignal),
    seniorMemberActivities: seedSeniorMemberActivities.map(cloneActivity),
  };
}

function createActivity(params: {
  brandId: string;
  userId: string;
  activityType: SeniorMemberActivity["activityType"];
  summary: string;
  relatedBrandTaskIds: string[];
}): SeniorMemberActivity {
  return {
    id: `activity-${randomUUID()}`,
    brandId: params.brandId,
    userId: params.userId,
    activityType: params.activityType,
    summary: params.summary,
    relatedBrandTaskIds: [...params.relatedBrandTaskIds],
    createdAt: new Date().toISOString(),
  };
}

function assertBrandExists(brandId: string): void {
  const brand = clientBrands.find((candidate) => candidate.id === brandId);

  if (!brand) {
    throw new BrandOpsError(`Brand ${brandId} was not found`, 404);
  }

  const brandBrain = seedBrandBrains.find(
    (candidate) => candidate.brandId === brandId,
  );

  if (!brandBrain) {
    throw new BrandOpsError(`Brand brain for ${brandId} was not found`, 404);
  }
}

function assertText(
  value: unknown,
  fieldName: string,
  options: { maxLength?: number } = {},
): string {
  if (typeof value !== "string") {
    throw new BrandOpsError(`${fieldName} must be a string`, 400);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new BrandOpsError(`${fieldName} is required`, 400);
  }

  if (options.maxLength && trimmed.length > options.maxLength) {
    throw new BrandOpsError(
      `${fieldName} must be at most ${options.maxLength} characters`,
      400,
    );
  }

  return trimmed;
}

function assertTaskForBrand(state: BrandOpsState, brandId: string, taskId: string) {
  const task = state.brandTasks.find((candidate) => candidate.id === taskId);

  if (!task) {
    throw new BrandOpsError(`Task ${taskId} was not found`, 404);
  }

  if (task.brandId !== brandId) {
    throw new BrandOpsError(
      `Task ${taskId} does not belong to brand ${brandId}`,
      404,
    );
  }

  return task;
}

function buildContext(state: BrandOpsState, brandId: string) {
  return buildBrandOperatingContext({
    brandId,
    brands: clientBrands,
    brandBrains: seedBrandBrains,
    brandTasks: state.brandTasks,
    revenueSignals: state.revenueSignals,
    seniorMemberActivities: state.seniorMemberActivities,
    users,
  });
}

function statusActivityType(status: BrandTaskStatus): SeniorMemberActivity["activityType"] {
  return status === "reviewing" || status === "done" ? "review" : "handoff";
}

export type BrandOpsStore = {
  getBrandOperatingContext(brandId: string): BrandOperatingContext;
  applyBrandOperation(
    brandId: string,
    operation: BrandTaskOperation,
  ): BrandOperationResult;
};

export function createBrandOpsStore(): BrandOpsStore {
  const state = createInitialState();

  return {
    getBrandOperatingContext(brandId: string) {
      assertBrandExists(brandId);
      return buildContext(state, brandId);
    },
    applyBrandOperation(brandId, operation) {
      assertBrandExists(brandId);

      if (!operation || typeof operation !== "object") {
        throw new BrandOpsError("Operation body is required", 400);
      }

      switch (operation.kind) {
        case "task_status": {
          const task = assertTaskForBrand(
            state,
            brandId,
            assertText(operation.taskId, "taskId"),
          );
          const nextStatus = operation.status;
          const previousStatus = task.status;

          task.status = nextStatus;

          const note =
            operation.note && operation.note.trim().length > 0
              ? ` Note: ${assertText(operation.note, "note", {
                  maxLength: 500,
                })}`
              : "";

          const activity = createActivity({
            brandId,
            userId: currentUser.id,
            activityType: statusActivityType(nextStatus),
            summary: `Task status changed: ${previousStatus} → ${nextStatus}.${note}`,
            relatedBrandTaskIds: [task.id],
          });

          state.seniorMemberActivities.unshift(activity);
          task.seniorMemberActivityIds.unshift(activity.id);

          return {
            context: buildContext(state, brandId),
            activity,
            task,
          };
        }
        case "task_note": {
          const task = assertTaskForBrand(
            state,
            brandId,
            assertText(operation.taskId, "taskId"),
          );
          const note = assertText(operation.note, "note", { maxLength: 500 });

          const activity = createActivity({
            brandId,
            userId: currentUser.id,
            activityType: "note",
            summary: note,
            relatedBrandTaskIds: [task.id],
          });

          state.seniorMemberActivities.unshift(activity);
          task.seniorMemberActivityIds.unshift(activity.id);

          return {
            context: buildContext(state, brandId),
            activity,
            task,
          };
        }
        case "revenue_signal": {
          const task =
            operation.taskId && operation.taskId.trim().length > 0
              ? assertTaskForBrand(
                  state,
                  brandId,
                  assertText(operation.taskId, "taskId"),
                )
              : undefined;

          const revenueSignal: RevenueSignal = {
            id: `signal-${randomUUID()}`,
            brandId,
            type: operation.type,
            label: assertText(operation.label, "label", { maxLength: 120 }),
            value: assertText(operation.value, "value", { maxLength: 500 }),
            confidence: operation.confidence,
            observedAt: new Date().toISOString(),
          };

          state.revenueSignals.unshift(revenueSignal);

          if (task && !task.revenueSignalIds.includes(revenueSignal.id)) {
            task.revenueSignalIds.unshift(revenueSignal.id);
          }

          return {
            context: buildContext(state, brandId),
            revenueSignal,
            task,
          };
        }
        default:
          throw new BrandOpsError("Unsupported operation kind", 400);
      }
    },
  };
}

export const brandOpsStore = createBrandOpsStore();
