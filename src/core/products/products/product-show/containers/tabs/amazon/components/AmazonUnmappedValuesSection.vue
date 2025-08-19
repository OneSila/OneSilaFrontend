<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../../apollo-client';
import { amazonProductPropertiesQuery } from '../../../../../../../../shared/api/queries/amazonProductProperties.js';
import { Link } from '../../../../../../../../shared/components/atoms/link';

interface SelectValue {
  id: string;
  remoteValue?: string | null;
  remoteName?: string | null;
  localInstance?: { id: string } | null;
}

const props = defineProps<{
  remoteProductId: string | null;
  id: string;
  salesChannelId: string;
}>();

const { t } = useI18n();

const properties = ref<any[]>([]);

const fetchProperties = async () => {
  if (!props.remoteProductId) {
    properties.value = [];
    return;
  }
  const { data } = await apolloClient.query({
    query: amazonProductPropertiesQuery,
    variables: { remoteProductId: props.remoteProductId },
    fetchPolicy: 'network-only',
  });
  properties.value =
    data?.amazonProductProperties?.edges?.map((e: any) => e.node) || [];
};

watch(
  () => props.remoteProductId,
  () => {
    fetchProperties();
  },
  { immediate: true },
);

const unmappedValues = computed(() => {
  const map = new Map<string, SelectValue>();
  for (const prop of properties.value) {
    const values: SelectValue[] = [];
    if (prop.remoteSelectValue && !prop.remoteSelectValue.localInstance) {
      values.push(prop.remoteSelectValue);
    }
    if (Array.isArray(prop.remoteSelectValues)) {
      for (const val of prop.remoteSelectValues as SelectValue[]) {
        if (!val.localInstance) {
          values.push(val);
        }
      }
    }
    for (const val of values) {
      if (!map.has(val.id)) {
        map.set(val.id, val);
      }
    }
  }
  return Array.from(map.values());
});
</script>

<template>
  <div
    v-if="unmappedValues.length"
    class="p-4 border rounded bg-gray-50 text-sm space-y-2"
  >
    <div class="font-medium">
      {{ t('dashboard.cards.amazon.unmappedSelectValues.title') }}
    </div>
    <p class="text-gray-500">
      {{ t('dashboard.cards.amazon.unmappedSelectValues.description') }}
    </p>
    <ul class="list-disc pl-5 space-y-1">
      <li v-for="value in unmappedValues" :key="value.id">
        <Link
          class="text-primary hover:underline"
          :path="{
            name: 'integrations.amazonPropertySelectValues.edit',
            params: {
              type: 'amazon',
              id: value.id,
              integrationId: props.id,
              salesChannelId: props.salesChannelId,
            },
          }"
        >
          {{ value.remoteName || value.remoteValue || value.id }}
        </Link>
      </li>
    </ul>
  </div>
</template>

