import { FormConfig, FormType } from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import { taxesQuery } from "../../../shared/api/queries/taxes.js"
import { deleteTaxMutation } from "../../../shared/api/mutations/taxes.js";

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
  submitUrl: { name: 'settings.taxes.list' },
  deleteMutation: deleteTaxMutation,
  fields: [
    {
      type: FieldType.Text,
      name: 'rate',
      label: t('settings.taxes.labels.rate'),
      placeholder: t('settings.taxes.placeholders.rate'),
      number: true,
    },
    ],
});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
});

export const listingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [t('shared.labels.name')],
  fields: [
    {
      name: 'name',
      type: FieldType.Text,
    },
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'settings.tax.edit',
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteTaxMutation,
});

export const listingQueryKey = 'taxes';
export const listingQuery = taxesQuery;

