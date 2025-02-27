export const routes = [
  {
    path: '/properties/properties',
    name: 'properties.properties.list',
    meta: { title: 'properties.title' },
    component: () => import('./properties/properties-list/PropertiesListController.vue')
  },
  {
    path: '/properties/properties/create',
    name: 'properties.properties.create',
    meta: { title: 'properties.properties.create.title' },
    component: () => import('./properties/properties-create/PropertiesCreateController.vue')
  },
  {
    path: '/properties/properties/edit/:id',
    name: 'properties.properties.edit',
    meta: { title: 'properties.properties.edit.title' },
    component: () => import('./properties/properties-edit/PropertiesEditController.vue')
  },
  {
    path: '/properties/properties/show/:id',
    name: 'properties.properties.show',
    meta: { title: 'properties.properties.show.title' },
    component: () => import('./properties/properties-show/PropertiesShowController.vue')
  },
  {
    path: '/properties/property-select-values',
    name: 'properties.values.list',
    meta: { title: 'properties.values.title' },
    component: () => import('./property-select-values/property-select-values-list/PropertySelectValuesListController.vue')
  },
  {
    path: '/properties/property-select-values/create',
    name: 'properties.values.create',
    meta: { title: 'properties.values.create.title' },
    component: () => import('./property-select-values/property-select-values-create/PropertySelectValuesCreateController.vue')
  },
  {
    path: '/properties/property-select-values/edit/:id',
    name: 'properties.values.edit',
    meta: { title: 'properties.values.edit.title' },
    component: () => import('./property-select-values/property-select-values-edit/PropertySelectValuesEditController.vue')
  },
  {
    path: '/properties/property-select-values/show/:id',
    name: 'properties.values.show',
    meta: { title: 'properties.values.show.title' },
    component: () => import('./property-select-values/property-select-values-show/PropertySelectValuesShowController.vue')
  },
  {
    path: '/properties/product-properties-rule',
    name: 'properties.rule.list',
    meta: { title: 'properties.rule.title' },
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
    meta: { title: 'properties.rule.edit.title' },
    component: () => import('./product-properties-rule/product-properties-rule-edit/ProductPropertiesRuleEditController.vue')
  },
  {
    path: '/properties/product-properties-rule/show/:id',
    name: 'properties.rule.show',
    meta: { title: 'properties.rule.show.title' },
    component: () => import('./product-properties-rule/product-properties-rule-show/ProductPropertiesRuleShowController.vue')
  },
];
