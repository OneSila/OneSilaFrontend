import { Plugin } from 'vue'
import { Flex, FlexCell } from "../components/layouts/flex";

export default {
  install(app) {
    app.component("Flex", Flex);
    app.component("FlexCell", FlexCell);

  }
} as Plugin
