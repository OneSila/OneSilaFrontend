<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  progress: number,
  isError?: boolean
}>();

const { t } = useI18n();

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
      // If the target decreases, update immediately.
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

const label = computed(() => {
  if (displayedProgress.value < 100) return t('shared.labels.processing');
  return props.isError ? t('shared.labels.failed') : t('shared.labels.completed');
});

const labelColor = computed(() => {
  if (displayedProgress.value < 100) return 'text-yellow-500';
  return props.isError ? 'text-red-600' : 'text-green-600';
});

const barColor = computed(() => {
  if (displayedProgress.value < 100) return 'bg-yellow-400';
  return props.isError ? 'bg-red-500' : 'bg-green-500';
});

</script>

<template>
  <div>
    <div class="flex justify-between mb-1">
      <!-- Label text (Processing / Completed) — hidden on small screens -->
      <span :class="['text-base', 'font-medium', labelColor, 'hidden sm:block']">
        {{ label }}
      </span>

      <!-- Percentage text only for small screens -->
      <span :class="[labelColor, 'text-sm', 'font-medium', 'block sm:hidden']">
        {{ Math.floor(displayedProgress) }}%
      </span>
    </div>

    <!-- Progress bar only on medium and up -->
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
