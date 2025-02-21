export const routes = [

  { path: '/sales/orders', name: 'sales.orders.list', component: () => import('./orders/orders-list/OrdersListController.vue') },
  { path: '/sales/orders/show/:id', name: 'sales.orders.show', component: () => import('./orders/order-show/OrderShowController.vue') },

  { path: '/sales/price-lists', name: 'sales.priceLists.list', component: () => import('./price-lists/price-lists-list/PriceListsListController.vue') },
  { path: '/sales/price-lists/create', name: 'sales.priceLists.create', component: () => import('./price-lists/price-list-create/PriceListCreateController.vue') },
  { path: '/sales/price-lists/show/:id', name: 'sales.priceLists.show', component: () => import('./price-lists/price-list-show/PriceListShowController.vue') },
  { path: '/sales/price-lists/edit/:id', name: 'sales.priceLists.edit', component: () => import('./price-lists/price-list-edit/PriceListEditController.vue') },

  { path: '/sales/price-lists/:priceListId/item/create', name: 'sales.priceLists.items.create', component: () => import('./price-lists/price-list-show/containers/items/item-create/ItemCreateController.vue') },
  { path: '/sales/price-lists/:priceListId/item/edit/:id', name: 'sales.priceLists.items.edit', component: () => import('./price-lists/price-list-show/containers/items/item-edit/ItemEditController.vue') },

]
