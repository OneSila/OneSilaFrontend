import {FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import {ListingConfig} from "../../../shared/components/organisms/general-listing/listingConfig";
import { salesPriceListsQuery } from "../../../shared/api/queries/salesPrices.js"
import { customersQuery} from "../../../shared/api/queries/contacts.js";
import { currenciesQuery } from "../../../shared/api/queries/currencies.js";
import {ShowConfig} from "../../../shared/components/organisms/general-show/showConfig";
import {salesPriceListSubscription} from "../../../shared/api/subscriptions/salesPrices.js";
import {deleteSalesPriceListMutation} from "../../../shared/api/mutations/salesPrices.js";
import {currencyOnTheFlyConfig} from "../../settings/currencies/configs";
import {customerOnTheFlyConfig} from "../customers/configs";

const getSubmitUrl = (customerId) => {
  if (customerId) {
    return { name: 'sales.customers.show', params: { id: customerId }, query: { tab: 'priceLists' } };
  }
  return { name: 'sales.priceLists.list' };
}

const getSubmitAndContinueUrl = (customerId) => {
  if (customerId) {
    return { name: 'sales.priceLists.edit', query: { customerId } };
  }
  return { name: 'sales.priceLists.edit' };
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
        query: customersQuery,
        dataKey: 'customers',
        isEdge: true,
        multiple: true,
        filterable: true,
        formMapIdentifier: 'id',
        createOnFlyConfig: customerOnTheFlyConfig(t)
    };
  }
}

const getFields = (customerId, t, type): FormField[] => {
  const fields = [
    {
      type: FieldType.Text,
      name: 'name',
      label: t('shared.labels.name'),
      placeholder: t('shared.placeholders.name'),
    },
    {
      type: FieldType.Text,
      name: 'notes',
      label: t('shared.labels.notes'),
      placeholder: t('shared.placeholders.notes'),
    },
    {
      type: FieldType.Text,
      name: 'discount',
      label: t('sales.prices.labels.discountAmount'),
      placeholder: t('sales.prices.placeholders.discountAmount'),
      number: true,
    },
    {
      type: FieldType.Query,
      name: 'currency',
      label: t('shared.labels.currency'),
      labelBy: 'symbol',
      valueBy: 'id',
      query: currenciesQuery,
      dataKey: 'currencies',
      isEdge: true,
      multiple: false,
      filterable: true,
      removable: false,
      formMapIdentifier: 'id',
      createOnFlyConfig: currencyOnTheFlyConfig(t)
    },
    getCustomerField(customerId, t, type),
    {
      type: FieldType.Checkbox,
      name: 'vatIncluded',
      label: t('sales.priceLists.labels.vatIncluded'),
      default: false,
      uncheckedValue: "false"
    },
    {
      type: FieldType.Checkbox,
      name: 'autoUpdate',
      label: t('sales.priceLists.labels.autoUpdate'),
      default: true,
      uncheckedValue: "false"
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
  submitAndContinueUrl: getSubmitAndContinueUrl(customerId),
  deleteMutation: deleteSalesPriceListMutation,
  fields: getFields(customerId, t, type)
});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: false,
  orderKey: "sort",
  filters: [],
  orders: []
});
const getUrlQueryParams = (customerId) => {
  return customerId ? { customerId: customerId } : undefined;
}
export const listingConfigConstructor = (t: Function, customerId: string | null = null): ListingConfig => ({
  headers: [t('shared.labels.name'), t('sales.prices.labels.discountAmount'), t('shared.labels.currency'),t('sales.priceLists.labels.vatIncluded'),  t('sales.priceLists.labels.autoUpdate')],
  fields: [
    {
      name: 'name',
      type: FieldType.Text,
    },
    {
      name: 'discount',
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
      name: 'autoUpdate',
      type: FieldType.Boolean,
    }
  ],
  identifierKey: 'id',
  addActions: true,
  editUrlName: 'sales.priceLists.edit',
  showUrlName: 'sales.priceLists.show',
  urlQueryParams: getUrlQueryParams(customerId),
  deleteMutation: deleteSalesPriceListMutation,
  addEdit: true,
  addShow: true,
  addDelete: true,
  addPagination: true,
});

export const showConfigConstructor = (t: Function, id): ShowConfig => ({
  cols: 1,
  subscription: salesPriceListSubscription,
  subscriptionKey: 'salesPriceList',
  subscriptionVariables: {pk: id},
  addBack: true,
  backUrl:  {name: 'sales.priceLists.list' },
  addEdit: true,
  editUrl: {name: 'sales.priceLists.edit', params: {id: id} },
  addDelete: true,
  deleteMutation: deleteSalesPriceListMutation,
  fields: [
    {
      name: 'name',
      type: FieldType.Text,
      label: t('shared.labels.name'),
      showLabel: true
    },
    {
      name: 'discount',
      type: FieldType.Text,
      label: t('sales.prices.labels.discountAmount'),
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
      name: 'autoUpdate',
      type: FieldType.Boolean,
      label: t('sales.priceLists.labels.autoUpdate'),
      showLabel: true,
    },
    {
      type: FieldType.Array,
      name: 'customers',
      label: t('sales.customers.title'),
      clickable: true,
      clickUrl: {name: 'sales.customers.show'},
      clickIdentifiers: [{id: ['id']}],
      keys: ['name'],
      showLabel: true
    }
  ]
});

export const listingQueryKey = 'salesPriceLists';
export const listingQuery = salesPriceListsQuery;


