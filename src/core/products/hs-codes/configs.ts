import {FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import { ShowConfig } from "../../../shared/components/organisms/general-show/showConfig";
import { hsCodesQuery } from "../../../shared/api/queries/hsCodes.js"
import { productsQuerySelector } from "../../../shared/api/queries/products.js"
import { deleteHsCodeMutation } from "../../../shared/api/mutations/hsCodes.js";
import { hsCodeSubscription } from "../../../shared/api/subscriptions/hsCodes.js";

const getSubmitUrl = (productId) => {
  if (productId) {
    return { name: 'products.products.show', params: { id: productId }, query: { tab: 'hsCodes' } };
  }
  return { name: 'products.hsCodes.list' };
}

const getSubmitAndContinueUrl = (productId) => {
  if (productId) {
    return { name: 'products.hsCodes.edit', query: { productId } };
  }
  return { name: 'products.hsCodes.edit' };
}

const getProductField = (productId, t, type): FormField | null => {
  if (productId) {
    if (type == FormType.CREATE) {
      return {
        type: FieldType.Hidden,
        name: 'product',
        value: [{ "id": productId }]
      };
    }
    return null;
  } else {
    return {
        type: FieldType.Query,
        name: 'product',
        label:  t('shared.labels.product'),
        labelBy: 'name',
        valueBy: 'id',
        query: productsQuerySelector,
        dataKey: 'products',
        isEdge: true,
        multiple: true,
        filterable: true,
        formMapIdentifier: 'id',
    };
  }
}

const getFields = (productId, t, type): FormField[] => {
  const fields = [
    {
      type: FieldType.Text,
      name: 'code',
      label: t('products.hsCodes.labels.hsCode'),
      placeholder: t('products.hsCodes.placeholders.hsCode'),
    },
    {
      type: FieldType.Text,
      name: 'name',
      label: t('shared.labels.name'),
      placeholder: t('shared.placeholders.name'),
    },
    getProductField(productId, t, type),
  ].filter(field => field !== null);
  return fields as FormField[];
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
  deleteMutation: deleteHsCodeMutation,
  fields: getFields(productId, t, type),
});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
});

export const listingConfigConstructor = (t: Function, productId: string | null = null): ListingConfig => ({
  headers: [t('shared.labels.name'), t('products.hsCodes.labels.hsCode')],
  fields: [
    {
      name: 'name',
      type: FieldType.Text,
    },
    {
      name: 'code',
      type: FieldType.Text,
    },
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'products.hsCodes.edit',
  showUrlName: 'products.hsCodes.show',
  addShow: true,
  addDelete: true,
  addPagination: true,
  urlQueryParams: productId ? { "productId": productId } : undefined,
  deleteMutation: deleteHsCodeMutation,
});

export const showConfigConstructor = (t: Function, id, productId: string | null = null): ShowConfig => ({
  cols: 1,
  subscription: hsCodeSubscription,
  subscriptionKey: 'hsCode',
  subscriptionVariables: {pk: id},
  addBack: true,
  backUrl:  productId ? { name: 'products.products.show', params: {id: productId}, query: {'tab': 'hsCodes'} } : { name: 'products.hsCodes.list' },
  addEdit: true,
  editUrl: productId ? { name: 'products.hsCodes.edit', query: {'productId': productId} } : { name: 'products.hsCodes.edit', params: {id: id} },
  addDelete: true,
  deleteMutation: deleteHsCodeMutation,
  deleteVariables: {id: id},
  fields: [
     {
       type: FieldType.Text,
        name: 'name',
        label:  t('shared.labels.name'),
        showLabel: true
      },
      {
        type: FieldType.Text,
        name: 'code',
        label: t('products.hsCodes.labels.hsCode'),
        showLabel: true
      },
      {
        type: FieldType.Array,
        name: 'product',
        label: t('products.title'),
        clickable: true,
        keys: ['name'],
        showLabel: true,
        clickIdentifiers: [{id: ['id']}],
        clickUrl: {name: 'products.products.show'},
      }
  ]

});
export const listingQueryKey = 'hsCodes';
export const listingQuery = hsCodesQuery;

