export const routes = [
  { path: '/auth/login', name: 'auth.login', component: () => import('./login/LoginController.vue') },
  { path: '/auth/register', name: 'auth.register', component: () => import('./register/RegisterController.vue') },
  { path: '/auth/register/company', name: 'auth.register.company', component: () => import('./register/RegisterController.vue') },
  { path: '/auth/recover', name: 'auth.recover', component: () => import('./recover/RecoverController.vue') },
  { path: '/auth/recover/token/:token', name: 'auth.recover.token', component: () => import('./login-token/LoginTokenController.vue') },
  { path: '/auth/register/accept-invite/:token', name: 'auth.accept.invite.token', component: () => import('./login-token/LoginTokenAcceptInvitationController.vue') }
]
