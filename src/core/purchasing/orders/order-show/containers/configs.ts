import { FormConfig, FormType } from '../../../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../../../shared/utils/constants.js'
import { SearchConfig } from "../../../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../../../shared/components/organisms/general-listing/listingConfig";
import { deletePurchaseOrderItemMutation} from "../../../../../shared/api/mutations/purchasing.js";
import { purchaseOrderItemsQuery, supplierProductsQuery } from "../../../../../shared/api/queries/purchasing.js";
import {supplierProductOnTheFlyConfig} from "../../../products/configs";
export const baseFormConfigConstructor = (
  t: Function,
  type: FormType,
  mutation: any,
  mutationKey: string,
  orderId: string,
  supplierId: string,
  productsId: string[] = [],
  symbol: string | undefined = undefined
): FormConfig => ({
  cols: 1,
  type: type,
  mutation: mutation,
  mutationKey: mutationKey,
  deleteMutation: deletePurchaseOrderItemMutation,
  submitUrl: { name: 'purchasing.orders.show', params: {id: orderId }, query: {tab: 'items'}},
  fields: [
    {
      type: FieldType.Hidden,
      name: 'purchaseOrder',
      value: { "id": orderId}
    },
    {
      type: FieldType.Query,
      name: 'product',
      query: supplierProductsQuery,
      queryVariables: productsId.length > 0
        ? {
            filter: {
              supplier: { id: { exact: supplierId } },
              NOT: { id: { inList: productsId } },
            },
          }
        : {
            filter: {
              supplier: { id: { exact: supplierId } },
            },
          },
      label: t('purchasing.products.show.title'),
      labelBy: 'name',
      valueBy: 'id',
      dataKey: 'supplierProducts',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
      createOnFlyConfig: supplierProductOnTheFlyConfig(t, supplierId)
    },
    {
      type: FieldType.Text,
      name: 'quantity',
      label: t('shared.labels.quantity'),
      placeholder: t('shared.placeholders.quantity'),
      number: true,
    },
    {
      type: FieldType.Text,
      name: 'unitPrice',
      label: t('purchasing.products.labels.unitPrice'),
      placeholder: t('purchasing.products.placeholders.unitPrice'),
      float: true,
      prepend: symbol
    },
    ],
});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: false,
  orderKey: "sort",
  filters: [],
  orders: []
});

export const listingConfigConstructor = (t: Function, orderId: string): ListingConfig => ({
  headers: [t('shared.labels.product'), t('shared.labels.quantity'),  t('purchasing.products.labels.unitPrice')],
  fields: [
    {
      name: 'product',
      type: FieldType.NestedText,
      keys: ['name'],
      clickable: true,
      clickIdentifiers: [{id: ['proxyId']}],
      clickUrl: {name: 'products.products.show'},
    },
    {
      name: 'quantity',
      type: FieldType.Text,
    },
    {
      name: 'priceWithCurrency',
      type: FieldType.Text,
    },
  ],
  identifierKey: 'id',
  identifierVariables: {orderId: orderId},
  addActions: true,
  addEdit: true,
  editUrlName: 'purchasing.orders.items.edit',
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deletePurchaseOrderItemMutation,
});

export const listingQueryKey = 'purchaseOrderItems';
export const listingQuery = purchaseOrderItemsQuery;

