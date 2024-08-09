import { FormConfig, FormType } from '../../../shared/components/organisms/general-form/formConfig';
import {FieldType, LeadTimeUnit, ReasonForSale} from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import { leadTimesQuery } from "../../../shared/api/queries/leadtimes.js"
import { deleteLeadTimeMutation } from "../../../shared/api/mutations/leadtimes.js";

export const unitOptions = (t) => [
  { name: t('settings.leadtimes.unit.hour'), code: LeadTimeUnit.HOUR },
  { name: t('settings.leadtimes.unit.day'), code: LeadTimeUnit.DAY },
  { name: t('settings.leadtimes.unit.week'), code: LeadTimeUnit.WEEK },
  { name: t('settings.leadtimes.unit.month'), code: LeadTimeUnit.MONTH },
];

export const unitOptionsBadgeMap = (t) => ({
  [LeadTimeUnit.HOUR]: { text: t('settings.leadtimes.unit.hour'), color: 'purple' },
  [LeadTimeUnit.DAY]: { text: t('settings.leadtimes.unit.day'), color: 'pink' },
  [LeadTimeUnit.WEEK]: { text: t('settings.leadtimes.unit.week'), color: 'red' },
  [LeadTimeUnit.MONTH]: { text: t('settings.leadtimes.unit.month'), color: 'green' },
});

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
  submitUrl: { name: 'settings.leadtimes.list' },
  deleteMutation: deleteLeadTimeMutation,
  fields: [
    {
      type: FieldType.Text,
      name: 'minTime',
      label: t('settings.leadtimes.labels.minTime'),
      placeholder: t('settings.leadtimes.placeholders.minTime'),
      number: true,
    },
    {
      type: FieldType.Text,
      name: 'maxTime',
      label: t('settings.leadtimes.labels.maxTime'),
      placeholder: t('settings.leadtimes.placeholders.maxTime'),
      number: true,
    },
    {
      type: FieldType.Choice,
      name: 'unit',
      label: t('settings.leadtimes.labels.unit'),
      placeholder: t('settings.leadtimes.placeholders.unit'),
      options: unitOptions(t),
      labelBy: 'name',
      valueBy: 'code',
      filterable: false
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
  headers: [
    t('settings.leadtimes.labels.minTime'),
    t('settings.leadtimes.labels.maxTime'),
    t('settings.leadtimes.labels.unit'),
  ],
  fields: [
    { name: 'minTime', type: FieldType.Text },
    { name: 'maxTime', type: FieldType.Text },
    { name: 'unit', type: FieldType.Badge, badgeMap: unitOptionsBadgeMap(t) },
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'settings.leadtimes.edit',
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteLeadTimeMutation,
});

export const listingQueryKey = 'leadTimes';
export const listingQuery = leadTimesQuery;

