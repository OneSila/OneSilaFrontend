import { FormConfig, FormType } from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import { ShowConfig } from "../../../shared/components/organisms/general-show/showConfig";
import { companiesQuery } from "../../../shared/api/queries/contacts.js"
import { deleteCompanyMutation } from "../../../shared/api/mutations/contacts.js";
import { getCompanySubscription } from "../../../shared/api/subscriptions/contacts.js";
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
  submitUrl: { name: 'contacts.companies.list' },
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
      optional: true
    },
    {
      type: FieldType.Text,
      name: 'eoriNumber',
      label: t('contacts.companies.labels.eori'),
      placeholder: t('contacts.companies.placeholders.eori'),
      optional: true
    },
    {
      type: FieldType.ProxyChoice,
      name: 'type',
      label: t('products.products.labels.type.title'),
      valueBy: 'value',
      labelBy: 'name',
      multiple: true,
      options: [
        {
          name: t('contacts.companies.labels.supplier'),
          value: 'isSupplier'
        },
        {
          name: t('contacts.companies.labels.customer'),
          value: 'isCustomer'
        },
        {
          name: t('contacts.companies.labels.influencer'),
          value: 'isInfluencer'
        },
        {
          name: t('contacts.companies.labels.internalCompany'),
          value: 'isInternalCompany'
        }
      ]
    },
    {
      type: FieldType.Query,
      name: 'relatedCompanies',
      query: companiesQuery,
      label: t('contacts.companies.labels.relatedCompanies'),
      labelBy: 'name',
      valueBy: 'id',
      dataKey: 'companies',
      isEdge: true,
      multiple: true,
      filterable: true,
      formMapIdentifier: 'id',
      optional: true
    }
  ],
});

export const showConfigConstructor = (t: Function, id): ShowConfig => ({
  cols: 1,
  subscription: getCompanySubscription,
  subscriptionKey: 'company',
  subscriptionVariables: {id: id},
  addBack: false,
  backUrl:  {name: 'contacts.companies.list' },
  addEdit: false,
  editUrl: {name: 'contacts.companies.edit', params: {id: id} },
  addDelete: false,
  deleteMutation: deleteCompanyMutation,
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
    type: FieldType.Boolean,
    label: t('contacts.companies.labels.supplier'),
    name: 'isSupplier',
    showLabel: true

  },
  {
    type: FieldType.Boolean,
    label: t('contacts.companies.labels.customer'),
    name: 'isCustomer',
    showLabel: true
  },
  {
    type: FieldType.Boolean,
    label: t('contacts.companies.labels.influencer'),
    name: 'isInfluencer',
    showLabel: true
  },
  {
    type: FieldType.Boolean,
    label: t('contacts.companies.labels.internalCompany'),
    name: 'isInternalCompany',
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

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    {
      type: FieldType.Boolean,
      strict: true,
      name: 'isSupplier',
      label: t('contacts.companies.labels.supplier')
    },
    {
      type: FieldType.Boolean,
      strict: true,
      name: 'isCustomer',
      label: t('contacts.companies.labels.customer')
    },
    {
      type: FieldType.Boolean,
      strict: true,
      name: 'isInfluencer',
      label: t('contacts.companies.labels.influencer')
    },
    {
      type: FieldType.Boolean,
      strict: true,
      name: 'isInternalCompany',
      label: t('contacts.companies.labels.internalCompany')
    },
  ],
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
  editUrlName: 'contacts.companies.edit',
  showUrlName: 'contacts.companies.show',
  addShow: true,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteCompanyMutation,
});

export const listingQueryKey = 'companies';
export const listingQuery = companiesQuery;

