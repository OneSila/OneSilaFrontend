<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';

const props = defineProps<{
  progress: number;
  label: string;
  labelColor: string;
  barColor: string;
}>();

const displayedProgress = ref(props.progress);

let timer: number | undefined = undefined;

const updateProgress = () => {
  const diff = props.progress - displayedProgress.value;
  if (diff <= 2) {
    displayedProgress.value = props.progress;
    clearInterval(timer);
    timer = undefined;
    return;
  }
  const increment = diff / 10;
  displayedProgress.value = Math.min(displayedProgress.value + increment, props.progress);
};

watch(
  () => props.progress,
  (newProgress) => {
    if (newProgress > displayedProgress.value && !timer) {
      timer = setInterval(updateProgress, 100) as unknown as number;
    } else if (newProgress < displayedProgress.value) {
      displayedProgress.value = newProgress;
      if (timer) {
        clearInterval(timer);
        timer = undefined;
      }
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<template>
  <div>
    <div class="flex justify-between mb-1">
      <span :class="['text-base', 'font-medium', labelColor, 'hidden sm:block']">
        {{ label }}
      </span>

      <span :class="[labelColor, 'text-sm', 'font-medium', 'block sm:hidden']">
        {{ Math.floor(displayedProgress) }}%
      </span>
    </div>

    <div class="hidden sm:block w-full bg-gray-200 rounded-full dark:bg-gray-700">
      <div
        :class="[barColor, 'text-xs', 'font-medium', 'text-white', 'text-center', 'p-0.5', 'leading-none', 'rounded-full']"
        :style="{ width: displayedProgress + '%' }"
      >
        <span>{{ Math.floor(displayedProgress) }}%</span>
      </div>
    </div>
  </div>
</template>
