import { FormConfig, FormType } from '../../../../../../shared/components/organisms/general-form/formConfig';
import {FieldType, ProductType} from '../../../../../../shared/utils/constants'
import { SearchConfig } from "../../../../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import { deleteOrderItemMutation} from "../../../../../../shared/api/mutations/salesOrders.js";
import { orderItemsQuery } from "../../../../../../shared/api/queries/salesOrders.js";
import { productsQuerySelector } from "../../../../../../shared/api/queries/products.js";

export const baseFormConfigConstructor = (
  t: Function,
  type: FormType,
  mutation: any,
  mutationKey: string,
  orderId: string,
  productsId: string[] = [],
  symbol: string | undefined = undefined
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
      labelBy: 'name',
      valueBy: 'id',
      query: productsQuerySelector,
      queryVariables: productsId.length > 0
      ? {
          filter: {
            AND: [
              { NOT: { id: { inList: productsId } } },
            ],
          },
        }
      : undefined,
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
      float: true,
      optional: true,
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
  headers: [t('shared.labels.product'), t('shared.labels.quantity'),  t('shared.labels.price')],
  fields: [
    {
      name: 'product',
      type: FieldType.NestedText,
      keys: ['name']
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
  addEdit: false,
  editUrlName: 'sales.orders.items.edit',
  addShow: false,
  addDelete: false,
  addPagination: true,
  deleteMutation: deleteOrderItemMutation,
});

export const listingQueryKey = 'orderItems';
export const listingQuery = orderItemsQuery;

