import { FormConfig, FormType } from '../../../../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../../../../shared/utils/constants'
import { SearchConfig } from "../../../../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import { deleteOrderNoteMutation} from "../../../../../../shared/api/mutations/salesOrders.js";
import { orderNotesQuery } from "../../../../../../shared/api/queries/salesOrders.js";

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
  deleteMutation: deleteOrderNoteMutation,
  submitUrl: { name: 'sales.orders.show', params: {id: orderId }, query: {tab: 'notes'}},
  fields: [
    {
      type: FieldType.Hidden,
      name: 'order',
      value: { "id": orderId}
    },
    {
      type: FieldType.Textarea,
      name: 'note',
      label: t('sales.orders.labels.note'),
      placeholder: t('sales.orders.placeholders.note'),
      scroll: true,
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
      name: 'note',
      type: FieldType.Text,
    },
    {
      name: 'createdAt',
      type: FieldType.Date,
    },
  ],
  identifierKey: 'id',
  identifierVariables: {orderId: orderId},
  addActions: true,
  addEdit: true,
  editUrlName: 'sales.orders.notes.edit',
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteOrderNoteMutation,
});

export const listingQueryKey = 'orderNotes';
export const listingQuery = orderNotesQuery;

