import { Plugin } from 'vue'
import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'

import { getRouter } from '../modules/router'

export default {
  install(app) {
    const dsn = import.meta.env.VITE_APP_SENTRY_DSN || ''

    if (!dsn) {
      return
    }

    Sentry.init({
      app,
      dsn,
      environment: import.meta.env.VITE_APP_SENTRY_ENV || 'development',
      integrations: [
        new BrowserTracing({
          routingInstrumentation: Sentry.vueRouterInstrumentation(getRouter()),
          tracingOrigins: ["localhost", /^\//],
        }),
      ],
      // Since volume isn't a concern in this application, we'll start
      // by capturing 100% of all transactions for better context.
      tracesSampleRate: 1.0,
    });
  }
} as Plugin
