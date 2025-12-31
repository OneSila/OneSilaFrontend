import { FieldType } from "../../../../../../shared/utils/constants";
import {
  getSalesChannelViewQuery,
  salesChannelViewsQuery,
  amazonChannelViewsQuery,
  getAmazonChannelViewQuery,
  ebayChannelViewsQuery,
  getEbaySalesChannelViewQuery,
  sheinChannelViewsQuery,
} from "../../../../../../shared/api/queries/salesChannels.js";
import {
  updateSalesChannelViewMutation,
  updateAmazonSalesChannelViewMutation,
  updateEbaySalesChannelViewMutation,
} from "../../../../../../shared/api/mutations/salesChannels.js";
import { IntegrationTypes } from "../../../integrations";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import { ShowField } from "../../../../../../shared/components/organisms/general-show/showConfig";
import {FormConfig, FormType, FormField} from '../../../../../../shared/components/organisms/general-form/formConfig';
import {SearchConfig} from "../../../../../../shared/components/organisms/general-search/searchConfig";

export const storeEditFormConfigConstructor = (
  t: Function,
  type: string,
  storeId: string,
  integrationId: string,
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation:
    type === IntegrationTypes.Amazon
      ? updateAmazonSalesChannelViewMutation
      : type === IntegrationTypes.Ebay
        ? updateEbaySalesChannelViewMutation
        : updateSalesChannelViewMutation,
  mutationKey:
    type === IntegrationTypes.Amazon
      ? 'updateAmazonSalesChannelView'
      : type === IntegrationTypes.Ebay
        ? 'updateEbaySalesChannelView'
        : 'updateSalesChannelView',
  query:
    type === IntegrationTypes.Amazon
      ? getAmazonChannelViewQuery
      : type === IntegrationTypes.Ebay
        ? getEbaySalesChannelViewQuery
        : getSalesChannelViewQuery,
  queryVariables: { id: storeId },
  queryDataKey:
    type === IntegrationTypes.Amazon
      ? 'amazonChannelView'
      : type === IntegrationTypes.Ebay
        ? 'ebaySalesChannelView'
        : 'salesChannelView',
  submitUrl: { name: 'integrations.integrations.show', params: { type: type, id: integrationId }, query: { tab: 'stores' } },
  fields: (() => {
    const baseFields: FormField[] = [
      {
        type: FieldType.Hidden,
        name: 'id',
        value: storeId,
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
    ];

    if (type === IntegrationTypes.Amazon || type === IntegrationTypes.Ebay) {
      baseFields.push({
        type: FieldType.Checkbox,
        name: 'isDefault',
        label: t('integrations.show.stores.labels.isDefault'),
        uncheckedValue: 'false',
        default: false,
        optional: true,
      });
    }

    return baseFields;
  })(),
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

export const storesListingConfigConstructor = (t: Function, specificIntegrationId: string, type: string): ListingConfig => {
  const headers = [
    t('shared.labels.name'),
    t('shared.labels.active'),
  ];
  const fields: ShowField[] = [
    { name: 'name', type: FieldType.Text },
    { name: 'active', type: FieldType.Boolean },
  ];

  if (type === IntegrationTypes.Amazon || type === IntegrationTypes.Ebay || type === IntegrationTypes.Shein) {
    headers.push(t('integrations.show.stores.labels.isDefault'));
    fields.push({ name: 'isDefault', type: FieldType.Boolean });
  }

  return {
    headers,
    fields,
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
  };
};

export const listingQueryConstructor = (type: string) => {
  if (type === IntegrationTypes.Amazon) {
    return amazonChannelViewsQuery;
  }
  if (type === IntegrationTypes.Ebay) {
    return ebayChannelViewsQuery;
  }
  if (type === IntegrationTypes.Shein) {
    return sheinChannelViewsQuery;
  }
  return salesChannelViewsQuery;
};

export const listingQueryKeyConstructor = (type: string) => {
  if (type === IntegrationTypes.Amazon) {
    return 'amazonChannelViews';
  }
  if (type === IntegrationTypes.Ebay) {
    return 'ebaySalesChannelViews';
  }
  if (type === IntegrationTypes.Shein) {
    return 'sheinSalesChannelViews';
  }
  return 'salesChannelViews';
};
