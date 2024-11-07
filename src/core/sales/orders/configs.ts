import {ChoiceFormField, FormConfig, FormField, FormType, QueryFormField} from '../../../shared/components/organisms/general-form/formConfig';
import {FieldType, OrderStatus, ReasonForSale} from '../../../shared/utils/constants.js'
import {OrderType, SearchConfig} from "../../../shared/components/organisms/general-search/searchConfig";
import {ListingConfig} from "../../../shared/components/organisms/general-listing/listingConfig";
import {NestedTextField, ShowConfig, ShowField} from "../../../shared/components/organisms/general-show/showConfig";
import {ordersQuery} from "../../../shared/api/queries/salesOrders.js"
import {companiesQuery, companyInvoiceAddressesQuery, companyShippingAddressesQuery} from "../../../shared/api/queries/contacts.js";
import {currenciesQuery} from "../../../shared/api/queries/currencies.js";
import {orderSubscription} from "../../../shared/api/subscriptions/salesOrders.js";
import {currencyOnTheFlyConfig} from "../../settings/currencies/configs";
import {customerOnTheFlyConfig} from "../customers/configs";

export const getStatusOptions = (t) => [
  { name: t('sales.orders.labels.status.choices.draft'), code: OrderStatus.DRAFT },
  { name: t('sales.orders.labels.status.choices.pending'), code: OrderStatus.PENDING },
  { name: t('sales.orders.labels.status.choices.pendingInventory'), code: OrderStatus.PENDING_INVENTORY },
  { name: t('sales.orders.labels.status.choices.pendingShippingApproval'), code: OrderStatus.PENDING_SHIPPING_APPROVAL },
  { name: t('sales.orders.labels.status.choices.toShip'), code: OrderStatus.TO_SHIP },
  { name: t('sales.orders.labels.status.choices.done'), code: OrderStatus.DONE },
  { name: t('sales.orders.labels.status.choices.cancelled'), code: OrderStatus.CANCELLED },
  { name: t('sales.orders.labels.status.choices.hold'), code: OrderStatus.HOLD },
  // { name: t('sales.orders.labels.status.choices.exchanged'), code: OrderStatus.EXCHANGED },
  // { name: t('sales.orders.labels.status.choices.refunded'), code: OrderStatus.REFUNDED },
  // { name: t('sales.orders.labels.status.choices.lost'), code: OrderStatus.LOST },
  // { name: t('sales.orders.labels.status.choices.merged'), code: OrderStatus.MERGED },
  // { name: t('sales.orders.labels.status.choices.damaged'), code: OrderStatus.DAMAGED },
  // { name: t('sales.orders.labels.status.choices.void'), code: OrderStatus.VOID }
];

export const getReasonForSaleOptions = (t) => [
  { name: t('sales.orders.labels.reasonForSale.choices.sale'), code: ReasonForSale.SALE },
  { name: t('sales.orders.labels.reasonForSale.choices.returnGoods'), code: ReasonForSale.RETURNGOODS },
  { name: t('sales.orders.labels.reasonForSale.choices.documents'), code: ReasonForSale.DOCUMENTS },
  { name: t('sales.orders.labels.reasonForSale.choices.sample'), code: ReasonForSale.SAMPLE },
  { name: t('sales.orders.labels.reasonForSale.choices.gift'), code: ReasonForSale.GIFT }
];

export const getReasonForSaleBadgeMap = (t) => ({
  [ReasonForSale.SALE]: { text: t('sales.orders.labels.reasonForSale.choices.sale'), color: 'purple' },
  [ReasonForSale.RETURNGOODS]: { text: t('sales.orders.labels.reasonForSale.choices.returnGoods'), color: 'pink' },
  [ReasonForSale.DOCUMENTS]: { text: t('sales.orders.labels.reasonForSale.choices.documents'), color: 'red' },
  [ReasonForSale.SAMPLE]: { text: t('sales.orders.labels.reasonForSale.choices.sample'), color: 'green' },
  [ReasonForSale.GIFT]: { text: t('sales.orders.labels.reasonForSale.choices.gift'), color: 'blue' },
});

export const getSalesOrderStatusBadgeMap = (t) => ({
  [OrderStatus.DRAFT]: { text: t('sales.orders.labels.status.choices.draft'), color: 'gray' },
  [OrderStatus.PENDING]: { text: t('sales.orders.labels.status.choices.pending'), color: 'yellow' },
  [OrderStatus.PENDING_INVENTORY]: { text: t('sales.orders.labels.status.choices.pendingInventory'), color: 'blue' },
  [OrderStatus.PENDING_SHIPPING_APPROVAL]: { text: t('sales.orders.labels.status.choices.pendingShippingApproval'), color: 'orange' },
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

export const getBadgeForSaleOrderStatus = (t, key) => {
  const map = getSalesOrderStatusBadgeMap(t);
  return map[key] || map[OrderStatus.VOID];
};



export const allowedStatusTransitions = {
  [OrderStatus.DRAFT]: [OrderStatus.DRAFT, OrderStatus.PENDING, OrderStatus.CANCELLED, OrderStatus.HOLD],
  // automatically assign to the next status (so it's short term status)
  [OrderStatus.PENDING]: [OrderStatus.PENDING],
  [OrderStatus.PENDING_SHIPPING_APPROVAL]: [OrderStatus.PENDING_SHIPPING_APPROVAL, OrderStatus.TO_SHIP],
  [OrderStatus.TO_SHIP]: [OrderStatus.TO_SHIP],
  [OrderStatus.PENDING_INVENTORY]: [OrderStatus.PENDING_INVENTORY],
  [OrderStatus.HOLD]: [OrderStatus.HOLD, OrderStatus.PENDING],
  [OrderStatus.DONE]: [OrderStatus.DONE],
  [OrderStatus.CANCELLED]: [OrderStatus.CANCELLED],
};

export const getCurrentStatusOptions = (t, currentStatus): Array<{ code: string; name: string }> => {
  const statusChoices = getStatusOptions(t);

  if (!currentStatus) {
    return statusChoices;
  }

  const allowedStatuses = allowedStatusTransitions[currentStatus] || [];

  return statusChoices.filter(choice => {
    return choice.code === currentStatus || allowedStatuses.includes(choice.code);
  });
};


const getSubmitUrl = (customerId, source) => {
  if (customerId && source === 'company') {
    return { name: 'contacts.companies.show', params: { id: customerId }, query: { tab: 'orders' } };
  } else if (customerId) {
    return { name: 'sales.customers.show', params: { id: customerId }, query: { tab: 'orders' } };
  }
  return { name: 'sales.orders.list' };
};


const getSubmitAndContinueUrl = (customerId, source) => {
  if (customerId && source === 'company') {
    return { name: 'sales.order.edit', query: { customerId, source: 'company' } };
  } else if (customerId) {
    return { name: 'sales.order.edit', query: { customerId } };
  }
  return { name: 'sales.orders.edit' };
};


const getCustomerField = (customerId, source, t): FormField => {
  if (customerId && source != null ) {
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
      query: companiesQuery,
      queryVariables: { filter: { 'isInternalCompany': { exact: false } }},
      dataKey: 'companies',
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
  customerId: string | null = null,
  source: string | null = null,
): FormConfig => {

  const invoiceAddressField: QueryFormField | ChoiceFormField = customerId ? {
    type: FieldType.Query,
    name: 'invoiceAddress',
    label: t('sales.orders.labels.invoiceAddress'),
    labelBy: 'fullAddress',
    valueBy: 'id',
    query: companyInvoiceAddressesQuery,
    dataKey: 'invoiceAddresses',
    isEdge: true,
    multiple: false,
    filterable: true,
    formMapIdentifier: 'id',
    disabled: type === FormType.CREATE,
    queryVariables: { filter: { company: { id: { exact: customerId } } } },
  } : {
    type: FieldType.Choice,
    name: 'invoiceAddress',
    label: t('sales.orders.labels.invoiceAddress'),
    labelBy: 'fullAddress',
    valueBy: 'id',
    options: [],
    disabled: true,
  };

  // Define shippingAddress field conditionally based on customerId
  const shippingAddressField: QueryFormField | ChoiceFormField = customerId ? {
    type: FieldType.Query,
    name: 'shippingAddress',
    label: t('sales.orders.labels.shippingAddress'),
    labelBy: 'fullAddress',
    valueBy: 'id',
    query: companyShippingAddressesQuery,
    dataKey: 'shippingAddresses',
    isEdge: true,
    multiple: false,
    filterable: true,
    formMapIdentifier: 'id',
    disabled: type === FormType.CREATE,
    queryVariables: { filter: { company: { id: { exact: customerId } } } },
  } : {
    type: FieldType.Choice,
    name: 'shippingAddress',
    label: t('sales.orders.labels.shippingAddress'),
    labelBy: 'fullAddress',
    valueBy: 'id',
    options: [],
    disabled: true,
  };

  let baseFields: FormField[] = [
    getCustomerField(customerId, source, t),
    {
      type: FieldType.Query,
      name: 'internalCompany',
      label: t('contacts.companies.labels.internalCompany'),
      labelBy: 'name',
      valueBy: 'id',
      query: companiesQuery,
      queryVariables: { filter: { 'isInternalCompany': { exact: true} }},
      dataKey: 'companies',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
    },
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
      createOnFlyConfig: currencyOnTheFlyConfig(t),
      setDefaultKey: 'isDefaultCurrency'
    },
    invoiceAddressField,
    shippingAddressField
  ];

  if (type !== FormType.CREATE) {
    const statusField: FormField = {
      type: FieldType.Choice,
      name: 'status',
      labelBy: 'name',
      valueBy: 'code',
      label: t('sales.orders.labels.status.title'),
      filterable: true,
      options: getStatusOptions(t),
    };

    baseFields.push(statusField)
  }

  baseFields = [
    ...baseFields,
    {
      type: FieldType.Choice,
      name: 'reasonForSale',
      label: t('sales.orders.labels.reasonForSale.title'),
      labelBy: 'name',
      valueBy: 'code',
      options: getReasonForSaleOptions(t),
      default: type === FormType.CREATE ? ReasonForSale.SALE : undefined,
    },
    {
      type: FieldType.Checkbox,
      name: 'priceInclVat',
      label: t('sales.orders.labels.priceInclVat'),
      default: true,
      uncheckedValue: "false",
    },
  ];

  return {
    cols: 1,
    type: type,
    mutation: mutation,
    mutationKey: mutationKey,
    submitUrl: getSubmitUrl(customerId, source),
    submitAndContinueUrl: getSubmitAndContinueUrl(customerId, source),
    fields: baseFields,
  };
};


export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    {
      type: FieldType.Choice,
      name: 'status',
      label: t('sales.orders.labels.status.title'),
      labelBy: 'name',
      valueBy: 'code',
      options: getStatusOptions(t),
      addLookup: true
    },
    {
      type: FieldType.Choice,
      name: 'reasonForSale',
      label: t('sales.orders.labels.reasonForSale.title'),
      labelBy: 'name',
      valueBy: 'code',
      options: getReasonForSaleOptions(t),
      addLookup: true
    },
    {
      type: FieldType.Query,
      name: 'customer',
      label: t('contacts.people.labels.customer'),
      labelBy: 'name',
      valueBy: 'id',
      query: companiesQuery,
      queryVariables: { filter: { 'isInternalCompany': { exact: false } }},
      dataKey: 'companies',
      filterable: true,
      isEdge: true,
      addLookup: true,
      lookupKeys: ['id']
    },
  ],
  orders: [
    {
      name: 'createdAt',
      label: t('shared.labels.createdAt'),
      type: OrderType.ASC
    },
    {
      name: 'createdAt',
      label: t('shared.labels.createdAt'),
      type: OrderType.DESC
    },
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
    },
  ]
});

const getHeaders = (t, customerId) => {
  return customerId
    ? [t('shared.labels.date'), t('sales.orders.labels.reference'), t('sales.orders.labels.status.title'), t('contacts.companies.address.labels.country')]
    : [t('shared.labels.date'), t('sales.orders.labels.reference'), t('sales.orders.labels.customer'), t('sales.orders.labels.status.title'), t('contacts.companies.address.labels.country')];
}

const getFields = (customerId, t): ShowField[] => {
  const commonFields: ShowField[] = [
    { name: 'createdAt', type: FieldType.Date },
    { name: 'reference', type: FieldType.Text },
    { name: 'status', type: FieldType.Badge, badgeMap: getSalesOrderStatusBadgeMap(t)},
    { name: 'country', type: FieldType.NestedText, keys: [] },
  ];

  if (!customerId) {
    commonFields.splice(2, 0, {
      name: 'customer',
      type: FieldType.NestedText,
      keys: ['name'],
      clickable: true,
      clickIdentifiers: [{id: ['id']}],
      clickUrl: {name: 'contacts.companies.show'}} as NestedTextField);
  }

  return commonFields;
}

const getUrlQueryParams = (customerId: string | null = null, productId: string | null = null, source: string|null = null): Record<string, string> | undefined => {
  const params: Record<string, string> = {};

  if (customerId) {
    params.customerId = customerId;
    if (source) {
      params.source = source
    }
  }
  if (productId) {
    params.productId = productId;
    params.tab = 'items';
  }
  return Object.keys(params).length > 0 ? params : undefined;
}

export const listingConfigConstructor = (t: Function, customerId: string|null = null, productId: string|null = null, source: string|null = null): ListingConfig => ({
  headers: getHeaders(t, customerId),
  fields: getFields(customerId, t),
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'sales.orders.edit',
  showUrlName: 'sales.orders.show',
  urlQueryParams: getUrlQueryParams(customerId, productId, source),
  addShow: true,
  addDelete: false,
  addPagination: true,
});

const getBackUrl = (customerId: string | null = null, productId: string | null = null, source: string|null = null) => {

  if (customerId) {
    if (customerId && source === 'company') {
      return { name: 'contacts.companies.show', params: { id: customerId }, query: { tab: 'orders' } };
    } else if (customerId) {
      return { name: 'sales.customers.show', params: { id: customerId }, query: { tab: 'orders' } };
    }
  }

  if (productId) {
    return { name: 'products.products.show', params: { id: productId }, query: {tab: 'saleOrders'} }
  }

  return {name: 'sales.orders.list' };
}

export const showConfigConstructor = (t: Function, id, customerId: string|null = null, productId: string|null = null, source: string|null = null): ShowConfig => ({
  cols: 1,
  subscription: orderSubscription,
  subscriptionKey: 'order',
  subscriptionVariables: {pk: id},
  addBack: true,
  backUrl: getBackUrl(customerId, productId, source),
  addCustomButtons: true,
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
  {
    name: 'createdAt',
    type: FieldType.Date,
    label: t('shared.labels.date'),
    showLabel: true
  }
]

});

export const listingQueryKey = 'orders';
export const listingQuery = ordersQuery;