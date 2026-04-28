<script setup lang="ts">
import apolloClient from '../../../../../apollo-client';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { changeProductViewsStatusMutation } from '../../../api/mutations/salesChannels.js';
import { productsBulkWebsiteAssignQuery } from '../../../api/queries/products.js';
import { salesChannelViewsQuerySelector } from '../../../api/queries/salesChannels.js';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Label } from '../../atoms/label';
import { Selector } from '../../atoms/selector';
import { TriStateToggle } from '../../atoms/tri-state-toggle';
import { Toast } from '../../../modules/toast';
import { displayApolloError, getProductViewStatus, PRODUCT_VIEW_STATUS } from '../../../utils';
import type { ProductViewStatus } from '../../../utils';

interface SalesChannelView {
  id: string;
  name: string;
  active: boolean;
  includeInTodo?: boolean;
  todoSortOrder?: number | null;
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
  saleschannelviewassignSet?: SalesChannelViewAssignSummary[];
  rejectedsaleschannelviewassignSet?: SalesChannelViewAssignSummary[];
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
const submitting = ref(false);
const selectedStatus = ref<ProductViewStatus>(PRODUCT_VIEW_STATUS.ADDED);

const statusOptions = computed(() => [
  {
    id: PRODUCT_VIEW_STATUS.TODO,
    label: t('shared.components.organisms.bulkProductWebsiteAssigner.statuses.todo'),
    value: PRODUCT_VIEW_STATUS.TODO,
    tone: 'yellow' as const,
  },
  {
    id: PRODUCT_VIEW_STATUS.REJECT,
    label: t('shared.components.organisms.bulkProductWebsiteAssigner.statuses.reject'),
    value: PRODUCT_VIEW_STATUS.REJECT,
    tone: 'red' as const,
  },
  {
    id: PRODUCT_VIEW_STATUS.ADDED,
    label: t('shared.components.organisms.bulkProductWebsiteAssigner.statuses.added'),
    value: PRODUCT_VIEW_STATUS.ADDED,
    tone: 'green' as const,
  },
]);

const viewsById = computed(() => new Map(views.value.map((view) => [view.id, view])));
const selectedViewItems = computed(() => selectedViews.value
  .map((id) => viewsById.value.get(id))
  .filter((view): view is SalesChannelView => !!view));

const totalPairsCount = computed(() => products.value.length * selectedViews.value.length);
const isDestructiveSelection = computed(() => selectedStatus.value !== PRODUCT_VIEW_STATUS.ADDED);

const plannedChanges = computed(() => {
  return products.value.flatMap((product) => {
    return selectedViews.value
      .filter((viewId) => getProductViewStatus(product, viewId) !== selectedStatus.value)
      .map((viewId) => ({
        status: selectedStatus.value,
        assignObject: {
          product: { id: product.id },
          view: { id: viewId },
        },
      }));
  });
});

const plannedChangesCount = computed(() => plannedChanges.value.length);
const skippedCount = computed(() => totalPairsCount.value - plannedChangesCount.value);

const isSubmitDisabled = computed(() => {
  return submitting.value || !props.selectedEntities.length || !selectedViews.value.length;
});

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    popup: 'sweet-alerts',
    confirmButton: 'btn btn-secondary',
    cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3',
  },
  buttonsStyling: false,
});

const removeSelectedView = (viewId: string) => {
  selectedViews.value = selectedViews.value.filter((id) => id !== viewId);
};

const fetchViews = async () => {
  loadingViews.value = true;

  try {
    const { data } = await apolloClient.query({
      query: salesChannelViewsQuerySelector,
      variables: {
        filter: {
          includeInTodo: { exact: true },
          salesChannel: { active: { exact: true } },
        },
      },
      fetchPolicy: 'cache-first',
    });

    views.value = (data?.salesChannelViews?.edges?.map((edge) => edge.node) ?? []).sort((first, second) => {
      const firstOrder = typeof first.todoSortOrder === 'number' ? first.todoSortOrder : Number.MAX_SAFE_INTEGER;
      const secondOrder = typeof second.todoSortOrder === 'number' ? second.todoSortOrder : Number.MAX_SAFE_INTEGER;

      if (firstOrder !== secondOrder) {
        return firstOrder - secondOrder;
      }

      return first.name.localeCompare(second.name);
    });
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

const confirmDestructiveStatusChange = async () => {
  if (!isDestructiveSelection.value) {
    return true;
  }

  const result = await swalWithBootstrapButtons.fire({
    title: t('shared.components.organisms.bulkProductWebsiteAssigner.destructiveConfirm.title'),
    text: t('shared.components.organisms.bulkProductWebsiteAssigner.destructiveConfirm.text'),
    confirmButtonText: t('shared.components.organisms.bulkProductWebsiteAssigner.destructiveConfirm.confirmButtonText'),
    cancelButtonText: t('shared.alert.mutationAlert.cancelButtonText'),
    icon: 'warning',
    showCancelButton: true,
    reverseButtons: true,
    padding: '2em',
  } as SweetAlertOptions);

  return result.isConfirmed;
};

const handleAssign = async () => {
  if (submitting.value) return;

  if (!selectedViews.value.length) {
    Toast.warning(t('shared.components.organisms.bulkProductWebsiteAssigner.missingSelection'));
    return;
  }

  if (!plannedChanges.value.length) {
    Toast.warning(t('shared.components.organisms.bulkProductWebsiteAssigner.nothingToChange'));
    return;
  }

  const confirmed = await confirmDestructiveStatusChange();
  if (!confirmed) {
    return;
  }

  submitting.value = true;

  try {
    const { data } = await apolloClient.mutate({
      mutation: changeProductViewsStatusMutation,
      variables: {
        changes: plannedChanges.value,
      },
    });

    Toast.success(
      t('shared.components.organisms.bulkProductWebsiteAssigner.success', {
        count: data?.changeProductViewsStatus?.productsCount ?? products.value.length,
        views: data?.changeProductViewsStatus?.viewsCount ?? selectedViews.value.length,
        status: t(`shared.components.organisms.bulkProductWebsiteAssigner.statuses.${selectedStatus.value.toLowerCase()}`),
      }),
    );

    emit('started');
    showPanel.value = false;
    selectedViews.value = [];
    selectedStatus.value = PRODUCT_VIEW_STATUS.ADDED;
  } catch (error) {
    displayApolloError(error);
  } finally {
    submitting.value = false;
  }
};

watch(showPanel, (open) => {
  if (!open) return;

  fetchViews();
  fetchProducts();
});

watch(() => props.selectedEntities, () => {
  if (showPanel.value && !submitting.value) {
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
  <div ref="panelRef" class="relative inline-block text-left">
    <button
      class="inline-flex items-center rounded bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-800 shadow-sm ring-1 ring-inset ring-blue-300 hover:bg-blue-100"
      @click="showPanel = !showPanel"
    >
      <Icon name="store" size="sm" class="mr-2 text-blue-600" />
      {{ t('shared.components.organisms.bulkProductWebsiteAssigner.button') }}
    </button>

    <div v-if="showPanel" class="absolute left-0 z-50 mt-2 w-[560px] rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
      <div class="mb-4 flex items-start justify-between border-b border-gray-200 pb-4">
        <div>
          <h3 class="text-sm font-semibold text-gray-800">
            {{ t('shared.components.organisms.bulkProductWebsiteAssigner.title', { count: props.selectedEntities.length }) }}
          </h3>
          <p class="mt-1 text-xs text-gray-500">
            {{ t('shared.components.organisms.bulkProductWebsiteAssigner.description') }}
          </p>
        </div>
        <button class="ml-auto text-gray-400 hover:text-gray-600" @click="showPanel = false">
          <Icon name="x" size="sm" />
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <Label class="mb-1 block text-sm font-semibold text-gray-700">
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
          <Label class="mb-2 block text-sm font-semibold text-gray-700">
            {{ t('shared.components.organisms.bulkProductWebsiteAssigner.statusLabel') }}
          </Label>
          <TriStateToggle
            :model-value="selectedStatus"
            :options="statusOptions"
            name="bulk-product-website-status"
            @update:modelValue="selectedStatus = $event as ProductViewStatus"
          />
        </div>

        <div v-if="isDestructiveSelection" class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
          {{ t('shared.components.organisms.bulkProductWebsiteAssigner.destructiveWarning') }}
        </div>

        <div>
          <Label class="block text-sm font-semibold text-gray-700">
            {{ t('shared.components.organisms.bulkProductWebsiteAssigner.selectedViewsTitle') }}
          </Label>
          <div v-if="selectedViewItems.length" class="mt-2 flex flex-wrap gap-2">
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

        <div class="space-y-1 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
          <p>{{ t('shared.components.organisms.bulkProductWebsiteAssigner.summaryProducts', { count: products.length }) }}</p>
          <p>{{ t('shared.components.organisms.bulkProductWebsiteAssigner.summaryViews', { count: selectedViews.length }) }}</p>
          <p>{{ t('shared.components.organisms.bulkProductWebsiteAssigner.summaryPlanned', { count: plannedChangesCount }) }}</p>
          <p>{{ t('shared.components.organisms.bulkProductWebsiteAssigner.summarySkipped', { count: skippedCount }) }}</p>
        </div>

        <p v-if="loadingProducts" class="text-xs text-gray-500">
          {{ t('shared.components.organisms.bulkProductWebsiteAssigner.loadingProducts') }}
        </p>
        <p v-if="!props.selectedEntities.length" class="text-xs text-gray-500">
          {{ t('shared.components.organisms.bulkProductWebsiteAssigner.noProductsSelected') }}
        </p>
      </div>

      <div class="mt-4 border-t border-gray-200 pt-4">
        <Button
          class="w-full rounded bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          :disabled="isSubmitDisabled"
          :loading="submitting"
          @click="handleAssign"
        >
          {{ t('shared.components.organisms.bulkProductWebsiteAssigner.assignButton') }}
        </Button>
      </div>
    </div>
  </div>
</template>
