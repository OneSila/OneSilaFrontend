import {CreateOnTheFly, FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import {FieldType, OrderStatus} from '../../../shared/utils/constants.js'
import {OrderType, SearchConfig} from "../../../shared/components/organisms/general-search/searchConfig";
import {ListingConfig} from "../../../shared/components/organisms/general-listing/listingConfig";
import {purchaseOrdersQuery} from "../../../shared/api/queries/purchasing.js"
import {deletePurchaseOrderMutation} from "../../../shared/api/mutations/purchasing.js";
import {currenciesQuery} from "../../../shared/api/queries/currencies.js";
import {companiesQuery, companyInvoiceAddressesQuery, companyShippingAddressesQuery} from "../../../shared/api/queries/contacts.js";
import {NestedTextField, ShowConfig, ShowField} from "../../../shared/components/organisms/general-show/showConfig";
import {purchaseOrderSubscription} from "../../../shared/api/subscriptions/purchasing.js";
import { createCompanyInvoiceAddressMutation, createCompanyShippingAddressMutation} from "../../../shared/api/mutations/contacts.js";
import {currencyOnTheFlyConfig} from "../../settings/currencies/configs";
import {baseFormConfigConstructor as baseAddressConfigConstructor } from '../../contacts/companies/companies-show/containers/configs'
import {supplierOnTheFlyConfig} from "../suppliers/configs";
import { membersQuery } from "../../../shared/api/queries/me.js";

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
  [OrderStatus.TO_ORDER]: { text: t('purchasing.orders.labels.status.choices.toOrder'), color: 'red' },
  [OrderStatus.CONFIRMED]: { text: t('purchasing.orders.labels.status.choices.confirmed'), color: 'green' },
  [OrderStatus.PENDING_DELIVERY]: { text: t('purchasing.orders.labels.status.choices.pendingDelivery'), color: 'blue' },
  [OrderStatus.DELIVERED]: { text: t('purchasing.orders.labels.status.choices.delivered'), color: 'indigo' },
});

const getSubmitUrl = (supplierId, source) => {
  if (supplierId && source === 'company') {
    return { name: 'contacts.companies.show', params: { id: supplierId }, query: { tab: 'purchaseOrders' } };
  } else if (supplierId) {
    return { name: 'purchasing.suppliers.show', params: { id: supplierId }, query: { tab: 'orders' } };
  }
  return { name: 'purchasing.orders.list' };
};


const getSubmitAndContinueUrl = (supplierId, source, type) => {

  if (type == FormType.CREATE) {
    return { name: 'purchasing.orders.show' };
  } else {
    if (supplierId && source === 'company') {
      return { name: 'purchasing.orders.edit', query: { supplierId, source: 'company' } };
    } else if (supplierId) {
      return { name: 'purchasing.orders.edit', query: { supplierId } };
    }
    return { name: 'purchasing.orders.edit' };
  }

};


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
        query: companiesQuery,
        queryVariables: { filter: { 'isInternalCompany': false }},
        dataKey: 'companies',
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
  supplierId: string | null = null,
  source: string | null = null
): FormConfig => {
  const fields: FormField[] = [
    {
      type: FieldType.Text,
      name: 'orderReference',
      label: t('purchasing.orders.labels.orderReference'),
      placeholder: t('purchasing.orders.placeholders.orderReference'),
      optional: true
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
      queryVariables: { filter: { company: { isInternalCompany: true } } },
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
      queryVariables: { filter: { company: { isInternalCompany: true } } },
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
      type: FieldType.Query,
      name: 'internalContact',
      label: t('purchasing.orders.labels.internalContact'),
      labelBy: 'fullName',
      valueBy: 'id',
      query: membersQuery,
      queryVariables: { filter: { isActive: true, invitationAccepted: true } },
      dataKey: 'users',
      isEdge: true,
      multiple: false,
      filterable: true,
      removable: false,
      formMapIdentifier: 'id',
    }
  ];

  // Add the status field only when the form is not in CREATE mode
  if (type !== FormType.CREATE) {
    fields.splice(1, 0, {
      type: FieldType.Choice,
      name: 'status',
      labelBy: 'name',
      valueBy: 'code',
      label: t('sales.orders.labels.status.title'),
      filterable: true,
      options: getStatusOptions(t),
    });
  }

  return {
    cols: 1,
    type: type,
    mutation: mutation,
    mutationKey: mutationKey,
    submitUrl: getSubmitUrl(supplierId, source),
    submitAndContinueUrl: getSubmitAndContinueUrl(supplierId, source, type),
    deleteMutation: deletePurchaseOrderMutation,
    fields: fields,
  };
};


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
      addLookup: true,
      lookupKeys: ['id']
    },
    {
      type: FieldType.Query,
      name: 'supplier',
      label: t('purchasing.orders.labels.supplier'),
      labelBy: 'name',
      valueBy: 'id',
      query: companiesQuery,
      queryVariables: { filter: { 'isInternalCompany': false }},
      dataKey: 'companies',
      isEdge: true,
      multiple: false,
      filterable: true,
      addLookup: true,
      lookupKeys: ['id']
    },
      {
      type: FieldType.Choice,
      name: 'status',
      labelBy: 'name',
      valueBy: 'code',
      label: t('sales.orders.labels.status.title'),
      filterable: true,
      options: getStatusOptions(t),
      addLookup: true,
      lookupKeys: []
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
  ]
});


const getHeaders = (t, supplierId) => {
  return supplierId
    ? [t('shared.labels.date'), t('purchasing.orders.labels.orderReference'),t('purchasing.orders.labels.totalValue'), t('sales.orders.labels.status.title'), t('contacts.companies.address.labels.country')]
    : [t('shared.labels.date'), t('purchasing.orders.labels.orderReference'), t('purchasing.orders.labels.totalValue'), t('purchasing.orders.labels.supplier'), t('sales.orders.labels.status.title'), t('contacts.companies.address.labels.country')];
}

const getFields = (t, supplierId): ShowField[] => {
  const commonFields: ShowField[] = [
    { name: 'createdAt',
      type: FieldType.Date
    },
    {
      name: 'orderReference',
      type: FieldType.Text,
    },
    {
      name: 'totalValue',
      type: FieldType.Text,
    },
    {
      name: 'status',
      type: FieldType.Badge,
      badgeMap: getOrderStatusBadgeMap(t)
    },
    {
      name: 'country',
      type: FieldType.Text,
    },
  ];

  if (!supplierId) {
    commonFields.splice(2, 0, {
      name: 'supplier',
      type: FieldType.NestedText,
      keys: ['name'],
      clickable: true,
      clickIdentifiers: [{id: ['id']}],
      clickUrl: {name: 'contacts.companies.show'}} as NestedTextField);
  }

  return commonFields;
}

const getUrlQueryParams = (supplierId: string | null = null, productId: string | null = null, source: string|null = null) => {
  const params: Record<string, string> = {};

  if (supplierId) {
    params.supplierId = supplierId;
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

export const listingConfigConstructor = (t: Function, supplierId: string | null = null, source: string|null = null, productId: string|null = null): ListingConfig => ({
  headers: getHeaders(t, supplierId),
  fields: getFields(t, supplierId),
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  addShow: true,
  editUrlName: 'purchasing.orders.edit',
  showUrlName: 'purchasing.orders.show',
  urlQueryParams: getUrlQueryParams(supplierId, productId, source),
  addDelete: true,
  addPagination: true,
  deleteMutation: deletePurchaseOrderMutation,
});

const getBackUrl = (supplierId: string | null = null,  productId: string | null = null, source: string|null = null) => {
  if (supplierId) {
    if (source === 'company') {
      return { name: 'contacts.companies.show', params: { id: supplierId }, query: { tab: 'purchaseOrders' } };
    } else {
      return { name: 'purchasing.suppliers.show', params: { id: supplierId }, query: { tab: 'orders' } };
    }
  }

  if (productId) {
    return { name: 'products.products.show', params: { id: productId }, query: {tab: 'purchaseOrders'} }
  }

  return { name: 'purchasing.orders.list' };
};

export const showConfigConstructor = (t: Function, id, supplierId: string|null = null, source: string|null = null, productId: string|null = null): ShowConfig => ({
  cols: 1,
  subscription: purchaseOrderSubscription,
  subscriptionKey: 'purchaseOrder',
  subscriptionVariables: {pk: id},
  addBack: true,
  backUrl: getBackUrl(supplierId, productId, source),
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
    showLabel: true,
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

