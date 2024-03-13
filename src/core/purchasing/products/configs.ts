import {FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import {FieldType} from '../../../shared/utils/constants.js'
import {SearchConfig} from "../../../shared/components/organisms/general-search/searchConfig";
import {ListingConfig, ListingField, NestedTextField} from "../../../shared/components/organisms/general-listing/listingConfig";
import {supplierProductsQuery} from "../../../shared/api/queries/purchasing.js"
import {deleteSupplierProductMutation} from "../../../shared/api/mutations/purchasing.js";
import {currenciesQuery} from "../../../shared/api/queries/currencies.js";
import {unitsQuery} from "../../../shared/api/queries/units.js";
import {productVariationsQuery} from "../../../shared/api/queries/products.js";
import {suppliersQuery} from "../../../shared/api/queries/contacts.js";

const getSubmitUrl = (supplierId, productId) => {
  if (supplierId) {
    return { name: 'purchasing.suppliers.show', params: {id: supplierId}, query: {tab: 'products'} };
  }

  if (productId) {
    return { name: 'products.products.show', params: {id: productId}, query: { tab: 'supplierProducts'} };
  }
  return { name: 'purchasing.products.list' };
}

const getSubmitAndContinueUrl = (supplierId, productId) => {
  if (supplierId) {
    return { name: 'purchasing.product.edit', query: { supplierId } };
  }
  if (productId) {
    return { name: 'purchasing.product.edit', query: { productId } };
  }
  return { name: 'purchasing.product.edit' };
}

const getSupplierField = (supplierId, t): FormField => {
  if (supplierId) {
    return {
      type: FieldType.Hidden,
      name: 'supplier',
      value: { "id": supplierId }
    };
  } else {
    return     {
        type: FieldType.Query,
        name: 'supplier',
        label: t('purchasing.orders.labels.supplier'),
        labelBy: 'name',
        valueBy: 'id',
        query: suppliersQuery,
        dataKey: 'suppliers',
        isEdge: true,
        multiple: false,
        filterable: true,
        formMapIdentifier: 'id',
    };
  }
}

const getProductField = (variationId, t): FormField => {
  if (variationId) {
    return {
      type: FieldType.Hidden,
      name: 'product',
      value: { "id": variationId }
    };
  } else {
    return {
        type: FieldType.Query,
        name: 'product',
        label:  t('shared.labels.product'),
        labelBy: 'sku',
        valueBy: 'id',
        query: productVariationsQuery,
        dataKey: 'productVariations',
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
  supplierId: string | null = null,
  productId: string | null = null,
  variationId: string | null = null
): FormConfig => ({
 cols: 1,
  type: type,
  mutation: mutation,
  mutationKey: mutationKey,
  submitUrl: getSubmitUrl(supplierId, productId),
  submitAndContinueUrl: getSubmitAndContinueUrl(supplierId, productId),
  deleteMutation: deleteSupplierProductMutation,
  fields: [
    {
      type: FieldType.Text,
      name: 'name',
      label: t('shared.labels.name'),
      placeholder: t('shared.placeholders.name'),
    },
    {
      type: FieldType.Text,
      name: 'sku',
      label: t('purchasing.products.labels.sku'),
      placeholder: t('shared.placeholders.sku'),
    },
    {
      type: FieldType.Text,
      name: 'quantity',
      label: t('shared.labels.quantity'),
      placeholder: t('shared.placeholders.quantity'),
      number: true,
    },
    {
      type: FieldType.Query,
      name: 'unit',
      label: t('shared.labels.unit'),
      labelBy: 'name',
      valueBy: 'id',
      query: unitsQuery,
      dataKey: 'units',
      isEdge: true,
      multiple: false,
      filterable: true,
      removable: false,
      formMapIdentifier: 'id',
    },
    {
      type: FieldType.Text,
      name: 'unitPrice',
      label: t('purchasing.products.labels.unitPrice'),
      placeholder: t('purchasing.products.placeholders.unitPrice'),
      number: true,
    },
    {
      type: FieldType.Query,
      name: 'currency',
      label: t('shared.labels.currency'),
      labelBy: 'symbol',
      valueBy: 'id',
      query: currenciesQuery,
      dataKey: 'currencies',
      isEdge: true,
      multiple: false,
      filterable: true,
      removable: false,
      formMapIdentifier: 'id',
    },
    getProductField(variationId, t),
    getSupplierField(supplierId, t)
    ],
});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
});

const getHeaders = (supplierId, productId, t) => {
  if (supplierId) {
    return [t('shared.labels.name'),t('shared.labels.sku'), t('shared.labels.quantity'), t('shared.labels.product')];
  }
  if (productId) {
    return [t('shared.labels.name'),t('shared.labels.sku'), t('shared.labels.quantity'), t('purchasing.products.labels.supplier')];
  }
  return [t('shared.labels.name'),t('shared.labels.sku'), t('shared.labels.quantity'), t('purchasing.products.labels.supplier'), t('shared.labels.product')];
}

const getFields = (supplierId, productId): ListingField[] => {
  const commonFields: ListingField[] = [
    {
      name: 'name',
      type: FieldType.Text,
    },
    {
      name: 'sku',
      type: FieldType.Text,
    },
    {
      name: 'quantity',
      type: FieldType.Text,
    },
  ];

  if (!supplierId) {
    commonFields.push({ name: 'supplierName', type: FieldType.NestedText, keys: ['supplier', 'name'] });
  }

  if (!productId) {
    commonFields.push({ name: 'productSku', type: FieldType.NestedText, keys: ['product', 'sku'] });
  }


  return commonFields;
}

const getUrlQueryParams = (supplierId: string | null = null, productId: string | null = null, variationId: string | null = null): Record<string, string> | undefined => {
  const params: Record<string, string> = {};

  if (supplierId) {
    params.supplierId = supplierId;
  }
  if (productId && variationId) {
    params.productId = productId;
    params.variationId = variationId;
  }

  return Object.keys(params).length > 0 ? params : undefined;
}

export const listingConfigConstructor = (t: Function,
                                         supplierId: string | null = null,
                                         productId: string | null = null,
                                         variationId: string | null = null
): ListingConfig => ({
  headers: getHeaders(supplierId, productId, t),
  fields: getFields(supplierId, productId),
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'purchasing.product.edit',
  urlQueryParams: getUrlQueryParams(supplierId, productId, variationId),
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteSupplierProductMutation,
});

export const listingQueryKey = 'supplierProducts';
export const listingQuery = supplierProductsQuery;
