import { FormConfig, FormType } from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import { inventoryLocationsQuery } from "../../../shared/api/queries/inventory.js"
import { inventoryShippingAddressesQuery } from "../../../shared/api/queries/contacts.js"
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
  helpSections: [
    {
      header: t('inventory.inventoryLocation.helpSection.location.header'),
      content: t('inventory.inventoryLocation.helpSection.location.content')
    },
    {
      header: t('inventory.inventoryLocation.helpSection.name.header'),
      content: t('inventory.inventoryLocation.helpSection.name.content')
    },
    {
      header: t('inventory.inventoryLocation.helpSection.description.header'),
      content: t('inventory.inventoryLocation.helpSection.description.content')
    },
    {
      header: t('inventory.inventoryLocation.helpSection.precise.header'),
      content: t('inventory.inventoryLocation.helpSection.precise.content')
    },
  ],
  fields: [
        {
          type: FieldType.Query,
          name: 'shippingaddress',
          label:  t('inventory.inventoryLocations.labels.parent'),
          labelBy: 'fullAddress',
          valueBy: 'id',
          query: inventoryShippingAddressesQuery,
          dataKey: 'inventoryShippingAddresses',
          isEdge: true,
          multiple: false,
          filterable: true,
          formMapIdentifier: 'id',
        },
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
          optional: true
        },
        {
            type: FieldType.Checkbox,
            name: 'precise',
            label: t('inventory.inventoryLocations.labels.precise'),
            default: false,
            uncheckedValue: "false",
        },
    ],
});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
     {
      type: FieldType.Query,
      name: 'shippingaddress',
      label:  t('inventory.inventoryLocations.labels.parent'),
      labelBy: 'fullAddress',
      valueBy: 'id',
      query: inventoryShippingAddressesQuery,
      dataKey: 'inventoryShippingAddresses',
      isEdge: true,
      multiple: false,
      filterable: true,
      addLookup: true,
      lookupKeys: ['id']
    }
  ],
  orders: []
});

export const listingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [t('shared.labels.name'), t('inventory.inventoryLocations.labels.parent'), t('inventory.inventoryLocations.labels.isInternalLocation')],
  fields: [
    {
      name: 'name',
      type: FieldType.Text,
    },
    {
      name: 'shippingaddress',
      type: FieldType.NestedText,
      keys: ['fullAddress']
    },
  {
      name: 'isInternalLocation',
      type: FieldType.Boolean,
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

