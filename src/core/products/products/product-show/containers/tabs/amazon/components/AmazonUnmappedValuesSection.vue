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
  amazonProperty?: { id: string; name?: string | null; code?: string | null } | null;
  localInstance?: { id: string } | null;
  salesChannel?: { id: string; ptrId: string } | null;
}

const props = defineProps<{
  remoteProductId: string | null;
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
    <table class="w-full text-left">
      <thead class="text-gray-500">
        <tr>
          <th class="font-normal py-1 px-2">
            {{ t('integrations.show.propertySelectValues.labels.selectValue') }}
          </th>
          <th class="font-normal py-1 px-2">
            {{ t('integrations.show.propertySelectValues.labels.amazonProperty') }}
          </th>
          <th class="font-normal py-1 px-2">
            {{ t('integrations.show.properties.labels.code') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="value in unmappedValues" :key="value.id" class="border-t">
          <td class="py-1 px-2">
            <Link
              class="text-primary hover:underline"
              :path="{
                name: 'integrations.amazonPropertySelectValues.edit',
                params: { type: 'amazon', id: value.id },
                query: {
                  integrationId: value.salesChannel?.ptrId,
                  salesChannelId: value.salesChannel?.id,
                },
              }"
            >
              {{ value.remoteName || value.remoteValue || value.id }}
            </Link>
          </td>
          <td class="py-1 px-2">
            <Link
              v-if="value.amazonProperty"
              class="text-primary hover:underline"
              :path="{
                name: 'integrations.amazonProperties.edit',
                params: { type: 'amazon', id: value.amazonProperty.id },
                query: {
                  integrationId: value.salesChannel?.ptrId,
                  salesChannelId: value.salesChannel?.id,
                },
              }"
            >
              {{ value.amazonProperty.name || value.amazonProperty.code }}
            </Link>
          </td>
          <td class="py-1 px-2">
            {{ value.amazonProperty?.code }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

