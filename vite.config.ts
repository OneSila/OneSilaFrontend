import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Vql from 'vite-plugin-vue-gql';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), Vql()],
});
