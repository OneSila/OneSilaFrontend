import { CreateOnTheFly, FormConfig, FormField, FormType } from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType, PropertyTypes } from '../../../shared/utils/constants';
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import {getPropertySelectValueQuery, propertiesQuery, propertySelectValuesQuery} from "../../../shared/api/queries/properties.js";
import {
  createPropertySelectValueMutation,
  deletePropertySelectValueMutation,
  updatePropertySelectValueMutation
} from "../../../shared/api/mutations/properties.js";
import { ShowConfig } from "../../../shared/components/organisms/general-show/showConfig";
import { getPropertySelectValueSubscription } from '../../../shared/api/subscriptions/properties.js';

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
  submitUrl: propertyId !== null  ? { name: 'properties.properties.show', params: {id: propertyId}, query: {tab: 'values'} } : { name: 'properties.values.list' },
  submitAndContinueUrl: { name: 'properties.values.edit' },
  deleteMutation: deletePropertySelectValueMutation,
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

export const selectValueOnTheFlyConfig = (t: Function, propertyId):CreateOnTheFly => ({
  config: {
    cols: 1,
    type: FormType.CREATE,
    mutation: createPropertySelectValueMutation,
    mutationKey: 'createPropertySelectValue',
    submitUrl: propertyId !== null  ? { name: 'properties.properties.show', params: {id: propertyId}, query: {tab: 'values'} } : { name: 'properties.values.list' },
    submitAndContinueUrl: { name: 'properties.values.edit' },
    deleteMutation: deletePropertySelectValueMutation,
    fields: [
        getPropertyField(t, propertyId, FormType.CREATE),
      {
        type: FieldType.Text,
        name: 'value',
        label: t('properties.values.show.title'),
        placeholder: t('properties.values.placeholders.value')
      },
    ],
  }
})

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
  deleteMutation: deletePropertySelectValueMutation,
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
        queryVariables: { filter: { 'type': {'inList': [PropertyTypes.SELECT, PropertyTypes.MULTISELECT]}}},
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
    {
      type: FieldType.Query,
      name: 'property',
      label: t('properties.properties.show.title'),
      labelBy: 'name',
      valueBy: 'id',
      query: propertiesQuery,
      queryVariables: { filter: { 'type': {'inList': [PropertyTypes.SELECT, PropertyTypes.MULTISELECT]}}},
      dataKey: 'properties',
      filterable: true,
      isEdge: true,
      addLookup: true,
      lookupKeys: ['id']
    },
    ],
  orders: []
});

export const listingConfigConstructor = (t: Function, addActions: boolean = true): ListingConfig => ({
  headers: [t('properties.values.show.title') , t('properties.properties.show.title')],
  fields: [
    { name: 'value', type: FieldType.Text },
    { name: 'property',
      type: FieldType.NestedText,
      keys: ['name'],
      clickable: true,
      clickIdentifiers: [{id: ['id']}],
      clickUrl: {name: 'properties.properties.show'}},
  ],
  identifierKey: 'id',
  addActions: addActions,
  addEdit: true,
  editUrlName: 'properties.values.edit',
  showUrlName: 'properties.values.show',
  addShow: true,
  addDelete: true,
  addPagination: true,
  deleteMutation: deletePropertySelectValueMutation,
});

export const showConfigConstructor = (t: Function, id): ShowConfig => ({
  cols: 1,
  subscription: getPropertySelectValueSubscription,
  subscriptionKey: 'propertySelectValue',
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
      label: t('properties.properties.show.title'),
      name: 'property',
      type: FieldType.NestedText,
      keys: ['name'],
    },
    {
      label: t('properties.values.show.title'),
      name: 'value',
      type: FieldType.Text
    }
  ]
});

export const listingQueryKey = 'propertySelectValues';
export const listingQuery = propertySelectValuesQuery;
