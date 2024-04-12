import { FormConfig, FormType } from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import { unitsQuery } from "../../../shared/api/queries/units.js"
import { deleteUnitMutation } from "../../../shared/api/mutations/units.js";

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
  addDelete: false,
  submitUrl: { name: 'settings.units.list' },
  fields: [
    {
      type: FieldType.Text,
      name: 'name',
      label: t('shared.labels.name'),
      placeholder: t('shared.placeholders.name'),
    },
    {
      type: FieldType.Text,
      name: 'unit',
      label: t('settings.units.labels.unit'),
      placeholder: t('settings.units.placeholders.unit'),
    },
    ],
});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: false,
  orderKey: "sort",
  filters: [],
  orders: []
});

export const listingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [t('shared.labels.name'),t('settings.units.labels.unit')],
  fields: [
    {
      name: 'name',
      type: FieldType.Text,
    },
    {
      name: 'unit',
      type: FieldType.Text,
    },
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'settings.unit.edit',
  addShow: false,
  addDelete: false,
  addPagination: true,
  deleteMutation: deleteUnitMutation,
});

export const listingQueryKey = 'units';
export const listingQuery = unitsQuery;

