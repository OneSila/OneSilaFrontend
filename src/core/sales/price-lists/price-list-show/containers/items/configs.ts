import { FormConfig, FormType } from '../../../../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../../../../shared/utils/constants'
import { SearchConfig } from "../../../../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import { deleteSalesPriceListItemMutation} from "../../../../../../shared/api/mutations/salesPrices.js";
import { salesPriceListItemsQuery } from "../../../../../../shared/api/queries/salesPrices.js";
import { productsQuery } from "../../../../../../shared/api/queries/products.js";
export const baseFormConfigConstructor = (
  t: Function,
  type: FormType,
  mutation: any,
  mutationKey: string,
  salesPriceListId: string,
): FormConfig => ({
  cols: 1,
  type: type,
  mutation: mutation,
  mutationKey: mutationKey,
  deleteMutation: deleteSalesPriceListItemMutation,
  submitUrl: { name: 'sales.priceLists.show', params: {id: salesPriceListId }, query: {tab: 'items'}},
  fields: [
    {
      type: FieldType.Hidden,
      name: 'salespricelist',
      value: { "id": salesPriceListId}
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
      name: 'salesprice',
      label: t('sales.priceLists.labels.salesprice'),
      placeholder: t('sales.priceLists.placeholders.salesprice'),
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

export const listingConfigConstructor = (t: Function, salesPriceListId: string): ListingConfig => ({
  headers: [t('shared.labels.product'), t('sales.priceLists.labels.price')],
  fields: [
    {
      name: 'product',
      type: FieldType.NestedText,
      keys: ['product', 'sku']
    },
    {
      name: 'salesprice',
      type: FieldType.Text,
    },
  ],
  identifierKey: 'id',
  editUrlName: 'sales.priceLists.items.edit',
  identifierVariables: {priceListId: salesPriceListId},
  addActions: true,
  addEdit: true,
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteSalesPriceListItemMutation,
});

export const listingQueryKey = 'salesPriceListItems';
export const listingQuery = salesPriceListItemsQuery;

