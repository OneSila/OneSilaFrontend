import { Flex, FlexCell } from './shared/components/layouts/flex';
import { Grid, GridCell } from './shared/components/layouts/grid';

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    Flex: typeof Flex;
    FlexCell: typeof FlexCell;
    Grid: typeof Grid;
    GridCell: typeof GridCell;
  }
}

export {};
