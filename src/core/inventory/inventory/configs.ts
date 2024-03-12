import {FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import {ListingConfig, ListingField} from "../../../shared/components/organisms/general-listing/listingConfig";
import { inventoriesQuery, inventoryLocationsQuery } from "../../../shared/api/queries/inventory.js"
import {productsQuery, productVariationsQuery} from "../../../shared/api/queries/products.js"
import { deleteInventoryMutation } from "../../../shared/api/mutations/inventory.js";

const getProductField = (variationId, t): FormField => {
  if (variationId) {
    return {
      type: FieldType.Hidden,
      name: 'product',
      value: { "id": variationId }
    };
  } else {
    return     {
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
  productId: string | null = null,
  variationId: string | null = null
): FormConfig => ({
 cols: 1,
  type: type,
  mutation: mutation,
  mutationKey: mutationKey,
  submitUrl:  productId ? { name: 'products.products.show', params: {id: productId}, query: { tab: 'inventory'} } : { name: 'inventory.inventory.list' },
  submitAndContinueUrl:  productId ? { name: 'inventory.inventory.edit', query: { productId } } : { name: 'inventory.inventory.edit' },
  deleteMutation: deleteInventoryMutation,
  fields: [
    {
      type: FieldType.Text,
      name: 'quantity',
      label: t('shared.labels.quantity'),
      placeholder: t('shared.placeholders.quantity'),
      number: true,
    },
    getProductField(variationId, t),
    {
        type: FieldType.Query,
        name: 'stocklocation',
        label:  t('inventory.inventoryLocations.show.title'),
        labelBy: 'name',
        valueBy: 'id',
        query: inventoryLocationsQuery,
        dataKey: 'inventoryLocations',
        isEdge: true,
        multiple: false,
        filterable: true,
        formMapIdentifier: 'id',
      }
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
    ? [t('inventory.inventoryLocations.show.title'), t('shared.labels.quantity')]
    : [t('products.products.labels.sku'), t('inventory.inventoryLocations.show.title'), t('shared.labels.quantity')];
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

  commonFields.push({
      name: 'locationName',
      type: FieldType.NestedText,
      keys: ['stocklocation', 'name']
    })

  commonFields.push({
      name: 'quantity',
      type: FieldType.Text,
    })

  return commonFields;
}
export const listingConfigConstructor = (t: Function, productId: string | null = null, variationId: string | null = null): ListingConfig => ({
  headers: getHeaders(t, productId),
  fields: getFields(productId),
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'inventory.inventory.edit',
  urlQueryParams: productId && variationId ? { "productId": productId, "variationId": variationId } : undefined,
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteInventoryMutation,
});

export const listingQueryKey = 'inventories';
export const listingQuery = inventoriesQuery;

