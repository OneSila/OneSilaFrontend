<script setup lang="ts">
const props = defineProps<{ source: any; cover?: boolean; alt?: string; }>()

const emit = defineEmits<{
  (e: 'loaded', size: { width: number; height: number; }): void
}>()

const classMap = {
  'w-full': props.cover,
  'h-full': props.cover,
}

const onLoaded = (event) => {
  emit('loaded', { width: event.target.offsetWidth, height: event.target.offsetHeight })
}
</script>

<template>
  <img :src="source" :class="classMap" :alt="alt" @load="onLoaded" />
</template>
