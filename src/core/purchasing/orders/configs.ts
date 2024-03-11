import {FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import {FieldType, OrderStatus} from '../../../shared/utils/constants.js'
import {SearchConfig} from "../../../shared/components/organisms/general-search/searchConfig";
import {ListingConfig, ListingField} from "../../../shared/components/organisms/general-listing/listingConfig";
import {purchaseOrdersQuery} from "../../../shared/api/queries/purchasing.js"
import {deletePurchaseOrderMutation} from "../../../shared/api/mutations/purchasing.js";
import {currenciesQuery} from "../../../shared/api/queries/currencies.js";
import {companyInvoiceAddressesQuery, companyShippingAddressesQuery, suppliersQuery} from "../../../shared/api/queries/contacts.js";
import {ShowConfig} from "../../../shared/components/organisms/general-show/showConfig";
import {purchaseOrderSubscription} from "../../../shared/api/subscriptions/purchasing.js";

export const getStatusOptions = (t) => [
  { name: t('purchasing.orders.labels.status.choices.draft'), code: OrderStatus.DRAFT },
  { name: t('purchasing.orders.labels.status.choices.ordered'), code: OrderStatus.ORDERED },
  { name: t('purchasing.orders.labels.status.choices.confirmed'), code: OrderStatus.CONFIRMED },
  { name: t('purchasing.orders.labels.status.choices.pendingDelivery'), code: OrderStatus.PENDING_DELIVERY },
  { name: t('purchasing.orders.labels.status.choices.delivered'), code: OrderStatus.DELIVERED },
];

const getSubmitUrl = (supplierId) => {
  if (supplierId) {
    return { name: 'purchasing.suppliers.show', params: { id: supplierId }, query: { tab: 'orders' } };
  }
  return { name: 'purchasing.order.list' };
}

const getSubmitAndContinueUrl = (supplierId) => {
  if (supplierId) {
    return { name: 'purchasing.order.edit', query: { supplierId } };
  }
  return { name: 'purchasing.order.edit' };
}

const getSupplierField = (supplierId, t): FormField => {
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
        labelBy: 'symbol',
        valueBy: 'id',
        query: currenciesQuery,
        dataKey: 'currencies',
        isEdge: true,
        multiple: false,
        filterable: true,
        removable: false,
        formMapIdentifier: 'id',
    },
    getSupplierField(supplierId, t)
    ],
});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
});


const getHeaders = (t, supplierId) => {
  return supplierId
    ? [t('purchasing.orders.labels.orderReference'),t('shared.labels.status'), t('purchasing.orders.labels.totalValue')]
    : [t('purchasing.orders.labels.orderReference'),t('shared.labels.status'), t('purchasing.orders.labels.supplier'), t('purchasing.orders.labels.totalValue')];
}

const getFields = (supplierId): ListingField[] => {
  const commonFields: ListingField[] = [
    {
      name: 'orderReference',
      type: FieldType.Text,
    },
    {
      name: 'status',
      type: FieldType.Text,
    },
    {
      name: 'totalValue',
      type: FieldType.Text,
    },
  ];

  if (!supplierId) {
    commonFields.splice(2, 0, { name: 'supplierName', type: FieldType.NestedText, keys: ['supplier', 'name'] });
  }

  return commonFields;
}

const getUrlQueryParams = (supplierId) => {
  return supplierId ? { "supplierId": supplierId } : undefined;
}

export const listingConfigConstructor = (t: Function, supplierId: string | null = null): ListingConfig => ({
  headers: getHeaders(t, supplierId),
  fields: getFields(supplierId),
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
    type: FieldType.Text,
    label: t('shared.labels.status'),
    showLabel: true
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
      // clickable: true,
      // clickUrl: { name: 'purchasing.suppliers.show'},
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
export const listingQueryKey = 'purchaseOrders';
export const listingQuery = purchaseOrdersQuery;

