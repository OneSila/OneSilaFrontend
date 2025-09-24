import { FieldType, getPropertyTypeOptions } from "../../../../../../../../shared/utils/constants";
import { ebayPropertiesQuery, ebayChannelViewsQuery } from "../../../../../../../../shared/api/queries/salesChannels.js";
import { propertiesQuerySelector } from "../../../../../../../../shared/api/queries/properties.js";
import { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";

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
