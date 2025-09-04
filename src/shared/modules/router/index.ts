import * as VueRouter from 'vue-router';

const routeModules = [
  () => import('../../../core/dashboard/routes'),
  () => import('../../../core/auth/routes'),
  () => import('../../../core/profile/routes'),
  () => import('../../../core/contacts/routes'),
  () => import('../../../core/sales/routes'),
  () => import('../../../core/inventory/routes'),
  () => import('../../../core/products/routes'),
  () => import('../../../core/integrations/routes'),
  () => import('../../../core/settings/routes'),
  () => import('../../../core/media/routes'),
  () => import('../../../core/properties/routes'),
];
import { PUBLIC_ROUTES } from '../../utils/constants'
import {detectAuth, isAuthenticated, hasCompany, isActive, removeAuth, isFinishedOnboarding, getOnboardingStatus, setPageLoader} from '../auth';
import { Toast } from '../toast';
import { useAppStore } from '../../plugins/store';

let router: VueRouter.Router;

export async function buildRouter() {
  const [
    { routes: dashboardRoutes },
    { routes: authRoutes },
    { routes: profileRoutes },
    { routes: contactsRoutes },
    { routes: salesRoutes },
    { routes: inventoryRoutes },
    { routes: productsRoutes },
    { routes: integrationsRoutes },
    { routes: settingsRoutes },
    { routes: mediaRoutes },
    { routes: propertiesRoutes },
  ] = await Promise.all(routeModules.map((load) => load()));

  router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes: [
      ...authRoutes,
      ...profileRoutes,
      ...salesRoutes,
      ...productsRoutes,
      ...integrationsRoutes,
      ...settingsRoutes,
      ...mediaRoutes,
      ...propertiesRoutes,
      ...dashboardRoutes,
    ],
  });

router.beforeEach((to, from, next) => {
  const auth = detectAuth();
  const routeName = (to.name as string) || '';

  if (routeName == 'integrations.shopify.entry' || routeName == 'integrations.shopify.installed') {
      return next();
  }

  // Set page loader to true if navigating to an authenticated route
  if (isAuthenticated(auth) && hasCompany(auth) && isActive(auth)) {
    setPageLoader(auth, true);
  }

  // Authenticated but does not have a company
  if (isAuthenticated(auth) && !hasCompany(auth)) {
    if (routeName === 'auth.register.company') {
      return next();
    }
    return next({ name: 'auth.register.company' });
  }

  // Authenticated but not active => didn't accepted the invitation
  if (isAuthenticated(auth) && !isActive(auth)) {
    if (routeName === 'auth.accept.invite.token') {
      return next();
    }
    // we don't have the token to redirect too so if you are authenticated but not active we will just logout and go back to login
    removeAuth(auth);
    return next({ name: 'auth.login' });
  }

  // Authenticated and trying to access a public page
  if (PUBLIC_ROUTES.includes(routeName) && isAuthenticated(auth) && hasCompany(auth) && isActive(auth)) {
    if (isFinishedOnboarding(auth)) {
      return next({ name: 'dashboard' });
    } else {
      return next({ name: 'dashboard.onboarding' });
    }
  }

  // Not authenticated and trying to access a non-public page
  if (!PUBLIC_ROUTES.includes(routeName) && !isAuthenticated(auth)) {
    return next({ name: 'auth.login' });
  }

  // If authenticated but not finished onboarding, redirect to onboarding unless already on onboarding page
  if (isAuthenticated(auth) && !isFinishedOnboarding(auth) && !PUBLIC_ROUTES.includes(routeName) && routeName !== 'dashboard.onboarding') {
    return next({ name: 'dashboard.onboarding' });
  }

  if (routeName === 'dashboard.onboarding' && isFinishedOnboarding(auth)) {
    return next({ name: 'dashboard' });
  }

  // make sure we refresh filters each click
  const appStore = useAppStore();
  appStore.resetSearchConfig();

  // All other cases
  return next();
});

  router.onError((error) => {
    const regexes = [
      /loading chunk \d* failed./i,
      /Loading.*chunk.*failed./i,
      /ChunkLoadError:.*failed./i,
    ];

    for (const regex of regexes) {
      if (regex.test(error.message)) {
        Toast.warning('New updates! Reloading...');
        window.location.reload();
        break;
      }
    }
  });

  return router;
}

export function getRouter() {
  if (!router) {
    throw new Error('Please instantiate the router first!');
  }

  return router;
}

export function navigateBack(
  router: VueRouter.Router,
  defaultPath?: VueRouter.RouteLocationRaw,
) {
  if (router.options.history.state.back) {
    return router.back();
  }

  return router.replace(defaultPath || '/');
}
