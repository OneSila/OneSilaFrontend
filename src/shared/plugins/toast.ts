import { App, Plugin } from "vue"

import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"

export default {
  install(app: App) {
    app.use(Toast)
  }
} as Plugin
