import { FormConfig, FormType } from '../../../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../../../shared/utils/constants.js'
import { SearchConfig } from "../../../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../../../shared/components/organisms/general-listing/listingConfig";
import { deleteCompanyAddressMutation} from "../../../../../shared/api/mutations/contacts";
import { countriesQuery } from "../../../../../shared/api/queries/languages.js";
import { companyAddressesQuery, peopleFilterQuery } from "../../../../../shared/api/queries/contacts.js";
export const baseFormConfigConstructor = (
  t: Function,
  type: FormType,
  mutation: any,
  mutationKey: string,
  companyId: string
): FormConfig => ({
  cols: 1,
  type: type,
  mutation: mutation,
  mutationKey: mutationKey,
  submitUrl: { name: 'contacts.companies.show', params: {id: companyId }},
  fields: [
    {
      type: FieldType.Hidden,
      name: 'company',
      value: { "id": companyId}
    },
      {
        type: FieldType.Text,
        name: 'address1',
        label: t('contacts.companies.address.labels.addressOne'),
        placeholder: t('contacts.companies.address.placeholders.addressOne')
      },
      {
        type: FieldType.Text,
        name: 'address2',
        label: t('contacts.companies.address.labels.addressTwo'),
        placeholder: t('contacts.companies.address.placeholders.addressTwo')
      },
      {
        type: FieldType.Text,
        name: 'address3',
        label: t('contacts.companies.address.labels.addressThree'),
        placeholder: t('contacts.companies.address.placeholders.addressThree')
      },
      {
        type: FieldType.Text,
        name: 'city',
        label: t('contacts.companies.address.labels.city'),
        placeholder: t('contacts.companies.address.placeholders.city')
      },
      {
        type: FieldType.Text,
        name: 'postcode',
        label: t('contacts.companies.address.labels.postcode'),
        placeholder: t('contacts.companies.address.placeholders.postcode')
      },
      {
        type: FieldType.Query,
        name: 'country',
        label: t('contacts.companies.address.placeholders.country'),
        labelBy: 'name',
        valueBy: 'code',
        query: countriesQuery,
        dataKey: 'countries',
        isEdge: false,
        multiple: false,
        filterable: true,
      },
    {
      type: FieldType.ProxyChoice,
      name: "type",
      label: t('contacts.companies.address.labels.addressType'),
      valueBy: 'value',
      labelBy: 'name',
      multiple: true,
      options: [
        {
          name: t('contacts.companies.address.labels.invoiceAddress'),
          value: 'isInvoiceAddress'
        },
        {
          name: t('contacts.companies.address.labels.shippingAddress'),
          value: 'isShippingAddress'
        }
      ]
    },
    {
      type: FieldType.Query,
      name: 'contact',
      query: peopleFilterQuery,
      queryVariables: {filter: {company: {id: {exact: companyId}}}},
      label: t('contacts.companies.address.labels.contact'),
      labelBy: 'firstName',
      valueBy: 'id',
      dataKey: 'people',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
    }
    ],
});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: false,
  orderKey: "sort",
  filters: [],
  orders: []
});

export const listingConfigConstructor = (t: Function, id: string): ListingConfig => ({
  headers: [t('contacts.companies.address.labels.address'), t('contacts.companies.address.labels.isInvoiceAddress'),  t('contacts.companies.address.labels.isShippingAddress'), t('contacts.companies.address.labels.country')],
  fields: [
    {
      name: 'address1',
      type: FieldType.Text,
    },
    {
      name: 'isInvoiceAddress',
      type: FieldType.Boolean,
    },
    {
      name: 'isShippingAddress',
      type: FieldType.Boolean,
    },
    {
      name: 'country',
      type: FieldType.Text,
    },
  ],
  identifierKey: 'id',
  identifierVariables: {companyId: id},
  addActions: true,
  addEdit: true,
  editUrlName: 'contacts.companies.address.edit',
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteCompanyAddressMutation,
});

export const listingQueryKey = 'addresses';
export const listingQuery = companyAddressesQuery;

