import {CreateOnTheFly, FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import { ShowConfig, ShowField } from '../../../shared/components/organisms/general-show/showConfig';
import {companiesQuery, companyAddressesQuery, peopleQuery} from "../../../shared/api/queries/contacts.js"
import { createCompanyMutation, deletePersonMutation } from "../../../shared/api/mutations/contacts.js";
import { customerLanguagesQuery } from "../../../shared/api/queries/languages.js";
import { baseFormConfigConstructor as baseCompanyConfigConstructor } from '../companies/configs'
import { getPersonSubscription } from "../../../shared/api/subscriptions/contacts.js";

const getSubmitUrl = (companyId) => {
  if (companyId) {
    return { name: 'contacts.companies.show', params: { id: companyId }, query: { tab: 'people' } };
  }
  return { name: 'contacts.people.list' };
}

const getSubmitAndContinueUrl = (companyId) => {
  if (companyId) {
    return { name: 'contacts.companies.edit', query: { companyId } };
  }
  return { name: 'contacts.people.edit' };
}

const companyOnTheFlyConfig = (t: Function):CreateOnTheFly => ({
  config: {
    ...baseCompanyConfigConstructor(
      t,
      FormType.CREATE,
      createCompanyMutation,
      'createCompany'
    ) as FormConfig
  }
})

const getCompanyField = (companyId, t): FormField => {
  if (companyId) {
    return {
      type: FieldType.Hidden,
      name: 'company',
      value: { "id": companyId }
    };
  } else {
    return {
      type: FieldType.Query,
      name: 'company',
      label: t('contacts.people.labels.company'),
      labelBy: 'name',
      valueBy: 'id',
      query: companiesQuery,
      dataKey: 'companies',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
      createOnFlyConfig: companyOnTheFlyConfig(t),
      };
  }
}

export const baseFormConfigConstructor = (
  t: Function,
  type: FormType,
  mutation: any,
  mutationKey: string,
  companyId: string | null = null
): FormConfig => ({
 cols: 1,
  type: type,
  mutation: mutation,
  mutationKey: mutationKey,
  submitUrl: getSubmitUrl(companyId),
  submitAndContinueUrl: getSubmitAndContinueUrl(companyId),
  deleteMutation: deletePersonMutation,
  fields: [
      getCompanyField(companyId, t),
      {
        type: FieldType.Text,
        name: 'firstName',
        label: t('shared.labels.firstName'),
        placeholder: t('shared.placeholders.firstName')
      },
      {
        type: FieldType.Text,
        name: 'lastName',
        label: t('shared.labels.lastName'),
        placeholder: t('shared.placeholders.lastName')
      },
      {
        type: FieldType.Text,
        name: 'role',
        label: t('shared.labels.role'),
        placeholder: t('shared.placeholders.role'),
        optional: true
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
        type: FieldType.Checkbox,
        name: 'active',
        label: t('shared.labels.active'),
        default: true,
        uncheckedValue: "false"
      },
  ],
});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    {
      type: FieldType.Query,
      query: companiesQuery,
      label: t('contacts.people.labels.company'),
      name: 'company',
      labelBy: "name",
      valueBy: "id",
      dataKey: "companies",
      filterable: true,
      isEdge: true,
      addLookup: true,
      lookupKeys: ['id']
    },
    {
      type: FieldType.Boolean,
      addLookup: true,
      strict: true,
      name: 'active',
      label: t('shared.labels.active'),
    },
  ],
  orders: []
});

const getHeaders = (t, companyId) => {
  return companyId
    ? [t('shared.labels.name'), t('shared.labels.email'), t('shared.labels.language'), t('shared.labels.active')]
    : [t('shared.labels.name'), t('shared.labels.email'), t('shared.labels.language'), t('contacts.people.labels.company'), t('shared.labels.active')];
};

const getBackUrl = (companyId: string | null = null) => {
  if (companyId) {
    return { name: 'contacts.companies.show', params: { id: companyId }, query: { tab: 'people' } };
  } else {
    return { name: 'contacts.people.list' };
  }
};

export const showConfigConstructor = (t: Function, id, companyId: string|null = null): ShowConfig => ({
  cols: 1,
  subscription: getPersonSubscription,
  subscriptionKey: 'person',
  subscriptionVariables: {pk: id},
  addBack: true,
  backUrl: getBackUrl(companyId),
  addEdit: true,
  editUrl: { name: 'contacts.people.edit', params: {id: id} },
  addDelete: true,
  deleteMutation: deletePersonMutation,
  deleteVariables: {id: id},
  fields: [
    {
      name: 'fullName',
      label: t('shared.labels.firstName'),
      type: FieldType.Text,
    },
    {
      name: 'role',
      label: t('shared.labels.role'),
      type: FieldType.Text,
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
      name: 'active',
      label: t('shared.labels.active'),
      type: FieldType.Boolean,
    },
    {
      name: 'language',
      label: t('shared.placeholders.language'),
      type: FieldType.Image,
      basePath: '/images/flags',
      suffix: '.svg'
    },
    {
      name: 'company',
      label: t('contacts.people.labels.company'),
      type: FieldType.NestedText,
      keys: ['name'],
      clickable: true,
      clickIdentifiers: [{id: ['id']}],
      clickUrl: {name: 'contacts.companies.show'},
    }
  ]
});

const getFields = (companyId): ShowField[] => {
  const commonFields: ShowField[] = [
    {
      name: 'fullName',
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
      type: FieldType.Boolean,
      name: 'active'
    },
  ];

  if (!companyId) {
    commonFields.splice(3, 0, { name: 'company', type: FieldType.NestedText, keys: ['name'],
      clickable: true, clickIdentifiers: [{id: ['id']}], clickUrl: {name: 'contacts.companies.show'} });
  }

  return commonFields;
};

const getUrlQueryParams = (companyId) => {
  return companyId ? { "companyId": companyId } : undefined;
};

export const listingConfigConstructor = (t: Function, companyId: string | null = null): ListingConfig => ({
  headers: getHeaders(t, companyId),
  fields: getFields(companyId),
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'contacts.people.edit',
  showUrlName: 'contacts.people.show',
  addShow: true,
  addDelete: true,
  addPagination: true,
  deleteMutation: deletePersonMutation,
  urlQueryParams: getUrlQueryParams(companyId),
});


export const listingQueryKey = 'people';
export const listingQuery = peopleQuery;

