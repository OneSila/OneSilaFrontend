<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import RemotelyMappedRemoteProductType from '../remote-product-types/containers/RemotelyMappedRemoteProductType.vue';
import { miraklMappedRemoteProductTypeConfig } from '../remote-product-types/configs';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { Link } from '../../../../../../../../shared/components/atoms/link';

defineProps<{ productType: any | null }>();

const { t } = useI18n();
</script>

<template>
  <RemotelyMappedRemoteProductType :product-type="productType" :config="miraklMappedRemoteProductTypeConfig">
    <template #schema="{ mappedItems, helpers }">
      <div class="max-h-[700px] overflow-y-auto rounded-md custom-scrollbar overflow-x-auto">
        <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
          <thead>
            <tr>
              <th class="p-2 text-left">{{ t('shared.labels.name') }}</th>
              <th class="p-2 text-left">{{ t('integrations.show.properties.labels.code') }}</th>
              <th class="p-2 text-left">{{ t('integrations.show.mirakl.properties.labels.requirementLevel') }}</th>
              <th class="p-2 text-left">{{ t('integrations.show.mirakl.productRules.labels.required') }}</th>
              <th class="p-2 text-left">{{ t('integrations.show.mirakl.productRules.labels.variant') }}</th>
              <th class="p-2 text-left">{{ t('integrations.show.mapping.mappedLocally') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="entry in mappedItems" :key="entry.item.id">
              <td class="p-2">
                <div class="flex flex-col">
                  <Link v-if="entry.propertyPath" :path="entry.propertyPath" class="font-medium">
                    {{ helpers.getItemName(entry.item) }}
                  </Link>
                  <span v-else class="font-medium">{{ helpers.getItemName(entry.item) }}</span>
                  <span v-if="entry.item.localInstance?.property?.name" class="text-xs text-gray-500">
                    {{ entry.item.localInstance.property.name }}
                  </span>
                </div>
              </td>
              <td class="p-2">{{ helpers.getItemCode(entry.item) || '—' }}</td>
              <td class="p-2">{{ entry.item.requirementLevel || '—' }}</td>
              <td class="p-2">
                <Icon v-if="entry.item.required" name="check-circle" class="text-green-500" />
                <Icon v-else name="times-circle" class="text-red-500" />
              </td>
              <td class="p-2">
                <Icon v-if="entry.item.variant" name="check-circle" class="text-green-500" />
                <Icon v-else name="times-circle" class="text-red-500" />
              </td>
              <td class="p-2">
                <Icon v-if="helpers.isItemMappedLocally(entry.item)" name="check-circle" class="text-green-500" />
                <Icon v-else name="times-circle" class="text-red-500" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </RemotelyMappedRemoteProductType>
</template>
