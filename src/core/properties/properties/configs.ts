import { CreateOnTheFly, FormConfig, FormField, FormType } from '../../../shared/components/organisms/general-form/formConfig';
import {FieldType, getPropertyTypeOptions, PropertyTypes} from '../../../shared/utils/constants';
import { OrderType, SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import {getPropertyQuery, propertiesQuery} from "../../../shared/api/queries/properties.js";
import {
  deletePropertiesMutation,
  deletePropertyMutation,
  updatePropertyMutation
} from "../../../shared/api/mutations/properties.js";
import { ShowConfig } from "../../../shared/components/organisms/general-show/showConfig";
import { getPropertySubscription } from '../../../shared/api/subscriptions/properties.js';

export const getPropertyTypeBadgeMap = (t) => ({
  [PropertyTypes.INT]: { text: t('properties.properties.types.int'), color: 'blue' },
  [PropertyTypes.FLOAT]: { text: t('properties.properties.types.float'), color: 'yellow' },
  [PropertyTypes.TEXT]: { text: t('properties.properties.types.text'), color: 'green' },
  [PropertyTypes.DESCRIPTION]: { text: t('properties.properties.types.description'), color: 'orange' },
  [PropertyTypes.BOOLEAN]: { text: t('properties.properties.types.boolean'), color: 'purple' },
  [PropertyTypes.DATE]: { text: t('properties.properties.types.date'), color: 'pink' },
  [PropertyTypes.DATETIME]: { text: t('properties.properties.types.datetime'), color: 'red' },
  [PropertyTypes.SELECT]: { text: t('properties.properties.types.select'), color: 'indigo' },
  [PropertyTypes.MULTISELECT]: { text: t('properties.properties.types.multiselect'), color: 'gray' }
});



export const editBaseFormConfigurator = (id: string): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updatePropertyMutation,
  mutationKey: 'updateProperty',
  submitUrl: { name: 'properties.properties.list' },
  submitAndContinueUrl: { name: 'properties.properties.edit' },
  deleteMutation: deletePropertyMutation,
  mutationId: id,
  query: getPropertyQuery,
  queryVariables: { id },
  queryDataKey: 'property',
  addShow: true,
  showUrlName: 'properties.properties.show',
  fields: []
});

export const getEditFields = (t: Function, id: string) => [
  {
    type: FieldType.Hidden,
    name: 'id',
    value: id
  },
  {
    type: FieldType.Choice,
    name: 'type',
    label: t('products.products.labels.type.title'),
    labelBy: 'name',
    valueBy: 'code',
    options: getPropertyTypeOptions(t),
    disabled: true,
    removable: false
  },
  {
    type: FieldType.Checkbox,
    name: 'isPublicInformation',
    label: t('properties.properties.labels.isPublicInformation'),
    default: true,
    uncheckedValue: 'false',
    help: t('properties.properties.help.isPublicInformation'),
    optional: true
  },
  {
    type: FieldType.Checkbox,
    name: 'addToFilters',
    label: t('properties.properties.labels.addToFilters'),
    default: false,
    uncheckedValue: 'false',
    help: t('properties.properties.help.addToFilters'),
    optional: true
  },
] as FormField[];

export const editFormConfigConstructor = (t: Function, id: string): FormConfig => ({
  ...editBaseFormConfigurator(id),
  fields: getEditFields(t, id),
});

export const getAdvancedFields = (t, id): any[] => [
  {
    type: FieldType.Hidden,
    name: 'id',
    value: id
  },
  {
    type: FieldType.Text,
    name: 'internalName',
    label: t('properties.properties.labels.internalName'),
    help: t('properties.properties.help.internalName'),
    labelBy: 'name',
    valueBy: 'code',
    options: getPropertyTypeOptions(t),
    disabled: true,
    optional: true
  },
  // {
  //   type: FieldType.Textarea,
  //   name: 'valueValidator',
  //   label: t('properties.properties.labels.valueValidator'),
  //   help: t('properties.properties.help.valueValidator'),
  //   optional: true
  // },
] as FormField[];

export const advancedFormConfigConstructor = (t: Function, id: string): FormConfig => ({
  ...editBaseFormConfigurator(id),
  fields: [
    ...getAdvancedFields(t, id)
  ],
});

export const baseFormConfigConstructor = (
  t: Function,
  type: FormType,
  mutation: any,
  mutationKey: string
): FormConfig => ({
  cols: 1,
  type: type,
  mutation: mutation,
  mutationKey: mutationKey,
  submitUrl: { name: 'properties.properties.list' },
  submitAndContinueUrl: { name: 'properties.properties.edit' },
  deleteMutation: deletePropertyMutation,
  fields: [
    {
      type: FieldType.Text,
      name: 'name',
      label: t('shared.labels.name'),
      placeholder: t('shared.placeholders.name')
    },
    {
      type: FieldType.Choice,
      name: 'type',
      label: t('products.products.labels.type.title'),
      labelBy: 'name',
      valueBy: 'code',
      options: getPropertyTypeOptions(t),
      help: t('properties.properties.help.type')
    },
    {
      type: FieldType.Checkbox,
      name: 'isPublicInformation',
      label: t('properties.properties.labels.isPublicInformation'),
      default: true,
      uncheckedValue: "false",
      help: t('properties.properties.help.isPublicInformation'),
      optional: true
    },
    {
      type: FieldType.Checkbox,
      name: 'addToFilters',
      label: t('properties.properties.labels.addToFilters'),
      default: false,
      uncheckedValue: "false",
      help: t('properties.properties.help.addToFilters'),
      optional: true
    },
    {
      type: FieldType.Checkbox,
      name: 'hasImage',
      label: t('properties.properties.labels.hasImage'),
      default: false,
      uncheckedValue: "false",
      help: t('properties.properties.help.hasImage'),
      optional: true
    }
  ],
});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
    filters: [
      {
        type: FieldType.Boolean,
        addLookup: true,
        strict: true,
        name: 'isPublicInformation',
        label: t('properties.properties.labels.isPublicInformation')
      },
      {
        type: FieldType.Boolean,
        name: 'missingMainTranslation',
        label: t('properties.properties.labels.missingMainTranslation'),
        strict: true,
      },
      {
        type: FieldType.Boolean,
        name: 'missingTranslations',
        label: t('properties.properties.labels.missingTranslations'),
        strict: true,
      },
      {
        type: FieldType.Boolean,
        name: 'usedInProducts',
        label: t('properties.properties.labels.usedInProducts'),
        strict: true,
      },
      {
        type: FieldType.Choice,
        name: 'type',
        label: t('products.products.labels.type.title'),
        labelBy: 'name',
        valueBy: 'code',
        options: getPropertyTypeOptions(t),
        addLookup: true
      },
    ],
  orders: [
    {
      name: 'createdAt',
      label: t('shared.sort.newest'),
      type: OrderType.DESC
    },
    {
      name: 'createdAt',
      label: t('shared.sort.oldest'),
      type: OrderType.ASC
    },
  ]
});

export const listingConfigConstructor = (t: Function, isMainPage: boolean = false): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('products.products.labels.type.title'),
    t('properties.properties.labels.usageCount'),
    t('properties.properties.labels.isPublicInformation'),
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'type', type: FieldType.Badge, badgeMap: getPropertyTypeBadgeMap(t) },
    { name: 'usageCount', type: FieldType.Text },
    { name: 'isPublicInformation', type: FieldType.Boolean },
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'properties.properties.edit',
  showUrlName: 'properties.properties.show',
  addShow: true,
  addDelete: true,
  addPagination: true,
  isMainPage: isMainPage,
  deleteMutation: deletePropertyMutation,
  addBulkDelete: true,
  bulkDeleteMutation: deletePropertiesMutation,
  bulkDeleteSuccessAlert: t('properties.properties.alert.toast.bulkDeleteSuccess'),
  bulkDeleteErrorAlert: t('properties.properties.alert.toast.bulkDeleteError'),
});

export const showConfigConstructor = (t: Function, id): ShowConfig => ({
  cols: 1,
  subscription: getPropertySubscription,
  subscriptionKey: 'property',
  subscriptionVariables: { pk: id },
  backUrl: { name: 'properties.properties.list' },
  editUrl: { name: 'properties.properties.edit', params: { id: id } },
  deleteMutation: deletePropertyMutation,
  deleteVariables: { id: id },
  deleteUrl: { name: 'properties.properties.list' },
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
      label: t('properties.properties.labels.internalName'),
      name: 'internalName',
      type: FieldType.Text,
    },
    {
      label: t('products.products.labels.type.title'),
      name: 'type',
      type: FieldType.Badge,
      badgeMap: getPropertyTypeBadgeMap(t)
    },
    {
      label: t('properties.properties.labels.isPublicInformation'),
      name: 'isPublicInformation',
      type: FieldType.Boolean
    },
    {
      label: t('properties.properties.labels.addToFilters'),
      name: 'addToFilters',
      type: FieldType.Boolean
    }
  ]
});

export const listingQueryKey = 'properties';
export const listingQuery = propertiesQuery;
