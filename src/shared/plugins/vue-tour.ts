import { Plugin } from 'vue'
import Vue3Tour from 'vue3-tour'
import 'vue3-tour/dist/vue3-tour.css'

export default {
  install(app) {
    app.use(Vue3Tour)
  }
} as Plugin
