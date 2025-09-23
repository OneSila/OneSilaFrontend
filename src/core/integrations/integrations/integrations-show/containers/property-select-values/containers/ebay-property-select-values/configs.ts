import { FieldType, PropertyTypes } from "../../../../../../../../shared/utils/constants";
import {
  ebayPropertySelectValuesQuery,
  ebayPropertiesQuery,
  salesChannelViewsQuerySelector,
} from "../../../../../../../../shared/api/queries/salesChannels.js";
import type { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import type { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";

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
      queryVariables: { filters: { salesChannel: { id: { exact: salesChannelId } } } }
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
  addEdit: false,
  addShow: false,
  addDelete: false,
  addPagination: true,
  addBulkActions: true,
});

export const listingQueryKey = 'ebayPropertySelectValues';
export const listingQuery = ebayPropertySelectValuesQuery;
