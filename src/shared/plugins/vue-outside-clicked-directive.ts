import type { App, Plugin } from 'vue';

import vueClickOutsideElement from 'vue-click-outside-element';

export default {
  install(app: App) {
    app.use(vueClickOutsideElement);
  },
} as Plugin;
