import { Plugin } from 'vue';

import router from './router';
import i18n from './i18n';
import sentry from './sentry';
import graphql from './graphql';
import sharedComponents from './shared-components';
import fontAwesome from './font-awesome';
import pooper from './pooper';
import screen from './screen';
import universalModal from './universal-modal';
import vueOutsideClickedDirective from './vue-outside-clicked-directive';
import toast from './toast';

export default {
  install(app) {
    app.use(router);
    app.use(i18n);
    app.use(sentry);
    app.use(graphql);
    app.use(sharedComponents);
    app.use(fontAwesome);
    app.use(screen);
    app.use(universalModal);
    app.use(toast);
    app.use(vueOutsideClickedDirective);
    app.use(pooper);
  },
} as Plugin;
