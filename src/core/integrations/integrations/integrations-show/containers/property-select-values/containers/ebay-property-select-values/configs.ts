import { FieldType, PropertyTypes } from "../../../../../../../../shared/utils/constants";
import {
  ebayPropertySelectValuesQuery,
  ebayPropertiesQuery,
  getEbayPropertySelectValueQuery,
  salesChannelViewsQuerySelector,
} from "../../../../../../../../shared/api/queries/salesChannels.js";
import { updateEbayPropertySelectValueMutation } from "../../../../../../../../shared/api/mutations/salesChannels.js";
import type { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import type { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";
import type { FormConfig } from "../../../../../../../../shared/components/organisms/general-form/formConfig";
import { FormType } from "../../../../../../../../shared/components/organisms/general-form/formConfig";

export const ebayPropertySelectValueEditFormConfigConstructor = (
  t: Function,
  type: string,
  valueId: string,
  integrationId: string,
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updateEbayPropertySelectValueMutation,
  mutationKey: "updateEbayPropertySelectValue",
  query: getEbayPropertySelectValueQuery,
  queryVariables: { id: valueId },
  queryDataKey: "ebayPropertySelectValue",
  submitUrl: {
    name: 'integrations.integrations.show',
    params: { type, id: integrationId },
    query: { tab: 'propertySelectValues' },
  },
  fields: [
    { type: FieldType.Hidden, name: 'id', value: valueId },
    {
      type: FieldType.Text,
      name: 'ebayProperty',
      label: t('integrations.show.propertySelectValues.labels.ebayProperty'),
      disabled: true,
      help: t('integrations.show.propertySelectValues.help.ebayProperty'),
    },
    {
      type: FieldType.Text,
      name: 'marketplace',
      label: t('integrations.show.propertySelectValues.labels.marketplace'),
      disabled: true,
      help: t('integrations.show.propertySelectValues.help.marketplace'),
    },
    {
      type: FieldType.Text,
      name: 'localizedValue',
      label: t('integrations.show.propertySelectValues.labels.localizedValue'),
      disabled: true,
      help: t('integrations.show.propertySelectValues.help.localizedValue'),
    },
    {
      type: FieldType.Text,
      name: 'translatedValue',
      label: t('integrations.show.propertySelectValues.labels.translatedValue'),
      help: t('integrations.show.propertySelectValues.help.translatedValue'),
    },
  ],
});

export const ebayPropertySelectValuesSearchConfigConstructor = (t: Function, salesChannelId: string): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    { type: FieldType.Boolean, name: 'mappedLocally', label: t('integrations.show.mapping.mappedLocally'), strict: true },
    {
      type: FieldType.Query,
      name: 'ebayProperty',
      label: t('integrations.show.propertySelectValues.labels.ebayProperty'),
      labelBy: 'localizedName',
      valueBy: 'id',
      query: ebayPropertiesQuery,
      dataKey: 'ebayProperties',
      filterable: true,
      isEdge: true,
      addLookup: true,
      lookupKeys: ['id'],
      queryVariables: { filter: { salesChannel: { id: { exact: salesChannelId } }, type: { inList: [PropertyTypes.SELECT, PropertyTypes.MULTISELECT] } } }
    },
    {
      type: FieldType.Query,
      name: 'marketplace',
      label: t('integrations.show.propertySelectValues.labels.marketplace'),
      labelBy: 'name',
      valueBy: 'id',
      query: salesChannelViewsQuerySelector,
      dataKey: 'salesChannelViews',
      filterable: true,
      isEdge: true,
      addLookup: true,
      lookupKeys: ['id'],
      queryVariables: { filters: { salesChannel: { id: { exact: salesChannelId } } } },
      default: salesChannelId,
    }
  ],
  orders: []
});

export const ebayPropertySelectValuesListingConfigConstructor = (t: Function, specificIntegrationId): ListingConfig => ({
  headers: [
    t('integrations.show.propertySelectValues.labels.localizedValue'),
    t('integrations.show.propertySelectValues.labels.translatedValue'),
    t('integrations.show.propertySelectValues.labels.ebayProperty'),
    t('integrations.show.propertySelectValues.labels.marketplace'),
    t('integrations.show.mapping.mappedLocally'),
    t('properties.values.title')
  ],
  fields: [
    { name: 'localizedValue', type: FieldType.Text },
    { name: 'translatedValue', type: FieldType.Text },
    { name: 'ebayProperty', type: FieldType.NestedText, keys: ['localizedName'], showLabel: true },
    { name: 'marketplace', type: FieldType.NestedText, keys: ['name'], showLabel: true },
    { name: 'mappedLocally', type: FieldType.Boolean },
    { name: 'localInstance', type: FieldType.NestedText, keys: ['value'], showLabel: true, clickable: true, clickIdentifiers: [{ id: ['id'] }], clickUrl: { name: 'properties.values.show' } }
  ],
  identifierKey: 'id',
  urlQueryParams: { integrationId: specificIntegrationId },
  addActions: true,
  addEdit: true,
  addShow: true,
  editUrlName: 'integrations.remotePropertySelectValues.edit',
  showUrlName: 'integrations.remotePropertySelectValues.edit',
  addDelete: false,
  addPagination: true,
  addBulkActions: true,
});

export const listingQueryKey = 'ebayPropertySelectValues';
export const listingQuery = ebayPropertySelectValuesQuery;
