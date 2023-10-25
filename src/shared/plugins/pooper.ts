import { App, Plugin } from 'vue';
import Popper from 'vue3-popper';

export default {
  install(app: App) {
    app.component('Popper', Popper);
  },
} as Plugin;
