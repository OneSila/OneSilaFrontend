import { FormConfig, FormType } from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import { ShowConfig } from "../../../shared/components/organisms/general-show/showConfig";
import { companiesQuery } from "../../../shared/api/queries/contacts.js"
import { deleteCompanyMutation } from "../../../shared/api/mutations/contacts.js";
import { getCompanySubscription } from "../../../shared/api/subscriptions/contacts.js";
import { customerLanguagesQuery } from "../../../shared/api/queries/languages.js";
import { currenciesQuery } from "../../../shared/api/queries/currencies.js";
import { currencyOnTheFlyConfig } from "../../settings/currencies/configs";

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
      type: FieldType.Email,
      name: 'email',
      label: t('shared.labels.email'),
      placeholder: t('shared.placeholders.email'),
      optional: true
    },
    {
      type: FieldType.Phone,
      name: 'phone',
      label: t('shared.labels.phone'),
      optional: true
    },
    {
      type: FieldType.Query,
      name: 'language',
      label: t('shared.placeholders.language'),
      labelBy: 'name',
      valueBy: 'code',
      query: customerLanguagesQuery,
      dataKey: 'customerLanguages',
      isEdge: false,
      multiple: false,
      filterable: true,
    },
    {
      type: FieldType.Query,
      name: 'currency',
      label: t('shared.labels.currency'),
      labelBy: 'isoCode',
      valueBy: 'id',
      query: currenciesQuery,
      dataKey: 'currencies',
      isEdge: true,
      multiple: false,
      filterable: true,
      removable: true,
      optional: true,
      formMapIdentifier: 'id',
      createOnFlyConfig: currencyOnTheFlyConfig(t)
    },
  ],
});

export const showConfigConstructor = (t: Function, id): ShowConfig => ({
  cols: 1,
  subscription: getCompanySubscription,
  subscriptionKey: 'company',
  subscriptionVariables: {id: id},
  addBack: true,
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
    name: 'email',
    label: t('shared.labels.email'),
    type: FieldType.Email,
    clickable: true
  },
  {
    name: 'phone',
    label: t('shared.labels.phone'),
    type: FieldType.Phone,
    clickable: true
  },
  {
    name: 'language',
    label: t('shared.placeholders.language'),
    type: FieldType.Image,
    basePath: '/images/flags',
    suffix: '.svg'
  },
  {
    name: 'currency',
    type: FieldType.NestedText,
    label: t('shared.labels.currency'),
    keys: ['isoCode'],
    showLabel: true
    },
  ]

});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    {
      type: FieldType.Boolean,
      addLookup: true,
      strict: true,
      name: 'isSupplier',
      label: t('contacts.companies.labels.supplier')
    },
    {
      type: FieldType.Boolean,
      addLookup: true,
      strict: true,
      name: 'isCustomer',
      label: t('contacts.companies.labels.customer')
    },
    {
      type: FieldType.Boolean,
      addLookup: true,
      strict: true,
      name: 'isInfluencer',
      label: t('contacts.companies.labels.influencer')
    },
    {
      type: FieldType.Query,
      name: 'language',
      label: t('shared.placeholders.language'),
      labelBy: 'name',
      valueBy: 'code',
      query: customerLanguagesQuery,
      dataKey: 'customerLanguages',
      filterable: true,
      isEdge: true,
      addLookup: true,
      lookupKeys: []
    },
  ],
  orders: []
});

export const listingConfigConstructor = (t: Function, isMainPage: boolean = false): ListingConfig => ({
  headers: [t('shared.labels.name'), t('shared.labels.email'), t('shared.labels.language'), t('contacts.companies.address.labels.country')],
  fields: [
    {
      name: 'name',
      type: FieldType.Text,
    },
    {
      name: 'email',
      type: FieldType.Email,
      clickable: true
    },
    {
      name: 'language',
      type: FieldType.Image,
      basePath: '/images/flags',
      suffix: '.svg'
    },
    {
      name: 'country',
      type: FieldType.Text,
    },
  ],
  identifierKey: 'id',
  addActions: false,
  addEdit: false,
  editUrlName: 'contacts.companies.edit',
  showUrlName: 'contacts.companies.show',
  addShow: true,
  addDelete: false,
  addPagination: true,
  isMainPage: isMainPage,
  deleteMutation: deleteCompanyMutation,
});

export const listingQueryKey = 'companies';
export const listingQuery = companiesQuery;

