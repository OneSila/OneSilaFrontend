export const routes = [
  { path: '/companies', name: 'contacts.companies.list', component: () => import('./companies/companies-list/CompaniesListController.vue') },
  { path: '/companies/create', name: 'contacts.companies.create', component: () => import('./companies/companies-create/CompaniesCreateController.vue') },
  { path: '/companies/edit/:id', name: 'contacts.companies.edit', component: () => import('./companies/companies-edit/CompaniesEditController.vue') },
  { path: '/companies/show/:id', name: 'contacts.companies.show', component: () => import('./companies/companies-show/CompaniesShowController.vue') },
  { path: '/companies/:companyId/address/create', name: 'contacts.companies.address.create', component: () => import('./companies/companies-show/containers/address-create/CompaniesAddressCreateController.vue') },
  { path: '/companies/:companyId/address/edit/:id', name: 'contacts.companies.address.edit', component: () => import('./companies/companies-show/containers/address-edit/CompaniesAddressEditController.vue') },

  { path: '/people', name: 'contacts.people.list', component: () => import('./people/people-list/PeopleListController.vue') },
  { path: '/people/create', name: 'contacts.people.create', component: () => import('./people/person-create/PeopleCreateController.vue') },
  { path: '/people/edit/:id', name: 'contacts.people.edit', component: () => import('./people/person-edit/PeopleEditController.vue') },
  { path: '/people/show/:id', name: 'contacts.people.show', component: () => import('./people/person-show/PersonShowController.vue') },
]
