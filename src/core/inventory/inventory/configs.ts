import {CreateOnTheFly, FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import {FieldType, INVENTORY_MOVEMENTS_MODEL_CODES, ProductType} from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import {ListingConfig} from "../../../shared/components/organisms/general-listing/listingConfig";
import { inventoriesQuery, inventoryLocationsQuery } from "../../../shared/api/queries/inventory.js"
import {productsQuerySelector} from "../../../shared/api/queries/products.js"
import {createInventoryLocationMutation, deleteInventoryMutation} from "../../../shared/api/mutations/inventory.js";
import {ShowConfig, ShowField} from "../../../shared/components/organisms/general-show/showConfig";
import {baseFormConfigConstructor as baseStocklocationConfigConstructor } from '../inventory-location/configs'
import { getInventorySubscription } from '../../../shared/api/subscriptions/inventory.js';

export const MOVEMENT_FROM_MODELS = (t) => [
  { code: INVENTORY_MOVEMENTS_MODEL_CODES.PURCHASE_ORDER, name: t('purchasing.orders.title') },
  { code: INVENTORY_MOVEMENTS_MODEL_CODES.INVENTORY_LOCATION, name: t('inventory.inventoryLocations.title') },
  // { code: MODEL_CODES.ORDER_RETURN, name: t('sales.orderReturn.title') }, // Not yet implemented
];

export const MOVEMENT_TO_MODELS = (t) => [
  { code: INVENTORY_MOVEMENTS_MODEL_CODES.INVENTORY_LOCATION, name: t('inventory.inventoryLocations.title') },
  // { code: MODEL_CODES.PACKAGE, name: t('inventory.packages.title') }, // Not yet implemented
];

const inventorylocationOnTheFlyConfig = (t: Function):CreateOnTheFly => ({
  config: {
    ...baseStocklocationConfigConstructor(
      t,
        FormType.CREATE,
        createInventoryLocationMutation,
        'createInventoryLocation'
    ) as FormConfig
  }
})

export const getProductField = (productId, t): FormField => {
  if (productId) {
    return {
        type: FieldType.Query,
        name: 'product',
        label:  t('shared.labels.product'),
        labelBy: 'name',
        valueBy: 'id',
        query: productsQuerySelector,
        queryVariables: {"filter": {"id": {"exact": productId}}},
        dataKey: 'products',
        isEdge: true,
        multiple: false,
        mandatory: true,
        formMapIdentifier: 'id',
        disabled: true
    };
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
        multiple: false,
        mandatory: true,
        formMapIdentifier: 'id',
    };
  }
}

export const baseFormConfigConstructor = (
  t,
  type,
  mutation,
  mutationKey,
  movementFromModelFromUrl: string | null = null,
  movementFromIdFromUrl: string | null = null,
  productIdFromUrl: string | null = null
) => {
  const fields = [
    getProductField(productIdFromUrl ,t),
    {
      type: FieldType.Text,
      name: 'quantity',
      number: true,
      label: t('inventory.movements.labels.quantity'),
    },
    {
      type: FieldType.Textarea,
      name: t('inventory.movements.labels.notes'),
      label: t('inventory.movements.labels.notes'),
      optional: true,
    },
    movementFromModelFromUrl
      ? {
          type: FieldType.Text,
          name: 'movementFromModel',
          label: t('inventory.movements.labels.movementFromModel'),
          default: movementFromModelFromUrl,
          disabled: true,
        }
      : {
          type: FieldType.Choice,
          name: 'movementFromModel',
          label: t('inventory.movements.labels.movementFromModel'),
          options: MOVEMENT_FROM_MODELS(t),
          labelBy: 'name',
          valueBy: 'code',
        },
    {
      type: FieldType.Choice,
      name: 'movementToModel',
      label: t('inventory.movements.labels.movementToModel'),
      options: MOVEMENT_TO_MODELS(t),
      labelBy: 'name',
      valueBy: 'code',
    },
    {
      type: FieldType.Query,
      name: 'movementToId',
      label: t('inventory.movements.labels.movementTo'),
      labelBy: 'name',
      valueBy: 'id',
      query: inventoryLocationsQuery,
      dataKey: null,
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
      disabled: true,
    },
  ];

  return {
    cols: 1,
    type: type,
    mutation: mutation,
    mutationKey: mutationKey,
    submitUrl:  productIdFromUrl ? { name: 'products.products.show', params: {id: productIdFromUrl}, query: { tab: 'inventory'} } : { name: 'inventory.inventory.list' },
    submitAndContinueUrl: { name: 'inventory.inventory.show' },
    fields: fields,
  };
};

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
      name: 'inventorylocation',
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
  addActions: false,
  addEdit: false,
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
  addEdit: false,
  addDelete: false,
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
    name: 'inventorylocation',
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

