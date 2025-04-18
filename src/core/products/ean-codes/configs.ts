import {FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import {ListingConfig} from "../../../shared/components/organisms/general-listing/listingConfig";
import {ShowField} from "../../../shared/components/organisms/general-show/showConfig";
import { eanCodesQuery } from "../../../shared/api/queries/eanCodes.js"
import { productsQuery } from "../../../shared/api/queries/products.js"
import {
    deleteEanCodeMutation,
    deleteEanCodesMutation,
    generateEanCodes
} from "../../../shared/api/mutations/eanCodes.js";

export const baseFormGenerateConfigConstructor = (
  t: Function,
): FormConfig => ({
  cols: 1,
  type: FormType.CREATE,
  mutation: generateEanCodes,
  allowNull: true,
  mutationKey: 'generateEanCodes',
  submitUrl: { name: 'products.eanCodes.list' },
  submitSuccessCreate: t('products.eanCodes.generateSuccessfully'),
  addSubmitAndContinue: false,
  submitLabel: t('shared.button.generate'),
  addDelete: false,
  helpSections: [
    {
      header: t('products.eanCodes.helpSection.prefix.header'),
      content: t('products.eanCodes.helpSection.prefix.content'),
    },
  ],
  fields: [
    {
      type: FieldType.Text,
      name: 'prefix',
      label: t('products.eanCodes.labels.prefix'),
      placeholder: t('products.eanCodes.placeholders.prefix'),
    },
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
  submitUrl: { name: 'products.eanCodes.list' },
  submitAndContinueUrl: { name: 'products.eanCodes.edit' },
  deleteMutation: deleteEanCodeMutation,
  fields: [
    {
      type: FieldType.Text,
      name: 'eanCode',
      label: t('products.eanCodes.labels.eanCode'),
      placeholder: t('products.eanCodes.placeholders.eanCode'),
    },
    {
        type: FieldType.Query,
        name: 'product',
        label:  t('shared.labels.product'),
        labelBy: 'name',
        valueBy: 'id',
        query: productsQuery,
        dataKey: 'products',
        isEdge: true,
        multiple: false,
        filterable: true,
        formMapIdentifier: 'id',
        disabled: true,
        optional: true,
        removable: false
    },
    {
        type: FieldType.Checkbox,
        name: 'alreadyUsed',
        label: t('products.eanCodes.labels.alreadyUsed'),
        default: true,
        uncheckedValue: "false",
        optional: true,
    },
  ],
});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
   {
      type: FieldType.Boolean,
      name: 'product',
      strict: true,
      reverse: true,
      addLookup: true,
      lookupType: 'isNull',
      lookupKeys: ['id'],
      label: t('products.eanCodes.labels.isAssigned')
   },
   {
      type: FieldType.Boolean,
      name: 'internal',
      addLookup: true,
      strict: true,
      label: t('products.eanCodes.labels.internal')
   },
  ],
  orders: []
});


const getAddPagination = (productId) => {
  return !productId;
}
export const listingConfigConstructor = (t: Function, productId: string | null = null, isMainPage: boolean = false): ListingConfig => ({
  headers: [t('products.eanCodes.labels.eanCode'), t('products.eanCodes.labels.productName'), t('products.eanCodes.labels.internal'), t('products.eanCodes.labels.alreadyUsed')],
  fields: [
      { name: 'eanCode', type: FieldType.Text},
      { name: 'product',
          type: FieldType.NestedText,
          keys: ['name'],
          clickable: true,
          clickIdentifiers: [{id: ['id']}],
          clickUrl: { name: 'products.products.show' }
      },
      { name: 'internal', type: FieldType.Boolean},
      { name: 'alreadyUsed', type: FieldType.Boolean},
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'products.eanCodes.edit',
  urlQueryParams: productId ? { "productId": productId } : undefined,
  addShow: false,
  addDelete: true,
  isMainPage: isMainPage,
  addPagination: getAddPagination(productId),
  deleteMutation: deleteEanCodeMutation,
  bulkDeleteMutation: deleteEanCodesMutation,
  addBulkDelete: true,
  bulkDeleteSuccessAlert: t('products.eanCodes.alert.toast.bulkDeleteSuccess'),
  bulkDeleteErrorAlert: t('products.eanCodes.alert.toast.bulkDeleteError')
});

export const listingQueryKey = 'eanCodes';
export const listingQuery = eanCodesQuery;

