import { SearchConfig } from "../../../../../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../../../../../shared/components/organisms/general-listing/listingConfig";
import { FieldType } from "../../../../../../../shared/utils/constants";
import { salesPriceListItemsQuery } from "../../../../../../../shared/api/queries/salesPrices.js";
import { deleteSalesPriceListItemMutation } from "../../../../../../../shared/api/mutations/salesPrices.js";

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: false,
  orderKey: 'sort',
  filters: [],
  orders: []
});

export const listingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [
    t('sales.priceLists.show.title'),
    t('shared.labels.price'),
    t('shared.labels.discountPrice'),
    t('sales.prices.labels.discountPercentage')
  ],
  fields: [
    {
      name: 'salespricelist',
      type: FieldType.NestedText,
      keys: ['name']
    },
    {
      name: 'price',
      type: FieldType.Text
    },
    {
      name: 'discount',
      type: FieldType.Text
    },
    {
      name: 'salespricelist',
      type: FieldType.NestedText,
      keys: ['discountPcnt']
    }
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: false,
  addShow: false,
  addDelete: true,
  deleteMutation: deleteSalesPriceListItemMutation,
  addPagination: true
});

export const listingQuery = salesPriceListItemsQuery;
export const listingQueryKey = 'salesPriceListItems';

