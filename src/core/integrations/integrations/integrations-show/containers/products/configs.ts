import { FieldType } from "../../../../../../shared/utils/constants";
import { salesChannelViewAssignsQuery, salesChannelViewsQuery } from "../../../../../../shared/api/queries/salesChannels.js";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import { SearchConfig } from "../../../../../../shared/components/organisms/general-search/searchConfig";
import { deleteSalesChannelViewAssignMutation } from "../../../../../../shared/api/mutations/salesChannels.js";

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
      name: 'NOT',
      label: t('integrations.show.products.labels.excludeStores'),
      labelBy: 'name',
      valueBy: 'id',
      query: salesChannelViewsQuery,
      dataKey: 'salesChannelViews',
      isEdge: true,
      multiple: true,
      filterable: true,
      removable: true,
      addLookup: true,
      lookupKeys: ['salesChannelView', 'id'],
      lookupType: 'inList',
      queryVariables: { filter: { salesChannel: { id: { exact: salesChannelId } } } },
    },
  ],
  orders: [],
});

export const productsListingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
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
