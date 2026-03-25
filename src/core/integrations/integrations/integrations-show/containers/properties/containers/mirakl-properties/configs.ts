import { FieldType, getPropertyTypeOptions } from "../../../../../../../../shared/utils/constants";
import {
  miraklPropertiesQuery,
  miraklInternalPropertiesQuery,
  getMiraklPropertyQuery,
  getMiraklInternalPropertyQuery,
} from "../../../../../../../../shared/api/queries/salesChannels.js";
import { propertiesQuerySelector } from "../../../../../../../../shared/api/queries/properties.js";
import type { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import type { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";
import { getPropertyTypeBadgeMap } from "../../../../../../../properties/properties/configs";
import { updateMiraklPropertyMutation, updateMiraklInternalPropertyMutation } from "../../../../../../../../shared/api/mutations/salesChannels.js";
import type { FormConfig } from "../../../../../../../../shared/components/organisms/general-form/formConfig";
import { FormType } from "../../../../../../../../shared/components/organisms/general-form/formConfig";
import { getMiraklRepresentationTypeOptions } from "./representationTypes";

export const miraklPropertiesSearchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: 'sort',
  filters: [
    { type: FieldType.Boolean, name: 'mappedLocally', label: t('integrations.show.mapping.mappedLocally'), strict: true },
    {
      type: FieldType.Boolean,
      name: 'isCommon',
      label: t('integrations.show.mirakl.properties.labels.isCommon'),
      addLookup: true,
      strict: true,
    },
    {
      type: FieldType.Boolean,
      name: 'allowsUnmappedValues',
      label: t('integrations.show.properties.labels.allowsUnmappedValues'),
      addLookup: true,
      strict: true,
    },
    {
      type: FieldType.Choice,
      name: 'representationType',
      label: t('integrations.show.mirakl.properties.labels.representationType'),
      labelBy: 'name',
      valueBy: 'code',
      options: getMiraklRepresentationTypeOptions(t),
      addLookup: true,
    },
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
      type: FieldType.Choice,
      name: 'originalType',
      label: t('integrations.show.properties.labels.originalType'),
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

export const miraklPropertyEditFormConfigConstructor = (
  t: Function,
  type: string,
  propertyId: string,
  integrationId: string,
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updateMiraklPropertyMutation,
  mutationKey: "updateMiraklProperty",
  query: getMiraklPropertyQuery,
  queryVariables: { id: propertyId },
  queryDataKey: "miraklProperty",
  haveCustomHelpSection: true,
  submitUrl: { name: 'integrations.integrations.show', params: { type, id: integrationId }, query: { tab: 'properties' } },
  fields: [
    { type: FieldType.Hidden, name: 'id', value: propertyId },
    {
      type: FieldType.Text,
      name: 'code',
      label: t('integrations.show.properties.labels.code'),
      disabled: true,
      help: t('integrations.show.properties.help.code'),
    },
    {
      type: FieldType.Choice,
      name: 'originalType',
      label: t('integrations.show.properties.labels.originalType'),
      labelBy: 'name',
      valueBy: 'code',
      options: getPropertyTypeOptions(t),
      disabled: true,
      removable: false,
      help: t('integrations.show.properties.help.originalType'),
    },
    {
      type: FieldType.Choice,
      name: 'type',
      label: t('integrations.show.properties.labels.currentType'),
      labelBy: 'name',
      valueBy: 'code',
      options: getPropertyTypeOptions(t),
      disabled: true,
      removable: false,
      help: t('integrations.show.properties.help.currentType'),
    },
    {
      type: FieldType.Boolean,
      name: 'allowsUnmappedValues',
      label: t('integrations.show.properties.labels.allowsUnmappedValues'),
      disabled: true,
      strict: true,
      help: t('integrations.show.properties.help.allowsUnmappedValues'),
    },
    {
      type: FieldType.Choice,
      name: 'representationType',
      label: t('integrations.show.mirakl.properties.labels.representationType'),
      labelBy: 'name',
      valueBy: 'code',
      options: getMiraklRepresentationTypeOptions(t),
      disabled: false,
      removable: false,
      help: t('integrations.show.mirakl.properties.help.representationType'),
    },
    {
      type: FieldType.Text,
      name: 'name',
      label: t('shared.labels.name'),
      help: t('integrations.show.properties.help.name'),
    },
  ],
});

export const miraklPropertiesListingConfigConstructor = (
  t: Function,
  specificIntegrationId: string,
  salesChannelId: string,
): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('integrations.show.properties.labels.code'),
    t('integrations.show.properties.labels.originalType'),
    t('integrations.show.mapping.mappedLocally'),
    t('properties.properties.title'),
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'code', type: FieldType.Text },
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
  urlQueryParams: { integrationId: specificIntegrationId, salesChannelId },
  addActions: true,
  addEdit: true,
  addShow: true,
  editUrlName: 'integrations.remoteProperties.edit',
  showUrlName: 'integrations.remoteProperties.edit',
  addDelete: false,
  addPagination: true,
  addBulkActions: true,
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

export const miraklInternalPropertyEditFormConfigConstructor = (
  t: Function,
  type: string,
  propertyId: string,
  integrationId: string,
  returnTab = 'inventoryFields',
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updateMiraklInternalPropertyMutation,
  mutationKey: "updateMiraklInternalProperty",
  query: getMiraklInternalPropertyQuery,
  queryVariables: { id: propertyId },
  queryDataKey: "miraklInternalProperty",
  submitUrl: {
    name: 'integrations.integrations.show',
    params: { type, id: integrationId },
    query: { tab: returnTab },
  },
  fields: [
    { type: FieldType.Hidden, name: 'id', value: propertyId },
    {
      type: FieldType.Text,
      name: 'name',
      label: t('shared.labels.name'),
      disabled: true,
      help: t('integrations.show.properties.help.name'),
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
    },
    {
      type: FieldType.Checkbox,
      name: 'isCondition',
      label: t('integrations.show.mirakl.internalProperties.labels.isCondition'),
      disabled: true,
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
      removable: true,
      optional: true,
      formMapIdentifier: 'id',
      help: t('integrations.show.mapping.help.selectLocalProperty'),
    },
  ],
});

export const miraklInternalPropertiesListingConfigConstructor = (
  t: Function,
  integrationId: string,
): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('integrations.show.properties.labels.originalType'),
    t('integrations.show.mirakl.internalProperties.labels.isCondition'),
    t('properties.properties.title'),
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'type', type: FieldType.Badge, badgeMap: getPropertyTypeBadgeMap(t) },
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
  urlQueryParams: { integrationId, fromTab: 'inventoryFields' },
  addActions: true,
  addEdit: true,
  addShow: true,
  editUrlName: 'integrations.remoteInternalProperties.edit',
  showUrlName: 'integrations.remoteInternalProperties.edit',
  addDelete: false,
  addPagination: true,
});

export const miraklPropertiesListingQuery = miraklPropertiesQuery;
export const miraklPropertiesListingQueryKey = 'miraklProperties';
export const miraklInternalListingQuery = miraklInternalPropertiesQuery;
export const miraklInternalListingQueryKey = 'miraklInternalProperties';
