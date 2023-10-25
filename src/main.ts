import { createApp } from 'vue';

import App from './App.vue';

import plugins from './shared/plugins';

import './shared/theme/default/index.css';

const app = createApp(App);
import appSetting from './app-setting';

app.use(plugins);

import { createPinia } from 'pinia';
const pinia = createPinia();
app.use(pinia);



appSetting.init();

app.mount('#app');
