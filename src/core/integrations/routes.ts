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
    path: '/integrations/:type/import/:integrationId',
    name: 'integrations.imports.create',
    meta: { title: 'integrations.imports.create.title' },
    component: () => import('./integrations/integrations-show/containers/imports/containers/create-import/ImportCreateController.vue'),
  }
];
