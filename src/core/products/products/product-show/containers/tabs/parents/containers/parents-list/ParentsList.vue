<script setup lang="ts">
import { getInspectorStatusIconMap, Product, getProductTypeBadgeMap } from "../../../../../../configs";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { useI18n } from "vue-i18n";
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { onMounted, ref } from "vue";
import { configurableVariationsQuery, bundleVariationsQuery } from "../../../../../../../../../shared/api/queries/products.js";
import apolloClient from "../../../../../../../../../../apollo-client";
import { Loader } from "../../../../../../../../../shared/components/atoms/loader";
import { Badge } from "../../../../../../../../../shared/components/atoms/badge";
import { shortenText } from "../../../../../../../../../shared/utils";

const { t } = useI18n();
const props = defineProps<{ product: Product }>();

const parents = ref<any[]>([]);
const loading = ref(true);

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

const fetchConfigurableVariations = async () => {
  const { data } = await apolloClient.query({
    query: configurableVariationsQuery,
    variables: {
      filter: { variation: { id: { exact: props.product.id } } },
      first: 100
    },
    fetchPolicy: 'network-only'
  });

  const edges = data?.configurableVariations?.edges || [];
  return edges.map(edge => edge.node.parent);
};

const fetchBundleVariations = async () => {
  const { data } = await apolloClient.query({
    query: bundleVariationsQuery,
    variables: {
      filter: { variation: { id: { exact: props.product.id } } },
      first: 100
    },
    fetchPolicy: 'network-only'
  });

  const edges = data?.bundleVariations?.edges || [];
  return edges.map(edge => edge.node.parent);
};

onMounted(async () => {
  loading.value = true;
  const [configurable, bundle] = await Promise.all([
    fetchConfigurableVariations(),
    fetchBundleVariations()
  ]);

  const combined = [...configurable, ...bundle];
  const unique = Object.values(
    combined.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<string, any>)
  );

  parents.value = unique;
  loading.value = false;
});

</script>

<template>
  <div>
    <Loader :loading="loading" />

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
          <tr v-for="parent in parents" :key="parent.id">
            <td>
              <Link :path="{ name: 'products.products.show', params: { id: parent.id } }">
                <div class="flex gap-4 items-center">
                  <div v-if="parent.thumbnailUrl" class="w-8 h-8 overflow-hidden">
                    <img
                      class="w-8 h-8 rounded-md object-cover"
                      :src="parent.thumbnailUrl"
                      :alt="parent.name"
                    />
                  </div>
                  <div
                    v-else
                    class="w-8 h-8 rounded-md bg-gray-200 flex justify-center items-center"
                  ></div>
                  <span :title="parent.name">{{ shortenText(parent.name, 64) }}</span>
                </div>
              </Link>
            </td>
            <td>
              <Badge
                v-if="parent.type"
                :text="getProductTypeBadgeMap(t)[parent.type]?.text"
                :color="getProductTypeBadgeMap(t)[parent.type]?.color"
              />
            </td>
            <td>
              <Icon v-if="parent.active" name="check-circle" class="text-green-500" />
              <Icon v-else name="times-circle" class="text-red-500" />
            </td>
            <td>
              <Icon
                :name="getInspectorStatusIconMap(t)[parent.inspectorStatus]?.name"
                :class="iconColorClass(getInspectorStatusIconMap(t)[parent.inspectorStatus]?.color)"
                :title="getInspectorStatusIconMap(t)[parent.inspectorStatus]?.hoverText"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>