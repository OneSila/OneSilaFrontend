export const routes = [
  { path: '/companies', name: 'contacts.companies.list', component: () => import('./companies/companies-list/CompaniesListController.vue') },
  { path: '/companies/show/:id', name: 'contacts.companies.show', component: () => import('./companies/companies-show/CompaniesShowController.vue') },
]
