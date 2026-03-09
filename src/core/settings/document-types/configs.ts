import { FormConfig, FormField, FormType } from '../../../shared/components/organisms/general-form/formConfig';
import { SearchConfig } from '../../../shared/components/organisms/general-search/searchConfig';
import { ListingConfig } from '../../../shared/components/organisms/general-listing/listingConfig';
import { FieldType } from '../../../shared/utils/constants';
import { documentTypesQuery } from '../../../shared/api/queries/documentTypes.js';
import { deleteDocumentTypeMutation } from '../../../shared/api/mutations/documentTypes.js';

const getDocumentTypeFields = (t: Function, type: FormType): FormField[] => {
  const fields: FormField[] = [
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
      placeholder: t('settings.documentTypes.placeholders.description'),
      optional: true,
    },
  ];

  if (type === FormType.EDIT) {
    fields.splice(1, 0, {
      type: FieldType.Text,
      name: 'code',
      label: t('settings.documentTypes.labels.code'),
      disabled: true,
    });
  }

  return fields;
};

export const baseFormConfigConstructor = (
  t: Function,
  type: FormType,
  mutation: any,
  mutationKey: string
): FormConfig => ({
  cols: 1,
  type,
  mutation,
  mutationKey,
  submitUrl: { name: 'settings.documentTypes.list' },
  deleteMutation: deleteDocumentTypeMutation,
  fields: getDocumentTypeFields(t, type),
});

export const searchConfigConstructor = (): SearchConfig => ({
  search: true,
  orderKey: 'sort',
  filters: [],
  orders: [],
});

export const listingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('settings.documentTypes.labels.code'),
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'code', type: FieldType.Text },
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'settings.documentType.edit',
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteDocumentTypeMutation,
});

export const listingQueryKey = 'documentTypes';
export const listingQuery = documentTypesQuery;
