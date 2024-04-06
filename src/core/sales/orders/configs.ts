import {FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType, OrderStatus, ReasonForSale } from '../../../shared/utils/constants.js'
import { OrderType, SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import { ShowField, NestedTextField } from "../../../shared/components/organisms/general-show/showConfig";
import { ordersQuery } from "../../../shared/api/queries/salesOrders.js"
import {companiesQuery, companyInvoiceAddressesQuery, companyShippingAddressesQuery, customersQuery} from "../../../shared/api/queries/contacts.js";
import { currenciesQuery } from "../../../shared/api/queries/currencies.js";
import {ShowConfig} from "../../../shared/components/organisms/general-show/showConfig";
import {orderSubscription} from "../../../shared/api/subscriptions/salesOrders.js";
import {currencyOnTheFlyConfig} from "../../settings/currencies/configs";
import {customerOnTheFlyConfig} from "../customers/configs";

export const getStatusOptions = (t) => [
  { name: t('sales.orders.labels.status.choices.draft'), code: OrderStatus.DRAFT },
  { name: t('sales.orders.labels.status.choices.pending'), code: OrderStatus.PENDING },
  { name: t('sales.orders.labels.status.choices.pendingInventory'), code: OrderStatus.PENDING_INVENTORY },
  { name: t('sales.orders.labels.status.choices.toPick'), code: OrderStatus.TO_PICK },
  { name: t('sales.orders.labels.status.choices.toShip'), code: OrderStatus.TO_SHIP },
  { name: t('sales.orders.labels.status.choices.done'), code: OrderStatus.DONE },
  { name: t('sales.orders.labels.status.choices.cancelled'), code: OrderStatus.CANCELLED },
  { name: t('sales.orders.labels.status.choices.hold'), code: OrderStatus.HOLD },
  { name: t('sales.orders.labels.status.choices.exchanged'), code: OrderStatus.EXCHANGED },
  { name: t('sales.orders.labels.status.choices.refunded'), code: OrderStatus.REFUNDED },
  { name: t('sales.orders.labels.status.choices.lost'), code: OrderStatus.LOST },
  { name: t('sales.orders.labels.status.choices.merged'), code: OrderStatus.MERGED },
  { name: t('sales.orders.labels.status.choices.damaged'), code: OrderStatus.DAMAGED },
  { name: t('sales.orders.labels.status.choices.void'), code: OrderStatus.VOID }
];

export const getReasonForSaleOptions = (t) => [
  { name: t('sales.orders.labels.reasonForSale.choices.sale'), code: ReasonForSale.SALE },
  { name: t('sales.orders.labels.reasonForSale.choices.returnGoods'), code: ReasonForSale.RETURNGOODS },
  { name: t('sales.orders.labels.reasonForSale.choices.documents'), code: ReasonForSale.DOCUMENTS },
  { name: t('sales.orders.labels.reasonForSale.choices.sample'), code: ReasonForSale.SAMPLE },
  { name: t('sales.orders.labels.reasonForSale.choices.gift'), code: ReasonForSale.GIFT }
];

export const getSalesOrderStatusBadgeMap = (t) => ({
  [OrderStatus.DRAFT]: { text: t('sales.orders.labels.status.choices.draft'), color: 'gray' },
  [OrderStatus.PENDING]: { text: t('sales.orders.labels.status.choices.pending'), color: 'yellow' },
  [OrderStatus.PENDING_INVENTORY]: { text: t('sales.orders.labels.status.choices.pendingInventory'), color: 'blue' },
  [OrderStatus.TO_PICK]: { text: t('sales.orders.labels.status.choices.toPick'), color: 'indigo' },
  [OrderStatus.TO_SHIP]: { text: t('sales.orders.labels.status.choices.toShip'), color: 'purple' },
  [OrderStatus.DONE]: { text: t('sales.orders.labels.status.choices.done'), color: 'green' },
  [OrderStatus.CANCELLED]: { text: t('sales.orders.labels.status.choices.cancelled'), color: 'red' },
  [OrderStatus.HOLD]: { text: t('sales.orders.labels.status.choices.hold'), color: 'pink' },
  [OrderStatus.EXCHANGED]: { text: t('sales.orders.labels.status.choices.exchanged'), color: 'primary' },
  [OrderStatus.REFUNDED]: { text: t('sales.orders.labels.status.choices.refunded'), color: 'indigo' },
  [OrderStatus.LOST]: { text: t('sales.orders.labels.status.choices.lost'), color: 'red' },
  [OrderStatus.MERGED]: { text: t('sales.orders.labels.status.choices.merged'), color: 'blue' },
  [OrderStatus.DAMAGED]: { text: t('sales.orders.labels.status.choices.damaged'), color: 'red' },
  [OrderStatus.VOID]: { text: t('sales.orders.labels.status.choices.void'), color: 'gray' },
});

export const getReasonForSaleBadgeMap = (t) => ({
  [ReasonForSale.SALE]: { text: t('sales.orders.labels.reasonForSale.choices.sale'), color: 'purple' },
  [ReasonForSale.RETURNGOODS]: { text: t('sales.orders.labels.reasonForSale.choices.returnGoods'), color: 'pink' },
  [ReasonForSale.DOCUMENTS]: { text: t('sales.orders.labels.reasonForSale.choices.documents'), color: 'red' },
  [ReasonForSale.SAMPLE]: { text: t('sales.orders.labels.reasonForSale.choices.sample'), color: 'green' },
  [ReasonForSale.GIFT]: { text: t('sales.orders.labels.reasonForSale.choices.gift'), color: 'blue' },
});


const getSubmitUrl = (customerId) => {
  if (customerId) {
    return { name: 'sales.customers.show', params: { id: customerId }, query: { tab: 'orders' } };
  }
  return { name: 'sales.orders.list' };
}

const getSubmitAndContinueUrl = (customerId) => {
  if (customerId) {
    return { name: 'sales.order.edit', query: { customerId } };
  }
  return { name: 'sales.orders.edit' };
}

const getCustomerField = (customerId, t): FormField => {
  if (customerId) {
    return {
      type: FieldType.Hidden,
      name: 'customer',
      value: { "id": customerId }
    };
  } else {
    return {
      type: FieldType.Query,
      name: 'customer',
      label: t('contacts.people.labels.customer'),
      labelBy: 'name',
      valueBy: 'id',
      query: customersQuery,
      dataKey: 'customers',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
      createOnFlyConfig: customerOnTheFlyConfig(t)
    };
  }
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
  fields: [
    {
      type: FieldType.Text,
      name: 'reference',
      label: t('sales.orders.labels.reference'),
      placeholder: t('sales.orders.placeholders.reference'),
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
        createOnFlyConfig: currencyOnTheFlyConfig(t)
    },
    getCustomerField(customerId, t),
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
      type: FieldType.Choice,
      name: 'status',
      labelBy: 'name',
      valueBy: 'code',
      label: t('sales.orders.labels.status.title'),
      filterable: true,
      options: getStatusOptions(t),
      default: type === FormType.CREATE ? OrderStatus.DRAFT : undefined,
    },
    {
      type: FieldType.Choice,
      name: 'reasonForSale',
      label: t('sales.orders.labels.reasonForSale.title'),
      labelBy: 'name',
      valueBy: 'code',
      options: getReasonForSaleOptions(t)
    },
    {
      type: FieldType.Boolean,
      name: 'priceInclVat',
      label: t('sales.orders.labels.priceInclVat'),
      placeholder: t('sales.orders.placeholders.priceInclVat'),
      strict: false,
      default: true
    },
    ],
});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: false,
  orderKey: "sort",
  filters: [
    {
      type: FieldType.Choice,
      name: 'status',
      label: t('sales.orders.labels.status.title'),
      labelBy: 'name',
      valueBy: 'code',
      options: getStatusOptions(t),
      addExactLookup: true
    },
    {
      type: FieldType.Choice,
      name: 'reasonForSale',
      label: t('sales.orders.labels.reasonForSale.title'),
      labelBy: 'name',
      valueBy: 'code',
      options: getReasonForSaleOptions(t),
      addExactLookup: true
    },
    {
      type: FieldType.Query,
      name: 'customer',
      label: t('contacts.people.labels.customer'),
      labelBy: 'name',
      valueBy: 'id',
      query: customersQuery,
      dataKey: 'customers',
      filterable: true,
      isEdge: true,
      addExactLookup: true,
      exactLookupKeys: ['id']
    },
  ],
  orders: [
    {
      name: 'status',
      label: t('sales.orders.labels.status.title'),
      type: OrderType.ASC
    },
    {
      name: 'status',
      label: t('sales.orders.labels.status.title'),
      type: OrderType.DESC
    },
    {
      name: 'reference',
      label: t('sales.orders.labels.reference'),
      type: OrderType.ASC
    },
    {
      name: 'reference',
      label: t('sales.orders.labels.reference'),
      type: OrderType.DESC
    }
  ]
});

const getHeaders = (t, customerId) => {
  return customerId
    ? [t('sales.orders.labels.reference'), t('shared.labels.date'), t('sales.orders.labels.status.title')]
    : [t('sales.orders.labels.reference'), t('sales.orders.labels.customer'), t('shared.labels.date'), t('sales.orders.labels.status.title')];
}

const getFields = (customerId, t): ShowField[] => {
  const commonFields: ShowField[] = [
    { name: 'reference', type: FieldType.Text },
    { name: 'createdAt', type: FieldType.Date },
    { name: 'status', type: FieldType.Badge, badgeMap: getSalesOrderStatusBadgeMap(t)},
  ];

  if (!customerId) {
    commonFields.splice(1, 0, { name: 'customer', type: FieldType.NestedText, keys: ['name'] } as NestedTextField);
  }

  return commonFields;
}

const getUrlQueryParams = (customerId: string | null = null, productId: string | null = null): Record<string, string> | undefined => {
  const params: Record<string, string> = {};

  if (customerId) {
    params.customerId = customerId;
  }
  if (productId) {
    params.productId = productId;
    params.tab = 'items';
  }
  return Object.keys(params).length > 0 ? params : undefined;
}

export const listingConfigConstructor = (t: Function, customerId: string|null = null, productId: string|null = null): ListingConfig => ({
  headers: getHeaders(t, customerId),
  fields: getFields(customerId, t),
  identifierKey: 'id',
  addActions: true,
  addEdit: !productId,
  editUrlName: 'sales.orders.edit',
  showUrlName: 'sales.orders.show',
  urlQueryParams: getUrlQueryParams(customerId, productId),
  addShow: true,
  addDelete: false,
  addPagination: true,
});

const getBackUrl = (customerId: string | null = null, productId: string | null = null) => {

  if (customerId) {
    return { name: 'sales.customers.show', params: { id: customerId }, query: {tab: 'orders'} }
  }

  if (productId) {
    return { name: 'products.products.show', params: { id: productId }, query: {tab: 'saleOrders'} }
  }

  return {name: 'sales.orders.list' };
}

export const showConfigConstructor = (t: Function, id, customerId: string|null = null, productId: string|null = null): ShowConfig => ({
  cols: 1,
  subscription: orderSubscription,
  subscriptionKey: 'order',
  subscriptionVariables: {pk: id},
  addBack: true,
  backUrl: getBackUrl(customerId, productId),
  addEdit: true,
  editUrl: {name: 'sales.orders.edit', params: {id: id} },
  addDelete: false,
  fields: [
 {
    name: 'reference',
    type: FieldType.Text,
    label:  t('sales.orders.labels.reference'),
    showLabel: true
  },
  {
    name: 'priceInclVat',
    type: FieldType.Boolean,
    label: t('sales.orders.labels.priceInclVat'),
    showLabel: true
  },
  {
    name: 'totalValue',
    type: FieldType.Text,
    label: t('sales.orders.labels.totalValue'),
    showLabel: true
  },
  {
    name: 'status',
    type: FieldType.Badge,
    label: t('sales.orders.labels.status.title'),
    showLabel: true,
    badgeMap: getSalesOrderStatusBadgeMap(t)
  },
  {
    name: 'reasonForSale',
    type: FieldType.Badge,
    label: t('sales.orders.labels.reasonForSale.title'),
    showLabel: true,
    badgeMap: getReasonForSaleBadgeMap(t)
  },
  {
    name: 'customer',
    type: FieldType.NestedText,
    label: t('sales.orders.labels.customer'),
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

export const listingQueryKey = 'orders';
export const listingQuery = ordersQuery;