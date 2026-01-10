import { FieldType } from "../../../../../../shared/utils/constants";
import { salesChannelViewAssignsQuery, salesChannelViewsQuerySelector } from "../../../../../../shared/api/queries/salesChannels.js";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import { SearchConfig } from "../../../../../../shared/components/organisms/general-search/searchConfig";
import {
  deleteSalesChannelViewAssignMutation,
  deleteSalesChannelViewAssignsMutation
} from "../../../../../../shared/api/mutations/salesChannels.js";
import { getProductTypeBadgeMap } from "../../../../../products/products/configs";
import {deletePropertiesMutation} from "../../../../../../shared/api/mutations/properties";

const getStatusBadgeMap = (t: Function) => ({
  completed: { text: t('shared.labels.completed'), color: 'green' },
  COMPLETED: { text: t('shared.labels.completed'), color: 'green' },
  failed: { text: t('shared.labels.failed'), color: 'red' },
  FAILED: { text: t('shared.labels.failed'), color: 'red' },
  processing: { text: t('shared.labels.processing'), color: 'yellow' },
  PROCESSING: { text: t('shared.labels.processing'), color: 'yellow' },
  PENDING_CREATION: { text: t('shared.labels.pendingCreation'), color: 'blue' },
  PARTIALLY_LISTED: { text: t('integrations.show.products.statuses.partiallyListed'), color: 'orange' },
  PENDING_APPROVAL: { text: t('integrations.show.products.statuses.pendingApproval'), color: 'yellow' },
  APPROVAL_REJECTED: { text: t('integrations.show.products.statuses.approvalRejected'), color: 'red' },
});

const getAssignStatus = (node: any) => {
  if (node.status === 'PENDING_CREATION') {
    if (node.remoteProduct?.status === 'FAILED') {
      return 'FAILED';
    }
    return 'PENDING_CREATION';
  }
  if (node.remoteProduct?.status) {
    return node.remoteProduct.status;
  }
  if (node.remoteProduct?.hasErrors) {
    return 'FAILED';
  }
  if (node.remoteProductPercentage === 100) {
    return 'COMPLETED';
  }
  return 'PROCESSING';
};

export const productsSearchConfigConstructor = (t: Function, salesChannelId: string): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    {
      type: FieldType.Query,
      name: 'salesChannelView',
      label: t('integrations.show.products.labels.store'),
      labelBy: 'name',
      valueBy: 'id',
      query: salesChannelViewsQuerySelector,
      dataKey: 'salesChannelViews',
      isEdge: true,
      multiple: true,
      filterable: true,
      removable: true,
      addLookup: true,
      lookupKeys: ['id'],
      lookupType: 'inList',
      queryVariables: { filter: { salesChannel: { id: { exact: salesChannelId } } } },
    },
    {
      type: FieldType.Query,
      name: 'notSalesChannelView',
      isNot: true,
      label: t('integrations.show.products.labels.excludeStores'),
      labelBy: 'name',
      valueBy: 'id',
      query: salesChannelViewsQuerySelector,
      dataKey: 'salesChannelViews',
      isEdge: true,
      multiple: false,
      filterable: true,
      removable: true,
      addLookup: true,
      filterKey: 'salesChannelView',
      lookupKeys: ['id'],
      lookupType: 'exact',
      queryVariables: { filter: { salesChannel: { id: { exact: salesChannelId } } } },
    },
    {
      type: FieldType.Choice,
      name: 'status',
      label: t('shared.labels.status'),
      labelBy: 'label',
      valueBy: 'value',
      options: [
        { label: t('shared.labels.completed'), value: 'completed' },
        { label: t('shared.labels.processing'), value: 'processing' },
        { label: t('shared.labels.failed'), value: 'failed' },
        { label: t('shared.labels.pendingCreation'), value: 'PENDING_CREATION' },
        { label: t('integrations.show.products.statuses.partiallyListed'), value: 'PARTIALLY_LISTED' },
        { label: t('integrations.show.products.statuses.pendingApproval'), value: 'PENDING_APPROVAL' },
        { label: t('integrations.show.products.statuses.approvalRejected'), value: 'APPROVAL_REJECTED' },
      ],
      removable: true,
    },
  ],
  orders: [],
});

export const productsListingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('products.products.labels.type.title'),
    t('shared.labels.active'),
    t('shared.labels.status'),
    t('shared.labels.sku'),
    t('integrations.show.products.labels.store'),
  ],
  fields: [
    {
      name: 'product',
      type: FieldType.NestedText,
      keys: ['name'],
      clickable: true,
      clickUrl: { name: 'products.products.show' },
      clickIdentifiers: [{ id: ['id'] }],
    },
    {
      name: 'product.type',
      type: FieldType.Badge,
      badgeMap: getProductTypeBadgeMap(t),
    },
    {
      name: 'product.active',
      type: FieldType.Boolean,
    },
    {
      name: 'status',
      type: FieldType.Badge,
      badgeMap: getStatusBadgeMap(t),
      accessor: (node) => getAssignStatus(node),
    },
    {
      name: 'product',
      type: FieldType.NestedText,
      keys: ['sku'],
    },
    {
      name: 'salesChannelView',
      type: FieldType.NestedText,
      keys: ['name'],
    },
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: false,
  addShow: false,
  addDelete: true,
  deleteMutation: deleteSalesChannelViewAssignMutation,
  addPagination: true,
  addBulkActions: true,
  addBulkDelete: true,
  bulkDeleteMutation: deleteSalesChannelViewAssignsMutation,
});

export const listingQuery = salesChannelViewAssignsQuery;
export const listingQueryKey = 'salesChannelViewAssigns';
