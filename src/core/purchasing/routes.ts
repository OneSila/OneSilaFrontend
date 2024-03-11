export const routes = [
  { path: '/purchasing/suppliers', name: 'purchasing.suppliers.list', component: () => import('./suppliers/suppliers-list/SuppliersListController.vue') },
  { path: '/purchasing/suppliers/create', name: 'purchasing.suppliers.create', component: () => import('./suppliers/supplier-create/SupplierCreateController.vue') },
  { path: '/purchasing/suppliers/edit/:id', name: 'purchasing.suppliers.edit', component: () => import('./suppliers/supplier-edit/SupplierEditController.vue') },
  { path: '/purchasing/suppliers/show/:id', name: 'purchasing.suppliers.show', component: () => import('./suppliers/supplier-show/SupplierShowController.vue') },

  { path: '/purchasing/products', name: 'purchasing.products.list', component: () => import('./products/products-list/ProductsListController.vue') },
  { path: '/purchasing/products/create', name: 'purchasing.product.create', component: () => import('./products/product-create/ProductCreateController.vue') },
  { path: '/purchasing/products/edit/:id', name: 'purchasing.product.edit', component: () => import('./products/product-edit/ProductEditController.vue') },

  { path: '/purchasing/orders', name: 'purchasing.orders.list', component: () => import('./orders/orders-list/OrdersListController.vue') },
  { path: '/purchasing/orders/create', name: 'purchasing.orders.create', component: () => import('./orders/order-create/OrderCreateController.vue') },
  { path: '/purchasing/orders/edit/:id', name: 'purchasing.orders.edit', component: () => import('./orders/order-edit/OrderEditController.vue') },
  { path: '/purchasing/orders/show/:id', name: 'purchasing.orders.show', component: () => import('./orders/order-show/OrderShowController.vue') },

  { path: '/purchasing/orders/:orderId/item/create', name: 'purchasing.orders.items.create', component: () => import('./orders/order-show/containers/item-create/ItemCreateController.vue') },
  { path: '/purchasing/orders/:orderId/item/edit/:id', name: 'purchasing.orders.items.edit', component: () => import('./orders/order-show/containers/item-edit/ItemEditController.vue') },

]
