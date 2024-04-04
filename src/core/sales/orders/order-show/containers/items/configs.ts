import { FormConfig, FormType } from '../../../../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../../../../shared/utils/constants'
import { SearchConfig } from "../../../../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import { deleteOrderItemMutation} from "../../../../../../shared/api/mutations/salesOrders.js";
import { orderItemsQuery } from "../../../../../../shared/api/queries/salesOrders.js";
import { productsQuery } from "../../../../../../shared/api/queries/products.js";
export const baseFormConfigConstructor = (
  t: Function,
  type: FormType,
  mutation: any,
  mutationKey: string,
  orderId: string,
): FormConfig => ({
  cols: 1,
  type: type,
  mutation: mutation,
  mutationKey: mutationKey,
  deleteMutation: deleteOrderItemMutation,
  submitUrl: { name: 'sales.orders.show', params: {id: orderId }, query: {tab: 'items'}},
  fields: [
    {
      type: FieldType.Hidden,
      name: 'order',
      value: { "id": orderId}
    },
    {
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
      name: 'price',
      label: t('shared.labels.price'),
      placeholder: t('shared.placeholders.price'),
      number: true,
      optional: true
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
  headers: [t('shared.labels.product'), t('shared.labels.quantity'),  t('shared.labels.price')],
  fields: [
    {
      name: 'product',
      type: FieldType.NestedText,
      keys: ['sku']
    },
    {
      name: 'quantity',
      type: FieldType.Text,
    },
    {
      name: 'price',
      type: FieldType.Text,
    },
  ],
  identifierKey: 'id',
  identifierVariables: {orderId: orderId},
  addActions: true,
  addEdit: true,
  editUrlName: 'sales.orders.items.edit',
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteOrderItemMutation,
});

export const listingQueryKey = 'orderItems';
export const listingQuery = orderItemsQuery;

