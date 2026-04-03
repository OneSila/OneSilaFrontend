<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Loader } from '../../../../shared/components/atoms/loader';
import { getSelectedExportPreviewConfig } from '../selectedExportConfig';

const props = defineProps<{
  kind: string;
  ids: string[];
}>();

const { t } = useI18n();

const previewConfig = computed(() => getSelectedExportPreviewConfig(props.kind));

const getItems = (data: any) => {
  if (!previewConfig.value) {
    return [];
  }

  return data?.[previewConfig.value.queryKey]?.edges || [];
};
</script>

<template>
  <div v-if="previewConfig && ids.length" class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
    <div class="mb-4">
      <h3 class="text-base font-semibold text-slate-900">
        {{ t('importsExports.exports.selected.title', { count: ids.length }) }}
      </h3>
      <p class="mt-1 text-sm text-slate-500">
        {{ t('importsExports.exports.selected.subtitle') }}
      </p>
    </div>

    <ApolloQuery
      :query="previewConfig.query"
      fetch-policy="cache-and-network"
      :variables="{ first: ids.length, filter: previewConfig.getFilter(ids) }"
    >
      <template #default="{ result: { loading, error, data } }">
        <Loader :loading="loading" />

        <div v-if="error" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ t('importsExports.exports.selected.loadError') }}
        </div>

        <div
          v-else-if="getItems(data).length"
          class="max-h-72 space-y-2 overflow-auto rounded-xl border border-slate-200 bg-white p-3"
        >
          <div
            v-for="edge in getItems(data)"
            :key="edge.node.id"
            class="flex items-start justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-slate-900">
                {{ previewConfig.getLabel(edge.node) }}
              </p>
              <p v-if="previewConfig.getMeta?.(edge.node)" class="truncate text-xs text-slate-500">
                {{ previewConfig.getMeta?.(edge.node) }}
              </p>
            </div>
            <span class="shrink-0 text-xs text-slate-400">{{ edge.node.id }}</span>
          </div>
        </div>

        <div v-else-if="!loading" class="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
          {{ t('importsExports.exports.selected.empty') }}
        </div>
      </template>
    </ApolloQuery>
  </div>
</template>
