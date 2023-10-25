<script setup lang="ts">
import { ref, computed } from 'vue'

import { Button } from '../button'
import { Icon } from '../icon'

const props = defineProps<{ withoutStyles?: boolean; disabled?: boolean; openedFirst?: boolean }>()

const opened = ref(!!props.openedFirst)

const defaultClasses = computed(() => {
  return {
  "bg-gray-100": !props.withoutStyles,
  "rounded-xl": !props.withoutStyles,
  "px-3": !props.withoutStyles,
 }})
</script>

<template>
  <Flex class="accordion" :class="defaultClasses" vertical>
    <FlexCell middle>
      <Button class="w-full py-3 text-left" @click="!disabled && (opened = !opened)">
        <Flex gap="2" between>
          <FlexCell class="w-full">
            <slot name="panel" />
          </FlexCell>

          <FlexCell center>
            <Icon :style="{ opacity: disabled ? 0.5 : 1 }" name="angle-down" />
          </FlexCell>
        </Flex>
      </Button>
    </FlexCell>

    <FlexCell class="border-t-2 py-3" v-if="opened">
      <slot name="content" />
    </FlexCell>
  </Flex>
</template>
