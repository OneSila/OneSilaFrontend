import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    allowedHosts: ['dadded25ad6a.ngrok-free.app'],
  },
});
