export const routes = [
  { path: '/settings/currencies', name: 'settings.currencies.list', component: () => import('./currencies/currencies-list/CurrenciesListController.vue') },
  { path: '/settings/currency/create', name: 'settings.currency.create', component: () => import('./currencies/currency-create/CurrencyCreateController.vue') },
  { path: '/settings/currency/edit/:id', name: 'settings.currency.edit', component: () => import('./currencies/currency-edit/CurrencyEditController.vue') },
    
  { path: '/settings/vatRates', name: 'settings.vatRates.list', component: () => import('./vat-rates/vat-rates-list/VatRatesListController.vue') },
  { path: '/settings/vatRate/create', name: 'settings.vatRate.create', component: () => import('./vat-rates/vat-rate-create/VatRateCreateController.vue') },
  { path: '/settings/vatRate/edit/:id', name: 'settings.vatRate.edit', component: () => import('./vat-rates/vat-rate-edit/VatRateEditController.vue') },

  { path: '/settings/units', name: 'settings.units.list', component: () => import('./units/units-list/UnitListController.vue') },
  // { path: '/settings/unit/create', name: 'settings.unit.create', component: () => import('./units/unit-create/UnitCreateController.vue') },
  { path: '/settings/unit/edit/:id', name: 'settings.unit.edit', component: () => import('./units/unit-edit/UnitEditController.vue') },
]
