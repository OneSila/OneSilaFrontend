<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Popover } from '../../../../atoms/popover';
import { Icon } from '../../../../atoms/icon';
import { InspectorProgressField } from '../../showConfig';
import { InspectorStatus } from '../../../../../utils/constants';

const props = defineProps<{
  field: InspectorProgressField;
  modelValue: {
    percentage: number;
    inspectorStatus: number;
    blocks: { code: string | number; completed: boolean }[];
  } | null;
}>();

const { t } = useI18n();

const isMobile = ref(false);
const container = ref<HTMLElement | null>(null);
const highlightRow = () => {
  const row = container.value?.closest('tr');
  row?.classList.add('bg-indigo-50');
};
const unhighlightRow = () => {
  const row = container.value?.closest('tr');
  row?.classList.remove('bg-indigo-50');
};
const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  updateIsMobile();
  window.addEventListener('resize', updateIsMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile);
});

const label = computed(() => {
  if (!props.modelValue) return '';
  return props.modelValue.percentage < 100
    ? t('shared.labels.processing')
    : t('shared.labels.completed');
});

const labelColor = computed(() => {
  if (!props.modelValue) return '';
  switch (props.modelValue.inspectorStatus) {
    case InspectorStatus.GREEN:
      return 'text-green-600';
    case InspectorStatus.ORANGE:
      return 'text-orange-600';
    case InspectorStatus.RED:
      return 'text-red-600';
    default:
      return '';
  }
});

const barColor = computed(() => {
  if (!props.modelValue) return '';
  switch (props.modelValue.inspectorStatus) {
    case InspectorStatus.GREEN:
      return 'bg-green-500';
    case InspectorStatus.ORANGE:
      return 'bg-orange-500';
    case InspectorStatus.RED:
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
});

const visibleBlocks = computed(() => {
  if (!props.modelValue) {
    return [];
  }
  const blocks = props.modelValue.blocks || [];
  if (props.modelValue.inspectorStatus === InspectorStatus.GREEN) {
    return blocks;
  }
  return blocks.filter((block) => !block.completed);
});
</script>

<template>
  <div ref="container" :class="field.customCssClass" :style="field.customCss">
    <Popover position="bottom" :hover="!isMobile" @hidden="unhighlightRow">
      <template #trigger>
        <div @mouseover="highlightRow" @click="highlightRow">
          <div class="w-20 mb-1">
            <span :class="[labelColor, 'text-sm', 'font-medium', 'block sm:hidden']">
              {{ Math.floor(modelValue?.percentage ?? 0) }}%
            </span>
          </div>
          <div class="hidden sm:block w-full bg-gray-200 rounded-full dark:bg-gray-700">
            <div
              :class="[barColor, 'text-xs', 'font-medium', 'text-white', 'text-center', 'p-0.5', 'leading-none', 'rounded-full']"
              :style="{ width: (modelValue?.percentage ?? 0) + '%' }"
            >
              <span>{{ Math.floor(modelValue?.percentage ?? 0) }}%</span>
            </div>
          </div>
        </div>
      </template>
      <div class="bg-white p-4 rounded shadow-md text-left">
        <ul v-if="visibleBlocks.length > 0">
          <li
            v-for="block in visibleBlocks"
            :key="block.code"
            class="flex items-center gap-2 py-2 z-50 hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
          >
            <Icon :name="block.completed ? 'circle-check' : 'circle-xmark'" size="sm"
                  :class="block.completed ? 'text-green-600' : 'text-red-600'" />
            <span>{{ t(`dashboard.cards.products.inspector.${block.code}.title`) }}</span>
          </li>
        </ul>
      </div>
    </Popover>
  </div>
</template>
