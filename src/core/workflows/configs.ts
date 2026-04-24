import { FieldType } from '../../shared/utils/constants';
import { OrderType, SearchConfig } from '../../shared/components/organisms/general-search/searchConfig';
import { ListingConfig } from '../../shared/components/organisms/general-listing/listingConfig';
import { workflowsOverviewQuery } from '../../shared/api/queries/workflows.js';

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: 'sort',
  filters: [
    {
      type: FieldType.Text,
      name: 'name',
      label: t('settings.workflows.filters.labels.name'),
      placeholder: t('settings.workflows.filters.placeholders.name'),
      addLookup: true,
    },
  ],
  orders: [
    {
      name: 'sortOrder',
      label: t('settings.workflows.sort.sortOrderAsc'),
      type: OrderType.ASC,
    },
    {
      name: 'sortOrder',
      label: t('settings.workflows.sort.sortOrderDesc'),
      type: OrderType.DESC,
    },
    {
      name: 'name',
      label: t('settings.workflows.sort.nameAsc'),
      type: OrderType.ASC,
    },
    {
      name: 'name',
      label: t('settings.workflows.sort.nameDesc'),
      type: OrderType.DESC,
    },
    {
      name: 'createdAt',
      label: t('shared.sort.oldest'),
      type: OrderType.ASC,
    },
    {
      name: 'createdAt',
      label: t('shared.sort.newest'),
      type: OrderType.DESC,
    },
  ],
});

export const listingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [
    t('settings.workflows.labels.name'),
    t('settings.workflows.labels.autoAddOnProduct'),
    t('products.workflows.labels.productCount'),
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'autoAddOnProduct', type: FieldType.Boolean },
    {
      name: 'productAssignments',
      type: FieldType.Text,
      accessor: (item) => item.productAssignments?.length ?? 0,
    },
  ],
  identifierKey: 'id',
  addActions: false,
  addEdit: false,
  addShow: true,
  showUrlName: 'workflows.kanban',
  showClickableFieldNames: ['name'],
  addDelete: false,
  addPagination: true,
  isMainPage: true,
});

export const listingQueryKey = 'workflows';
export const listingQuery = workflowsOverviewQuery;
