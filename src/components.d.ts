import { Flex, FlexCell } from './shared/components/layouts/flex';

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    Flex: typeof Flex;
    FlexCell: typeof FlexCell;
  }
}

export {};
