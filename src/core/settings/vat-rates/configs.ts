import { FormConfig, FormType } from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import { vatRatesQuery } from "../../../shared/api/queries/vatRates.js"
import { deleteVatRateMutation } from "../../../shared/api/mutations/vatRates.js";

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
  submitUrl: { name: 'settings.vatRates.list' },
  deleteMutation: deleteVatRateMutation,
  fields: [
    {
      type: FieldType.Text,
      name: 'rate',
      label: t('settings.vatRates.labels.rate'),
      placeholder: t('settings.vatRates.placeholders.rate'),
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
  editUrlName: 'settings.vatRate.edit',
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteVatRateMutation,
});

export const listingQueryKey = 'vatRates';
export const listingQuery = vatRatesQuery;

