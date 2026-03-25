export interface MiraklProductTypeItemNode {
  id: string;
  required: boolean;
  variant: boolean;
  requirementLevel?: string | null;
  remoteProperty: {
    id: string;
    code: string;
    name: string;
    mappedLocally?: boolean;
    localInstance?: {
      id: string;
      name: string;
      type?: string | null;
    } | null;
  } | null;
  localInstance?: {
    id: string;
    type?: string | null;
    sortOrder?: number | null;
    property?: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export interface MiraklProductTypeNode {
  id: string;
  remoteId: string;
  name: string;
  readyToPush: boolean;
  templateUrl?: string | null;
  items: MiraklProductTypeItemNode[];
}

export interface MiraklCategoryNode {
  id: string;
  remoteId: string;
  name: string;
  parentCode?: string | null;
  level: number;
  isLeaf: boolean;
  parent?: {
    id?: string | null;
    remoteId?: string | null;
    name?: string | null;
  } | null;
  productTypes: MiraklProductTypeNode[];
}

export const normalizeMiraklCategoryNode = (node: any): MiraklCategoryNode => ({
  id: String(node?.id ?? ''),
  remoteId: String(node?.remoteId ?? ''),
  name: String(node?.name ?? ''),
  parentCode: node?.parentCode ?? null,
  level: Number(node?.level ?? 0),
  isLeaf: Boolean(node?.isLeaf),
  parent: node?.parent
    ? {
        id: node.parent.id ?? null,
        remoteId: node.parent.remoteId ?? null,
        name: node.parent.name ?? null,
      }
    : null,
  productTypes: Array.isArray(node?.productTypes)
    ? node.productTypes.map((productType: any) => ({
        id: String(productType?.id ?? ''),
        remoteId: String(productType?.remoteId ?? ''),
        name: String(productType?.name ?? ''),
        readyToPush: Boolean(productType?.readyToPush),
        templateUrl: productType?.templateUrl ?? null,
        items: Array.isArray(productType?.items)
          ? productType.items.map((item: any) => ({
              id: String(item?.id ?? ''),
              required: Boolean(item?.required),
              variant: Boolean(item?.variant),
              requirementLevel: item?.requirementLevel ?? null,
              remoteProperty: item?.remoteProperty
                ? {
                    id: String(item.remoteProperty.id ?? ''),
                    code: String(item.remoteProperty.code ?? ''),
                    name: String(item.remoteProperty.name ?? ''),
                    mappedLocally: Boolean(item.remoteProperty.mappedLocally),
                    localInstance: item.remoteProperty.localInstance
                      ? {
                          id: String(item.remoteProperty.localInstance.id ?? ''),
                          name: String(item.remoteProperty.localInstance.name ?? ''),
                          type: item.remoteProperty.localInstance.type ?? null,
                        }
                      : null,
                  }
                : null,
              localInstance: item?.localInstance
                ? {
                    id: String(item.localInstance.id ?? ''),
                    type: item.localInstance.type ?? null,
                    sortOrder: item.localInstance.sortOrder ?? null,
                    property: item.localInstance.property
                      ? {
                          id: String(item.localInstance.property.id ?? ''),
                          name: String(item.localInstance.property.name ?? ''),
                        }
                      : null,
                  }
                : null,
            }))
          : [],
      }))
    : [],
});

export const mapMiraklCategoriesConnection = (connection: any): MiraklCategoryNode[] => {
  if (!connection) return [];
  const list = Array.isArray(connection)
    ? connection
    : connection.edges?.map((edge: any) => edge.node) || [];
  return list.map((item: any) => normalizeMiraklCategoryNode(item));
};
