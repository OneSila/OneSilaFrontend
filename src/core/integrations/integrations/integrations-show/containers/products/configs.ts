import { FieldType } from "../../../../../../shared/utils/constants";
import { salesChannelViewAssignsQuery, salesChannelViewsQuery } from "../../../../../../shared/api/queries/salesChannels.js";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import { SearchConfig } from "../../../../../../shared/components/organisms/general-search/searchConfig";
import { deleteSalesChannelViewAssignMutation } from "../../../../../../shared/api/mutations/salesChannels.js";
import { getProductTypeBadgeMap } from "../../../../../products/products/configs";

const getStatusBadgeMap = (t: Function) => ({
  completed: { text: t('shared.labels.completed'), color: 'green' },
  failed: { text: t('shared.labels.failed'), color: 'red' },
  processing: { text: t('shared.labels.processing'), color: 'yellow' },
});

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
      query: salesChannelViewsQuery,
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
      query: salesChannelViewsQuery,
      dataKey: 'salesChannelViews',
      isEdge: true,
      multiple: false,
      filterable: true,
      removable: true,
      addLookup: true,
      lookupKeys: ['salesChannelView', 'id'],
      lookupType: 'exact',
      queryVariables: { filter: { salesChannel: { id: { exact: salesChannelId } } } },
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
      accessor: (node) => {
        if (node.remoteProduct?.hasErrors) {
          return 'failed';
        }
        if (node.remoteProductPercentage === 100) {
          return 'completed';
        }
        return 'processing';
      },
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
});

export const listingQuery = salesChannelViewAssignsQuery;
export const listingQueryKey = 'salesChannelViewAssigns';
