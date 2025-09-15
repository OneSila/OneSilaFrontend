import {FieldType, PropertyTypes} from "../../../../../../../../shared/utils/constants";
import {
  amazonPropertySelectValuesQuery,
  getAmazonPropertySelectValueQuery,
  amazonPropertiesQuery,
  amazonChannelsQuery,
  salesChannelViewsQuerySelector
} from "../../../../../../../../shared/api/queries/salesChannels.js";
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
    { type: FieldType.Text, name: 'amazonProperty', label: t('integrations.show.propertySelectValues.labels.amazonProperty'), disabled: true, help: t('integrations.show.propertySelectValues.help.amazonProperty') },
    { type: FieldType.Text, name: 'marketplace', label: t('integrations.show.propertySelectValues.labels.marketplace'), disabled: true, help: t('integrations.show.propertySelectValues.help.marketplace') },
    { type: FieldType.Text, name: 'remoteValue', label: t('integrations.show.propertySelectValues.labels.remoteValue'), disabled: true, help: t('integrations.show.propertySelectValues.help.remoteValue') },
    { type: FieldType.Text, name: 'remoteName', label: t('shared.labels.name'), help: t('integrations.show.propertySelectValues.help.remoteName') },
    { type: FieldType.Text, name: 'translatedRemoteName', label: t('integrations.show.propertySelectValues.labels.translatedRemoteName'), help: t('integrations.show.propertySelectValues.help.translatedRemoteName') },
  ]
});

export const amazonPropertySelectValuesSearchConfigConstructor = (t: Function, salesChannelId: string): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    { type: FieldType.Boolean, name: 'mappedLocally', label: t('integrations.show.mapping.mappedLocally'), strict: true },
    {
      type: FieldType.Query,
      name: 'amazonProperty',
      label: t('integrations.show.propertySelectValues.labels.amazonProperty'),
      labelBy: 'name',
      valueBy: 'id',
      query: amazonPropertiesQuery,
      dataKey: 'amazonProperties',
      filterable: true,
      isEdge: true,
      addLookup: true,
      lookupKeys: ['id'],
      queryVariables: { filter: { salesChannel: { id: { exact: salesChannelId } }, type: {inList: [PropertyTypes.SELECT, PropertyTypes.MULTISELECT]} } }
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
      queryVariables: { filters: { salesChannel: { id: { exact: salesChannelId } } } }
    }
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
    t('properties.values.title')
  ],
  fields: [
    { name: 'remoteName', type: FieldType.Text },
    { name: 'remoteValue', type: FieldType.Text },
    { name: 'amazonProperty', type: FieldType.NestedText, keys: ['name'], showLabel: true, },
    { name: 'marketplace', type: FieldType.NestedText, keys: ['name'], showLabel: true },
    { name: 'mappedLocally', type: FieldType.Boolean },
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
  addBulkActions: true,
});

export const listingQueryKey = 'amazonPropertySelectValues';
export const listingQuery = amazonPropertySelectValuesQuery;
