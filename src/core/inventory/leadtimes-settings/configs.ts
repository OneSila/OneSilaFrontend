import { FormConfig, FormType } from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import { leadTimesForShippingAddressesQuery, leadTimesQuery } from "../../../shared/api/queries/leadtimes.js"
import { companyShippingAddressesQuery } from "../../../shared/api/queries/contacts.js"
import { deleteLeadTimeForShippingAddressMutation } from "../../../shared/api/mutations/leadtimes.js";
import {leadTimeOnTheFlyConfig} from "../../settings/leadtimes/configs";

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
  submitUrl: { name: 'inventory.leadTimeSettings.list' },
  deleteMutation: deleteLeadTimeForShippingAddressMutation,
  fields: [
    {
      type: FieldType.Query,
      name: 'shippingaddress',
      label:  t('contacts.companies.address.labels.shippingAddress'),
      labelBy: 'fullAddress',
      valueBy: 'id',
      query: companyShippingAddressesQuery,
      queryVariables: {
          filter: {
            company: { isSupplier: true },
            OR: { company: { isInternalCompany: true }
          }}
      },
      dataKey: 'shippingAddresses',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
    },
    {
      type: FieldType.Query,
      name: 'leadtime',
      label:  t('settings.leadtimes.show.title'),
      labelBy: 'name',
      valueBy: 'id',
      query: leadTimesQuery,
      dataKey: 'leadTimes',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
      createOnFlyConfig: leadTimeOnTheFlyConfig(t),
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
      label:  t('inventory.leadTimeSettings.labels.parent'),
      labelBy: 'fullAddress',
      valueBy: 'id',
      query: companyShippingAddressesQuery,
      queryVariables: {
          filter: {
            company: { isSupplier: true },
            OR: { company: { isInternalCompany: true }
          }}
      },
      dataKey: 'shippingAddresses',
      isEdge: true,
      multiple: false,
      filterable: true,
      addLookup: true,
      lookupKeys: ['id']
    },
    {
      type: FieldType.Query,
      name: 'leadtime',
      label:  t('settings.leadtimes.show.title'),
      labelBy: 'name',
      valueBy: 'id',
      query: leadTimesQuery,
      dataKey: 'leadTimes',
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
  headers: [t('contacts.companies.address.labels.shippingAddress'), t('settings.leadtimes.show.title')],
  fields: [
    {
      name: 'shippingaddress',
      type: FieldType.NestedText,
      keys: ['fullAddress']
    },
    {
      name: 'leadtime',
      type: FieldType.NestedText,
      keys: ['name']
    },
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'inventory.leadTimeSettings.edit',
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteLeadTimeForShippingAddressMutation,
});

export const listingQueryKey = 'leadTimeForShippingaddresses';
export const listingQuery = leadTimesForShippingAddressesQuery;

