import {FormConfig, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import {FieldType} from '../../../shared/utils/constants.js'
import {SearchConfig} from "../../../shared/components/organisms/general-search/searchConfig";
import {ListingConfig} from "../../../shared/components/organisms/general-listing/listingConfig";
import { customersQuery } from "../../../shared/api/queries/contacts.js"
import { deleteCustomerMutation } from "../../../shared/api/mutations/contacts.js";
import {ShowConfig} from "../../../shared/components/organisms/general-show/showConfig";
import {getCustomerSubscription} from "../../../shared/api/subscriptions/contacts.js";

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
  submitUrl: { name: 'sales.customers.list' },
  deleteMutation: deleteCustomerMutation,
  fields: [
    {
      type: FieldType.Text,
      name: 'name',
      label: t('shared.labels.name'),
      placeholder: t('shared.placeholders.name'),
    },
    {
      type: FieldType.Text,
      name: 'vatNumber',
      label: t('contacts.companies.labels.vat'),
      placeholder: t('contacts.companies.placeholders.eori'),
    },
    {
      type: FieldType.Text,
      name: 'eoriNumber',
      label: t('contacts.companies.labels.eori'),
      placeholder: t('contacts.companies.placeholders.eori'),
    },
    {
      type: FieldType.Hidden,
      name: 'isCustomer',
      value: true
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
  headers: [t('shared.labels.name'),t('contacts.companies.labels.eori'), t('contacts.companies.labels.vat')],
  fields: [
    {
      name: 'name',
      type: FieldType.Text,
    },
    {
      name: 'eoriNumber',
      type: FieldType.Text,
    },
    {
      name: 'vatNumber',
      type: FieldType.Text,
    },
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'sales.customers.edit',
  showUrlName: 'sales.customers.show',
  addShow: true,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteCustomerMutation,
});

export const showConfigConstructor = (t: Function, id): ShowConfig => ({
  cols: 1,
  subscription: getCustomerSubscription,
  subscriptionKey: 'customer',
  subscriptionVariables: {pk: id},
  addBack: true,
  backUrl:  {name: 'sales.customers.list' },
  addEdit: true,
  editUrl: {name: 'sales.customers.edit', params: {id: id} },
  addDelete: true,
  deleteMutation: deleteCustomerMutation,
  deleteVariables: {id: id},
  fields: [
 {
    name: 'name',
    type: FieldType.Text,
    label:  t('shared.labels.name'),
    showLabel: true
  },
  {
    name: 'vatNumber',
    type: FieldType.Text,
    label: t('contacts.companies.labels.vat'),
    showLabel: true
  },
  {
    name: 'eoriNumber',
    type: FieldType.Text,
    label: t('contacts.companies.labels.eori'),
    showLabel: true
  },
  {
    type: FieldType.Array,
    name: 'relatedCompanies',
    label: t('contacts.companies.labels.relatedCompanies'),
    clickable: true,
    clickUrl: {name: 'contacts.companies.show'},
    clickIdentifiers: [{id: ['id']}],
    keys: ['name'],
    showLabel: true
  }
  ]

});

export const listingQueryKey = 'customers';
export const listingQuery = customersQuery;

