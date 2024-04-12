import {CreateOnTheFly, FormConfig, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import {ShowConfig} from "../../../shared/components/organisms/general-show/showConfig";
import {companiesQuery} from "../../../shared/api/queries/contacts.js"
import {createCompanyMutation, deleteCompanyMutation} from "../../../shared/api/mutations/contacts.js";
import {getCompanySubscription} from "../../../shared/api/subscriptions/contacts.js";
import {customerLanguagesQuery} from "../../../shared/api/queries/languages";

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
  submitUrl: { name: 'purchasing.suppliers.list' },
  deleteMutation: deleteCompanyMutation,
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
      type: FieldType.Hidden,
      name: 'isSupplier',
      value: true
    }
    ],
});

export const supplierOnTheFlyConfig = (t: Function):CreateOnTheFly => ({
  config: {
    ...baseFormConfigConstructor(
      t,
        FormType.CREATE,
        createCompanyMutation,
        'createCompany'
    ) as FormConfig
  }
})

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
});

export const listingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [t('shared.labels.name'), t('shared.labels.email'), t('shared.labels.language')],
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
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'purchasing.suppliers.edit',
  showUrlName: 'purchasing.suppliers.show',
  addShow: true,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteCompanyMutation,
});

export const showConfigConstructor = (t: Function, id): ShowConfig => ({
  cols: 1,
  subscription: getCompanySubscription,
  subscriptionKey: 'company',
  subscriptionVariables: {id: id},
  addBack: true,
  backUrl:  {name: 'purchasing.suppliers.list' },
  addEdit: true,
  editUrl: {name: 'purchasing.suppliers.edit', params: {id: id} },
  addDelete: true,
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
  ]

});

export const listingQueryKey = 'companies';
export const listingQuery = companiesQuery;

