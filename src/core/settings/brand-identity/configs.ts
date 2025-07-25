import { FormConfig, FormType } from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js';
import { SearchConfig } from '../../../shared/components/organisms/general-search/searchConfig';
import { ListingConfig } from '../../../shared/components/organisms/general-listing/listingConfig';
import { brandCustomPromptsQuery } from '../../../shared/api/queries/llm.js';
import { deleteBrandCustomPromptMutation } from '../../../shared/api/mutations/llm.js';
import { companyLanguagesQuery } from '../../../shared/api/queries/languages.js';
import { propertySelectValuesQuerySimpleSelector } from '../../../shared/api/queries/properties.js';

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
  submitUrl: { name: 'settings.brandIdentity.list' },
  deleteMutation: deleteBrandCustomPromptMutation,
  fields: [
    {
      type: FieldType.Query,
      name: 'brandValue',
      label: t('settings.brandIdentity.labels.brand'),
      labelBy: 'value',
      valueBy: 'id',
      query: propertySelectValuesQuerySimpleSelector,
      queryVariables: { filter: { property: { internalName: { exact: 'brand' } } } },
      dataKey: 'propertySelectValues',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
    },
    {
      type: FieldType.Query,
      name: 'language',
      label: t('shared.labels.language'),
      labelBy: 'name',
      valueBy: 'code',
      query: companyLanguagesQuery,
      dataKey: 'companyLanguages',
      isEdge: false,
      multiple: false,
      filterable: true,
      optional: true,
    },
    {
      type: FieldType.Textarea,
      name: 'prompt',
      label: t('settings.brandIdentity.labels.prompt'),
      placeholder: t('settings.brandIdentity.placeholders.prompt'),
    },
  ],
});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: false,
  orderKey: 'sort',
  filters: [],
  orders: [],
});

export const listingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [
    t('settings.brandIdentity.labels.brand'),
    t('shared.labels.language'),
  ],
  fields: [
    { name: 'brandValue', type: FieldType.NestedText, keys: ['value'] },
    { name: 'language', type: FieldType.Text },
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'settings.brandIdentity.edit',
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteBrandCustomPromptMutation,
});

export const listingQueryKey = 'brandCustomPrompts';
export const listingQuery = brandCustomPromptsQuery;
