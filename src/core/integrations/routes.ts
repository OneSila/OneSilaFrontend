export const routes = [
  {
    path: '/integrations',
    name: 'integrations.integrations.list',
    meta: { title: 'integrations.title' },
    component: () => import('./integrations/integrations-list/IntegrationsListController.vue'),
  },

  {
    path: '/integrations/create',
    name: 'integrations.integrations.create',
    meta: { title: 'integrations.create.title' },
    component: () => import('./integrations/integrations-create/IntegrationCreateController.vue')
  },
  {
    path: '/integrations/:type/:id',
    name: 'integrations.integrations.show',
    meta: { title: 'integrations.show.title' },
    component: () => import('./integrations/integrations-show/IntegrationsShowController.vue'),
  },
  {
    path: '/integrations/:type/store/:id',
    name: 'integrations.stores.edit',
    meta: { title: 'integrations.show.stores.title' },
    component: () => import('./integrations/integrations-show/containers/stores/containers/IntegrationsStoreEditController.vue'),
  },
  {
    path: '/integrations/:type/language/:id',
    name: 'integrations.languages.edit',
    meta: { title: 'integrations.show.languages.title' },
    component: () => import('./integrations/integrations-show/containers/languages/containers/IntegrationsLanguageEditController.vue'),
  },
  {
    path: '/integrations/:type/currency/:id',
    name: 'integrations.currencies.edit',
    meta: { title: 'integrations.show.currencies.title' },
    component: () => import('./integrations/integrations-show/containers/currencies/containers/IntegrationsCurrencyEditController.vue'),
  },
  {
    path: '/integrations/:type/price-list/:integrationId/create',
    name: 'integrations.priceLists.create',
    meta: { title: 'sales.priceLists.create.title' },
    component: () => import('./integrations/integrations-show/containers/price-lists/containers/IntegrationsPriceListCreateController.vue'),
  },
  {
    path: '/integrations/:type/product-type/:id',
    name: 'integrations.remoteProductTypes.edit',
    meta: { title: 'integrations.show.productRules.title' },
    component: () => import('./integrations/integrations-show/containers/rules/IntegrationsRemoteProductTypeEditController.vue'),
  },
  {
    path: '/integrations/:type/property/:id',
    name: 'integrations.remoteProperties.edit',
    meta: { title: 'integrations.show.properties.title' },
    component: () => import('./integrations/integrations-show/containers/properties/containers/remote-properties/IntegrationsRemotePropertyEditController.vue'),
  },
  {
    path: '/integrations/:type/internal-property/:id',
    name: 'integrations.remoteInternalProperties.edit',
    meta: { title: 'integrations.show.ebay.internalProperties.title' },
    component: () => import('./integrations/integrations-show/containers/properties/containers/remote-internal-properties/IntegrationsRemoteInternalPropertyEditController.vue'),
  },
  {
    path: '/integrations/:type/property-value/:id',
    name: 'integrations.remotePropertySelectValues.edit',
    meta: { title: 'integrations.show.propertySelectValues.title' },
    component: () => import('./integrations/integrations-show/containers/property-select-values/containers/remote-property-select-values/IntegrationsRemotePropertySelectValueEditController.vue'),
  },
  {
    path: '/integrations/:type/amazon-default-unit-configurator/:id',
    name: 'integrations.amazonDefaultUnitConfigurators.edit',
    meta: { title: 'integrations.show.sections.defaultUnits' },
    component: () => import('./integrations/integrations-show/containers/default-unit-configurators/containers/amazon-unit-configurators/containers/IntegrationsAmazonDefaultUnitConfiguratorEditController.vue'),
  },
  {
    path: '/integrations/:type/import/:integrationId',
    name: 'integrations.imports.create',
    meta: { title: 'integrations.imports.create.title' },
    component: () => import('./integrations/integrations-show/containers/imports/containers/create-import/ImportCreateController.vue'),
  },
  {
    path: '/integrations/:type/import-process/:id',
    name: 'integrations.imports.show',
    meta: { title: 'integrations.imports.show.title' },
    component: () => import('./integrations/integrations-show/containers/imports/containers/import-show/ImportShowController.vue'),
  },
  {
    path: '/integrations/:type/amazon-issues/:issueId',
    name: 'integrations.amazonProductIssues.show',
    meta: { title: 'integrations.show.amazonIssues.show.title' },
    component: () => import('./integrations/integrations-show/containers/issues/containers/AmazonProductIssueShowController.vue'),
  },
  // temporary commented since we no longer to oAuth
  // {
  //   path: '/integrations/shopify/installed',
  //   name: 'integrations.shopify.installed',
  //   meta: { title: 'integrations.shopify.installed.title' },
  //   component: () => import('./integrations/integrations-installed/shopify-installed/ShopifyInstalledController.vue'),
  // },
  // {
  //   path: '/integrations/shopify/entry',
  //   name: 'integrations.shopify.entry',
  //   meta: { title: 'integrations.shopify.entry.title' },
  //   component: () => import('./integrations/integrations-shopify-entry/ShopifyEntryController.vue'),
  // },
  {
    path: '/integrations/amazon/installed',
    name: 'integrations.amazon.installed',
    meta: { title: 'integrations.amazon.installed.title' },
    component: () => import('./integrations/integrations-installed/amazon-installed/AmazonInstalledController.vue'),
  },
  {
    path: '/integrations/ebay/installed',
    name: 'integrations.ebay.installed',
    meta: { title: 'integrations.ebay.installed.title' },
    component: () => import('./integrations/integrations-installed/ebay-installed/EbayInstalledController.vue'),
  },
  {
    path: '/integrations/shein/installed',
    name: 'integrations.shein.installed',
    meta: { title: 'integrations.shein.installed.title' },
    component: () => import('./integrations/integrations-installed/shein-installed/SheinInstalledController.vue'),
  }

];
