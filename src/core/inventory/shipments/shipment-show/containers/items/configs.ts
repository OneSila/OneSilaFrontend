import { FieldType } from '../../../../../../shared/utils/constants';
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import { SearchConfig } from "../../../../../../shared/components/organisms/general-search/searchConfig";
import { shipmentItemsToShipQuery } from "../../../../../../shared/api/queries/inventory.js";

export const listingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [t('shared.labels.product'), t('shared.labels.quantity')],
  fields: [
    {
      name: 'product',
      type: FieldType.NestedText,
      keys: ['name'],
    },
    {
      name: 'quantity',
      type: FieldType.Text,
    },
  ],
  identifierKey: 'id',
  addActions: false,
  addEdit: false,
  addShow: false,
  addDelete: false,
  addPagination: true,
});

export const searchConfigConstructor = (): SearchConfig => ({
  search: false,
  filters: [],
  orders: [],
});

export const listingQueryKey = 'shipmentitemstoship';
export const listingQuery = shipmentItemsToShipQuery;
