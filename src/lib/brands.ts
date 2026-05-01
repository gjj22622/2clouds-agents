import type {
  BrandBrain,
  BrandMemberAssignment,
  BrandOperatingContext,
  BrandOperatingStage,
  BrandDataSource,
  BrandNormalizedMetric,
  BrandRawImport,
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
  dataSources: BrandDataSource[];
  memberAssignments: BrandMemberAssignment[];
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

  const memberAssignments = getActiveBrandMemberAssignments({
    brandId: brand.id,
    memberAssignments: params.memberAssignments,
  });

  return {
    brand,
    brain,
    memberAssignments,
    assignedMembers: memberAssignments.flatMap((assignment) => {
      const memberId = assignment.memberId;
      const user = params.users.find((candidate) => candidate.id === memberId);
      return user ? [user] : [];
    }),
    dataSources: getBrandDataSourceRegistry({
      brandId: brand.id,
      dataSources: params.dataSources,
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

export function shouldShowBrandInCommandCenter(brand: {
  operatingStage: BrandOperatingStage;
}): boolean {
  return brand.operatingStage !== "archived";
}

export function canEnterBrandApp(params: {
  brand: { id: string; operatingStage: BrandOperatingStage };
  memberId: string;
  memberAssignments: BrandMemberAssignment[];
  isAdmin?: boolean;
}): boolean {
  if (params.brand.operatingStage === "archived") {
    return false;
  }

  if (params.isAdmin) {
    return true;
  }

  return params.memberAssignments.some(
    (assignment) =>
      assignment.brandId === params.brand.id &&
      assignment.memberId === params.memberId &&
      assignment.status === "active",
  );
}

export function shouldEnableBrandConnector(brand: {
  operatingStage: BrandOperatingStage;
}): boolean {
  return brand.operatingStage === "active" || brand.operatingStage === "resumed";
}

export function getActiveBrandMemberAssignments(params: {
  brandId: string;
  memberAssignments: BrandMemberAssignment[];
}): BrandMemberAssignment[] {
  return params.memberAssignments.filter(
    (assignment) =>
      assignment.brandId === params.brandId && assignment.status === "active",
  );
}

export function getBrandDataSourceRegistry(params: {
  brandId: string;
  dataSources: BrandDataSource[];
}): BrandDataSource[] {
  return params.dataSources.filter(
    (dataSource) => dataSource.brandId === params.brandId,
  );
}

export function getNormalizedMetricsForDataSource(params: {
  dataSource: BrandDataSource;
  rawImports: BrandRawImport[];
  normalizedMetrics: BrandNormalizedMetric[];
}): BrandNormalizedMetric[] {
  const rawImportIds = new Set(
    params.rawImports
      .filter(
        (rawImport) =>
          rawImport.brandId === params.dataSource.brandId &&
          rawImport.dataSourceId === params.dataSource.id,
      )
      .map((rawImport) => rawImport.id),
  );

  return params.normalizedMetrics.filter(
    (metric) =>
      metric.brandId === params.dataSource.brandId &&
      metric.dataSourceId === params.dataSource.id &&
      (!metric.rawImportId || rawImportIds.has(metric.rawImportId)),
  );
}

export function getRevenueSignalsForBrandTask(params: {
  task: BrandTask;
  revenueSignals: RevenueSignal[];
}): RevenueSignal[] {
  return params.revenueSignals.filter((signal) =>
    params.task.revenueSignalIds.includes(signal.id),
  );
}
