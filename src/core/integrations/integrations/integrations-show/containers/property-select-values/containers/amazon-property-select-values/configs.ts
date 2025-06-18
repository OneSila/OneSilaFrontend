import { FieldType } from "../../../../../../../../shared/utils/constants";
import { amazonPropertySelectValuesQuery, getAmazonPropertySelectValueQuery } from "../../../../../../../../shared/api/queries/salesChannels.js";
import { propertySelectValuesQuery } from "../../../../../../../../shared/api/queries/properties.js";
import { selectValueOnTheFlyConfig } from "../../../../../../../properties/property-select-values/configs";
import { updateAmazonPropertySelectValueMutation } from "../../../../../../../../shared/api/mutations/salesChannels.js";
import { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import { FormConfig, FormType } from '../../../../../../../../shared/components/organisms/general-form/formConfig';
import { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";

export const amazonPropertySelectValueEditFormConfigConstructor = (
  t: Function,
  type: string,
  valueId: string,
  integrationId: string,
  propertyId: string | null = null
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updateAmazonPropertySelectValueMutation,
  mutationKey: "updateAmazonPropertySelectValue",
  query: getAmazonPropertySelectValueQuery,
  queryVariables: { id: valueId },
  queryDataKey: "amazonPropertySelectValue",
  submitUrl: { name: 'integrations.integrations.show', params: { type: type, id: integrationId }, query: { tab: 'propertySelectValues' } },
  fields: [
    { type: FieldType.Hidden, name: 'id', value: valueId },
    { type: FieldType.Text, name: 'amazonProperty', label: t('integrations.show.propertySelectValues.labels.amazonProperty'), disabled: true },
    { type: FieldType.Text, name: 'marketplace', label: t('integrations.show.propertySelectValues.labels.marketplace'), disabled: true },
    { type: FieldType.Text, name: 'remoteValue', label: t('integrations.show.propertySelectValues.labels.remoteValue'), disabled: true },
    { type: FieldType.Text, name: 'remoteName', label: t('shared.labels.name') },
    {
      type: FieldType.Query,
      name: 'localInstance',
      label: t('properties.values.title'),
      labelBy: 'value',
      valueBy: 'id',
      query: propertySelectValuesQuery,
      dataKey: 'propertySelectValues',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
      ...(propertyId ? { queryVariables: { filter: { property: { id: { exact: propertyId } } } }, createOnFlyConfig: selectValueOnTheFlyConfig(t, propertyId) } : {}),
    }
  ]
});

export const amazonPropertySelectValuesSearchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    { type: FieldType.Boolean, name: 'mappedLocally', label: t('integrations.show.mapping.mappedLocally'), addLookup: true, strict: true },
    { type: FieldType.Boolean, name: 'mappedRemotely', label: t('integrations.show.mapping.mappedRemotely'), addLookup: true, strict: true },
    { type: FieldType.Text, name: 'amazonProperty', label: t('integrations.show.propertySelectValues.labels.amazonProperty') },
    { type: FieldType.Text, name: 'marketplace', label: t('integrations.show.propertySelectValues.labels.marketplace') }
  ],
  orders: []
});

export const amazonPropertySelectValuesListingConfigConstructor = (t: Function, specificIntegrationId): ListingConfig => ({
  headers: [
    t('integrations.show.propertySelectValues.labels.remoteName'),
    t('integrations.show.propertySelectValues.labels.remoteValue'),
    t('integrations.show.propertySelectValues.labels.amazonProperty'),
    t('integrations.show.propertySelectValues.labels.marketplace'),
    t('integrations.show.mapping.mappedLocally'),
    t('integrations.show.mapping.mappedRemotely'),
    t('properties.values.title')
  ],
  fields: [
    { name: 'remoteName', type: FieldType.Text },
    { name: 'remoteValue', type: FieldType.Text },
    { name: 'amazonProperty', type: FieldType.NestedText, keys: ['name'], showLabel: true, clickable: true, clickIdentifiers: [{id: ['id']}], clickUrl: { name: 'integrations.amazonProperties.edit' } },
    { name: 'marketplace', type: FieldType.NestedText, keys: ['name'], showLabel: true, clickable: true, clickIdentifiers: [{id: ['id']}], clickUrl: { name: 'integrations.stores.edit' } },
    { name: 'mappedLocally', type: FieldType.Boolean },
    { name: 'mappedRemotely', type: FieldType.Boolean },
    { name: 'localInstance', type: FieldType.NestedText, keys: ['value'], showLabel: true, clickable: true, clickIdentifiers: [{id: ['id']}], clickUrl: { name: 'properties.values.show' } }
  ],
  identifierKey: 'id',
  urlQueryParams: {integrationId: specificIntegrationId },
  addActions: true,
  addEdit: true,
  addShow: true,
  editUrlName: 'integrations.amazonPropertySelectValues.edit',
  showUrlName: 'integrations.amazonPropertySelectValues.edit',
  addDelete: false,
  addPagination: true,
});

export const listingQueryKey = 'amazonPropertySelectValues';
export const listingQuery = amazonPropertySelectValuesQuery;
