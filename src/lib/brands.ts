import type {
  BrandBrain,
  BrandOperatingContext,
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
