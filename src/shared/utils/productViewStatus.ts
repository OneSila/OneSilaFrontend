export const PRODUCT_VIEW_STATUS = {
  TODO: 'TODO',
  REJECT: 'REJECT',
  ADDED: 'ADDED',
} as const;

export type ProductViewStatus = typeof PRODUCT_VIEW_STATUS[keyof typeof PRODUCT_VIEW_STATUS];

interface ViewReference {
  salesChannelView?: {
    id?: string | null;
  } | null;
}

interface ProductViewStateSource {
  saleschannelviewassignSet?: ViewReference[] | null;
  rejectedsaleschannelviewassignSet?: ViewReference[] | null;
}

export const getProductViewStatus = (
  product: ProductViewStateSource,
  viewId: string,
): ProductViewStatus => {
  const hasAddedAssign = (product.saleschannelviewassignSet ?? []).some(
    (assign) => assign.salesChannelView?.id === viewId,
  );

  if (hasAddedAssign) {
    return PRODUCT_VIEW_STATUS.ADDED;
  }

  const hasRejectedAssign = (product.rejectedsaleschannelviewassignSet ?? []).some(
    (assign) => assign.salesChannelView?.id === viewId,
  );

  if (hasRejectedAssign) {
    return PRODUCT_VIEW_STATUS.REJECT;
  }

  return PRODUCT_VIEW_STATUS.TODO;
};

export const isProductViewRemovalTransition = (
  previousStatus: ProductViewStatus,
  nextStatus: ProductViewStatus,
): boolean => {
  return previousStatus === PRODUCT_VIEW_STATUS.ADDED && nextStatus !== PRODUCT_VIEW_STATUS.ADDED;
};
