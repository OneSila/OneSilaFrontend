import { createApp, provide, h } from 'vue';
import { DefaultApolloClient } from '@vue/apollo-composable'
import App from './App.vue';
import apolloClient from '../apollo-client';
import plugins from './shared/plugins';
import { createPinia } from 'pinia';
import './shared/theme/default/index.css';
import appSetting from './app-setting';
import PerfectScrollbar from 'vue3-perfect-scrollbar';

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient);
  },
  render: () => h(App),
});

app.use(plugins);

app.use(PerfectScrollbar);

const pinia = createPinia();
app.use(pinia);

appSetting.init();

app.mount('#app');
