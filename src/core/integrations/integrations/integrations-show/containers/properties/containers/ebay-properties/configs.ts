import { FieldType, getPropertyTypeOptions } from "../../../../../../../../shared/utils/constants";
import { ebayPropertiesQuery, ebayChannelViewsQuery, getEbayPropertyQuery } from "../../../../../../../../shared/api/queries/salesChannels.js";
import { propertiesQuerySelector } from "../../../../../../../../shared/api/queries/properties.js";
import { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import { FormConfig, FormType } from "../../../../../../../../shared/components/organisms/general-form/formConfig";
import { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";
import { updateEbayPropertyMutation } from "../../../../../../../../shared/api/mutations/salesChannels.js";

export const ebayPropertyEditFormConfigConstructor = (
  t: Function,
  type: string,
  propertyId: string,
  integrationId: string,
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updateEbayPropertyMutation,
  mutationKey: "updateEbayProperty",
  query: getEbayPropertyQuery,
  queryVariables: { id: propertyId },
  queryDataKey: "ebayProperty",
  submitUrl: { name: 'integrations.integrations.show', params: { type, id: integrationId }, query: { tab: 'properties' } },
  fields: [
    { type: FieldType.Hidden, name: 'id', value: propertyId },
    {
      type: FieldType.Text,
      name: 'localizedName',
      label: t('integrations.show.properties.labels.localizedName'),
      help: t('integrations.show.properties.help.localizedName'),
      disabled: true,
    },
    {
      type: FieldType.Text,
      name: 'translatedName',
      label: t('integrations.show.properties.labels.translatedName'),
      help: t('integrations.show.properties.help.translatedName'),
    },
    {
      type: FieldType.Choice,
      name: 'type',
      label: t('products.products.labels.type.title'),
      labelBy: 'name',
      valueBy: 'code',
      options: getPropertyTypeOptions(t),
      disabled: true,
      removable: false,
      help: t('integrations.show.properties.help.type'),
    },
    {
      type: FieldType.Boolean,
      name: 'allowsUnmappedValues',
      label: t('integrations.show.properties.labels.allowsUnmappedValues'),
      disabled: true,
      strict: true,
      help: t('integrations.show.properties.help.allowsUnmappedValues'),
    },
  ],
});

export const ebayPropertiesSearchConfigConstructor = (t: Function, salesChannelId: string): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    { type: FieldType.Boolean, name: 'mappedLocally', label: t('integrations.show.mapping.mappedLocally'), strict: true },
    { type: FieldType.Boolean, name: 'allowsUnmappedValues', label: t('integrations.show.properties.labels.allowsUnmappedValues'), addLookup: true, strict: true },
    {
      type: FieldType.Choice,
      name: 'type',
      label: t('products.products.labels.type.title'),
      labelBy: 'name',
      valueBy: 'code',
      options: getPropertyTypeOptions(t),
      addLookup: true,
    },
    {
      type: FieldType.Query,
      name: 'localInstance',
      label: t('properties.properties.title'),
      labelBy: 'name',
      valueBy: 'id',
      query: propertiesQuerySelector,
      dataKey: 'properties',
      filterable: true,
      isEdge: true,
      addLookup: true,
      lookupKeys: ['id'],
    },
    {
      type: FieldType.Query,
      name: 'marketplace',
      label: t('integrations.show.propertySelectValues.labels.marketplace'),
      labelBy: 'name',
      valueBy: 'id',
      query: ebayChannelViewsQuery,
      dataKey: 'ebaySalesChannelViews',
      filterable: true,
      isEdge: true,
      addLookup: true,
      lookupKeys: ['id'],
      queryVariables: { filters: { salesChannel: { id: { exact: salesChannelId } } } },
    },
  ],
  orders: [],
});

export const ebayPropertiesListingConfigConstructor = (t: Function, specificIntegrationId): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('integrations.show.properties.labels.code'),
    t('integrations.show.mapping.mappedLocally'),
    t('properties.properties.title'),
    t('integrations.show.propertySelectValues.labels.marketplace'),
  ],
  fields: [
    { name: 'localizedName', type: FieldType.Text },
    { name: 'mappedLocally', type: FieldType.Boolean },
    {
      name: 'localInstance',
      type: FieldType.NestedText,
      keys: ['name'],
      showLabel: true,
      clickable: true,
      clickIdentifiers: [{ id: ['id'] }],
      clickUrl: { name: 'properties.properties.show' },
    },
    {
      name: 'marketplace',
      type: FieldType.NestedText,
      keys: ['name'],
      showLabel: true,
    },
  ],
  identifierKey: 'id',
  urlQueryParams: { integrationId: specificIntegrationId },
  addActions: true,
  addEdit: true,
  addShow: true,
  editUrlName: 'integrations.remoteProperties.edit',
  showUrlName: 'integrations.remoteProperties.edit',
  addDelete: false,
  addPagination: true,
});

export const listingQueryKey = 'ebayProperties';
export const listingQuery = ebayPropertiesQuery;
