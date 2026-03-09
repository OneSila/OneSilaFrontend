export interface EbayStoreCategoryNode {
  id: string;
  remoteId: string;
  name: string;
  fullPath: string;
  order: number;
  level: number;
  isLeaf: boolean;
  parent?: { id?: string | null; remoteId?: string | null; name?: string | null } | null;
  salesChannel?: { id?: string | null } | null;
}

export const normalizeStoreCategoryNode = (node: any): EbayStoreCategoryNode => ({
  id: String(node?.id ?? ''),
  remoteId: String(node?.remoteId ?? ''),
  name: String(node?.name ?? ''),
  fullPath: String(node?.fullPath ?? `/${String(node?.name ?? '')}`),
  order: Number(node?.order ?? 0),
  level: Number(node?.level ?? 1),
  isLeaf: Boolean(node?.isLeaf),
  parent: node?.parent ?? null,
  salesChannel: node?.salesChannel ?? null,
});

export const mapStoreCategoriesConnection = (connection: any): EbayStoreCategoryNode[] => {
  if (!connection) return [];
  const list = Array.isArray(connection)
    ? connection
    : connection.edges?.map((edge: any) => edge.node) || [];
  return list.map((item: any) => normalizeStoreCategoryNode(item));
};
