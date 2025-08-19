<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../../apollo-client';
import { amazonProductPropertiesQuery } from '../../../../../../../../shared/api/queries/amazonProductProperties.js';

interface SelectValue {
  id: string;
  remoteValue?: string | null;
  remoteName?: string | null;
  localInstance?: { id: string } | null;
}

const props = defineProps<{ remoteProductId: string | null }>();

const { t } = useI18n();

const properties = ref<any[]>([]);
const loading = ref(false);

const fetchProperties = async () => {
  if (!props.remoteProductId) {
    properties.value = [];
    return;
  }
  loading.value = true;
  const { data } = await apolloClient.query({
    query: amazonProductPropertiesQuery,
    variables: { remoteProductId: props.remoteProductId },
    fetchPolicy: 'network-only',
  });
  properties.value = data?.amazonProductProperties?.edges?.map((e: any) => e.node) || [];
  loading.value = false;
};

watch(
  () => props.remoteProductId,
  () => {
    fetchProperties();
  },
  { immediate: true },
);

const unmappedValues = computed(() => {
  const result: SelectValue[] = [];
  for (const prop of properties.value) {
    if (prop.remoteSelectValue && !prop.remoteSelectValue.localInstance) {
      result.push(prop.remoteSelectValue);
    }
    if (Array.isArray(prop.remoteSelectValues)) {
      for (const val of prop.remoteSelectValues as SelectValue[]) {
        if (!val.localInstance) {
          result.push(val);
        }
      }
    }
  }
  return result;
});
</script>

<template>
  <div v-if="unmappedValues.length" class="p-2 border rounded text-sm">
    <div class="mb-2 font-medium">{{ t('dashboard.cards.amazon.unmappedSelectValues.title') }}</div>
    <p class="mb-2 text-gray-500">{{ t('dashboard.cards.amazon.unmappedSelectValues.description') }}</p>
    <ul class="list-disc pl-4">
      <li v-for="value in unmappedValues" :key="value.id">
        <RouterLink
          class="text-primary hover:underline"
          :to="{ name: 'integrations.amazonPropertySelectValues.edit', params: { type: 'amazon', id: value.id } }"
        >
          {{ value.remoteName || value.remoteValue || value.id }}
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

