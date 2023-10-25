<script setup lang="ts">
import { injectScreen, isMobile, isWiderThan } from '../../../modules/screen'

defineProps<{ completed?: boolean; current?: boolean; count?: number; last?: boolean }>()

const screen = injectScreen()
</script>

<template>
  <Flex class="wizard-step-button cursor-pointer" gap="4" :vertical="isMobile(screen)">
    <FlexCell>
      <div
        class="rounded-full h-10 w-10 text-lg flex items-center justify-center"
        :class="{
          'bg-green-500 text-white': completed,
          'bg-blue-500 text-white': current,
          'bg-white text-blue-500': !completed && !current,
          'mx-auto': isMobile(screen)
        }"
      >
        {{ count || 1 }}
      </div>
    </FlexCell>

    <FlexCell
      class="text-xl pt-1 text-center"
      :class="{
        'text-green-500': completed,
        'text-blue-500': current,
      }"
    ><slot /></FlexCell>

    <FlexCell class="flex items-center" v-if="!last && isWiderThan(screen, 1079)">
      <div style="height: 3px" class="w-16" :class="{ 'bg-green-500': completed, 'bg-gray-300': !completed }"></div>
    </FlexCell>
  </Flex>
</template>
