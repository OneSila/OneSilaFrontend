import {CreateOnTheFly, FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import {currenciesQuery, publicCurrenciesQuery} from "../../../shared/api/queries/currencies.js"
import {createCurrencyMutation, deleteCurrencyMutation} from "../../../shared/api/mutations/currencies.js";

export const getCurrencyFields = (t, isEdit: boolean = false): FormField[] => {
  const fields: FormField[] = [];

  if (isEdit) {
    fields.push({
      type: FieldType.Text,
      name: 'name',
      label: t('shared.labels.name'),
      placeholder: t('shared.placeholders.name'),
      disabled: isEdit,
    });
    fields.push({
      type: FieldType.Text,
      name: 'isoCode',
      label: t('settings.currencies.labels.isoCode'),
      placeholder: t('settings.currencies.placeholders.isoCode'),
      disabled: isEdit,
    });
    fields.push({
      type: FieldType.Text,
      name: 'symbol',
      label: t('settings.currencies.labels.symbol'),
      placeholder: t('settings.currencies.placeholders.symbol'),
      disabled: isEdit,
    });
  } else {
    fields.push({
      type: FieldType.Query,
      name: 'publicCurrency',
      label: t('shared.labels.currency'),
      labelBy: 'isoCode',
      valueBy: 'id',
      query: publicCurrenciesQuery,
      dataKey: 'publicCurrencies',
      isEdge: true,
      multiple: false,
      filterable: true,
      removable: false,
      formMapIdentifier: 'id'
    });
  }

  // Adding common fields
  fields.push({
    type: FieldType.Checkbox,
    name: 'isDefaultCurrency',
    label: t('settings.currencies.labels.isDefaultCurrency'),
    uncheckedValue: "false",
    default: false,
    optional: true
  });
  fields.push(...getNonDefaultFields(t));
  fields.push({
    type: FieldType.Text,
    name: 'comment',
    label: t('settings.currencies.labels.comment'),
    placeholder: t('settings.currencies.placeholders.comment'),
    optional: true
  });

  return fields;
};

export const getNonDefaultFields = (t): FormField[] => {
  return [
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
      optional: true
    },
    {
      type: FieldType.Checkbox,
      name: 'followOfficialRate',
      label: t('settings.currencies.labels.followOfficialRate'),
      uncheckedValue: "false",
      default: false,
      optional: true
    },
    {
      type: FieldType.Text,
      name: 'exchangeRate',
      label: t('settings.currencies.labels.exchangeRate'),
      placeholder: t('settings.currencies.placeholders.exchangeRate'),
      float: true,
    },
    {
      type: FieldType.Text,
      name: 'roundPricesUpTo',
      label: t('settings.currencies.labels.roundPricesUpTo'),
      placeholder: t('settings.currencies.placeholders.roundPricesUpTo'),
      float: true,
    },
  ];
}

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
  helpSections: [
    {
      header: t('settings.currencies.helpSection.name.header'),
      content: t('settings.currencies.helpSection.name.content')
    },
    {
      header: t('settings.currencies.helpSection.isoCode.header'),
      content: t('settings.currencies.helpSection.isoCode.content')
    },
    {
      header: t('settings.currencies.helpSection.symbol.header'),
      content: t('settings.currencies.helpSection.symbol.content')
    },
    {
      header: t('settings.currencies.helpSection.isDefaultCurrency.header'),
      content: t('settings.currencies.helpSection.isDefaultCurrency.content')
    },
    {
      header: t('settings.currencies.helpSection.inheritsFrom.header'),
      content: t('settings.currencies.helpSection.inheritsFrom.content')
    },
    {
      header: t('settings.currencies.helpSection.followOfficialRate.header'),
      content: t('settings.currencies.helpSection.followOfficialRate.content')
    },
    {
      header: t('settings.currencies.helpSection.exchangeRate.header'),
      content: t('settings.currencies.helpSection.exchangeRate.content')
    },
    {
      header: t('settings.currencies.helpSection.roundPricesUpTo.header'),
      content: t('settings.currencies.helpSection.roundPricesUpTo.content')
    },
    {
      header: t('settings.currencies.helpSection.comment.header'),
      content: t('settings.currencies.helpSection.comment.content')
    },
  ],
  fields: getCurrencyFields(t, type == FormType.EDIT),
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
  headers: [t('shared.labels.name'),t('settings.currencies.labels.isoCode'), t('settings.currencies.labels.symbol'), t('settings.currencies.labels.isDefaultCurrency')],
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
    {
      name: 'isDefaultCurrency',
      type: FieldType.Boolean,
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

