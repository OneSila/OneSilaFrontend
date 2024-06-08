import {CreateOnTheFly, FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import {FieldType, ProductType} from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import {ListingConfig} from "../../../shared/components/organisms/general-listing/listingConfig";
import { inventoriesQuery, inventoryLocationsQuery } from "../../../shared/api/queries/inventory.js"
import {productsQuery} from "../../../shared/api/queries/products.js"
import {createInventoryLocationMutation, deleteInventoryMutation} from "../../../shared/api/mutations/inventory.js";
import {ShowConfig, ShowField} from "../../../shared/components/organisms/general-show/showConfig";
import {baseFormConfigConstructor as baseStocklocationConfigConstructor } from '../inventory-location/configs'
import { getInventorySubscription } from '../../../shared/api/subscriptions/inventory.js';

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
        queryVariables: {"filter": {"type": {"exact": ProductType.Supplier}}},
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

const getHeaders = (t, productId, isSupplierProduct) => {
  const nameLabel = isSupplierProduct ? t('shared.labels.name') : t('purchasing.products.show.title');
  return productId && isSupplierProduct
    ? [t('inventory.inventoryLocations.show.title'), t('shared.labels.quantity'), t('purchasing.orders.labels.supplier')]
    : [nameLabel, t('inventory.inventoryLocations.show.title'), t('shared.labels.quantity'), t('purchasing.orders.labels.supplier')];
}
const getFields = (productId, isSupplierProduct): ShowField[] => {
  const commonFields: ShowField[] = [];

  if (!productId || !isSupplierProduct) {
    commonFields.push({
      name: 'product',
      type: FieldType.NestedText,
      keys: ['name'],
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

   commonFields.push({
      name: 'product',
      type: FieldType.NestedText,
      keys: ['supplier', 'name'],
      clickable: true,
      clickIdentifiers: [{id: ['supplier', 'id']}],
      clickUrl: { name: 'purchasing.suppliers.show', query: {tab: 'inventory'}},
    });

  return commonFields;
}
export const listingConfigConstructor = (t: Function, productId: string | null = null, isSupplierProduct: boolean = true): ListingConfig => ({
  headers: getHeaders(t, productId, isSupplierProduct),
  fields: getFields(productId, isSupplierProduct),
  identifierKey: 'id',
  addActions: isSupplierProduct,
  addEdit: isSupplierProduct,
  editUrlName: 'inventory.inventory.edit',
  showUrlName: 'inventory.inventory.show',
  urlQueryParams: productId && isSupplierProduct ? { "productId": productId } : undefined,
  addShow: true,
  addDelete: isSupplierProduct,
  addPagination: true,
  deleteMutation: deleteInventoryMutation,
});

export const showConfigConstructor = (t: Function, id): ShowConfig => ({
  cols: 1,
  subscription: getInventorySubscription,
  subscriptionKey: 'inventory',
  subscriptionVariables: {pk: id},
  backUrl:  {name: 'inventory.inventory.list' },
  editUrl: {name: 'inventory.inventory.edit', params: { id: id } },
  deleteMutation: deleteInventoryMutation,
  deleteVariables: { id: id },
  addBack: true,
  addEdit: true,
  addDelete: true,
  fields: [
  {
    label: t('shared.labels.quantity'),
    name: 'quantity',
    type: FieldType.Text,
  },
  {
    label: t('products.products.show.title'),
    name: 'product',
    type: FieldType.NestedText,
    keys: ['name'],
    clickable: true,
    clickIdentifiers: [{id: ['id']}],
    clickUrl: { name: 'products.products.show', query: {tab: 'inventory'}},
  },
  {
    label: t('inventory.inventoryLocations.show.title'),
    name: 'stocklocation',
    type: FieldType.NestedText,
    keys: ['name'],
    clickable: true,
    clickIdentifiers: [{id: ['id']}],
    clickUrl: { name: 'inventory.inventoryLocations.edit'},
  },
  {
    label: t('purchasing.suppliers.show.title'),
    name: 'product',
    type: FieldType.NestedText,
    keys: ['supplier', 'name'],
    clickable: true,
    clickIdentifiers: [{id: ['supplier', 'id']}],
    clickUrl: { name: 'purchasing.suppliers.show'},
   }
  ]
});

export const listingQueryKey = 'inventories';
export const listingQuery = inventoriesQuery;

