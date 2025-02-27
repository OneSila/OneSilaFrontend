export const routes = [
    {
        path: '/profile',
        name: 'profile.user',
        meta: { title: 'profile.dropdown.profile'},
        component: () => import('./user/UserProfileController.vue')
    },
    {
        path: '/company/profile',
        name: 'profile.company',
        meta: { title: 'profile.dropdown.company'},
        component: () => import('./company/CompanyProfileController.vue')
    },
]
