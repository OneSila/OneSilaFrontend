import { FieldType } from '../../../../../shared/utils/constants.js'
import {inventoryMovementsQuery} from "../../../../../shared/api/queries/inventory.js";
import {ListingConfig} from "../../../../../shared/components/organisms/general-listing/listingConfig";
import {SearchConfig} from "../../../../../shared/components/organisms/general-search/searchConfig";

export const searchConfigConstructor = (t): SearchConfig => ({
  search: false,
  orderKey: "sort",
  filters: [],
  orders: [],
});

export const listingConfigConstructor = (t): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('shared.labels.createdAt'),
  ],
  fields: [
    {
      name: 'name',
      type: FieldType.Text,
    },
    {
      name: 'createdAt',
      type: FieldType.Date,
    },
  ],
  identifierKey: 'id',
  addActions: false,
  addEdit: false,
  addShow: false,
  addDelete: false,
  addPagination: true,
});

export const listingQueryKey = 'inventoryMovements';
export const listingQuery = inventoryMovementsQuery;

