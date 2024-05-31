import {CreateOnTheFly, FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import {FieldType, ProductType} from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import {ListingConfig} from "../../../shared/components/organisms/general-listing/listingConfig";
import { inventoriesQuery, inventoryLocationsQuery } from "../../../shared/api/queries/inventory.js"
import {productsQuery} from "../../../shared/api/queries/products.js"
import {createInventoryLocationMutation, deleteInventoryMutation} from "../../../shared/api/mutations/inventory.js";
import {ShowField} from "../../../shared/components/organisms/general-show/showConfig";
import {baseFormConfigConstructor as baseStocklocationConfigConstructor } from '../inventory-location/configs'

const stocklocationOnTheFlyConfig = (t: Function):CreateOnTheFly => ({
  config: {
    ...baseStocklocationConfigConstructor(
      t,
        FormType.CREATE,
        createInventoryLocationMutation,
        'createInventoryLocationType'
    ) as FormConfig
  }
})
const getProductField = (productId, t): FormField => {
  if (productId) {
    return {
      type: FieldType.Hidden,
      name: 'product',
      value: { "id": productId }
    };
  } else {
    return     {
        type: FieldType.Query,
        name: 'product',
        label:  t('shared.labels.product'),
        labelBy: 'name',
        valueBy: 'id',
        query: productsQuery,
        queryVariables: {"filter": {"type": {"exact": ProductType.Simple}}},
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
    getProductField(productId, t),
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
        createOnFlyConfig: stocklocationOnTheFlyConfig(t),
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
    : [t('shared.labels.name'), t('inventory.inventoryLocations.show.title'), t('shared.labels.quantity')];
}
const getFields = (productId): ShowField[] => {
  const commonFields: ShowField[] = [];

  if (!productId) {
    commonFields.push({
      name: 'product',
      type: FieldType.NestedText,
      keys: ['name']
    });
  }

  commonFields.push({
      name: 'stocklocation',
      type: FieldType.NestedText,
      keys: ['name']
    })

  commonFields.push({
      name: 'quantity',
      type: FieldType.Text,
    })

  return commonFields;
}
export const listingConfigConstructor = (t: Function, productId: string | null = null): ListingConfig => ({
  headers: getHeaders(t, productId),
  fields: getFields(productId),
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'inventory.inventory.edit',
  urlQueryParams: productId ? { "productId": productId } : undefined,
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteInventoryMutation,
});

export const listingQueryKey = 'inventories';
export const listingQuery = inventoriesQuery;

