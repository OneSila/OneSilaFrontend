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
  if (props.modelValue.percentage < 100) return 'text-yellow-500';
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
  if (props.modelValue.percentage < 100) return 'bg-yellow-400';
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
</script>

<template>
  <div :class="field.customCssClass" :style="field.customCss">
    <Popover position="bottom" :hover="!isMobile">
      <template #trigger>
        <div>
          <div class="flex justify-between mb-1">
            <span :class="['text-base', 'font-medium', labelColor, 'hidden sm:block']">
              {{ label }}
            </span>
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
      <div class="bg-white p-2 rounded shadow-md text-left">
        <ul>
          <li v-for="block in modelValue?.blocks" :key="block.code" class="flex items-center gap-2 py-1">
            <Icon :name="block.completed ? 'circle-check' : 'circle-xmark'" size="sm"
                  :class="block.completed ? 'text-green-600' : 'text-red-600'" />
            <span>{{ t(`dashboard.cards.products.inspector.${block.code}.title`) }}</span>
          </li>
        </ul>
      </div>
    </Popover>
  </div>
</template>
