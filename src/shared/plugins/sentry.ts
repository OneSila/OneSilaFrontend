import { Plugin } from 'vue'
import * as Sentry from '@sentry/vue';
import { getDefaultIntegrations } from '@sentry/browser';
import { getRouter } from "../modules/router";
export default {
  install(app) {
    const dsn = import.meta.env.VITE_APP_SENTRY_DSN || ''

    if (!dsn) {
      return
    }

    const router = getRouter();
    const apiGraphqlUrl = import.meta.env.VITE_APP_API_GRAPHQL_URL;

    const integrations = getDefaultIntegrations({}).filter(defaultIntegration => {
      return !['BrowserApiErrors', 'TryCatch', 'Breadcrumbs', 'GlobalHandlers'].includes(
        defaultIntegration.name
      );
    });

    integrations.push(Sentry.replayIntegration())
    integrations.push(Sentry.browserTracingIntegration({router}))

    Sentry.init({
      app,
      dsn,
      environment: import.meta.env.VITE_APP_SENTRY_ENV || 'development',
      integrations: integrations,
      tracesSampleRate: 1.0,
      tracePropagationTargets: ['localhost', new RegExp(apiGraphqlUrl)],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
} as Plugin
