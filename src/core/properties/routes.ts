export const routes = [
  {
    path: '/properties/property-select-values',
    name: 'properties.values.list',
    component: () => import('./property-select-values/property-select-values-list/PropertySelectValuesListController.vue')
  },
  {
    path: '/properties/property-select-values/create',
    name: 'properties.values.create',
    component: () => import('./property-select-values/property-select-values-create/PropertySelectValuesCreateController.vue')
  },
  {
    path: '/properties/property-select-values/edit/:id',
    name: 'properties.values.edit',
    component: () => import('./property-select-values/property-select-values-edit/PropertySelectValuesEditController.vue')
  },

  {
    path: '/properties/properties',
    name: 'properties.properties.list',
    component: () => import('./properties/properties-list/PropertiesListController.vue')
  },
  {
    path: '/properties/properties/create',
    name: 'properties.properties.create',
    component: () => import('./properties/properties-create/PropertiesCreateController.vue')
  },
  {
    path: '/properties/properties/edit/:id',
    name: 'properties.properties.edit',
    component: () => import('./properties/properties-edit/PropertiesEditController.vue')
  },
  // {
  //   path: '/inventory/inventory/show/:id',
  //   name: 'inventory.inventory.show',
  //   component: () => import('./inventory/inventory-show/InventoryShowController.vue')
  // },
];
