import { Plugin } from 'vue';
import { createI18n } from 'vue-i18n';

import locale from '../../locale';

export default {
  install(app) {
    const i18n = createI18n({
      locale: import.meta.env.VITE_APP_LOCALE || 'en',
      fallbackLocale: 'en',
      allowComposition: true,
      globalInjection: true,
      messages: locale as any,
    });

    app.use(i18n);
  },
} as Plugin;
