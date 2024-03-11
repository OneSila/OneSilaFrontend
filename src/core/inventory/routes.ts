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
];
