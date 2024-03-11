export const routes = [
  { path: '/settings/currencies', name: 'settings.currencies.list', component: () => import('./currencies/currencies-list/CurrenciesListController.vue') },
  { path: '/settings/currency/create', name: 'settings.currency.create', component: () => import('./currencies/currency-create/CurrencyCreateController.vue') },
  { path: '/settings/currency/edit/:id', name: 'settings.currency.edit', component: () => import('./currencies/currency-edit/CurrencyEditController.vue') },
    
  { path: '/settings/taxes', name: 'settings.taxes.list', component: () => import('./taxes/taxes-list/TaxesListController.vue') },
  { path: '/settings/tax/create', name: 'settings.tax.create', component: () => import('./taxes/tax-create/TaxCreateController.vue') },
  { path: '/settings/tax/edit/:id', name: 'settings.tax.edit', component: () => import('./taxes/tax-edit/TaxEditController.vue') },

  { path: '/settings/units', name: 'settings.units.list', component: () => import('./units/units-list/UnitListController.vue') },
  { path: '/settings/unit/create', name: 'settings.unit.create', component: () => import('./units/unit-create/UnitCreateController.vue') },
  { path: '/settings/unit/edit/:id', name: 'settings.unit.edit', component: () => import('./units/unit-edit/UnitEditController.vue') },
]
