export const routes = [
  {
    path: '/warehouse/inventory-locations',
    name: 'inventory.inventoryLocations.list',
    component: () => import('./inventory-location/inventory-locations-list/InventoryLocationsListController.vue')
  },
  {
    path: '/warehouse/inventory-locations/create',
    name: 'inventory.inventoryLocations.create',
    component: () => import('./inventory-location/inventory-location-create/InventoryLocationCreateController.vue')
  },
  {
    path: '/warehouse/inventory-locations/edit/:id',
    name: 'inventory.inventoryLocations.edit',
    component: () => import('./inventory-location/inventory-location-edit/InventoryLocationEditController.vue')
  },
  {
    path: '/warehouse/inventory',
    name: 'inventory.inventory.list',
    component: () => import('./inventory/inventory-list/InventoryListController.vue')
  },
  {
    path: '/warehouse/inventory/create',
    name: 'inventory.inventory.create',
    component: () => import('./inventory/inventory-create/InventoryCreateController.vue')
  },
  // {
  //   path: '/warehouse/inventory/edit/:id',
  //   name: 'inventory.inventory.edit',
  //   component: () => import('./warehouse/inventory-edit/InventoryEditController.vue')
  // },
  {
    path: '/warehouse/inventory/show/:id',
    name: 'inventory.inventory.show',
    component: () => import('./inventory/inventory-show/InventoryShowController.vue')
  },
  {
    path: '/warehouse/lead-time-settings',
    name: 'inventory.leadTimeSettings.list',
    component: () => import('./leadtimes-settings/leadtime-settings-list/LeadTimeSettingsLocationsListController.vue')
  },
  {
    path: '/warehouse/lead-time-settings/create',
    name: 'inventory.leadTimeSettings.create',
    component: () => import('./leadtimes-settings/leadtime-settings-create/LeadTimeSettingsCreateController.vue')
  },
  {
    path: '/warehouse/lead-time-settings/edit/:id',
    name: 'inventory.leadTimeSettings.edit',
    component: () => import('./leadtimes-settings/leadtime-settings-edit/LeadTimeSettingsLocationEditController.vue')
  },

  {
    path: '/warehouse/shipments',
    name: 'inventory.shipments.list',
    component: () => import('./shipments/shipments-list/ShipmentsListController.vue'),
  },
  {
    path: '/warehouse/shipments/create',
    name: 'inventory.shipments.create',
    component: () => import('./shipments/shipment-create/ShipmentCreateController.vue'),
  },
  {
    path: '/warehouse/shipments/show/:id',
    name: 'inventory.shipments.show',
    component: () => import('./shipments/shipment-show/ShipmentShowController.vue'),
  },
  {
    path: '/warehouse/shipments/edit/:id',
    name: 'inventory.shipments.edit',
    component: () => import('./shipments/shipment-edit/ShipmentEditController.vue'),
  },
  {
    path: '/warehouse/shipments/:shipmentId/package/create',
    name: 'inventory.packages.create',
    component: () => import('./shipments/shipment-show/containers/packages/package-create/PackageCreateController.vue'),
  },
  {
    path: '/warehouse/shipments/:shipmentId/package/edit/:id',
    name: 'inventory.packages.edit',
    component: () => import('./shipments/shipment-show/containers/packages/package-edit/PackageEditController.vue'),
  },
  {
    path: '/warehouse/shipments/:shipmentId/package/show/:id',
    name: 'inventory.packages.show',
    component: () => import('./shipments/shipment-show/containers/packages/package-show/PackageShowController.vue'),
  }

];
