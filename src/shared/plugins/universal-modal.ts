import { Plugin } from 'vue';
import 'vue-universal-modal/dist/index.css';
import VueUniversalModal from 'vue-universal-modal';

export default {
  install(app) {
    app.use(VueUniversalModal, {
      teleportTarget: '#modals',
      modalComponent: 'UniversalModal',
    });
  },
} as Plugin;
