<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '../../atoms/icon';
import { Label } from '../../atoms/label';
import { Selector } from '../../atoms/selector';
import { Button } from '../../atoms/button';
import apolloClient from '../../../../../apollo-client';
import { salesChannelViewsQuerySelector } from '../../../api/queries/salesChannels.js';
import { productsBulkWebsiteAssignQuery } from '../../../api/queries/products.js';
import { createSalesChannelViewAssignMutation } from '../../../api/mutations/salesChannels.js';
import { InspectorStatus } from '../../../utils/constants';
import { Toast } from '../../../modules/toast';

interface SalesChannelView {
  id: string;
  name: string;
  salesChannel: {
    id: string;
  };
}

interface SalesChannelViewAssignSummary {
  id: string;
  salesChannelView: {
    id: string;
  };
}

interface ProductSummary {
  id: string;
  sku: string;
  inspectorStatus: number;
  saleschannelviewassignSet?: SalesChannelViewAssignSummary[];
}

const props = defineProps<{ selectedEntities: string[] }>();
const emit = defineEmits<{ (e: 'started'): void }>();

const { t } = useI18n();

const showPanel = ref(false);
const panelRef = ref<HTMLElement | null>(null);
const views = ref<SalesChannelView[]>([]);
const selectedViews = ref<string[]>([]);
const products = ref<ProductSummary[]>([]);
const loadingViews = ref(false);
const loadingProducts = ref(false);
const assigning = ref(false);

const viewsById = computed(() => new Map(views.value.map((view) => [view.id, view])));
const selectedViewItems = computed(() => selectedViews.value
  .map((id) => viewsById.value.get(id))
  .filter((view): view is SalesChannelView => !!view));

const readyProducts = computed(() => products.value
  .filter((product) => product.inspectorStatus !== InspectorStatus.RED));
const skippedProducts = computed(() => products.value
  .filter((product) => product.inspectorStatus === InspectorStatus.RED));

const existingAssignments = computed(() => {
  const set = new Set<string>();
  products.value.forEach((product) => {
    (product.saleschannelviewassignSet ?? []).forEach((assign) => {
      if (assign.salesChannelView?.id) {
        set.add(`${product.id}:${assign.salesChannelView.id}`);
      }
    });
  });
  return set;
});

const existingAssignmentsCount = computed(() => {
  if (!readyProducts.value.length || !selectedViews.value.length) return 0;
  let count = 0;
  readyProducts.value.forEach((product) => {
    selectedViews.value.forEach((viewId) => {
      if (existingAssignments.value.has(`${product.id}:${viewId}`)) {
        count += 1;
      }
    });
  });
  return count;
});

const assignmentTargets = computed(() => {
  const targets: Array<{ productId: string; sku: string; viewId: string }> = [];
  const existing = existingAssignments.value;
  readyProducts.value.forEach((product) => {
    selectedViews.value.forEach((viewId) => {
      if (!existing.has(`${product.id}:${viewId}`)) {
        targets.push({ productId: product.id, sku: product.sku, viewId });
      }
    });
  });
  return targets;
});

const plannedAssignmentsCount = computed(() => assignmentTargets.value.length);

const isSubmitDisabled = computed(() => assigning.value || !props.selectedEntities.length || !selectedViews.value.length);

const removeSelectedView = (viewId: string) => {
  selectedViews.value = selectedViews.value.filter((id) => id !== viewId);
};

const fetchViews = async () => {
  loadingViews.value = true;
  try {
    const { data } = await apolloClient.query({
      query: salesChannelViewsQuerySelector,
      variables: { filter: { salesChannel: { active: { exact: true } } } },
      fetchPolicy: 'cache-first',
    });
    views.value = data?.salesChannelViews?.edges?.map((edge) => edge.node) ?? [];
  } finally {
    loadingViews.value = false;
  }
};

const fetchProducts = async () => {
  if (!props.selectedEntities.length) {
    products.value = [];
    return;
  }
  loadingProducts.value = true;
  try {
    const { data } = await apolloClient.query({
      query: productsBulkWebsiteAssignQuery,
      variables: { filter: { id: { inList: props.selectedEntities } }, first: props.selectedEntities.length },
      fetchPolicy: 'network-only',
    });
    products.value = data?.products?.edges?.map((edge) => edge.node) ?? [];
  } finally {
    loadingProducts.value = false;
  }
};

const handleGlobalClick = (event: MouseEvent) => {
  const clickedEl = event.target as HTMLElement;
  const clickedInsidePanel = panelRef.value?.contains(clickedEl);
  const clickedInsideSelectorDropdown = !!clickedEl.closest('.vs__dropdown-menu');
  if (!clickedInsidePanel && !clickedInsideSelectorDropdown) {
    showPanel.value = false;
  }
};

const handleAssign = async () => {
  if (assigning.value) return;
  if (!selectedViews.value.length) {
    Toast.warning(t('shared.components.organisms.bulkProductWebsiteAssigner.missingSelection'));
    return;
  }

  const targets = assignmentTargets.value;
  if (!targets.length) {
    Toast.warning(t('shared.components.organisms.bulkProductWebsiteAssigner.nothingToAssign'));
    return;
  }

  const selectedViewsCount = selectedViews.value.length;
  const skippedRedCount = skippedProducts.value.length;
  const existingCount = existingAssignmentsCount.value;

  assigning.value = true;
  emit('started');

  let createdCount = 0;
  const errorSkus: string[] = [];

  for (const target of targets) {
    const view = viewsById.value.get(target.viewId);
    if (!view) continue;

    try {
      await apolloClient.mutate({
        mutation: createSalesChannelViewAssignMutation,
        variables: {
          data: {
            product: { id: target.productId },
            salesChannelView: { id: view.id },
            salesChannel: { id: view.salesChannel.id },
          },
        },
      });
      createdCount += 1;
    } catch (error) {
      errorSkus.push(target.sku);
    }
  }

  assigning.value = false;

  if (createdCount > 0) {
    Toast.success(t('shared.components.organisms.bulkProductWebsiteAssigner.success', { created: createdCount, views: selectedViewsCount }));
  }

  if (skippedRedCount > 0) {
    Toast.warning(t('shared.components.organisms.bulkProductWebsiteAssigner.skippedRed', { count: skippedRedCount }));
  }

  if (existingCount > 0) {
    Toast.info(t('shared.components.organisms.bulkProductWebsiteAssigner.skippedExisting', { count: existingCount }));
  }

  if (errorSkus.length > 0) {
    const uniqueSkus = Array.from(new Set(errorSkus));
    Toast.error(t('shared.components.organisms.bulkProductWebsiteAssigner.error', { count: uniqueSkus.length, skus: uniqueSkus.join(', ') }));
  }
};

watch(showPanel, (open) => {
  if (!open) return;
  fetchViews();
  fetchProducts();
});

watch(() => props.selectedEntities, () => {
  if (showPanel.value && !assigning.value) {
    fetchProducts();
  }
}, { deep: true });

watch(views, () => {
  const available = new Set(views.value.map((view) => view.id));
  if (selectedViews.value.some((id) => !available.has(id))) {
    selectedViews.value = selectedViews.value.filter((id) => available.has(id));
  }
});

onMounted(() => {
  document.addEventListener('click', handleGlobalClick, true);
});

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick, true);
});
</script>

<template>
  <div class="relative inline-block text-left" ref="panelRef">
    <button
      @click="showPanel = !showPanel"
      class="inline-flex items-center rounded bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-800 shadow-sm ring-1 ring-inset ring-blue-300 hover:bg-blue-100"
    >
      <Icon name="store" size="sm" class="mr-2 text-blue-600" />
      {{ t('shared.components.organisms.bulkProductWebsiteAssigner.button') }}
    </button>

    <div v-if="showPanel" class="absolute z-50 mt-2 left-0 rounded-xl bg-white shadow-lg border border-gray-200 p-4 w-[520px]">
      <div class="flex justify-between items-start mb-4 border-b border-gray-200 pb-4">
        <h3 class="text-sm font-semibold text-gray-800">
          {{ t('shared.components.organisms.bulkProductWebsiteAssigner.title', { count: props.selectedEntities.length }) }}
        </h3>
        <button class="text-gray-400 hover:text-gray-600 ml-auto" @click="showPanel = false">
          <Icon name="x" size="sm" />
        </button>
      </div>

      <div class="space-y-4">
        <div class="space-y-1">
          <p class="text-sm text-gray-600">
            {{ t('shared.components.organisms.bulkProductWebsiteAssigner.description') }}
          </p>
          <p class="text-sm text-red-500">
            {{ t('shared.components.organisms.bulkProductWebsiteAssigner.disclaimer') }}
          </p>
          <p class="text-xs text-gray-500">
            {{ t('shared.components.organisms.bulkProductWebsiteAssigner.processingNote') }}
          </p>
        </div>

        <div>
          <Label class="block text-sm font-semibold text-gray-700 mb-1">
            {{ t('shared.components.organisms.bulkProductWebsiteAssigner.viewsLabel') }}
          </Label>
          <Selector
            v-model="selectedViews"
            :options="views"
            label-by="name"
            value-by="id"
            multiple
            filterable
            :is-loading="loadingViews"
            :placeholder="t('shared.components.organisms.bulkProductWebsiteAssigner.viewsPlaceholder')"
          />
          <p v-if="!loadingViews && views.length === 0" class="mt-2 text-xs text-gray-500">
            {{ t('shared.components.organisms.bulkProductWebsiteAssigner.noActiveViews') }}
          </p>
        </div>

        <div>
          <Label class="block text-sm font-semibold text-gray-700">
            {{ t('shared.components.organisms.bulkProductWebsiteAssigner.selectedViewsTitle') }}
          </Label>
          <div v-if="selectedViewItems.length" class="flex flex-wrap gap-2 mt-2">
            <span
              v-for="view in selectedViewItems"
              :key="view.id"
              class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
            >
              {{ view.name }}
              <button type="button" class="ml-1 text-blue-500 hover:text-blue-700" @click="removeSelectedView(view.id)">
                <Icon name="x" size="xs" />
              </button>
            </span>
          </div>
          <p v-else class="mt-2 text-xs text-gray-500">
            {{ t('shared.components.organisms.bulkProductWebsiteAssigner.selectedViewsEmpty') }}
          </p>
        </div>

        <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
          <p>{{ t('shared.components.organisms.bulkProductWebsiteAssigner.summaryReady', { count: readyProducts.length }) }}</p>
          <p>{{ t('shared.components.organisms.bulkProductWebsiteAssigner.summarySkipped', { count: skippedProducts.length }) }}</p>
          <p>{{ t('shared.components.organisms.bulkProductWebsiteAssigner.summaryExisting', { count: existingAssignmentsCount }) }}</p>
          <p>{{ t('shared.components.organisms.bulkProductWebsiteAssigner.summaryPlanned', { count: plannedAssignmentsCount }) }}</p>
        </div>

        <p v-if="loadingProducts" class="text-xs text-gray-500">
          {{ t('shared.components.organisms.bulkProductWebsiteAssigner.loadingProducts') }}
        </p>
        <p v-if="!props.selectedEntities.length" class="text-xs text-gray-500">
          {{ t('shared.components.organisms.bulkProductWebsiteAssigner.noProductsSelected') }}
        </p>
      </div>

      <div class="mt-4 pt-4 border-t border-gray-200">
        <Button
          :disabled="isSubmitDisabled"
          :loading="assigning"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm font-semibold"
          @click="handleAssign"
        >
          {{ t('shared.components.organisms.bulkProductWebsiteAssigner.assignButton') }}
        </Button>
      </div>
    </div>
  </div>
</template>
