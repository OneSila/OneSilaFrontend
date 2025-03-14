import {FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import {ListingConfig} from "../../../shared/components/organisms/general-listing/listingConfig";
import { salesPriceListsQuery } from "../../../shared/api/queries/salesPrices.js"
import {companiesQuery} from "../../../shared/api/queries/contacts.js";
import { currenciesQuery } from "../../../shared/api/queries/currencies.js";
import {ShowConfig} from "../../../shared/components/organisms/general-show/showConfig";
import {salesPriceListSubscription} from "../../../shared/api/subscriptions/salesPrices.js";
import {deleteSalesPriceListMutation} from "../../../shared/api/mutations/salesPrices.js";
import {currencyOnTheFlyConfig} from "../../settings/currencies/configs";

const getSubmitUrl = (customerId) => {
  if (customerId) {
    return { name: 'sales.customers.show', params: { id: customerId }, query: { tab: 'priceLists' } };
  }
  return { name: 'sales.priceLists.list' };
}

const getSubmitAndContinueUrl = (customerId, type) => {

  if (type == FormType.CREATE) {
    return { name: 'sales.priceLists.show' };
  } else {
    if (customerId) {
      return { name: 'sales.priceLists.edit', query: { customerId } };
    }
    return { name: 'sales.priceLists.edit' };
  }
}

const getCustomerField = (customerId, t, type): FormField | null => {
  if (customerId) {
    if (type == FormType.CREATE) {
      return {
        type: FieldType.Hidden,
        name: 'customers',
        value: [{ "id": customerId }]
      };
    }
    return null;
  } else {
    return {
        type: FieldType.Query,
        name: 'customers',
        label: t('sales.customers.title'),
        labelBy: 'name',
        valueBy: 'id',
        query: companiesQuery,
        queryVariables: { filter: { 'isInternalCompany': { exact: false } }},
        dataKey: 'companies',
        isEdge: true,
        multiple: true,
        filterable: true,
        optional: true,
        formMapIdentifier: 'id',
    };
  }
}

export const getFields = (customerId, t, type, showPcnt: boolean = true): FormField[] => {
  const fields = [
    {
      type: FieldType.Text,
      name: 'name',
      label: t('shared.labels.name'),
      placeholder: t('shared.placeholders.name'),
    },
    {
      name: 'dateRange',
      type: FieldType.RangeDate,
      label: t('shared.labels.dateRange'),
      keys: ['isoCode'],
      showLabel: true,
      startName: 'startDate',
      endName: 'endDate',
      optional: true
    },
    {
      type: FieldType.Query,
      name: 'currency',
      label: t('shared.labels.currency'),
      labelBy: 'isoCode',
      valueBy: 'id',
      query: currenciesQuery,
      dataKey: 'currencies',
      isEdge: true,
      multiple: false,
      filterable: true,
      removable: false,
      formMapIdentifier: 'id',
      createOnFlyConfig: currencyOnTheFlyConfig(t),
      setDefaultKey: 'isDefaultCurrency'
    },
    {
      type: FieldType.Checkbox,
      name: 'vatIncluded',
      label: t('sales.priceLists.labels.vatIncluded'),
      default: true,
      uncheckedValue: "false"
    },
    {
      type: FieldType.Checkbox,
      name: 'autoAddProducts',
      label: t('sales.priceLists.labels.autoAddProducts'),
      default: false,
      uncheckedValue: "false"
    },
    {
      type: FieldType.Checkbox,
      name: 'autoUpdatePrices',
      label: t('sales.priceLists.labels.autoUpdatePrices'),
      default: true,
      uncheckedValue: "false"
    },
    showPcnt ? {
      type: FieldType.Text,
      name: 'priceChangePcnt',
      label: t('sales.priceLists.labels.priceChangePcnt'),
      placeholder: t('sales.priceLists.placeholders.priceChangePcnt'),
      number: true,
      optional: true,
    } : null,
    showPcnt ? {
      type: FieldType.Text,
      name: 'discountPcnt',
      label: t('sales.prices.labels.discountPercentage'),
      placeholder: t('sales.prices.placeholders.discountPercentage'),
      number: true,
      optional: true,
    } : null,
    {
      type: FieldType.Textarea,
      name: 'notes',
      label: t('shared.labels.notes'),
      placeholder: t('shared.placeholders.notes'),
      optional: true
    },
  ].filter(field => field !== null);
  return fields as FormField[];
}

export const baseFormConfigConstructor = (
  t: Function,
  type: FormType,
  mutation: any,
  mutationKey: string,
  customerId: string | null = null
): FormConfig => ({
 cols: 1,
  type: type,
  mutation: mutation,
  mutationKey: mutationKey,
  submitUrl: getSubmitUrl(customerId),
  submitAndContinueUrl: getSubmitAndContinueUrl(customerId, type),
  addShow: true,
  showUrlName: 'sales.priceLists.show',
  deleteMutation: deleteSalesPriceListMutation,
  helpSections: [
    {
      header: t('sales.priceLists.helpSection.name.header'),
      content: t('sales.priceLists.helpSection.name.content')
    },
    {
      header: t('sales.priceLists.helpSection.dateRange.header'),
      content: t('sales.priceLists.helpSection.dateRange.content')
    },
    {
      header: t('sales.priceLists.helpSection.currency.header'),
      content: t('sales.priceLists.helpSection.currency.content')
    },
    {
      header: t('sales.priceLists.helpSection.vatIncluded.header'),
      content: t('sales.priceLists.helpSection.vatIncluded.content')
    },
    {
      header: t('sales.priceLists.helpSection.autoUpdatePrices.header'),
      content: t('sales.priceLists.helpSection.autoUpdatePrices.content')
    },
    {
      header: t('sales.priceLists.helpSection.priceChangePcnt.header'),
      content: t('sales.priceLists.helpSection.priceChangePcnt.content')
    },
    {
      header: t('sales.priceLists.helpSection.discountPercentage.header'),
      content: t('sales.priceLists.helpSection.discountPercentage.content')
    },

  ],
  fields: getFields(customerId, t, type)
});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    {
      type: FieldType.Boolean,
      addLookup: true,
      strict: true,
      name: 'vatIncluded',
      label: t('sales.priceLists.labels.vatIncluded'),
    },
    {
      type: FieldType.Boolean,
      addLookup: true,
      strict: true,
      name: 'autoUpdatePrices',
      label: t('sales.priceLists.labels.autoUpdatePrices'),
    },
    {
      type: FieldType.Query,
      query: currenciesQuery,
      dataKey: 'currencies',
      name: 'currency',
      label: t('shared.labels.currency'),
      labelBy: 'isoCode',
      valueBy: 'id',
      filterable: true,
      isEdge: true,
      addLookup: true,
      lookupKeys: ['id']
    },
  ],
  orders: []
});


export const listingConfigConstructor = (t: Function, isMainPage: boolean = false): ListingConfig => ({
  headers: [t('shared.labels.name'), t('sales.priceLists.labels.priceChangePcnt'), t('sales.prices.labels.discountPercentage'), t('shared.labels.currency'),t('sales.priceLists.labels.vatIncluded'),  t('sales.priceLists.labels.autoUpdatePrices')],
  fields: [
    {
      name: 'name',
      type: FieldType.Text,
    },
    {
      name: 'priceChangePcnt',
      type: FieldType.Text,
    },
    {
      name: 'discountPcnt',
      type: FieldType.Text,
    },
    {
      name: 'currency',
      type: FieldType.NestedText,
      keys: ['isoCode'],
    },
    {
      name: 'vatIncluded',
      type: FieldType.Boolean,
    },
    {
      name: 'autoUpdatePrices',
      type: FieldType.Boolean,
    }
  ],
  identifierKey: 'id',
  addActions: true,
  editUrlName: 'sales.priceLists.edit',
  showUrlName: 'sales.priceLists.show',
  deleteMutation: deleteSalesPriceListMutation,
  addEdit: true,
  addShow: true,
  addDelete: true,
  addPagination: true,
  isMainPage: isMainPage,
});

export const showConfigConstructor = (t: Function, id): ShowConfig => ({
  cols: 1,
  subscription: salesPriceListSubscription,
  subscriptionKey: 'salesPriceList',
  subscriptionVariables: { pk: id },
  addBack: true,
  backUrl:  { name: 'sales.priceLists.list' },
  addEdit: true,
  editUrl: {name: 'sales.priceLists.edit', params: {id: id} },
  addDelete: true,
  deleteVariables: {id: id},
  deleteUrl:  { name: 'sales.priceLists.list' },
  deleteMutation: deleteSalesPriceListMutation,
  fields: [
    {
      name: 'name',
      type: FieldType.Text,
      label: t('shared.labels.name'),
      showLabel: true
    },
    {
      name: 'priceChangePcnt',
      type: FieldType.Text,
      label: t('sales.priceLists.labels.priceChangePcnt'),
      showLabel: true
    },
    {
      name: 'discountPcnt',
      type: FieldType.Text,
      label: t('sales.prices.labels.discountPercentage'),
      showLabel: true
    },
    {
      name: 'currency',
      type: FieldType.NestedText,
      label: t('shared.labels.currency'),
      keys: ['isoCode'],
      showLabel: true
    },
    {
      name: 'notes',
      type: FieldType.Text,
      label: t('shared.labels.notes'),
      showLabel: true
    },
    {
      name: 'vatIncluded',
      type: FieldType.Boolean,
      label: t('sales.priceLists.labels.vatIncluded'),
      showLabel: true
    },
    {
      name: 'autoUpdatePrices',
      type: FieldType.Boolean,
      label: t('sales.priceLists.labels.autoUpdatePrices'),
      showLabel: true,
    },
    {
      type: FieldType.Array,
      name: 'customers',
      label: t('sales.customers.title'),
      clickable: false,
      clickIdentifiers: [{id: ['id']}],
      keys: ['name'],
      showLabel: true
    }
  ]
});

export const listingQueryKey = 'salesPriceLists';
export const listingQuery = salesPriceListsQuery;


