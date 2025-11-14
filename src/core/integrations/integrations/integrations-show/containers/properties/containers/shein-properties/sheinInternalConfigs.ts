import { FieldType, getPropertyTypeOptions } from "../../../../../../../../shared/utils/constants";
import { sheinInternalPropertiesQuery, getSheinInternalPropertyQuery } from "../../../../../../../../shared/api/queries/salesChannels.js";
import { propertiesQuerySelector } from "../../../../../../../../shared/api/queries/properties.js";
import { updateSheinInternalPropertyMutation } from "../../../../../../../../shared/api/mutations/salesChannels.js";
import type { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import type { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";
import type { FormConfig } from "../../../../../../../../shared/components/organisms/general-form/formConfig";
import { FormType } from "../../../../../../../../shared/components/organisms/general-form/formConfig";

export const sheinInternalPropertiesSearchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: 'sort',
  filters: [
    { type: FieldType.Boolean, name: 'mappedLocally', label: t('integrations.show.mapping.mappedLocally'), strict: true },
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
  ],
  orders: [],
});

export const sheinInternalPropertiesListingConfigConstructor = (
  t: Function,
  integrationId: string,
): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('integrations.show.properties.labels.code'),
    t('integrations.show.mapping.mappedLocally'),
    t('properties.properties.title'),
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
  ],
  identifierKey: 'id',
  urlQueryParams: { integrationId, fromTab: 'internalFields' },
  addActions: false,
  addEdit: false,
  addShow: false,
  addDelete: false,
  addPagination: true,
});

export const sheinInternalListingQueryKey = 'sheinInternalProperties';
export const sheinInternalListingQuery = sheinInternalPropertiesQuery;

export const sheinInternalPropertyEditFormConfigConstructor = (
  t: Function,
  integrationType: string,
  propertyId: string,
  integrationId: string,
  returnTab = 'internalFields',
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updateSheinInternalPropertyMutation,
  mutationKey: "updateSheinInternalProperty",
  query: getSheinInternalPropertyQuery,
  queryVariables: { id: propertyId },
  queryDataKey: "sheinInternalProperty",
  submitUrl: {
    name: 'integrations.integrations.show',
    params: { type: integrationType, id: integrationId },
    query: { tab: returnTab },
  },
  fields: [
    { type: FieldType.Hidden, name: 'id', value: propertyId },
    {
      type: FieldType.Text,
      name: 'code',
      label: t('integrations.show.properties.labels.code'),
      disabled: true,
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
      type: FieldType.Text,
      name: 'name',
      label: t('shared.labels.name'),
      help: t('integrations.show.properties.help.name'),
    },
  ],
});
