import {FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType, OrderStatus, ReasonForSale } from '../../../shared/utils/constants.js'
import { OrderType, SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import { ShowField, NestedTextField } from "../../../shared/components/organisms/general-show/showConfig";
import { ordersQuery } from "../../../shared/api/queries/salesOrders.js"
import {companyInvoiceAddressesQuery, companyShippingAddressesQuery, customersQuery} from "../../../shared/api/queries/contacts.js";
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
  helpSections: [
    {
      header: 'Reference',
      content: 'This field is used as reference of the order :)'
    },
    {
      header: 'Invoice address',
      content: 'Invoice adress for the order'
    }
  ],
  fields: [
    {
      type: FieldType.Text,
      name: 'reference',
      label: t('sales.orders.labels.reference'),
      placeholder: t('sales.orders.placeholders.reference'),
      help: 'This should be a refrence to the order.'
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
      options: getStatusOptions(t)
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
      options: getStatusOptions(t)
    },
    {
      type: FieldType.Choice,
      name: 'reasonForSale',
      label: t('sales.orders.labels.reasonForSale.title'),
      labelBy: 'name',
      valueBy: 'code',
      options: getReasonForSaleOptions(t)
    }
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
    ? [t('sales.orders.labels.reference'), t('shared.labels.date'), t('sales.orders.labels.status.title'), t('sales.orders.labels.reasonForSale.title')]
    : [t('sales.orders.labels.reference'), t('sales.orders.labels.customer'), t('shared.labels.date'), t('sales.orders.labels.status.title'), t('sales.orders.labels.reasonForSale.title')];
}

const getFields = (customerId): ShowField[] => {
  const commonFields: ShowField[] = [
    { name: 'reference', type: FieldType.Text },
    { name: 'createdAt', type: FieldType.Date },
    { name: 'status', type: FieldType.Text },
    { name: 'reasonForSale', type: FieldType.Text }
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
  fields: getFields(customerId),
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
    type: FieldType.Text,
    label: t('sales.orders.labels.status.title'),
    showLabel: true
  },
  {
    name: 'reasonForSale',
    type: FieldType.Text,
    label: t('sales.orders.labels.reasonForSale.title'),
    showLabel: true
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
    keys: ['address1'],
    showLabel: true
  },
  {
    name: 'invoiceAddress',
    type: FieldType.NestedText,
    keys: ['address2'],
    showLabel: false
  },
  {
    name: 'invoiceAddress',
    type: FieldType.NestedText,
    keys: ['address3'],
    showLabel: false
  },
  {
    name: 'shippingAddress',
    type: FieldType.NestedText,
    label: t('contacts.companies.address.labels.shippingAddress'),
    keys: ['address1'],
    showLabel: true
  },
  {
    name: 'shippingAddress',
    type: FieldType.NestedText,
    keys: ['address2'],
    showLabel: false
  },
  {
    name: 'shippingAddress',
    type: FieldType.NestedText,
    keys: ['address3'],
    showLabel: false
  },
  ]

});
export const listingQueryKey = 'orders';
export const listingQuery = ordersQuery;


