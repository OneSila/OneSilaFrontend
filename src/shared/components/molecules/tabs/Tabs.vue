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
  <Card class="tabs">
    <slot name="above-tabs" />

    <Flex v-if="!hideContent" gap="4" vertical>
      <FlexCell>
        <Flex
          gap="2"
          :between="isWiderThan(screen, 376)"
          :vertical="!isWiderThan(screen, 376)"
        >
          <FlexCell>
            <Flex gap="2" :vertical="!isWiderThan(screen, 320)" wrap>
              <FlexCell
                v-for="tab in tabs"
                :key="tab.key"
                :grow="!isWiderThan(screen, 320)"
              >
                <TertiaryButton
                  class="mb-2 px-3"
                  :style="{ color: isHighlighted(tab) ? 'white !important' : '' }"
                  :class="{
                    'w-full': !isWiderThan(screen, 320),
                    'bg-red-500': isHighlighted(tab),
                  }"
                  :inverse="isSelected(tab.key)"
                  :disabled="isDisabled(tab.key)"
                  @click="$emit('tab-selected', tab.key)"
                  >{{ tab.label }}</TertiaryButton
                >
              </FlexCell>
            </Flex>
          </FlexCell>

          <FlexCell>
            <slot name="right-corner" />
          </FlexCell>
        </Flex>
      </FlexCell>

      <FlexCell>
        <slot :name="selected" />
      </FlexCell>
    </Flex>
  </Card>
</template>
