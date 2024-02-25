import { createApp,  provide, h } from 'vue';
import { DefaultApolloClient } from '@vue/apollo-composable'
import App from './App.vue';
import apolloClient from '../apollo-client';
import plugins from './shared/plugins';
import { createPinia } from 'pinia';
import './shared/theme/default/index.css';
import appSetting from './app-setting';
import PerfectScrollbar from 'vue3-perfect-scrollbar';
import { reactive } from 'vue';
import { AuthKey, detectAuth } from "./shared/modules/auth";
import VueApolloComponents from '@vue/apollo-components'
import { createApolloProvider } from "@vue/apollo-option";

const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
})

const app = createApp({
  render: () => h(App),
})

app.use(plugins);
app.use(apolloProvider)
app.use(VueApolloComponents)

const auth = reactive(detectAuth());
app.provide(AuthKey, auth);

app.use(PerfectScrollbar);

const pinia = createPinia();
app.use(pinia);

appSetting.init();

app.mount('#app');
