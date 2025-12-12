import { FieldType, PropertyTypes } from "../../../../../../../../shared/utils/constants";
import {
  getSheinPropertySelectValueQuery,
  sheinPropertySelectValuesQuery,
  sheinPropertiesQuery,
} from "../../../../../../../../shared/api/queries/salesChannels.js";
import { updateSheinPropertySelectValueMutation } from "../../../../../../../../shared/api/mutations/salesChannels.js";
import type { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import type { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";
import type { FormConfig } from "../../../../../../../../shared/components/organisms/general-form/formConfig";
import { FormType } from "../../../../../../../../shared/components/organisms/general-form/formConfig";

export const sheinPropertySelectValueEditFormConfigConstructor = (
  t: Function,
  type: string,
  valueId: string,
  integrationId: string,
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updateSheinPropertySelectValueMutation,
  mutationKey: "updateSheinPropertySelectValue",
  query: getSheinPropertySelectValueQuery,
  queryVariables: { id: valueId },
  queryDataKey: "sheinPropertySelectValue",
  submitUrl: {
    name: 'integrations.integrations.show',
    params: { type, id: integrationId },
    query: { tab: 'propertySelectValues' },
  },
  fields: [
    { type: FieldType.Hidden, name: 'id', value: valueId },
    {
      type: FieldType.Text,
      name: 'remoteProperty',
      label: t('integrations.show.propertySelectValues.labels.sheinProperty'),
      disabled: true,
      help: t('integrations.show.propertySelectValues.help.sheinProperty'),
    },
    {
      type: FieldType.Text,
      name: 'value',
      label: t('integrations.show.propertySelectValues.labels.localizedValue'),
      disabled: true,
      help: t('integrations.show.propertySelectValues.help.localizedValue'),
    },
    {
      type: FieldType.Text,
      name: 'valueEn',
      label: t('integrations.show.propertySelectValues.labels.translatedValue'),
      help: t('integrations.show.propertySelectValues.help.translatedValue'),
    },
  ],
});

export const sheinPropertySelectValuesSearchConfigConstructor = (
  t: Function,
  salesChannelId: string,
): SearchConfig => ({
  search: true,
  orderKey: 'sort',
  filters: [
    { type: FieldType.Boolean, name: 'mappedLocally', label: t('integrations.show.mapping.mappedLocally'), strict: true },
    { type: FieldType.Boolean, name: 'remoteProperty__allowsUnmappedValues', label: t('integrations.show.properties.labels.allowsUnmappedValues'), strict: true, lookupType: 'exact' },
    { type: FieldType.Boolean, name: 'usedInProducts', label: t('properties.values.labels.usedInProducts'), strict: true },
    {
      type: FieldType.Query,
      name: 'remoteProperty',
      label: t('integrations.show.propertySelectValues.labels.sheinProperty'),
      labelBy: 'name',
      valueBy: 'id',
      query: sheinPropertiesQuery,
      dataKey: 'sheinProperties',
      filterable: true,
      isEdge: true,
      addLookup: true,
      lookupKeys: ['id'],
      queryVariables: {
        filter: {
          salesChannel: { id: { exact: salesChannelId } },
          type: { inList: [PropertyTypes.SELECT, PropertyTypes.MULTISELECT] },
        },
      },
    },
  ],
  orders: [],
});

export const sheinPropertySelectValuesListingConfigConstructor = (
  t: Function,
  integrationId: string,
): ListingConfig => ({
  headers: [
    t('integrations.show.propertySelectValues.labels.localizedValue'),
    t('integrations.show.propertySelectValues.labels.translatedValue'),
    t('integrations.show.propertySelectValues.labels.sheinProperty'),
    t('integrations.show.mapping.mappedLocally'),
    t('properties.values.title'),
  ],
  fields: [
    { name: 'value', type: FieldType.Text },
    { name: 'valueEn', type: FieldType.Text },
    { name: 'remoteProperty', type: FieldType.NestedText, keys: ['name'], showLabel: true },
    { name: 'mappedLocally', type: FieldType.Boolean },
    {
      name: 'localInstance',
      type: FieldType.NestedText,
      keys: ['value'],
      showLabel: true,
      clickable: true,
      clickIdentifiers: [{ id: ['id'] }],
      clickUrl: { name: 'properties.values.show' },
    },
  ],
  identifierKey: 'id',
  urlQueryParams: { integrationId },
  addActions: true,
  addEdit: true,
  addShow: true,
  editUrlName: 'integrations.remotePropertySelectValues.edit',
  showUrlName: 'integrations.remotePropertySelectValues.edit',
  addDelete: false,
  addPagination: true,
});

export const listingQueryKey = 'sheinPropertySelectValues';
export const listingQuery = sheinPropertySelectValuesQuery;
