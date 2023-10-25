import { Plugin } from 'vue'
import { reactive } from "vue"

import { detectScreen, ScreenKey } from "../modules/screen"

export default {
  install(app) {
    const screen = reactive(detectScreen())

    app.provide(ScreenKey, screen)

    window.addEventListener('resize', () => {
      const updatedScreen = detectScreen()
      
      screen.height = updatedScreen.height
      screen.width = updatedScreen.width
    })
  }
} as Plugin
