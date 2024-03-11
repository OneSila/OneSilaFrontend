export const routes = [
  { path: '/sales/customers', name: 'sales.customers.list', component: () => import('./customers/customers-list/CustomersListController.vue') },
  { path: '/sales/customers/create', name: 'sales.customers.create', component: () => import('./customers/customer-create/CustomerCreateController.vue') },
  { path: '/sales/customers/edit/:id', name: 'sales.customers.edit', component: () => import('./customers/customer-edit/CustomerEditController.vue') },
  { path: '/sales/customers/show/:id', name: 'sales.customers.show', component: () => import('./customers/customer-show/CustomerShowController.vue') },

  { path: '/sales/orders', name: 'sales.orders.list', component: () => import('./orders/orders-list/OrdersListController.vue') },
  { path: '/sales/orders/create', name: 'sales.orders.create', component: () => import('./orders/order-create/OrderCreateController.vue') },
  { path: '/sales/orders/show/:id', name: 'sales.orders.show', component: () => import('./orders/order-show/OrderShowController.vue') },
  { path: '/sales/orders/edit/:id', name: 'sales.orders.edit', component: () => import('./orders/order-edit/OrderEditController.vue') },
    
  { path: '/sales/orders/:orderId/item/create', name: 'sales.orders.items.create', component: () => import('./orders/order-show/containers/items/item-create/ItemCreateController.vue') },
  { path: '/sales/orders/:orderId/item/edit/:id', name: 'sales.orders.items.edit', component: () => import('./orders/order-show/containers/items/item-edit/ItemEditController.vue') },

  { path: '/sales/orders/:orderId/note/create', name: 'sales.orders.notes.create', component: () => import('./orders/order-show/containers/notes/note-create/NoteCreateController.vue') },
  { path: '/sales/orders/:orderId/note/edit/:id', name: 'sales.orders.notes.edit', component: () => import('./orders/order-show/containers/notes/note-edit/NoteEditController.vue') },

  { path: '/sales/price-lists', name: 'sales.priceLists.list', component: () => import('./price-lists/price-lists-list/PriceListsListController.vue') },
  { path: '/sales/price-lists/create', name: 'sales.priceLists.create', component: () => import('./price-lists/price-list-create/PriceListCreateController.vue') },
  { path: '/sales/price-lists/show/:id', name: 'sales.priceLists.show', component: () => import('./price-lists/price-list-show/PriceListShowController.vue') },
  { path: '/sales/price-lists/edit/:id', name: 'sales.priceLists.edit', component: () => import('./price-lists/price-list-edit/PriceListEditController.vue') },

  { path: '/sales/price-lists/:priceListId/item/create', name: 'sales.priceLists.items.create', component: () => import('./price-lists/price-list-show/containers/items/item-create/ItemCreateController.vue') },
  { path: '/sales/price-lists/:priceListId/item/edit/:id', name: 'sales.priceLists.items.edit', component: () => import('./price-lists/price-list-show/containers/items/item-edit/ItemEditController.vue') },

]
