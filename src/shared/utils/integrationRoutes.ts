const nestedIntegrationRouteNames = new Set([
  'integrations.stores.edit',
  'integrations.stores.create',
  'integrations.languages.edit',
  'integrations.currencies.edit',
  'integrations.priceLists.create',
  'integrations.remoteProductTypes.edit',
  'integrations.remoteDocumentTypes.edit',
  'integrations.remoteProperties.edit',
  'integrations.remoteInternalProperties.edit',
  'integrations.remotePropertySelectValues.edit',
  'integrations.amazonDefaultUnitConfigurators.edit',
  'integrations.miraklDefaultUnitConfigurators.edit',
  'integrations.imports.create',
  'integrations.imports.show',
  'integrations.miraklImports.show',
  'integrations.amazonProductIssues.show',
  'integrations.miraklProductIssues.show',
]);

const routeParamToString = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return value[0] ? String(value[0]) : undefined;
  }
  return value === undefined || value === null ? undefined : String(value);
};

export const withIntegrationRouteContext = (
  route: { name?: unknown; params: Record<string, any> },
  name: unknown,
  params: Record<string, any> | undefined,
) => {
  if (typeof name !== 'string' || !nestedIntegrationRouteNames.has(name)) {
    return params;
  }

  const integrationId =
    routeParamToString(params?.integrationId) ||
    routeParamToString(route.params.integrationId) ||
    (route.name === 'integrations.integrations.show' ? routeParamToString(route.params.id) : undefined);
  const type = routeParamToString(params?.type) || routeParamToString(route.params.type);

  return {
    ...(type ? { type } : {}),
    ...(integrationId ? { integrationId } : {}),
    ...(params || {}),
  };
};
