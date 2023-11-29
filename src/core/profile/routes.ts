export const routes = [
  { path: '/profile', name: 'profile.user', component: () => import('./user/UserProfileController.vue') },
  { path: '/company/profile', name: 'profile.company', component: () => import('./company/CompanyProfile.vue') },
]
