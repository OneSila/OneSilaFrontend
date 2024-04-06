import {CreateOnTheFly, FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import {FieldType, OrderStatus} from '../../../shared/utils/constants.js'
import {SearchConfig} from "../../../shared/components/organisms/general-search/searchConfig";
import {ListingConfig} from "../../../shared/components/organisms/general-listing/listingConfig";
import {purchaseOrdersQuery} from "../../../shared/api/queries/purchasing.js"
import {deletePurchaseOrderMutation} from "../../../shared/api/mutations/purchasing.js";
import {currenciesQuery} from "../../../shared/api/queries/currencies.js";
import {companyInvoiceAddressesQuery, companyShippingAddressesQuery, suppliersQuery} from "../../../shared/api/queries/contacts.js";
import {ShowConfig, ShowField} from "../../../shared/components/organisms/general-show/showConfig";
import {purchaseOrderSubscription} from "../../../shared/api/subscriptions/purchasing.js";
import { createCompanyInvoiceAddressMutation, createCompanyShippingAddressMutation} from "../../../shared/api/mutations/contacts.js";
import {currencyOnTheFlyConfig} from "../../settings/currencies/configs";
import {baseFormConfigConstructor as baseAddressConfigConstructor } from '../../contacts/companies/companies-show/containers/configs'
import {supplierOnTheFlyConfig} from "../suppliers/configs";

export const invoiceAddressOnTheFlyConfig = (t: Function, supplierId):CreateOnTheFly => ({
  config: {
    ...baseAddressConfigConstructor(
        t,
        FormType.CREATE,
        createCompanyInvoiceAddressMutation,
        'createInvoiceAddress',
        supplierId,
        'isInvoiceAddress'
    ) as FormConfig
  }
})

export const shippingAddressOnTheFlyConfig = (t: Function, supplierId):CreateOnTheFly => ({
  config: {
    ...baseAddressConfigConstructor(
      t,
        FormType.CREATE,
        createCompanyShippingAddressMutation,
        'createShippingAddress',
        supplierId,
        'isShippingAddress'
    ) as FormConfig
  }
})

export const getStatusOptions = (t) => [
  { name: t('purchasing.orders.labels.status.choices.draft'), code: OrderStatus.DRAFT },
  { name: t('purchasing.orders.labels.status.choices.ordered'), code: OrderStatus.ORDERED },
  { name: t('purchasing.orders.labels.status.choices.confirmed'), code: OrderStatus.CONFIRMED },
  { name: t('purchasing.orders.labels.status.choices.pendingDelivery'), code: OrderStatus.PENDING_DELIVERY },
  { name: t('purchasing.orders.labels.status.choices.delivered'), code: OrderStatus.DELIVERED },
];

export const getOrderStatusBadgeMap = (t) => ({
  [OrderStatus.DRAFT]: { text: t('purchasing.orders.labels.status.choices.draft'), color: 'gray' },
  [OrderStatus.ORDERED]: { text: t('purchasing.orders.labels.status.choices.ordered'), color: 'yellow' },
  [OrderStatus.CONFIRMED]: { text: t('purchasing.orders.labels.status.choices.confirmed'), color: 'green' },
  [OrderStatus.PENDING_DELIVERY]: { text: t('purchasing.orders.labels.status.choices.pendingDelivery'), color: 'blue' },
  [OrderStatus.DELIVERED]: { text: t('purchasing.orders.labels.status.choices.delivered'), color: 'indigo' },
});

const getSubmitUrl = (supplierId) => {
  if (supplierId) {
    return { name: 'purchasing.suppliers.show', params: { id: supplierId }, query: { tab: 'orders' } };
  }
  return { name: 'purchasing.orders.list' };
}

const getSubmitAndContinueUrl = (supplierId) => {
  if (supplierId) {
    return { name: 'purchasing.orders.edit', query: { supplierId } };
  }
  return { name: 'purchasing.orders.edit' };
}

const getSupplierField = (t, supplierId): FormField => {
  if (supplierId) {
    return {
      type: FieldType.Hidden,
      name: 'supplier',
      value: { "id": supplierId }
    };
  } else {
    return     {
        type: FieldType.Query,
        name: 'supplier',
        label: t('purchasing.orders.labels.supplier'),
        labelBy: 'name',
        valueBy: 'id',
        query: suppliersQuery,
        dataKey: 'suppliers',
        isEdge: true,
        multiple: false,
        filterable: true,
        formMapIdentifier: 'id',
        createOnFlyConfig: supplierOnTheFlyConfig(t),
    };
  }
}

export const baseFormConfigConstructor = (
  t: Function,
  type: FormType,
  mutation: any,
  mutationKey: string,
  supplierId: string | null = null
): FormConfig => ({
 cols: 1,
  type: type,
  mutation: mutation,
  mutationKey: mutationKey,
  submitUrl: getSubmitUrl(supplierId),
  submitAndContinueUrl: getSubmitAndContinueUrl(supplierId),
  deleteMutation: deletePurchaseOrderMutation,
  fields: [
    {
      type: FieldType.Text,
      name: 'orderReference',
      label: t('purchasing.orders.labels.orderReference'),
      placeholder: t('purchasing.orders.placeholders.orderReference'),
    },
    {
      type: FieldType.Choice,
      name: 'status',
      labelBy: 'name',
      valueBy: 'code',
      label: t('sales.orders.labels.status.title'),
      filterable: true,
      options: getStatusOptions(t)
     },
    getSupplierField(t, supplierId),
    {
      type: FieldType.Query,
      name: 'invoiceAddress',
      label: t('sales.orders.labels.invoiceAddress'),
      labelBy: 'address1',
      valueBy: 'id',
      query: companyInvoiceAddressesQuery,
      dataKey: 'invoiceAddresses',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
    },
    {
      type: FieldType.Query,
      name: 'shippingAddress',
      label: t('sales.orders.labels.shippingAddress'),
      labelBy: 'address1',
      valueBy: 'id',
      query: companyShippingAddressesQuery,
      dataKey: 'shippingAddresses',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
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
      createOnFlyConfig: currencyOnTheFlyConfig(t)
    }
  ],
});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
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
      addExactLookup: true,
      exactLookupKeys: ['id']
    },
    {
      type: FieldType.Query,
      name: 'supplier',
      label: t('purchasing.orders.labels.supplier'),
      labelBy: 'name',
      valueBy: 'id',
      query: suppliersQuery,
      dataKey: 'suppliers',
      isEdge: true,
      multiple: false,
      filterable: true,
      addExactLookup: true,
      exactLookupKeys: ['id']
    },
      {
      type: FieldType.Choice,
      name: 'status',
      labelBy: 'name',
      valueBy: 'code',
      label: t('sales.orders.labels.status.title'),
      filterable: true,
      options: getStatusOptions(t),
      addExactLookup: true,
      exactLookupKeys: []
    },
  ],
  orders: []
});


const getHeaders = (t, supplierId) => {
  return supplierId
    ? [t('purchasing.orders.labels.orderReference'),t('sales.orders.labels.status.title'), t('purchasing.orders.labels.totalValue')]
    : [t('purchasing.orders.labels.orderReference'),t('sales.orders.labels.status.title'), t('purchasing.orders.labels.supplier'), t('purchasing.orders.labels.totalValue')];
}

const getFields = (t, supplierId): ShowField[] => {
  const commonFields: ShowField[] = [
    {
      name: 'orderReference',
      type: FieldType.Text,
    },
    {
      name: 'status',
      type: FieldType.Badge,
      badgeMap: getOrderStatusBadgeMap(t)
    },
    {
      name: 'totalValue',
      type: FieldType.Text,
    },
  ];

  if (!supplierId) {
    commonFields.splice(2, 0, { name: 'supplier', type: FieldType.NestedText, keys: ['name'] });
  }

  return commonFields;
}

const getUrlQueryParams = (supplierId) => {
  return supplierId ? { "supplierId": supplierId } : undefined;
}

export const listingConfigConstructor = (t: Function, supplierId: string | null = null): ListingConfig => ({
  headers: getHeaders(t, supplierId),
  fields: getFields(t, supplierId),
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  addShow: true,
  editUrlName: 'purchasing.orders.edit',
  showUrlName: 'purchasing.orders.show',
  urlQueryParams: getUrlQueryParams(supplierId),
  addDelete: true,
  addPagination: true,
  deleteMutation: deletePurchaseOrderMutation,
});

export const showConfigConstructor = (t: Function, id): ShowConfig => ({
  cols: 1,
  subscription: purchaseOrderSubscription,
  subscriptionKey: 'purchaseOrder',
  subscriptionVariables: {pk: id},
  addBack: true,
  backUrl:  {name: 'purchasing.orders.list' },
  addEdit: true,
  editUrl: {name: 'purchasing.orders.edit', params: {id: id} },
  addDelete: true,
  deleteMutation: deletePurchaseOrderMutation,
  deleteVariables: {id: id},
  fields: [
 {
    name: 'orderReference',
    type: FieldType.Text,
    label:  t('purchasing.orders.labels.orderReference'),
    showLabel: true
  },
  {
    name: 'status',
    type: FieldType.Badge,
    label: t('sales.orders.labels.status.title'),
    showLabel: true,
    badgeMap: getOrderStatusBadgeMap(t)
  },
  {
    name: 'totalValue',
    type: FieldType.Text,
    label: t('purchasing.orders.labels.totalValue'),
    showLabel: true
  },
  {
    name: 'supplier',
    type: FieldType.NestedText,
    label: t('purchasing.orders.labels.supplier'),
    keys: ['name'],
    showLabel: true
  },
  {
    name: 'invoiceAddress',
    type: FieldType.NestedText,
    label: t('contacts.companies.address.labels.invoiceAddress'),
    keys: ['fullAddress'],
    showLabel: true
  },
  {
    name: 'shippingAddress',
    type: FieldType.NestedText,
    label: t('contacts.companies.address.labels.shippingAddress'),
    keys: ['fullAddress'],
    showLabel: true
  },
  ]

});
export const listingQueryKey = 'purchaseOrders';
export const listingQuery = purchaseOrdersQuery;

