import { Plugin } from 'vue'
import { Flex, FlexCell } from "../components/layouts/flex";
import { Grid, GridCell } from "../components/layouts/grid";

export default {
  install(app) {
    app.component("Flex", Flex);
    app.component("FlexCell", FlexCell);

    app.component("Grid", Grid);
    app.component("GridCell", GridCell);
  }
} as Plugin
