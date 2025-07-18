<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { ProductWithAliasFields } from "../../../../../../configs";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { Badge } from "../../../../../../../../../shared/components/atoms/badge";
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { getProductTypeBadgeMap, getInspectorStatusIconMap } from "../../../../../../configs";
import { shortenText } from "../../../../../../../../../shared/utils";

const props = defineProps<{ products: ProductWithAliasFields[] }>();
const { t } = useI18n();

const aliasProducts = computed(() => props.products ?? []);

function iconColorClass(color?: string) {
  switch (color) {
    case 'green':
      return 'text-green-500';
    case 'yellow':
      return 'text-yellow-500';
    case 'orange':
      return 'text-orange-500';
    case 'red':
      return 'text-red-500';
    default:
      return '';
  }
}
</script>

<template>
  <div class="table-responsive">
    <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
      <thead>
        <tr>
          <th class="px-3 py-2 text-left">{{ t('shared.labels.name') }}</th>
          <th class="px-3 py-2 text-left">{{ t('shared.labels.sku') }}</th>
          <th class="px-3 py-2 text-left">{{ t('shared.labels.type') }}</th>
          <th class="px-3 py-2 text-left">{{ t('shared.labels.active') }}</th>
          <th class="px-3 py-2 text-left">{{ t('products.products.labels.inspectorStatus') }}</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="alias in aliasProducts" :key="alias.id">
          <td>
            <Link :path="{ name: 'products.products.show', params: { id: alias.id } }">
              <div class="flex gap-4 items-center">
                <div v-if="alias.thumbnailUrl" class="w-8 h-8 overflow-hidden">
                  <img
                    class="w-8 h-8 rounded-md object-cover"
                    :src="alias.thumbnailUrl"
                    :alt="alias.name"
                  />
                </div>
                <div
                  v-else
                  class="w-8 h-8 rounded-md bg-gray-200 flex justify-center items-center"
                ></div>
                <span :title="alias.name">{{ shortenText(alias.name, 64) }}</span>
              </div>
            </Link>
          </td>
          <td>
            {{ alias.sku }}
          </td>
          <td>
            <Badge
              v-if="alias.type"
              :text="getProductTypeBadgeMap(t)[alias.type]?.text"
              :color="getProductTypeBadgeMap(t)[alias.type]?.color"
            />
          </td>
          <td>
            <Icon v-if="alias.active" name="check-circle" class="text-green-500" />
            <Icon v-else name="times-circle" class="text-red-500" />
          </td>
          <td>
            <Icon
              :name="getInspectorStatusIconMap(t)[alias.inspectorStatus]?.name"
              :class="iconColorClass(getInspectorStatusIconMap(t)[alias.inspectorStatus]?.color)"
              :title="getInspectorStatusIconMap(t)[alias.inspectorStatus]?.hoverText"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
