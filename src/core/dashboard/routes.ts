export const routes = [
  { path: '', name: 'dashboard', component: () => import('./dashboard/DashboardController.vue') },
  { path: '/onboarding', name: 'dashboard.onboarding', component: () => import('./onboarding/OnboardingController.vue') },
]
