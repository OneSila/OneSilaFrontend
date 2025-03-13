import { FieldType } from "../../../../../../shared/utils/constants";
import { getSalesChannelViewQuery, salesChannelViewsQuery } from "../../../../../../shared/api/queries/salesChannels.js";
import { updateSalesChannelViewMutation } from "../../../../../../shared/api/mutations/salesChannels.js";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import {FormConfig, FormType} from '../../../../../../shared/components/organisms/general-form/formConfig';
import {SearchConfig} from "../../../../../../shared/components/organisms/general-search/searchConfig";

export const storeEditFormConfigConstructor = (
  t: Function,
  type: string,
  storeId: string,
  integrationId: string,
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updateSalesChannelViewMutation,
  mutationKey: "updateSalesChannelView",
  query: getSalesChannelViewQuery,
  queryVariables: { id: storeId },
  queryDataKey: 'salesChannelView',
  submitUrl: { name: 'integrations.integrations.show', params: { type: type, id: integrationId }, query: { tab: 'stores' } },
  fields: [
    {
      type: FieldType.Hidden,
      name: 'id',
      value: storeId
    },
    {
      type: FieldType.Text,
      name: 'name',
      label: t('shared.labels.name'),
      placeholder: t('shared.placeholders.name'),
      number: false,
    },
    {
      type: FieldType.Text,
      name: 'url',
      label: t('shared.labels.url'),
      number: false,
    },
    {
      type: FieldType.Boolean,
      strict: false,
      name: 'active',
      label: t('shared.labels.active')
    }
  ]
});

export const storesSearchConfigConstructor = (t: Function): SearchConfig  => ({
  search: true,
  orderKey: "sort",
  filters: [
    {
      type: FieldType.Boolean,
      addLookup: true,
      strict: true,
      name: 'active',
      label: t('shared.labels.active')
    }
  ],
  orders: []
});

export const storesListingConfigConstructor = (t: Function, specificIntegrationId): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('shared.labels.active')
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'active', type: FieldType.Boolean }
  ],
  identifierKey: 'id',
  urlQueryParams: {integrationId: specificIntegrationId },
  editUrlName: 'integrations.stores.edit',
  showUrlName: 'integrations.stores.edit',
  secondIdentifierKey: 'type',
  secondIdentifierParam: 'type',
  addActions: true,
  addEdit: true,
  addShow: true,
  addDelete: false,
  addPagination: true,
});

export const listingQueryKey = 'salesChannelViews';
export const listingQuery = salesChannelViewsQuery;
