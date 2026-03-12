import { FieldType, getPropertyTypeOptions } from "../../../../../../../../shared/utils/constants";
import {
  miraklPropertiesQuery,
  miraklInternalPropertiesQuery,
} from "../../../../../../../../shared/api/queries/salesChannels.js";
import { propertiesQuerySelector } from "../../../../../../../../shared/api/queries/properties.js";
import type { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import type { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";
import { getPropertyTypeBadgeMap } from "../../../../../../../properties/properties/configs";

export const miraklPropertiesSearchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: 'sort',
  filters: [
    { type: FieldType.Boolean, name: 'mappedLocally', label: t('integrations.show.mapping.mappedLocally'), strict: true },
    { type: FieldType.Boolean, name: 'usedInProducts', label: t('properties.properties.labels.usedInProducts'), strict: true },
    {
      type: FieldType.Choice,
      name: 'type',
      label: t('integrations.show.properties.labels.currentType'),
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
  ],
  orders: [],
});

export const miraklPropertiesListingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('integrations.show.properties.labels.originalType'),
    t('integrations.show.mapping.mappedLocally'),
    t('properties.properties.title'),
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'originalType', type: FieldType.Badge, badgeMap: getPropertyTypeBadgeMap(t) },
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
  ],
  identifierKey: 'id',
  addActions: false,
  addEdit: false,
  addShow: false,
  addDelete: false,
  addPagination: true,
});

export const miraklInternalPropertiesSearchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: 'sort',
  filters: [
    { type: FieldType.Boolean, name: 'mappedLocally', label: t('integrations.show.mapping.mappedLocally'), strict: true },
    { type: FieldType.Boolean, name: 'isCondition', label: t('integrations.show.mirakl.internalProperties.labels.isCondition'), strict: true },
  ],
  orders: [],
});

export const miraklInternalPropertiesListingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('integrations.show.properties.labels.originalType'),
    t('integrations.show.mirakl.internalProperties.labels.acceptedValues'),
    t('integrations.show.mirakl.internalProperties.labels.isCondition'),
    t('properties.properties.title'),
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'type', type: FieldType.Badge, badgeMap: getPropertyTypeBadgeMap(t) },
    { name: 'acceptedValues', type: FieldType.Text },
    { name: 'isCondition', type: FieldType.Boolean },
    {
      name: 'localInstance',
      type: FieldType.NestedText,
      keys: ['name'],
      showLabel: true,
      clickable: true,
      clickIdentifiers: [{ id: ['id'] }],
      clickUrl: { name: 'properties.properties.show' },
    },
  ],
  identifierKey: 'id',
  addActions: false,
  addEdit: false,
  addShow: false,
  addDelete: false,
  addPagination: true,
});

export const miraklPropertiesListingQuery = miraklPropertiesQuery;
export const miraklPropertiesListingQueryKey = 'miraklProperties';
export const miraklInternalListingQuery = miraklInternalPropertiesQuery;
export const miraklInternalListingQueryKey = 'miraklInternalProperties';
