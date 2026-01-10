export interface SheinCategoryNode {
  remoteId: string;
  name: string;
  parentRemoteId?: string | null;
  isLeaf: boolean;
  productTypeRemoteId?: string | null;
  defaultLanguage?: string | null;
  currency?: string | null;
  properties: any[];
}

export const parseCategoryProperties = (value: unknown): any[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (_error) {
      /* ignore malformed JSON */
    }
  }
  return [];
};

export const normalizeCategoryNode = (node: any): SheinCategoryNode => ({
  remoteId: String(node?.remoteId ?? ''),
  name: String(node?.name ?? ''),
  parentRemoteId: node?.parentRemoteId ?? null,
  isLeaf: Boolean(node?.isLeaf),
  productTypeRemoteId: node?.productTypeRemoteId ?? null,
  defaultLanguage: node?.defaultLanguage ?? null,
  currency: node?.currency ?? null,
  properties: parseCategoryProperties(node?.properties ?? node?.configuratorProperties),
});

export const mapCategoriesConnection = (connection: any): SheinCategoryNode[] => {
  if (!connection) return [];
  const list = Array.isArray(connection)
    ? connection
    : connection.edges?.map((edge: any) => edge.node) || [];
  return list.map((item: any) => normalizeCategoryNode(item));
};
