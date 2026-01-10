export interface EbayCategoryNode {
  remoteId: string;
  name: string;
  fullName?: string | null;
  hasChildren: boolean;
  parentNode?: { remoteId?: string | null } | null;
  configuratorProperties: string[];
}

const parseConfiguratorProperties = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string');
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === 'string');
      }
    } catch (_error) {
      /* ignore malformed JSON */
    }
  }
  return [];
};

export const normalizeCategoryNode = (node: any): EbayCategoryNode => ({
  remoteId: node?.remoteId ?? '',
  name: node?.name ?? '',
  fullName: node?.fullName ?? null,
  hasChildren: Boolean(node?.hasChildren),
  parentNode: node?.parentNode ?? null,
  configuratorProperties: parseConfiguratorProperties(node?.configuratorProperties),
});

export const mapCategoriesConnection = (connection: any): EbayCategoryNode[] => {
  if (!connection) return [];
  const list = Array.isArray(connection)
    ? connection
    : connection.edges?.map((edge: any) => edge.node) || [];
  return list.map((item: any) => normalizeCategoryNode(item));
};
