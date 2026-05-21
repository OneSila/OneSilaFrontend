export const routes = [
    {
        path: '/settings/price-lists',
        alias: '/sales/price-lists',
        name: 'sales.priceLists.list',
        meta: { title: 'sales.priceLists.title' },
        component: () => import('./price-lists/price-lists-list/PriceListsListController.vue')
    },
    {
        path: '/settings/price-lists/create',
        alias: '/sales/price-lists/create',
        name: 'sales.priceLists.create',
        meta: { title: 'sales.priceLists.create.title' },
        component: () => import('./price-lists/price-list-create/PriceListCreateController.vue')
    },
    {
        path: '/settings/price-lists/show/:id',
        alias: '/sales/price-lists/show/:id',
        name: 'sales.priceLists.show',
        meta: { title: 'sales.priceLists.show.title' },
        component: () => import('./price-lists/price-list-show/PriceListShowController.vue')
    },
    {
        path: '/settings/price-lists/edit/:id',
        alias: '/sales/price-lists/edit/:id',
        name: 'sales.priceLists.edit',
        meta: { title: 'sales.priceLists.edit.title' },
        component: () => import('./price-lists/price-list-edit/PriceListEditController.vue')
    },

    {
        path: '/settings/price-lists/:priceListId/item/create',
        alias: '/sales/price-lists/:priceListId/item/create',
        name: 'sales.priceLists.items.create',
        meta: { title: 'sales.priceLists.items.create.title' },
        component: () => import('./price-lists/price-list-show/containers/items/item-create/ItemCreateController.vue')
    },
    {
        path: '/settings/price-lists/:priceListId/item/edit/:id',
        alias: '/sales/price-lists/:priceListId/item/edit/:id',
        name: 'sales.priceLists.items.edit',
        meta: { title: 'sales.priceLists.items.edit.title' },
        component: () => import('./price-lists/price-list-show/containers/items/item-edit/ItemEditController.vue')
    },

]
