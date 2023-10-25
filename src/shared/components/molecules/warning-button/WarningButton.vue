<script setup lang="ts">
import { Button } from "../../atoms/button"

withDefaults(
  defineProps<{ color?: string; hoverColor?: string }>(),
  { color: 'yellow-500', hoverColor: 'yellow-600' }
)
</script>

<template>
  <Button class="warning-button border-2 rounded-md py-1" :class="{ [`border-${color} text-${color} hover:border-${hoverColor} hover:text-${hoverColor}`]: true }">
    <slot />
  </Button>
</template>
