import {FormConfig, FormField, FormType} from '../../../../../../shared/components/organisms/general-form/formConfig';
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
  autoUpdatePrice: boolean = false,
  productsId: string[] = []
): FormConfig => {
  let fields: FormField[] = [
    {
      type: FieldType.Hidden,
      name: 'salespricelist',
      value: { "id": salesPriceListId }
    },
    {
      type: FieldType.Query,
      name: 'product',
      label: t('shared.labels.product'),
      labelBy: 'name',
      valueBy: 'id',
      query: productsQuery,
      dataKey: 'products',
      queryVariables: productsId.length > 0 ? { filter: {id: { "nInList": productsId } }} : undefined,
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
    }
  ];

  if (!autoUpdatePrice) {
    fields.push({
      type: FieldType.Text,
      name: 'salesprice',
      label: t('shared.labels.price'),
      placeholder: t('shared.placeholders.price'),
      number: true,
    });
  }

  return {
    cols: 1,
    type: type,
    mutation: mutation,
    mutationKey: mutationKey,
    deleteMutation: deleteSalesPriceListItemMutation,
    submitUrl: { name: 'sales.priceLists.show', params: { id: salesPriceListId }, query: { tab: 'items' } },
    fields: fields
  };
};


export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: false,
  orderKey: "sort",
  filters: [],
  orders: []
});

export const listingConfigConstructor = (t: Function, salesPriceListId: string, addEdit: boolean = true): ListingConfig => ({
  headers: [t('shared.labels.product'), t('shared.labels.price')],
  fields: [
    {
      name: 'product',
      type: FieldType.NestedText,
      keys: ['name']
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
  addEdit: addEdit,
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteSalesPriceListItemMutation,
});

export const listingQueryKey = 'salesPriceListItems';
export const listingQuery = salesPriceListItemsQuery;

