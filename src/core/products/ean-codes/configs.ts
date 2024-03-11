import {FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import {ListingConfig, ListingField} from "../../../shared/components/organisms/general-listing/listingConfig";
import { eanCodesQuery } from "../../../shared/api/queries/eanCodes.js"
import { productsQuery } from "../../../shared/api/queries/products.js"
import { deleteEanCodeMutation } from "../../../shared/api/mutations/eanCodes.js";

const getSubmitUrl = (productId) => {
  if (productId) {
    return { name: 'products.products.show', params: {id: productId}, query: {tab: 'eanCodes'} };
  }
  return { name: 'products.eanCodes.list' };
}

const getSubmitAndContinueUrl = (productId) => {
  if (productId) {
    return { name: 'products.eanCodes.edit', query: { productId } };
  }
  return  { name: 'products.eanCodes.edit' };
}

const getProductField = (productId, t): FormField => {
  if (productId) {
    return {
      type: FieldType.Hidden,
      name: 'product',
      value: { "id": productId }
    };
  } else {
    return {
        type: FieldType.Query,
        name: 'product',
        label:  t('shared.labels.product'),
        labelBy: 'sku',
        valueBy: 'id',
        query: productsQuery,
        dataKey: 'products',
        isEdge: true,
        multiple: false,
        filterable: true,
        formMapIdentifier: 'id',
    };
  }
}

export const baseFormConfigConstructor = (
  t: Function,
  type: FormType,
  mutation: any,
  mutationKey: string,
  productId: string | null = null
): FormConfig => ({
 cols: 1,
  type: type,
  mutation: mutation,
  mutationKey: mutationKey,
  submitUrl: getSubmitUrl(productId),
  submitAndContinueUrl: getSubmitAndContinueUrl(productId),
  deleteMutation: deleteEanCodeMutation,
  fields: [
    {
      type: FieldType.Text,
      name: 'eanCode',
      label: t('products.eanCodes.labels.eanCode'),
      placeholder: t('products.eanCodes.placeholders.eanCode'),
    },
    getProductField(productId, t)
    ],
});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
});

const getHeaders = (t, productId) => {
  return productId
    ? [t('products.eanCodes.labels.eanCode')]
    : [t('products.products.labels.sku'), t('products.eanCodes.labels.eanCode')];
}
const getFields = (productId): ListingField[] => {
  const commonFields: ListingField[] = [];

  if (!productId) {
    commonFields.push({
      name: 'productName',
      type: FieldType.NestedText,
      keys: ['product', 'sku']
    });
  }

  commonFields.push({name: 'eanCode', type: FieldType.Text})

  return commonFields;
}

const getAddPagination = (productId) => {
  return !productId;
}
export const listingConfigConstructor = (t: Function, productId: string | null = null): ListingConfig => ({
  headers: getHeaders(t, productId),
  fields: getFields(productId),
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'products.eanCodes.edit',
  urlQueryParams: productId ? { "productId": productId } : undefined,
  addShow: false,
  addDelete: true,
  addPagination: getAddPagination(productId),
  deleteMutation: deleteEanCodeMutation,
});

export const listingQueryKey = 'eanCodes';
export const listingQuery = eanCodesQuery;

