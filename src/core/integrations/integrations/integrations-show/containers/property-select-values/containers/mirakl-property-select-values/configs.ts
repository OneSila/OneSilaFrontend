import { FieldType } from "../../../../../../../../shared/utils/constants";
import {
  getMiraklPropertySelectValueQuery,
  miraklPropertiesQuery,
  miraklPropertySelectValuesQuery,
} from "../../../../../../../../shared/api/queries/salesChannels.js";
import { updateMiraklPropertySelectValueMutation } from "../../../../../../../../shared/api/mutations/salesChannels.js";
import type { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import type { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";
import type { FormConfig } from "../../../../../../../../shared/components/organisms/general-form/formConfig";
import { FormType } from "../../../../../../../../shared/components/organisms/general-form/formConfig";

export const miraklPropertySelectValueEditFormConfigConstructor = (
  t: Function,
  type: string,
  valueId: string,
  integrationId: string,
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updateMiraklPropertySelectValueMutation,
  mutationKey: "updateMiraklPropertySelectValue",
  query: getMiraklPropertySelectValueQuery,
  queryVariables: { id: valueId },
  queryDataKey: "miraklPropertySelectValue",
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
      label: t('integrations.show.propertySelectValues.labels.remoteProperty'),
      disabled: true,
      help: t('integrations.show.propertySelectValues.help.remoteProperty'),
    },
    {
      type: FieldType.Text,
      name: 'label',
      label: t('integrations.show.propertySelectValues.labels.localizedValue'),
      disabled: true,
      help: t('integrations.show.propertySelectValues.help.localizedValue'),
    },
  ],
});

export const miraklPropertySelectValuesSearchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: 'sort',
  filters: [
    { type: FieldType.Boolean, name: 'mappedLocally', label: t('integrations.show.mapping.mappedLocally'), strict: true },
    {
      type: FieldType.Query,
      name: 'remoteProperty',
      label: t('integrations.show.propertySelectValues.labels.remoteProperty'),
      labelBy: 'name',
      valueBy: 'id',
      query: miraklPropertiesQuery,
      dataKey: 'miraklProperties',
      filterable: true,
      isEdge: true,
      addLookup: true,
      lookupKeys: ['id'],
      queryVariables: {
        filter: {
          showProperty: true,
        },
      },
    },
  ],
  orders: [],
});

export const miraklPropertySelectValuesListingConfigConstructor = (
  t: Function,
  specificIntegrationId: string,
): ListingConfig => ({
  headers: [
    t('integrations.show.propertySelectValues.labels.localizedValue'),
    t('integrations.show.propertySelectValues.labels.remoteProperty'),
    t('integrations.show.mapping.mappedLocally'),
    t('properties.values.title'),
  ],
  fields: [
    { name: 'label', type: FieldType.Text },
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
  addActions: true,
  addEdit: true,
  addShow: true,
  urlQueryParams: { integrationId: specificIntegrationId },
  editUrlName: 'integrations.remotePropertySelectValues.edit',
  showUrlName: 'integrations.remotePropertySelectValues.edit',
  addDelete: false,
  addPagination: true,
  addBulkActions: true,
});

export const listingQueryKey = 'miraklPropertySelectValues';
export const listingQuery = miraklPropertySelectValuesQuery;
