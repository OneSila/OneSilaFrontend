import {FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import {SearchConfig, SearchFilter} from "../../../shared/components/organisms/general-search/searchConfig";
import {ListingConfig} from "../../../shared/components/organisms/general-listing/listingConfig";
import {ShowConfig, ShowField} from "../../../shared/components/organisms/general-show/showConfig";
import {shipmentsQuery} from "../../../shared/api/queries/inventory.js";
import {ordersQuery} from "../../../shared/api/queries/salesOrders.js";
import {companyShippingAddressesQuery} from "../../../shared/api/queries/contacts.js";
import {deleteShipmentMutation, updateShipmentMutation} from "../../../shared/api/mutations/inventory.js";
import {shipmentSubscription} from "../../../shared/api/subscriptions/inventory.js";
import {FieldType} from "../../../shared/utils/constants";

export const ShipmentStatus = {
  DRAFT: 'DRAFT',
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED',
};

export const getShipmentStatusOptions = (t) => [
  { name: t('inventory.shipments.statuses.draft'), code: ShipmentStatus.DRAFT },
  { name: t('inventory.shipments.statuses.todo'), code: ShipmentStatus.TODO },
  { name: t('inventory.shipments.statuses.inProgress'), code: ShipmentStatus.IN_PROGRESS },
  { name: t('inventory.shipments.statuses.done'), code: ShipmentStatus.DONE },
  { name: t('inventory.shipments.statuses.cancelled'), code: ShipmentStatus.CANCELLED },
];

export const getShipmentStatusBadgeMap = (t) => ({
  [ShipmentStatus.DRAFT]: { text: t('inventory.shipments.statuses.draft'), color: 'gray' },
  [ShipmentStatus.TODO]: { text: t('inventory.shipments.statuses.todo'), color: 'yellow' },
  [ShipmentStatus.IN_PROGRESS]: { text: t('inventory.shipments.statuses.inProgress'), color: 'blue' },
  [ShipmentStatus.DONE]: { text: t('inventory.shipments.statuses.done'), color: 'green' },
  [ShipmentStatus.CANCELLED]: { text: t('inventory.shipments.statuses.cancelled'), color: 'red' },
});


const getSubmitUrl = (sourceType: string | null, orderId: string | null) => {
  if (sourceType === 'order') {
    return { name: 'sales.orders.show', params: { id: orderId }, query: { tab: 'shippings' } };
  }
  return { name: 'inventory.shipments.list' };
};


const getSubmitAndContinueUrl = (orderId, sourceType: string | null, type: FormType) => {
  if (type === FormType.CREATE) {
    return { name: 'inventory.shipments.show' };
  } else {
    if (orderId && sourceType === 'order') {
      return { name: 'inventory.shipments.edit', query: { id: orderId, sourceType: 'order' } };
    }
    return { name: 'inventory.shipments.edit' };
  }
};

const getOrderField = (orderId: string | null, t, type): FormField => {
  if (orderId) {
    return {
      type: FieldType.Hidden,
      name: 'order',
      value: { id: orderId }
    };
  } else {
    return {
      type: FieldType.Query,
      name: 'order',
      label: t('sales.orders.title'),
      labelBy: 'reference',
      valueBy: 'id',
      query: ordersQuery,
      dataKey: 'orders',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
      disabled: type == FormType.EDIT
    };
  }
};

export const getFields = (t, type: FormType, orderId: string | null): FormField[] => {
  const statusField: FormField[] = type !== FormType.CREATE
    ? [
        {
          type: FieldType.Choice,
          name: 'status',
          labelBy: 'name',
          valueBy: 'code',
          label: t('sales.orders.labels.status.title'),
          filterable: true,
          options: getShipmentStatusOptions(t),
        }
      ]
    : [];

  return [
    getOrderField(orderId, t, type),
    {
      type: FieldType.Query,
      name: 'fromAddress',
      label: t('inventory.shipments.labels.fromAddress'),
      labelBy: 'fullAddress',
      valueBy: 'id',
      query: companyShippingAddressesQuery,
      dataKey: 'shippingAddresses',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
      queryVariables: { "filter": { "company": {'isInternalCompany': { exact: true} } } },
    },
    {
      type: FieldType.Query,
      name: 'toAddress',
      label: t('inventory.shipments.labels.toAddress'),
      labelBy: 'fullAddress',
      valueBy: 'id',
      query: companyShippingAddressesQuery,
      dataKey: 'shippingAddresses',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
      disabled: type === FormType.CREATE
    },
    ...statusField
  ];
};


export const baseFormConfigConstructor = (
  t: Function,
  type: FormType,
  mutation: any,
  mutationKey: string,
  orderId: string | null = null,
  sourceType: string | null = null
): FormConfig => ({
  cols: 1,
  type: type,
  mutation: mutation,
  mutationKey: mutationKey,
  submitUrl: getSubmitUrl(sourceType, orderId),
  submitAndContinueUrl: getSubmitAndContinueUrl(orderId, sourceType, type),
  deleteMutation: deleteShipmentMutation,
  fields: getFields(t, type, orderId),
});

export const searchConfigConstructor = (t, orderId: string | null = null): SearchConfig => {
  const orderField: SearchFilter[] = !orderId
    ? [
        {
          type: FieldType.Query,
          name: 'order',
          label: t('sales.orders.title'),
          labelBy: 'reference',
          valueBy: 'id',
          query: ordersQuery,
          dataKey: 'orders',
          isEdge: true,
          filterable: true,
        }
      ]
    : [];

  return {
    search: true,
    orderKey: 'sort',
    filters: [
      {
        type: FieldType.Choice,
        name: 'status',
        label: t('sales.orders.labels.status.title'),
        options: getShipmentStatusOptions(t),
        labelBy: 'name',
        valueBy: 'code',
        mandatory: true,
        addLookup: true,
      },
      {
        type: FieldType.Query,
        name: 'fromAddress',
        label: t('inventory.shipments.labels.fromAddress'),
        labelBy: 'fullAddress',
        valueBy: 'id',
        query: companyShippingAddressesQuery,
        dataKey: 'shippingAddresses',
        isEdge: true,
        filterable: true,
        addLookup: true,
        lookupKeys: ['id'],
      },
      {
        type: FieldType.Query,
        name: 'toAddress',
        label: t('inventory.shipments.labels.toAddress'),
        labelBy: 'fullAddress',
        valueBy: 'id',
        query: companyShippingAddressesQuery,
        dataKey: 'shippingAddresses',
        isEdge: true,
        multiple: false,
        filterable: true,
        addLookup: true,
        lookupKeys: ['id'],
      },
      ...orderField,
    ],
    orders: [],
  };
};


const getUrlQueryParams = (orderId: string | null = null, source: string | null = null): Record<string, string> | undefined => {
  const params: Record<string, string> = {};

  if (orderId) {
    params.orderId = orderId;
    if (source) {
      params.source = source;
    }
  }
  return Object.keys(params).length > 0 ? params : undefined;
};

export const listingConfigConstructor = (
  t: Function,
  orderId: string | null = null,
  source: string | null = null
): ListingConfig => {

  const orderHeader = !orderId ? [t('sales.orders.title')] : [];
  const orderField: ShowField[] = !orderId
    ? [
        {
          name: 'order',
          type: FieldType.NestedText,
          keys: ['reference'],
        }
      ]
    : [];

  return {
    headers: [
      t('sales.orders.labels.reference'),
      ...orderHeader,
      t('sales.orders.labels.status.title'),
      t('inventory.shipments.labels.fromAddress'),
      t('inventory.shipments.labels.toAddress'),
    ],
    fields: [
      {
        name: 'reference',
        type: FieldType.Text,
      },
      ...orderField,  // Insert the conditional field
      {
        name: 'status',
        type: FieldType.Badge,
        badgeMap: getShipmentStatusBadgeMap(t),
      },
      {
        name: 'fromAddress',
        type: FieldType.NestedText,
        keys: ['fullAddress'],
      },
      {
        name: 'toAddress',
        type: FieldType.NestedText,
        keys: ['fullAddress'],
      },
    ],
    identifierKey: 'id',
    addActions: true,
    editUrlName: 'inventory.shipments.edit',
    showUrlName: 'inventory.shipments.show',
    deleteMutation: deleteShipmentMutation,
    addEdit: true,
    addShow: true,
    addDelete: true,
    addPagination: true,
    urlQueryParams: getUrlQueryParams(orderId, source),
  };
};


export const showConfigConstructor = (t, id): ShowConfig => ({
  cols: 1,
  subscription: shipmentSubscription,
  subscriptionKey: 'shipment',
  subscriptionVariables: { pk: id },
  addBack: true,
  backUrl: { name: 'inventory.shipments.list' },
  addEdit: true,
  editUrl: { name: 'inventory.shipments.edit', params: { id: id } },
  addDelete: true,
  deleteMutation: deleteShipmentMutation,
  fields: [
    {
      name: 'status',
      type: FieldType.Badge,
      label: t('sales.orders.labels.status.title'),
      showLabel: true,
      badgeMap: getShipmentStatusBadgeMap(t),
    },
    {
      name: 'fromAddress',
      type: FieldType.NestedText,
      label: t('inventory.shipments.labels.fromAddress'),
      keys: ['fullAddress'],
      showLabel: true,
    },
    {
      name: 'toAddress',
      type: FieldType.NestedText,
      label: t('inventory.shipments.labels.toAddress'),
      keys: ['fullAddress'],
      showLabel: true,
    },
    {
      name: 'order',
      type: FieldType.NestedText,
      label: t('sales.orders.title'),
      keys: ['reference'],
      showLabel: true,
      clickable: true,
      clickUrl: { name: 'sales.orders.show' },
      clickIdentifiers: [{ id: ['id'] }],
    },
  ],
});

export const listingQueryKey = 'shipments';
export const listingQuery = shipmentsQuery;

export const updateShipmentStatus = async (apolloClient, shipmentId: string, status: string) => {
  try {
    const formData = {
      id: shipmentId,
      status: status,
    };

    const { data } = await apolloClient.mutate({
      mutation: updateShipmentMutation,
      variables: { data: formData },
    });

    return !!(data && data.updateShipment);
  } catch (error) {
    console.error("Error updating shipment status:", error);
    return false;
  }
};
