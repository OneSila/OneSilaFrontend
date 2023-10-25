<script setup lang="ts">
import { Card } from '../../atoms/card'

defineProps<{ current: string }>()
</script>

<template>
  <Card class="wizard">
    <Flex gap="4" vertical>
      <FlexCell>
        <div
          class="p-4 rounded-lg"
          :class="{
            'bg-gray-100': !['processing', 'end', 'error'].includes(current),
            'bg-blue-100 h-16': current === 'processing',
            'bg-green-100 h-16': current === 'end',
            'bg-red-100 h-16': current === 'error',
          }"
        >
          <slot name="steps" />
        </div>
      </FlexCell>

      <FlexCell>
        <slot :name="current" />
      </FlexCell>
    </Flex>
  </Card>
</template>
