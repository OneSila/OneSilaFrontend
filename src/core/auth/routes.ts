export const routes = [
  { path: '/auth/login', name: 'auth.login', component: () => import('./login/LoginController.vue') },
  { path: '/auth/profile', name: 'auth.profile', component: () => import('./profile/ProfileController.vue') },
]
