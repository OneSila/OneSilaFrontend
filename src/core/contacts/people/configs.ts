import { FormConfig, FormType } from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import {companiesQuery, peopleQuery} from "../../../shared/api/queries/contacts.js"
import { deletePersonMutation } from "../../../shared/api/mutations/contacts.js";
import { customerLanguagesQuery } from "../../../shared/api/queries/languages.js";
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
        placeholder: t('shared.placeholders.email')
      },
      {
        type: FieldType.Phone,
        name: 'phone',
        label: t('shared.labels.phone')
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

