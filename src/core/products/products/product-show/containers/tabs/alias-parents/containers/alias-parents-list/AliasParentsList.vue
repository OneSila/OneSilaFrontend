<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Product } from "../../../../../../configs";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { Badge } from "../../../../../../../../../shared/components/atoms/badge";
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { getProductTypeBadgeMap, getInspectorStatusBadgeMap } from "../../../../../../configs";

const props = defineProps<{ products: Product[] }>();
const { t } = useI18n();

const aliasProducts = computed(() => props.products ?? []);
</script>

<template>
  <div class="table-responsive">
    <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
      <thead>
        <tr>
          <th class="px-3 py-2 text-left">{{ t('shared.labels.name') }}</th>
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
                <span>{{ alias.name }}</span>
              </div>
            </Link>
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
            {{ getInspectorStatusBadgeMap()[alias.inspectorStatus]?.text || '-' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
