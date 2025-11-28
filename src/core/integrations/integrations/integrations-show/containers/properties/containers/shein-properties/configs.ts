import { FieldType, getPropertyTypeOptions } from "../../../../../../../../shared/utils/constants";
import {
  getSheinPropertyQuery,
  sheinPropertiesQuery,
} from "../../../../../../../../shared/api/queries/salesChannels.js";
import { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";
import { FormConfig, FormType } from "../../../../../../../../shared/components/organisms/general-form/formConfig";
import { updateSheinPropertyMutation } from "../../../../../../../../shared/api/mutations/salesChannels.js";

export const sheinPropertyEditFormConfigConstructor = (
  t: Function,
  type: string,
  propertyId: string,
  integrationId: string,
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updateSheinPropertyMutation,
  mutationKey: "updateSheinProperty",
  query: getSheinPropertyQuery,
  queryVariables: { id: propertyId },
  queryDataKey: "sheinProperty",
  submitUrl: {
    name: 'integrations.integrations.show',
    params: { type, id: integrationId },
    query: { tab: 'properties' },
  },
  fields: [
    { type: FieldType.Hidden, name: 'id', value: propertyId },
    {
      type: FieldType.Text,
      name: 'name',
      label: t('integrations.show.properties.labels.localizedName'),
      help: t('integrations.show.properties.help.localizedName'),
    },
    {
      type: FieldType.Text,
      name: 'nameEn',
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

export const sheinPropertiesSearchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: 'sort',
  filters: [
    { type: FieldType.Boolean, name: 'mappedLocally', label: t('integrations.show.mapping.mappedLocally'), strict: true },
  ],
  orders: [],
});

export const sheinPropertiesListingConfigConstructor = (
  t: Function,
  integrationId: string,
): ListingConfig => ({
  headers: [t('shared.labels.name'), t('properties.properties.title')],
  fields: [
    { name: 'name', type: FieldType.Text },
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
  urlQueryParams: { integrationId },
  addActions: true,
  addEdit: true,
  editUrlName: 'integrations.remoteProperties.edit',
  showUrlName: 'integrations.remoteProperties.edit',
  addShow: true,
  addDelete: false,
  addPagination: true,
});

export const listingQueryKey = 'sheinProperties';
export const listingQuery = sheinPropertiesQuery;
