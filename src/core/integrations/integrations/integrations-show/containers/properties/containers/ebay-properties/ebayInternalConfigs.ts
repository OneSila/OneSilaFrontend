import { FieldType, getPropertyTypeOptions } from "../../../../../../../../shared/utils/constants";
import { ebayInternalPropertiesQuery, getEbayInternalPropertyQuery } from "../../../../../../../../shared/api/queries/salesChannels.js";
import { propertiesQuerySelector } from "../../../../../../../../shared/api/queries/properties.js";
import { updateEbayInternalPropertyMutation } from "../../../../../../../../shared/api/mutations/salesChannels.js";
import { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";
import { FormConfig, FormType } from "../../../../../../../../shared/components/organisms/general-form/formConfig";

export const ebayInternalPropertiesSearchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    { type: FieldType.Boolean, name: 'mappedLocally', label: t('integrations.show.mapping.mappedLocally'), strict: true },
    { type: FieldType.Boolean, name: 'mappedRemotely', label: t('integrations.show.mapping.mappedRemotely'), strict: true },
    {
      type: FieldType.Choice,
      name: 'type',
      label: t('products.products.labels.type.title'),
      labelBy: 'name',
      valueBy: 'code',
      options: getPropertyTypeOptions(t),
      addLookup: true,
    },
    { type: FieldType.Boolean, name: 'isRoot', label: t('integrations.show.ebay.internalProperties.labels.isRoot'), strict: true },
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
  ],
  orders: [],
});

export const ebayInternalPropertiesListingConfigConstructor = (t: Function, specificIntegrationId): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('integrations.show.properties.labels.code'),
    t('integrations.show.mapping.mappedLocally'),
    t('properties.properties.title'),
    t('integrations.show.ebay.internalProperties.labels.isRoot'),
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'code', type: FieldType.Text },
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
    { name: 'isRoot', type: FieldType.Boolean },
  ],
  identifierKey: 'id',
  urlQueryParams: { integrationId: specificIntegrationId },
  addActions: true,
  addEdit: true,
  addShow: true,
  editUrlName: 'integrations.ebayInternalProperties.edit',
  showUrlName: 'integrations.ebayInternalProperties.edit',
  addDelete: false,
  addPagination: true,
});

export const ebayInternalPropertyEditFormConfigConstructor = (
  t: Function,
  type: string,
  propertyId: string,
  integrationId: string
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updateEbayInternalPropertyMutation,
  mutationKey: "updateEbayInternalProperty",
  query: getEbayInternalPropertyQuery,
  queryVariables: { id: propertyId },
  queryDataKey: "ebayInternalProperty",
  submitUrl: { name: 'integrations.integrations.show', params: { type, id: integrationId }, query: { tab: 'properties' } },
  fields: [
    { type: FieldType.Hidden, name: 'id', value: propertyId },
    { type: FieldType.Text, name: 'code', label: t('integrations.show.properties.labels.code'), disabled: true },
    {
      type: FieldType.Choice,
      name: 'type',
      label: t('products.products.labels.type.title'),
      labelBy: 'name',
      valueBy: 'code',
      options: getPropertyTypeOptions(t),
      disabled: true,
      removable: false,
    },
    { type: FieldType.Boolean, name: 'isRoot', label: t('integrations.show.ebay.internalProperties.labels.isRoot'), disabled: true, strict: true },
    { type: FieldType.Text, name: 'name', label: t('shared.labels.name'), help: t('integrations.show.properties.help.name') },
  ],
});

export const ebayInternalListingQueryKey = 'ebayInternalProperties';
export const ebayInternalListingQuery = ebayInternalPropertiesQuery;
