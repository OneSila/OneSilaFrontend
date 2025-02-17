export const routes = [
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
  {
    path: '/properties/properties/show/:id',
    name: 'properties.properties.show',
    component: () => import('./properties/properties-show/PropertiesShowController.vue')
  },
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
    path: '/properties/property-select-values/show/:id',
    name: 'properties.values.show',
    component: () => import('./property-select-values/property-select-values-show/PropertySelectValuesShowController.vue')
  },
  {
    path: '/properties/product-properties-rule',
    name: 'properties.rule.list',
    component: () => import('./product-properties-rule/product-properties-rule-list/ProductPropertiesRuleListController.vue')
  },
  // {
  //   path: '/properties/product-properties-rule/create',
  //   name: 'properties.rule.create',
  //   component: () => import('./product-properties-rule/product-properties-rule-create/ProductPropertiesRuleCreateController.vue')
  // },
  {
    path: '/properties/product-properties-rule/edit/:id',
    name: 'properties.rule.edit',
    component: () => import('./product-properties-rule/product-properties-rule-edit/ProductPropertiesRuleEditController.vue')
  },
  {
    path: '/properties/product-properties-rule/show/:id',
    name: 'properties.rule.show',
    component: () => import('./product-properties-rule/product-properties-rule-show/ProductPropertiesRuleShowController.vue')
  },
];
