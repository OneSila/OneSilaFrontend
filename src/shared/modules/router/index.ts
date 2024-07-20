import * as VueRouter from 'vue-router';

import { routes as dashboardRoutes } from '../../../core/dashboard/routes';
import { routes as authRoutes } from '../../../core/auth/routes';
import { routes as profileRoutes } from '../../../core/profile/routes';
import { routes as contactsRoutes } from '../../../core/contacts/routes';
import { routes as salesRoutes } from '../../../core/sales/routes';
import { routes as purchasingRoutes } from '../../../core/purchasing/routes';
import { routes as inventoryRoutes } from '../../../core/inventory/routes';
import { routes as productsRoutes } from '../../../core/products/routes';
import { routes as settingsRoutes } from '../../../core/settings/routes';
import { routes as mediaRoutes } from '../../../core/media/routes';
import { routes as propertiesRoutes } from '../../../core/properties/routes';
import { PUBLIC_ROUTES } from '../../utils/constants'
import {detectAuth, isAuthenticated, hasCompany, isActive, removeAuth, isFinishedOnboarding, getOnboardingStatus} from '../auth';
import { Toast } from '../toast';
import { useAppStore } from '../../plugins/store';

let router: VueRouter.Router;

export function buildRouter() {
  router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes: [
      ...authRoutes,
      ...profileRoutes,
      ...contactsRoutes,
      ...salesRoutes,
      ...purchasingRoutes,
      ...inventoryRoutes,
      ...productsRoutes,
      ...settingsRoutes,
      ...mediaRoutes,
      ...propertiesRoutes,
      ...dashboardRoutes,
    ],
  });

router.beforeEach((to, from, next) => {
  const auth = detectAuth();
  const routeName = (to.name as string) || '';

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
