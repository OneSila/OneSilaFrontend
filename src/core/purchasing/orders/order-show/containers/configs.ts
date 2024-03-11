import { FormConfig, FormType } from '../../../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../../../shared/utils/constants.js'
import { SearchConfig } from "../../../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../../../shared/components/organisms/general-listing/listingConfig";
import { deletePurchaseOrderItemMutation} from "../../../../../shared/api/mutations/purchasing.js";
import { purchaseOrderItemsQuery, supplierProductsQuery } from "../../../../../shared/api/queries/purchasing.js";
export const baseFormConfigConstructor = (
  t: Function,
  type: FormType,
  mutation: any,
  mutationKey: string,
  orderId: string,
  supplierId: string
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
      name: 'item',
      query: supplierProductsQuery,
      queryVariables: {filter: {supplier: {id: {exact: supplierId}}}},
      label: t('purchasing.companies.address.labels.contact'),
      labelBy: 'name',
      valueBy: 'id',
      dataKey: 'supplierProducts',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
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
      number: true,
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
      name: 'item',
      type: FieldType.NestedText,
      keys: ['name']
    },
    {
      name: 'quantity',
      type: FieldType.Boolean,
    },
    {
      name: 'unit_price',
      type: FieldType.Boolean,
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

