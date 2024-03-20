import {CreateOnTheFly, FormConfig, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import { currenciesQuery } from "../../../shared/api/queries/currencies.js"
import {createCurrencyMutation, deleteCurrencyMutation} from "../../../shared/api/mutations/currencies.js";

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
  submitUrl: { name: 'settings.currencies.list' },
  deleteMutation: deleteCurrencyMutation,
  fields: [
    {
      type: FieldType.Text,
      name: 'name',
      label: t('shared.labels.name'),
      placeholder: t('shared.placeholders.name'),
    },
    {
      type: FieldType.Text,
      name: 'isoCode',
      label: t('settings.currencies.labels.isoCode'),
      placeholder: t('settings.currencies.placeholders.isoCode'),
    },
    {
      type: FieldType.Text,
      name: 'symbol',
      label: t('settings.currencies.labels.symbol'),
      placeholder: t('settings.currencies.placeholders.symbol'),
    },
    {
      type: FieldType.Query,
      name: 'inheritsFrom',
      label:  t('settings.currencies.labels.inheritsFrom'),
      labelBy: 'name',
      valueBy: 'id',
      query: currenciesQuery,
      dataKey: 'currencies',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
    },
    {
      type: FieldType.Text,
      name: 'exchangeRate',
      label: t('settings.currencies.labels.exchangeRate'),
      placeholder: t('settings.currencies.placeholders.exchangeRate'),
      number: true,
    },
    {
      type: FieldType.Text,
      name: 'exchangeRateOfficial',
      label: t('settings.currencies.labels.exchangeRateOfficial'),
      placeholder: t('settings.currencies.placeholders.exchangeRateOfficial'),
      number: true,
    },
    {
      type: FieldType.Text,
      name: 'roundPricesUpTo',
      label: t('settings.currencies.labels.roundPricesUpTo'),
      placeholder: t('settings.currencies.placeholders.roundPricesUpTo'),
      number: true,
    },
    {
      type: FieldType.Checkbox,
      name: 'followOfficialRate',
      label: t('settings.currencies.labels.followOfficialRate'),
      uncheckedValue: "false",
      default: false
    },
    {
      type: FieldType.Checkbox,
      name: 'isDefaultCurrency',
      label: t('settings.currencies.labels.isDefaultCurrency'),
      uncheckedValue: "false",
      default: false
    },
    {
      type: FieldType.Text,
      name: 'comment',
      label: t('settings.currencies.labels.comment'),
      placeholder: t('settings.currencies.placeholders.comment'),
    },

    ],
});

export const currencyOnTheFlyConfig = (t: Function):CreateOnTheFly => ({
  config: {
    ...baseFormConfigConstructor(
       t,
      FormType.CREATE,
      createCurrencyMutation,
      'createCurrency'
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
  headers: [t('shared.labels.name'),t('settings.currencies.labels.isoCode'), t('settings.currencies.labels.symbol')],
  fields: [
    {
      name: 'name',
      type: FieldType.Text,
    },
    {
      name: 'isoCode',
      type: FieldType.Text,
    },
    {
      name: 'symbol',
      type: FieldType.Text,
    },
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'settings.currency.edit',
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteCurrencyMutation,
});

export const listingQueryKey = 'currencies';
export const listingQuery = currenciesQuery;

