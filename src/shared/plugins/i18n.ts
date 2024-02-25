import { Plugin } from 'vue';
import { createI18n } from 'vue-i18n';
import { DEFAULT_LANGUAGE } from '../utils/constants'

import locale from '../../locale';

export default {
  install(app) {
    const i18n = createI18n({
      locale: import.meta.env.VITE_APP_LOCALE || DEFAULT_LANGUAGE.code,
      fallbackLocale: DEFAULT_LANGUAGE.code,
      legacy: false,
      allowComposition: true,
      globalInjection: true,
      fallbackWarn: false,
      missingWarn: false,
      messages: locale as any,
    });

    app.use(i18n);
  },
} as Plugin;
