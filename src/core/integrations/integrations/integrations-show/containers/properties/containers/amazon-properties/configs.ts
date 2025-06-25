import {FieldType, getPropertyTypeOptions} from "../../../../../../../../shared/utils/constants";
import { amazonPropertiesQuery, getAmazonPropertyQuery } from "../../../../../../../../shared/api/queries/salesChannels.js";
import { propertiesQuery } from "../../../../../../../../shared/api/queries/properties.js";
import { updateAmazonPropertyMutation } from "../../../../../../../../shared/api/mutations/salesChannels.js";
import { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import { FormConfig, FormType } from '../../../../../../../../shared/components/organisms/general-form/formConfig';
import { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";

export const amazonPropertyEditFormConfigConstructor = (
  t: Function,
  type: string,
  propertyId: string,
  integrationId: string,
  defaultPropertyId: string | null = null
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updateAmazonPropertyMutation,
  mutationKey: "updateAmazonProperty",
  query: getAmazonPropertyQuery,
  queryVariables: { id: propertyId },
  queryDataKey: "amazonProperty",
  submitUrl: { name: 'integrations.integrations.show', params: { type: type, id: integrationId }, query: { tab: 'properties' } },
  fields: [
    { type: FieldType.Hidden, name: 'id', value: propertyId },
    { type: FieldType.Text, name: 'code', label: t('integrations.show.properties.labels.code'), disabled: true, help: t('integrations.show.properties.help.code') },
    {
      type: FieldType.Choice,
      name: 'type',
      label: t('products.products.labels.type.title'),
      labelBy: 'name',
      valueBy: 'code',
      options: getPropertyTypeOptions(t),
      disabled: true,
      removable: false,
      help: t('integrations.show.properties.help.type')
    },
    { type: FieldType.Boolean, name: 'allowsUnmappedValues', label: t('integrations.show.properties.labels.allowsUnmappedValues'), disabled: true, strict: true, help: t('integrations.show.properties.help.allowsUnmappedValues') },
    { type: FieldType.Text, name: 'name', label: t('shared.labels.name'), help: t('integrations.show.properties.help.name') },
    {
      type: FieldType.Query,
      name: 'localInstance',
      label: t('integrations.show.properties.labels.property'),
      help: t('integrations.show.properties.help.property'),
      labelBy: 'name',
      valueBy: 'id',
      query: propertiesQuery,
      dataKey: 'properties',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
      ...(defaultPropertyId ? { default: defaultPropertyId } : {})
    }
  ]
});

export const amazonPropertiesSearchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    { type: FieldType.Boolean, name: 'mappedLocally', label: t('integrations.show.mapping.mappedLocally'), strict: true },
    { type: FieldType.Boolean, name: 'mappedRemotely', label: t('integrations.show.mapping.mappedRemotely'), strict: true },
    { type: FieldType.Boolean, name: 'allowsUnmappedValues', label: t('integrations.show.properties.labels.allowsUnmappedValues'), addLookup: true, strict: true },
    {
      type: FieldType.Choice,
      name: 'type',
      label: t('products.products.labels.type.title'),
      labelBy: 'name',
      valueBy: 'code',
      options: getPropertyTypeOptions(t),
      addLookup: true
    },
    {
      type: FieldType.Query,
      name: 'localInstance',
      label: t('properties.properties.title'),
      labelBy: 'name',
      valueBy: 'id',
      query: propertiesQuery,
      dataKey: 'properties',
      filterable: true,
      isEdge: true,
      addLookup: true,
      lookupKeys: ['id']
    },
  ],
  orders: []
});

export const amazonPropertiesListingConfigConstructor = (t: Function, specificIntegrationId): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('integrations.show.properties.labels.code'),
    t('integrations.show.mapping.mappedLocally'),
    t('integrations.show.mapping.mappedRemotely'),
    t('properties.properties.title')
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'code', type: FieldType.Text },
    { name: 'mappedLocally', type: FieldType.Boolean },
    { name: 'mappedRemotely', type: FieldType.Boolean },
    { name: 'localInstance',
      type: FieldType.NestedText,
      keys: ['name'],
      showLabel: true,
      clickable: true,
      clickIdentifiers: [{id: ['id']}],
      clickUrl: { name: 'properties.properties.show' }
    }
  ],
  identifierKey: 'id',
  urlQueryParams: {integrationId: specificIntegrationId },
  addActions: true,
  addEdit: true,
  addShow: true,
  editUrlName: 'integrations.amazonProperties.edit',
  showUrlName: 'integrations.amazonProperties.edit',
  addDelete: false,
  addPagination: true,
});

export const listingQueryKey = 'amazonProperties';
export const listingQuery = amazonPropertiesQuery;
