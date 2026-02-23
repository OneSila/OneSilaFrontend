<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '../../../../../../../../../../shared/components/atoms/icon';

type CategoryId = string | number;

const props = defineProps<{
  modelValue: CategoryId[];
  categoryKind: 'required' | 'optional';
  errorMessage?: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: CategoryId[]): void;
}>();

const { t } = useI18n();
const localValue = ref<CategoryId[]>([]);

watch(
  () => props.modelValue,
  (value) => {
    localValue.value = Array.isArray(value) ? [...value] : [];
  },
  { immediate: true, deep: true },
);

watch(
  localValue,
  (value) => {
    emit('update:modelValue', [...value]);
  },
  { deep: true },
);

const title = computed(() =>
  props.categoryKind === 'required'
    ? t('integrations.show.documentTypes.labels.requiredCategories')
    : t('integrations.show.documentTypes.labels.optionalCategories'),
);
</script>

<template>
  <div class="rounded-md border border-gray-200 bg-gray-100 p-4 text-sm text-gray-700">
    <p class="font-semibold text-gray-900">{{ title }}</p>
    <div v-if="props.errorMessage" class="text-danger text-small blink-animation mt-1">
      <Icon size="sm" name="exclamation-circle" />
      <span class="ml-1">{{ props.errorMessage }}</span>
    </div>
    <p class="mt-1">{{ t('integrations.show.documentTypes.toBeContinued') }}</p>
    <p class="mt-2 text-xs text-gray-500">
      {{ t('integrations.show.documentTypes.count', { count: localValue.length }) }}
    </p>
  </div>
</template>

<style scoped>
.blink-animation {
  animation: blinker 2s linear infinite;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}
</style>
