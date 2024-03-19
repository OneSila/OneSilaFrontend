import {CreateOnTheFly, FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import {companiesQuery, peopleQuery, suppliersQuery} from "../../../shared/api/queries/contacts.js"
import {createCompanyMutation, deletePersonMutation} from "../../../shared/api/mutations/contacts.js";
import { customerLanguagesQuery } from "../../../shared/api/queries/languages.js";
import {baseFormConfigConstructor as baseCompanyConfigConstructor } from '../companies/configs'


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
  submitUrl: { name: 'contacts.people.list' },
  deleteMutation: deletePersonMutation,
  fields: [
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
      getCompanyField(companyId, t)
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
      addExactLookup: true,
      exactLookupKeys: ['id']
    },
  ],
  orders: []
});

export const listingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [t('shared.labels.firstName'), t('shared.labels.email'), t('shared.labels.phone'), t('contacts.people.labels.company'), t('shared.placeholders.language')],
  fields: [
    {
      name: 'firstName',
      type: FieldType.Text,
    },
    {
      name: 'email',
      type: FieldType.Email,
      clickable: true
    },
    {
      name: 'phone',
      type: FieldType.Phone,
      clickable: true
    },
    {
      name: 'company',
      type: FieldType.NestedText,
      keys: ['name']
    },
    {
      name: 'language',
      type: FieldType.Image,
      basePath: '/images/flags',
      suffix: '.svg'
    }
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'contacts.people.edit',
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deletePersonMutation,
});

export const listingQueryKey = 'people';
export const listingQuery = peopleQuery;

