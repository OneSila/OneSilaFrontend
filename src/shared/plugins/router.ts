import { Plugin } from 'vue';
import { buildRouter } from '../modules/router';

export default {
  install(app) {
    app.use(buildRouter());
  },
} as Plugin;
