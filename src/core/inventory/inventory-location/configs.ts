import { FormConfig, FormType } from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import { inventoryLocationsQuery } from "../../../shared/api/queries/inventory.js"
import { deleteInventoryLocationMutation } from "../../../shared/api/mutations/inventory.js";

export const baseFormConfigConstructor = (
  t: Function,
  type: FormType,
  mutation: any,
  mutationKey: string
): FormConfig => ({
 cols: 1,
  type: type,
  mutation: mutation,
  mutationKey: mutationKey,
  submitUrl: { name: 'inventory.inventoryLocations.list' },
  deleteMutation: deleteInventoryLocationMutation,
  fields: [
    {
      type: FieldType.Text,
      name: 'name',
      label: t('shared.labels.name'),
      placeholder: t('shared.placeholders.name'),
    },
    {
      type: FieldType.Textarea,
      name: 'description',
      label: t('shared.labels.description'),
      placeholder: t('shared.placeholders.description'),
      scroll: true,
    },
    {
        type: FieldType.Query,
        name: 'parentLocation',
        label:  t('inventory.inventoryLocations.labels.parent'),
        labelBy: 'name',
        valueBy: 'id',
        query: inventoryLocationsQuery,
        dataKey: 'inventoryLocations',
        isEdge: true,
        multiple: false,
        filterable: true,
        formMapIdentifier: 'id',
      }
    ],
});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
});

export const listingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [t('shared.labels.name'), t('inventory.inventoryLocations.labels.parent')],
  fields: [
    {
      name: 'name',
      type: FieldType.Text,
    },
    {
      name: 'parentLocation',
      type: FieldType.NestedText,
      keys: ['name']
    },
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'inventory.inventoryLocations.edit',
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteInventoryLocationMutation,
});

export const listingQueryKey = 'inventoryLocations';
export const listingQuery = inventoryLocationsQuery;

