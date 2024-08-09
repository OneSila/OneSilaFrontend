export const routes = [
  {
    path: '/inventory/inventory-locations',
    name: 'inventory.inventoryLocations.list',
    component: () => import('./inventory-location/inventory-locations-list/InventoryLocationsListController.vue')
  },
  {
    path: '/inventory/inventory-locations/create',
    name: 'inventory.inventoryLocations.create',
    component: () => import('./inventory-location/inventory-location-create/InventoryLocationCreateController.vue')
  },
  {
    path: '/inventory/inventory-locations/edit/:id',
    name: 'inventory.inventoryLocations.edit',
    component: () => import('./inventory-location/inventory-location-edit/InventoryLocationEditController.vue')
  },
  {
    path: '/inventory/inventory',
    name: 'inventory.inventory.list',
    component: () => import('./inventory/inventory-list/InventoryListController.vue')
  },
  {
    path: '/inventory/inventory/create',
    name: 'inventory.inventory.create',
    component: () => import('./inventory/inventory-create/InventoryCreateController.vue')
  },
  {
    path: '/inventory/inventory/edit/:id',
    name: 'inventory.inventory.edit',
    component: () => import('./inventory/inventory-edit/InventoryEditController.vue')
  },
  {
    path: '/inventory/inventory/show/:id',
    name: 'inventory.inventory.show',
    component: () => import('./inventory/inventory-show/InventoryShowController.vue')
  },
  {
    path: '/inventory/lead-time-settings',
    name: 'inventory.leadTimeSettings.list',
    component: () => import('./leadtimes-settings/leadtime-settings-list/LeadTimeSettingsLocationsListController.vue')
  },
  {
    path: '/inventory/lead-time-settings/create',
    name: 'inventory.leadTimeSettings.create',
    component: () => import('./leadtimes-settings/leadtime-settings-create/LeadTimeSettingsCreateController.vue')
  },
  {
    path: '/inventory/lead-time-settings/edit/:id',
    name: 'inventory.leadTimeSettings.edit',
    component: () => import('./leadtimes-settings/leadtime-settings-edit/LeadTimeSettingsLocationEditController.vue')
  },
];
