import { Plugin } from 'vue';
import { buildRouter } from '../modules/router';

export default {
  async install(app) {
    app.use(await buildRouter());
  },
} as Plugin;
