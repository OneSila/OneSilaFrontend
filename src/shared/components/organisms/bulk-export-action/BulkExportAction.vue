<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Icon } from '../../atoms/icon';
import { Toast } from '../../../modules/toast';
import { SELECTED_EXPORT_LIMIT } from '../../../../core/imports_exports/exports/selectedExportConfig';

const props = defineProps<{
  kind: string;
  selectedEntities: string[];
}>();

const { t } = useI18n();
const router = useRouter();

const selectedIds = computed(() => {
  const seen = new Set<string>();

  return props.selectedEntities.filter((id) => {
    if (!id || seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });
});

const exportSelection = async () => {
  if (!selectedIds.value.length) {
    return;
  }

  if (selectedIds.value.length > SELECTED_EXPORT_LIMIT) {
    Toast.error(t('importsExports.exports.alerts.selectedLimitExceeded', { count: SELECTED_EXPORT_LIMIT }));
    return;
  }

  await router.push({
    name: 'importsExports.exports.create',
    query: {
      kind: props.kind,
      ids: selectedIds.value.join(','),
    },
  });
};
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center rounded bg-cyan-50 px-4 py-1 text-sm font-semibold text-cyan-800 shadow-sm ring-1 ring-inset ring-cyan-300 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
    :disabled="!selectedIds.length"
    @click="exportSelection"
  >
    <Icon name="download" size="sm" class="mr-2 text-cyan-600" />
    {{ t('shared.button.export') }}
  </button>
</template>
