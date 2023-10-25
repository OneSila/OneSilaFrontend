import * as VueRouter from 'vue-router';

import { routes as authRoutes } from '../../../core/auth/routes';

import { detectAuth, isAuthenticated } from '../auth';
import { Toast } from '../toast';

let router: VueRouter.Router;

export function buildRouter() {
  router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes: [
      ...authRoutes
    ],
  });

  router.beforeEach((to, from, next) => {
    const auth = detectAuth();

    const routeName = (to.name as string) || '';


    if (routeName.includes('login') && isAuthenticated(auth)) {
      return next({ name: 'dashboard' });
    }

    if (!routeName.includes('login') && !isAuthenticated(auth)) {
      return next({ name: 'auth.login' });
    }

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
