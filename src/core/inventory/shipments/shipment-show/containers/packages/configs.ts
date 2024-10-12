import {FieldType, PackageStatus, PackageType} from '../../../../../../shared/utils/constants';
import {ListingConfig} from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import {SearchConfig} from "../../../../../../shared/components/organisms/general-search/searchConfig";
import {getItemPickingLocation, getPackageQuery, packagesQuery} from "../../../../../../shared/api/queries/inventory.js";
import {
  createInventoryMovementMutation,
  createPackageMutation,
  deletePackageMutation,
  updatePackageMutation
} from "../../../../../../shared/api/mutations/inventory.js";
import {ShowConfig} from "../../../../../../shared/components/organisms/general-show/showConfig";
import {FormConfig, FormField, FormType} from "../../../../../../shared/components/organisms/general-form/formConfig";
import {packageSubscription} from "../../../../../../shared/api/subscriptions/inventory.js";

export const getPackageTypeOptions = (t) => [
  { name: t('inventory.packages.type.box'), code: PackageType.BOX },
  { name: t('inventory.packages.type.pallet'), code: PackageType.PALLET },
];

export const getPackageTypeBadgeMap = (t) => ({
  [PackageType.BOX]: { text: t('inventory.packages.type.box'), color: 'blue' },
  [PackageType.PALLET]: { text: t('inventory.packages.type.pallet'), color: 'green' },
});

export const getPackageStatusOptions = (t) => [
  { name: t('inventory.packages.status.new'), code: PackageStatus.NEW },
  { name: t('inventory.packages.status.inProgress'), code: PackageStatus.IN_PROGRESS },
  { name: t('inventory.packages.status.packed'), code: PackageStatus.PACKED },
  { name: t('inventory.packages.status.dispatched'), code: PackageStatus.DISPATCHED },
];

export const getPackageStatusBadgeMap = (t) => ({
  [PackageStatus.NEW]: { text: t('inventory.packages.status.new'), color: 'gray' },
  [PackageStatus.IN_PROGRESS]: { text: t('inventory.packages.status.inProgress'), color: 'yellow' },
  [PackageStatus.PACKED]: { text: t('inventory.packages.status.packed'), color: 'blue' },
  [PackageStatus.DISPATCHED]: { text: t('inventory.packages.status.dispatched'), color: 'green' },
});

export const editFormConfigConstructor = (
  t: Function,
  packageId: string,
  shipmentId: string,
): FormConfig => {
  const fields: FormField[] = [
    {
      type: FieldType.Hidden,
      name: 'id',
      value: packageId,
    },
    {
      type: FieldType.Choice,
      name: 'type',
      label: t('inventory.packages.labels.type'),
      options: getPackageTypeOptions(t),
      labelBy: 'name',
      valueBy: 'code',
      disabled: true
    },
    {
      type: FieldType.Choice,
      name: 'status',
      label: t('shared.labels.status'),
      options: getPackageStatusOptions(t),
      labelBy: 'name',
      valueBy: 'code',
    },
    {
      type: FieldType.Text,
      name: 'trackingCode',
      label: t('inventory.packages.labels.trackingCode'),
      placeholder: t('inventory.packages.placeholders.trackingCode'),
    },
    {
      type: FieldType.Website,
      name: 'trackingLink',
      label: t('inventory.packages.labels.trackingLink'),
      placeholder: t('inventory.packages.placeholders.trackingLink'),
      optional: true
    },
    {
      type: FieldType.IndividualFile,
      name: 'shippingLabel',
      label: t('inventory.packages.labels.shippingLabel'),
      optional: true
    },
    {
      type: FieldType.IndividualFile,
      name: 'customsDocument',
      label: t('inventory.packages.labels.customsDocument'),
      optional: true
    },
  ];

  return {
    cols: 1,
    type: FormType.EDIT,
    mutation: updatePackageMutation,
    mutationKey: 'updatePackage',
    query: getPackageQuery,
    queryVariables: { id: packageId },
    queryDataKey: 'package',
    fields: fields,
    submitUrl: { name: 'inventory.shipments.show', params: { id: shipmentId }, query: {tab: 'packages'}  },
  };
};

export const createFormConfigConstructor = (
  t: Function,
  shipmentId: string,
  isVirtual: boolean = false
): FormConfig => {
  const fields: FormField[] = [
    {
      type: FieldType.Hidden,
      name: 'shipment',
      value: { id: shipmentId },
    },
    {
      type: FieldType.Choice,
      name: 'type',
      label: t('inventory.packages.labels.type'),
      options: getPackageTypeOptions(t),
      labelBy: 'name',
      valueBy: 'code',
      disabled: isVirtual,
    },
    {
      type: FieldType.Text,
      name: 'trackingCode',
      label: t('inventory.packages.labels.trackingCode'),
      placeholder: t('inventory.packages.placeholders.trackingCode'),
    },
    {
      type: FieldType.Website,
      name: 'trackingLink',
      label: t('inventory.packages.labels.trackingLink'),
      placeholder: t('inventory.packages.placeholders.trackingLink'),
      optional: true,
    },
    {
      type: FieldType.IndividualFile,
      name: 'shippingLabel',
      label: t('inventory.packages.labels.shippingLabel'),
      optional: true,
    },
    {
      type: FieldType.IndividualFile,
      name: 'customsDocument',
      label: t('inventory.packages.labels.customsDocument'),
      optional: true,
    }
  ];

  if (isVirtual) {
    fields.splice(2, 0, {
      type: FieldType.Choice,
      name: 'status',
      label: t('shared.labels.status'),
      options: getPackageStatusOptions(t),
      labelBy: 'name',
      valueBy: 'code',
      disabled: true,
    });
  }

  return {
    cols: 1,
    mutation: createPackageMutation,
    type: FormType.CREATE,
    mutationKey: 'createPackage',
    submitUrl: { name: 'inventory.shipments.show', params: { id: shipmentId }, query: {tab: 'packages'}  },
    fields,
  };
};




export const listingConfigConstructor = (t: Function, shipmentId: string): ListingConfig => ({
  headers: [t('inventory.packages.labels.trackingCode'), t('products.products.labels.type.title'), t('shared.labels.status')],
  fields: [
    {
      name: 'trackingCode',
      type: FieldType.Text,
    },
    {
      name: 'type',
      type: FieldType.Badge,
      badgeMap: getPackageTypeBadgeMap(t),
    },
    {
      name: 'status',
      type: FieldType.Badge,
      badgeMap: getPackageStatusBadgeMap(t),
    },
  ],
  identifierKey: 'id',
  editUrlName: 'inventory.packages.edit',
  showUrlName: 'inventory.packages.show',
  identifierVariables: { shipmentId: shipmentId },
  addActions: true,
  addEdit: true,
  addShow: true,
  addDelete: true,
  deleteMutation: deletePackageMutation,
  addPagination: false,
});

export const searchConfigConstructor = (): SearchConfig => ({
  search: true,
  filters: [],
  orders: [],
});

export const showConfigConstructor = (t, id, shipmentId): ShowConfig => ({
  cols: 1,
  subscription: packageSubscription,
  subscriptionKey: 'package',
  subscriptionVariables: { pk: id },
  addBack: true,
  backUrl: { name: 'inventory.shipments.show', params: { id: shipmentId } },
  addEdit: true,
  editUrl: { name: 'inventory.packages.edit', params: { shipmentId: shipmentId, id: id } },
  addDelete: true,
  deleteMutation: deletePackageMutation,
  fields: [
    {
      name: 'status',
      type: FieldType.Badge,
      label: t('inventory.packages.labels.status'),
      showLabel: true,
      badgeMap: getPackageStatusBadgeMap(t),
    },
    {
      name: 'type',
      type: FieldType.Badge,
      label: t('inventory.packages.labels.type'),
      showLabel: true,
      badgeMap: getPackageTypeBadgeMap(t),
    },
    {
      name: 'trackingCode',
      type: FieldType.Text,
      label: t('inventory.packages.labels.trackingCode'),
      showLabel: true,
    },
    {
      name: 'trackingLink',
      type: FieldType.Website,
      label: t('inventory.packages.labels.trackingLink'),
      showLabel: true,
    },
    {
      type: FieldType.IndividualFile,
      name: 'shippingLabel',
      label: t('inventory.packages.labels.shippingLabel'),
      showLabel: true,
    },
    {
      type: FieldType.IndividualFile,
      name: 'customsDocument',
      label: t('inventory.packages.labels.customsDocument'),
      showLabel: true,
    },
  ],
});


export const listingQueryKey = 'packages';
export const listingQuery = packagesQuery;

export const createInventoryMovement = async (apolloClient, item: any, packageId: string) => {
  try {
    const submitData = {
      product: { id: item.product.id },
      quantity: parseFloat(item.quantity),
      movementFromId: item.inventorylocation.id,
      movementToId: packageId,
    };

    const { data } = await apolloClient.mutate({
      mutation: createInventoryMovementMutation,
      variables: {
        data: submitData,
      },
    });

    return !!(data && data.createInventoryMovement);
  } catch (error) {
    return false;
  }
};

export const createPackage = async (apolloClient, form: any) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: createPackageMutation,
      variables: {
        data: form,
      },
    });

    // Return the package ID if the package was created successfully
    return data && data.createPackage ? data.createPackage.id : null;
  } catch (error) {
    return null; // Return null in case of error
  }
};

// Method to fetch picking locations based on the item to ship
export const getItemPickingLocations = async (apolloClient, currentItemId) => {

  const { data } = await apolloClient.query({
    query: getItemPickingLocation,
    variables: {
      itemToShipId: currentItemId,
    },
  });

  return data && data.pickingLocations ? data.pickingLocations : [];

};

export interface Item {
  id: string;
  product: {
    id: string;
    name: string;
  };
  inventorylocation: {
    id: string,
    name: string,
  },
  quantity: number;
}

export interface PickingLocation {
  location: {
    id: string;
    name: string;
  },
  quantity: number;
}

export interface Package {
  id: string;
  form: {
    shipment: { id: string };
    type: string;
    status: string;
    trackingCode: string;
    trackingLink: string;
    shippingLabel: null | File;
    customsDocument: null | File;
  };
  items: Item[],
  config: FormConfig;
  isOpen?: boolean
}

export interface StepType {
  item: Item | null;
  availableLocation: PickingLocation | null;
  type: 'prepare' | 'move' | 'collect' | 'confirm';
}