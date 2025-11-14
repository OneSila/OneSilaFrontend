<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import RemotelyMappedRemoteProductType from '../remote-product-types/containers/RemotelyMappedRemoteProductType.vue';
import { sheinMappedRemoteProductTypeConfig } from '../remote-product-types/configs';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';

const props = defineProps<{ productType: any | null }>();

const { t } = useI18n();

const requirementLabels = computed(() => ({
  not_fillable: t('integrations.show.shein.productRules.requirement.notFillable'),
  optional: t('integrations.show.shein.productRules.requirement.optional'),
  required: t('integrations.show.shein.productRules.requirement.required'),
}));

const attributeTypeLabels = computed(() => ({
  sales: t('integrations.show.shein.productRules.attributeType.sales'),
  size: t('integrations.show.shein.productRules.attributeType.size'),
  composition: t('integrations.show.shein.productRules.attributeType.composition'),
  common: t('integrations.show.shein.productRules.attributeType.common'),
}));

const visibilityLabels = computed(() => ({
  display: t('integrations.show.shein.productRules.visibility.display'),
  hidden: t('integrations.show.shein.productRules.visibility.hidden'),
}));

const remarkLabels = computed(() => ({
  important: t('integrations.show.shein.productRules.remarks.important'),
  compliance: t('integrations.show.shein.productRules.remarks.compliance'),
  quality: t('integrations.show.shein.productRules.remarks.quality'),
  customs: t('integrations.show.shein.productRules.remarks.customs'),
}));

const getRequirementLabel = (item: any) => requirementLabels.value[item?.requirement ?? 'optional'] || '—';
const getAttributeTypeLabel = (item: any) => attributeTypeLabels.value[item?.attributeType ?? 'common'] || '—';
const getVisibilityLabel = (item: any) => visibilityLabels.value[item?.visibility ?? 'display'] || '—';
const getRemarks = (item: any) => Array.isArray(item?.remarks) ? item.remarks.filter(Boolean) : [];
const resolveRemarkLabel = (remark: string) => remarkLabels.value[remark] || remark;
const formatBoolean = (value: boolean) => (value ? t('shared.labels.yes') : t('shared.labels.no'));
</script>

<template>
  <RemotelyMappedRemoteProductType :product-type="productType" :config="sheinMappedRemoteProductTypeConfig">
    <template #schema="{ mappedItems, helpers }">
      <div class="max-h-[700px] overflow-y-auto rounded-md custom-scrollbar overflow-x-auto">
        <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
          <thead>
            <tr>
              <th class="p-2 text-left">{{ t('shared.labels.name') }}</th>
              <th class="p-2 text-left">{{ t('integrations.show.shein.productRules.labels.requirement') }}</th>
              <th class="p-2 text-left">{{ t('integrations.show.shein.productRules.labels.attributeType') }}</th>
              <th class="p-2 text-left">{{ t('integrations.show.shein.productRules.labels.visibility') }}</th>
              <th class="p-2 text-left">{{ t('integrations.show.shein.productRules.labels.remarks') }}</th>
              <th class="p-2 text-left">{{ t('integrations.show.shein.productRules.labels.allowsCustomValues') }}</th>
              <th class="p-2 text-left">{{ t('integrations.show.mapping.mappedLocally') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="entry in mappedItems" :key="entry.item.id">
              <td class="p-2">
                <div class="flex flex-col">
                  <span class="font-medium">{{ helpers.getItemName(entry.item) }}</span>
                  <span v-if="helpers.getItemCode(entry.item)" class="text-xs text-gray-500">
                    {{ helpers.getItemCode(entry.item) }}
                  </span>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <span v-if="entry.item.isMainAttribute" class="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {{ t('integrations.show.shein.productRules.labels.mainAttribute') }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="p-2">{{ getRequirementLabel(entry.item) }}</td>
              <td class="p-2">{{ getAttributeTypeLabel(entry.item) }}</td>
              <td class="p-2">{{ getVisibilityLabel(entry.item) }}</td>
              <td class="p-2">
                <div v-if="getRemarks(entry.item).length" class="flex flex-wrap gap-2">
                  <span
                    v-for="remark in getRemarks(entry.item)"
                    :key="`${entry.item.id}-${remark}`"
                    class="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
                  >
                    {{ resolveRemarkLabel(remark) }}
                  </span>
                </div>
                <span v-else class="text-sm text-gray-500">—</span>
              </td>
              <td class="p-2">{{ formatBoolean(entry.item.allowsUnmappedValues) }}</td>
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
