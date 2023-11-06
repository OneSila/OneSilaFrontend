<script setup lang="ts">
import { injectScreen, isWiderThan } from '../../../../shared/modules/screen';

import { Card } from '../../atoms/card';

import { TertiaryButton } from '../tertiary-button';

const props = withDefaults(
  defineProps<{
    tabs: any[];
    disabledTabs?: string[];
    selected: string;
    hideContent?: boolean;
  }>(),
  { disabledTabs: [] as any },
);

const screen = injectScreen();

const isSelected = (tab: string) => tab === props.selected;

const isHighlighted = (tab: any) => {
  return !isSelected(tab.key) && tab.danger
};
const isDisabled = (tab: string) => props.disabledTabs.includes(tab);
</script>

<template>
</template>
