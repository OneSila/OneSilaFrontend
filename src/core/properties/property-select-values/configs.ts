import { CreateOnTheFly, FormConfig, FormField, FormType } from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType, PropertyTypes } from '../../../shared/utils/constants';
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import {getPropertySelectValueQuery, propertiesQuery, propertySelectValuesQuery} from "../../../shared/api/queries/properties.js";
import {deletePropertyMutation, deletePropertySelectValueMutation, updatePropertySelectValueMutation} from "../../../shared/api/mutations/properties.js";
import { ShowConfig } from "../../../shared/components/organisms/general-show/showConfig";
import { getPropertySubscription } from '../../../shared/api/subscriptions/properties.js';

export const baseFormConfigConstructor = (
  t: Function,
  type: FormType,
  mutation: any,
  mutationKey: string,
  propertyId: string | null = null
): FormConfig => ({
  cols: 1,
  type: type,
  mutation: mutation,
  mutationKey: mutationKey,
  submitUrl: { name: 'properties.values.list' },
  submitAndContinueUrl: { name: 'properties.values.edit' },
  deleteMutation: deletePropertyMutation,
  fields: [
      getPropertyField(t, propertyId, type),
    {
      type: FieldType.Text,
      name: 'value',
      label: t('properties.values.show.title'),
      placeholder: t('properties.values.placeholders.value')
    },
    {
      type: FieldType.Image,
      name: 'image',
      label: t('shared.labels.image'),
      optional: true,
    }
  ],
});

export const editFormConfigConstructor = (
  t: Function,
  id: string,
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updatePropertySelectValueMutation,
  mutationKey: 'updatePropertySelectValue',
  submitUrl: { name: 'properties.values.list' },
  submitAndContinueUrl: { name: 'properties.values.edit' },
  deleteMutation: deletePropertyMutation,
  mutationId: id,
  query: getPropertySelectValueQuery,
  queryVariables: { id: id },
  queryDataKey: 'propertySelectValue',
  fields: [
        {
        type: FieldType.Hidden,
        name: 'id',
        value: id
      },
      {
        type: FieldType.Query,
        name: 'property',
        label: t('properties.properties.show.title'),
        labelBy: 'name',
        valueBy: 'id',
        query: propertiesQuery,
        queryVariables: { filter: { 'type': {'exact': PropertyTypes.SELECT}}},
        dataKey: 'properties',
        isEdge: true,
        multiple: false,
        filterable: true,
        formMapIdentifier: 'id',
        disabled: true
    },
    {
      type: FieldType.Image,
      name: 'image',
      label: t('shared.labels.image'),
      optional: true,
    }
  ],
});


const getPropertyField = (t, propertyId, type): FormField => {
  if (propertyId) {
    return {
      type: FieldType.Hidden,
      name: 'property',
      value: { "id": propertyId }
    };
  } else {
    return     {
        type: FieldType.Query,
        name: 'property',
        label: t('properties.properties.show.title'),
        labelBy: 'name',
        valueBy: 'id',
        query: propertiesQuery,
        queryVariables: { filter: { 'type': {'exact': PropertyTypes.SELECT}}},
        dataKey: 'properties',
        isEdge: true,
        multiple: false,
        filterable: true,
        formMapIdentifier: 'id',
        disabled: type === FormType.EDIT
    };
  }
}

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
    filters: [
    ],
  orders: []
});

export const listingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [t('properties.values.show.title') , t('properties.properties.show.title')],
  fields: [
    { name: 'value', type: FieldType.Text },
    { name: 'property',
      type: FieldType.NestedText,
      keys: ['name'],
      clickable: true,
      clickIdentifiers: [{id: ['id']}],
      clickUrl: {name: 'properties.properties.edit'}}, // @TODO: Change to show
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'properties.values.edit',
  showUrlName: 'properties.values.show',
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deletePropertySelectValueMutation,
});

export const showConfigConstructor = (t: Function, id): ShowConfig => ({
  cols: 1,
  subscription: getPropertySubscription,
  subscriptionKey: 'property',
  subscriptionVariables: { pk: id },
  backUrl: { name: 'properties.values.list' },
  editUrl: { name: 'properties.values.edit', params: { id: id } },
  deleteMutation: deletePropertySelectValueMutation,
  deleteVariables: { id: id },
  addBack: true,
  addEdit: true,
  addDelete: true,
  fields: [
    {
      label: t('shared.labels.name'),
      name: 'name',
      type: FieldType.Text,
    },
    {
      label: t('properties.values.labels.isPublicInformation'),
      name: 'isPublicInformation',
      type: FieldType.Boolean
    }
  ]
});

export const listingQueryKey = 'propertySelectValues';
export const listingQuery = propertySelectValuesQuery;
