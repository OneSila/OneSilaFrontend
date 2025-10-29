export const routes = [
    {
        path: '/settings/currencies',
        name: 'settings.currencies.list',
        meta: { title: 'settings.title' },
        component: () => import('./currencies/currencies-list/CurrenciesListController.vue')
    },
    {
        path: '/settings/currency/create',
        name: 'settings.currency.create',
        meta: { title: 'settings.title' },
        component: () => import('./currencies/currency-create/CurrencyCreateController.vue')
    },
    {
        path: '/settings/currency/edit/:id',
        name: 'settings.currency.edit',
        meta: { title: 'settings.title' },
        component: () => import('./currencies/currency-edit/CurrencyEditController.vue')
    },

    {
        path: '/settings/vat-rates',
        name: 'settings.vatRates.list',
        meta: { title: 'settings.title' },
        component: () => import('./vat-rates/vat-rates-list/VatRatesListController.vue')
    },
    {
        path: '/settings/vat-rate/create',
        name: 'settings.vatRate.create',
        meta: { title: 'settings.title' },
        component: () => import('./vat-rates/vat-rate-create/VatRateCreateController.vue')
    },
    {
        path: '/settings/vat-rate/edit/:id',
        name: 'settings.vatRate.edit',
        meta: { title: 'settings.title' },
        component: () => import('./vat-rates/vat-rate-edit/VatRateEditController.vue')
    },

    {
        path: '/settings/brand-identity',
        name: 'settings.brandIdentity.list',
        meta: { title: 'settings.title' },
        component: () => import('./brand-identity/brand-custom-prompts-list/BrandCustomPromptsListController.vue')
    },
    {
        path: '/settings/brand-identity/create',
        name: 'settings.brandIdentity.create',
        meta: { title: 'settings.title' },
        component: () => import('./brand-identity/brand-custom-prompt-create/BrandCustomPromptCreateController.vue')
    },
    {
        path: '/settings/brand-identity/edit/:id',
        name: 'settings.brandIdentity.edit',
        meta: { title: 'settings.title' },
        component: () => import('./brand-identity/brand-custom-prompt-edit/BrandCustomPromptEditController.vue')
    },

    {
        path: '/settings/chat-gpt-product-feed',
        name: 'settings.chatGptProductFeedConfig',
        meta: { title: 'settings.title' },
        component: () => import('./chat-gpt-product-feed/ChatGptProductFeedConfigController.vue')
    },

    // {
    //     path: '/settings/units',
    //     name: 'settings.units.list',
    //     meta: { title: 'settings.title' },
    //     component: () => import('./units/units-list/UnitListController.vue')
    // },
    // {
    //     path: '/settings/unit/edit/:id',
    //     name: 'settings.unit.edit',
    //     meta: { title: 'settings.title' },
    //     component: () => import('./units/unit-edit/UnitEditController.vue')
    // },
    // {
    //     path: '/settings/unit/create',
    //     name: 'settings.unit.create',
    //     component: () => import('./units/unit-create/UnitCreateController.vue')
    // },
    //
    // {
    //     path: '/settings/internal-companies',
    //     name: 'settings.internalCompanies.list',
    //     component: () => import('./internal-companies/companies-list/CompaniesListController.vue')
    // },
    // {
    //     path: '/settings/internal-company/create',
    //     name: 'settings.internalCompany.create',
    //     component: () => import('./internal-companies/companies-create/CompaniesCreateController.vue')
    // },
    // {
    //     path: '/settings/internal-company/edit/:id',
    //     name: 'settings.internalCompany.edit',
    //     component: () => import('./internal-companies/companies-edit/CompaniesEditController.vue')
    // },
    // {
    //     path: '/settings/internal-company/show/:id',
    //     name: 'settings.internalCompany.show',
    //     component: () => import('./internal-companies/companies-show/CompaniesShowController.vue')
    // },
    // {
    //     path: '/settings/internal-company/:companyId/address/create',
    //     name: 'settings.companies.address.create',
    //     component: () => import('./internal-companies/companies-show/containers/address-create/CompaniesAddressCreateController.vue')
    // },
    // {
    //     path: '/settings/internal-company/:companyId/address/edit/:id',
    //     name: 'settings.companies.address.edit',
    //     component: () => import('./internal-companies/companies-show/containers/address-edit/CompaniesAddressEditController.vue')
    // },

    {
        path: '/settings/demo-data',
        name: 'settings.demoData.show',
        meta: { title: 'settings.title' },
        component: () => import('./demo-data/demo-data-show/DemoDataController.vue')
    },
]
