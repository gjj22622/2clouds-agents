import type {
  BrandBrain,
  BrandOperatingContext,
  BrandTask,
  ClientBrand,
  RevenueSignal,
  SeniorMemberActivity,
  User,
} from "./domain";

export function buildBrandOperatingContext(params: {
  brandId: string;
  brands: ClientBrand[];
  brandBrains: BrandBrain[];
  brandTasks: BrandTask[];
  revenueSignals: RevenueSignal[];
  seniorMemberActivities: SeniorMemberActivity[];
  users: User[];
}): BrandOperatingContext {
  const brand = params.brands.find((candidate) => candidate.id === params.brandId);

  if (!brand) {
    throw new Error(`Brand ${params.brandId} was not found`);
  }

  const brain = params.brandBrains.find(
    (candidate) => candidate.brandId === brand.id,
  );

  if (!brain) {
    throw new Error(`Brand brain for ${brand.id} was not found`);
  }

  return {
    brand,
    brain,
    assignedMembers: brand.assignedMemberIds.flatMap((memberId) => {
      const user = params.users.find((candidate) => candidate.id === memberId);
      return user ? [user] : [];
    }),
    tasks: params.brandTasks.filter((task) => task.brandId === brand.id),
    revenueSignals: params.revenueSignals.filter(
      (signal) => signal.brandId === brand.id,
    ),
    seniorMemberActivities: params.seniorMemberActivities.filter(
      (activity) => activity.brandId === brand.id,
    ),
  };
}

export function getRevenueSignalsForBrandTask(params: {
  task: BrandTask;
  revenueSignals: RevenueSignal[];
}): RevenueSignal[] {
  return params.revenueSignals.filter((signal) =>
    params.task.revenueSignalIds.includes(signal.id),
  );
}
