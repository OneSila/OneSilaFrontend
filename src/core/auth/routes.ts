export const routes = [
    {
        path: '/auth/login',
        name: 'auth.login',
        meta: { title: 'auth.login.header' },
        component: () => import('./login/LoginController.vue')
    },
    {
        path: '/auth/register',
        name: 'auth.register',
        meta: { title: 'auth.register.header' },
        component: () => import('./register/RegisterController.vue')
    },
    {
        path: '/auth/register/company',
        name: 'auth.register.company',
        meta: { title: 'auth.register.company.button.createCompany' },
        component: () => import('./register/RegisterController.vue')
    },
    {
        path: '/auth/recover',
        name: 'auth.recover',
        meta: { title: 'auth.recover.header' },
        component: () => import('./recover/RecoverController.vue')
    },
    {
        path: '/auth/recover/:token',
        name: 'auth.recover.token',
        meta: { title: 'auth.recover.header' },
        component: () => import('./login-token/LoginTokenController.vue')
    },
    {
        path: '/auth/register/accept-invite/:token',
        name: 'auth.accept.invite.token',
        meta: { title: 'auth.register.header' },
        component: () => import('./login-token/LoginTokenAcceptInvitationController.vue')
    }
]
