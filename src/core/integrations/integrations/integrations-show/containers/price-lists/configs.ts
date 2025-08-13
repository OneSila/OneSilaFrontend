import { FieldType } from "../../../../../../shared/utils/constants";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import { SearchConfig } from "../../../../../../shared/components/organisms/general-search/searchConfig";
import { FormConfig, FormType } from "../../../../../../shared/components/organisms/general-form/formConfig";
import { salesPriceListsQuery } from "../../../../../../shared/api/queries/salesPrices.js";
import { salesChannelIntegrationPricelistsQuery } from "../../../../../../shared/api/queries/salesChannels.js";
import {
  createSalesChannelIntegrationPricelistMutation,
  deleteSalesChannelIntegrationPricelistMutation,
} from "../../../../../../shared/api/mutations/salesChannels.js";

export const priceListCreateFormConfigConstructor = (
  t: Function,
  type: string,
  salesChannelId: string,
  integrationId: string,
): FormConfig => ({
  cols: 1,
  type: FormType.CREATE,
  mutation: createSalesChannelIntegrationPricelistMutation,
  mutationKey: 'createSalesChannelIntegrationPricelist',
  submitUrl: { name: 'integrations.integrations.show', params: { type: type, id: integrationId }, query: { tab: 'priceLists' } },
  helpSections: [
    {
      header: t('integrations.show.priceLists.helpSection.rules.header'),
      content: t('integrations.show.priceLists.helpSection.rules.content'),
    },
  ],
  fields: [
    {
      type: FieldType.Hidden,
      name: 'salesChannel',
      value: { id: salesChannelId },
    },
    {
      type: FieldType.Query,
      name: 'priceList',
      label: t('sales.priceLists.title'),
      labelBy: 'name',
      valueBy: 'id',
      formMapIdentifier: 'id',
      query: salesPriceListsQuery,
      dataKey: 'salesPriceLists',
      isEdge: true,
      multiple: false,
      filterable: true,
    },
  ],
});

export const priceListsSearchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: 'sort',
  filters: [],
  orders: [],
});

export const priceListsListingConfigConstructor = (t: Function, specificIntegrationId: string): ListingConfig => ({
  headers: [t('shared.labels.name')],
  fields: [
    { name: 'priceList', type: FieldType.NestedText, keys: ['name'] },
  ],
  identifierKey: 'id',
  urlQueryParams: { integrationId: specificIntegrationId },
  addActions: true,
  addEdit: false,
  addShow: false,
  addDelete: true,
  deleteMutation: deleteSalesChannelIntegrationPricelistMutation,
  addPagination: true,
});

export const listingQueryKey = 'salesChannelIntegrationPricelists';
export const listingQuery = salesChannelIntegrationPricelistsQuery;
