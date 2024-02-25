export const routes = [
  { path: '/companies', name: 'companies.list', component: () => import('./companies/companies-list/CompaniesListController.vue') },
  { path: '/companies/create', name: 'companies.create', component: () => import('./companies/companies-create/CompaniesCreateController.vue') },
  { path: '/companies/edit/:id', name: 'companies.edit', component: () => import('./companies/companies-edit/CompaniesEditController.vue') },
  { path: '/companies/show/:id', name: 'companies.show', component: () => import('./companies/companies-show/CompaniesShowController.vue') },
  { path: '/companies/:companyId/address/create', name: 'companies.address.create', component: () => import('./companies/companies-show/containers/address-create/CompaniesAddressCreateController.vue') },
  { path: '/companies/:companyId/address/edit/:id', name: 'companies.address.edit', component: () => import('./companies/companies-show/containers/address-edit/CompaniesAddressEditController.vue') },

  { path: '/people', name: 'people.list', component: () => import('./people/people-list/PeopleListController.vue') },
  { path: '/people/create', name: 'people.create', component: () => import('./people/person-create/PeopleCreateController.vue') },
  { path: '/people/edit/:id', name: 'people.edit', component: () => import('./people/person-edit/PeopleEditController.vue') },
  { path: '/people/show/:id', name: 'people.show', component: () => import('./people/person-show/PeopleShowController.vue') },
]
