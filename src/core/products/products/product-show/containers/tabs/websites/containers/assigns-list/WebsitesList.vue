<script setup lang="ts">
import apolloClient from '../../../../../../../../../../apollo-client';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { changeProductViewStatusMutation, resyncSalesChannelViewAssignMutation } from '../../../../../../../../../shared/api/mutations/salesChannels.js';
import { salesChannelViewsQuerySelector } from '../../../../../../../../../shared/api/queries/salesChannels.js';
import { Button } from '../../../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../../../shared/components/atoms/icon';
import { Link } from '../../../../../../../../../shared/components/atoms/link';
import { TriStateToggle } from '../../../../../../../../../shared/components/atoms/tri-state-toggle';
import { InfoModal } from '../../../../../../../../../shared/components/molecules/info-modal';
import { ProgressBar } from '../../../../../../../../../shared/components/molecules/progress-bar';
import { Toast } from '../../../../../../../../../shared/modules/toast';
import {
  displayApolloError,
  getProductViewStatus,
  isProductViewRemovalTransition,
  PRODUCT_VIEW_STATUS,
} from '../../../../../../../../../shared/utils';
import { getProgressBarUiForStatus } from '../../../../../../../../../shared/utils/constants';
import type { ProductViewStatus } from '../../../../../../../../../shared/utils';
import type { Product, SalesChannelView, SalesChannelViewAssign } from '../../../../../../configs';
import { LogsInfoModal } from '../logs-info-modal';

interface WebsiteRow {
  view: SalesChannelView;
  status: ProductViewStatus;
  assign: SalesChannelViewAssign | null;
}

interface RowOverride {
  status: ProductViewStatus;
  assign: SalesChannelViewAssign | null;
}

const { t } = useI18n();
const props = defineProps<{ product: Product }>();
const emit = defineEmits(['assign-deleted', 'assign-added']);

const views = ref<SalesChannelView[]>([]);
const loadingViews = ref(false);
const updatingViewId = ref<string | null>(null);
const infoId = ref<string | null>(null);
const infoIntegrationType = ref<string | undefined>(undefined);
const showInfoModal = ref(false);
const rowOverrides = ref<Record<string, RowOverride>>({});

const toggleOptions = computed(() => [
  {
    id: PRODUCT_VIEW_STATUS.REJECT,
    label: t('products.products.websites.statuses.reject'),
    value: PRODUCT_VIEW_STATUS.REJECT,
    tone: 'red' as const,
  },
  {
    id: PRODUCT_VIEW_STATUS.TODO,
    label: t('products.products.websites.statuses.todo'),
    value: PRODUCT_VIEW_STATUS.TODO,
    tone: 'yellow' as const,
  },
  {
    id: PRODUCT_VIEW_STATUS.ADDED,
    label: t('products.products.websites.statuses.added'),
    value: PRODUCT_VIEW_STATUS.ADDED,
    tone: 'green' as const,
  },
]);

const baseRows = computed<WebsiteRow[]>(() => {
  return [...views.value]
    .sort((first, second) => {
      const firstOrder = typeof first.todoSortOrder === 'number' ? first.todoSortOrder : Number.MAX_SAFE_INTEGER;
      const secondOrder = typeof second.todoSortOrder === 'number' ? second.todoSortOrder : Number.MAX_SAFE_INTEGER;

      if (firstOrder !== secondOrder) {
        return firstOrder - secondOrder;
      }

      return first.name.localeCompare(second.name);
    })
    .map((view) => {
      const assign = props.product.saleschannelviewassignSet.find(
        (item) => item.salesChannelView?.id === view.id,
      ) ?? null;

      return {
        view,
        assign,
        status: getProductViewStatus(props.product, view.id),
      };
    });
});

const rows = computed<WebsiteRow[]>(() => {
  return baseRows.value.map((row) => {
    const override = rowOverrides.value[row.view.id];
    if (!override) {
      return row;
    }

    return {
      ...row,
      status: override.status,
      assign: override.assign,
    };
  });
});

watch(baseRows, (nextRows) => {
  const nextOverrides = { ...rowOverrides.value };

  nextRows.forEach((row) => {
    const override = nextOverrides[row.view.id];
    if (!override) {
      return;
    }

    if (override.status === row.status) {
      delete nextOverrides[row.view.id];
    }
  });

  rowOverrides.value = nextOverrides;
}, { deep: true });

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    popup: 'sweet-alerts',
    confirmButton: 'btn btn-secondary',
    cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3',
  },
  buttonsStyling: false,
});

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

    views.value = data?.salesChannelViews?.edges?.map((edge) => edge.node) ?? [];
  } finally {
    loadingViews.value = false;
  }
};

const setInfoId = (id: string | null, type: string | null) => {
  infoId.value = id;
  infoIntegrationType.value = type || undefined;
  showInfoModal.value = true;
};

const modalClosed = () => {
  infoId.value = null;
  infoIntegrationType.value = undefined;
  showInfoModal.value = false;
};

const getAssignStatus = (item: SalesChannelViewAssign) => {
  if (item.integrationType === 'manual') {
    return 'COMPLETED';
  }

  const remoteStatus = item.remoteProduct?.status;

  if (item.status === 'PENDING_CREATION') {
    if (remoteStatus === 'FAILED') {
      return 'FAILED';
    }

    return remoteStatus || 'PENDING_CREATION';
  }

  if (remoteStatus) {
    return remoteStatus;
  }

  if (item.remoteProduct?.hasErrors) {
    return 'FAILED';
  }

  if (item.remoteProductPercentage === 100) {
    return 'COMPLETED';
  }

  return 'PROCESSING';
};

const getProgressProps = (row: WebsiteRow) => {
  if (row.assign && row.status === PRODUCT_VIEW_STATUS.ADDED) {
    const ui = getProgressBarUiForStatus(getAssignStatus(row.assign));
    const progress = row.assign.integrationType === 'manual' ? 100 : row.assign.remoteProductPercentage;

    return {
      progress,
      label: t(ui.labelKey),
      labelColor: ui.labelColor,
      barColor: ui.barColor,
    };
  }

  if (row.status === PRODUCT_VIEW_STATUS.REJECT) {
    return {
      progress: 0,
      label: t('products.products.websites.progress.rejected'),
      labelColor: 'text-slate-500',
      barColor: 'bg-slate-300',
    };
  }

  return {
    progress: 0,
    label: t('products.products.websites.progress.todo'),
    labelColor: 'text-slate-500',
    barColor: 'bg-slate-300',
  };
};

const onResyncError = (error) => {
  displayApolloError(error);
};

const onResyncSuccess = () => {
  Toast.success(t('integrations.salesChannel.toast.resyncSuccess'));
};

const confirmStatusChange = async (row: WebsiteRow, nextStatus: ProductViewStatus) => {
  if (!isProductViewRemovalTransition(row.status, nextStatus)) {
    return true;
  }

  const result = await swalWithBootstrapButtons.fire({
    title: t('products.products.websites.confirmation.title'),
    text: t('products.products.websites.confirmation.text', { view: row.view.name }),
    confirmButtonText: t('products.products.websites.confirmation.confirmButtonText'),
    cancelButtonText: t('shared.alert.mutationAlert.cancelButtonText'),
    icon: 'warning',
    showCancelButton: true,
    reverseButtons: true,
    padding: '2em',
  } as SweetAlertOptions);

  return result.isConfirmed;
};

const updateStatus = async (row: WebsiteRow, nextStatus: ProductViewStatus) => {
  if (row.status === nextStatus || updatingViewId.value === row.view.id) {
    return;
  }

  const confirmed = await confirmStatusChange(row, nextStatus);
  if (!confirmed) {
    return;
  }

  const previousOverride = rowOverrides.value[row.view.id];
  rowOverrides.value = {
    ...rowOverrides.value,
    [row.view.id]: {
      status: nextStatus,
      assign: nextStatus === PRODUCT_VIEW_STATUS.ADDED ? row.assign : null,
    },
  };
  updatingViewId.value = row.view.id;

  try {
    await apolloClient.mutate({
      mutation: changeProductViewStatusMutation,
      variables: {
        status: nextStatus,
        assignObject: {
          product: { id: props.product.id },
          view: { id: row.view.id },
        },
      },
    });

    if (nextStatus === PRODUCT_VIEW_STATUS.ADDED) {
      emit('assign-added');
    } else if (row.status === PRODUCT_VIEW_STATUS.ADDED) {
      emit('assign-deleted');
    }

    Toast.success(
      t('products.products.websites.toast.statusUpdated', {
        view: row.view.name,
        status: t(`products.products.websites.statuses.${nextStatus.toLowerCase()}`),
      }),
    );
  } catch (error) {
    if (previousOverride) {
      rowOverrides.value = {
        ...rowOverrides.value,
        [row.view.id]: previousOverride,
      };
    } else {
      const nextOverrides = { ...rowOverrides.value };
      delete nextOverrides[row.view.id];
      rowOverrides.value = nextOverrides;
    }
    displayApolloError(error);
  } finally {
    updatingViewId.value = null;
  }
};

onMounted(fetchViews);
</script>

<template>
  <div class="mt-5 p-0 border-0 overflow-hidden">
    <div class="mb-4 flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div>
        <p class="text-sm font-semibold text-slate-900">
          {{ t('products.products.websites.guidance.title') }}
        </p>
        <p class="mt-1 text-sm text-slate-600">
          {{ t('products.products.websites.guidance.description') }}
        </p>
      </div>
      <InfoModal button-class="rounded-full bg-white p-2 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50">
        <template #content>
          <div class="w-full max-w-4xl rounded-2xl bg-white p-6 sm:p-8">
            <div class="flex items-start gap-3">
              <div class="mt-1 rounded-full bg-slate-100 p-2.5">
                <Icon name="circle-info" class="text-slate-600" />
              </div>
              <div class="w-full">
                <h3 class="text-xl font-semibold text-slate-900">
                  {{ t('products.products.websites.tutorial.title') }}
                </h3>
                <p class="mt-2 text-sm leading-6 text-slate-600">
                  {{ t('products.products.websites.tutorial.description') }}
                </p>

                <div class="mt-6 grid gap-4 lg:grid-cols-3">
                  <div class="rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <p class="text-sm font-semibold uppercase tracking-[0.12em] text-rose-800">
                      {{ t('products.products.websites.statuses.reject') }}
                    </p>
                    <p class="mt-2 text-sm leading-6 text-rose-700">
                      {{ t('products.products.websites.tutorial.reject') }}
                    </p>
                  </div>
                  <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p class="text-sm font-semibold uppercase tracking-[0.12em] text-amber-800">
                      {{ t('products.products.websites.statuses.todo') }}
                    </p>
                    <p class="mt-2 text-sm leading-6 text-amber-700">
                      {{ t('products.products.websites.tutorial.todo') }}
                    </p>
                  </div>
                  <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p class="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-800">
                      {{ t('products.products.websites.statuses.added') }}
                    </p>
                    <p class="mt-2 text-sm leading-6 text-emerald-700">
                      {{ t('products.products.websites.tutorial.added') }}
                    </p>
                  </div>
                </div>

                <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p class="text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">
                    {{ t('products.products.websites.tutorial.transitionsTitle') }}
                  </p>
                  <div class="mt-4 grid gap-3 sm:grid-cols-2">
                    <div class="rounded-xl bg-white p-4 ring-1 ring-inset ring-slate-200">
                      <p class="text-sm font-semibold text-slate-900">
                        {{ t('products.products.websites.tutorial.transitionAddedToTodo.title') }}
                      </p>
                      <p class="mt-1 text-sm leading-6 text-slate-600">
                        {{ t('products.products.websites.tutorial.transitionAddedToTodo.description') }}
                      </p>
                    </div>
                    <div class="rounded-xl bg-white p-4 ring-1 ring-inset ring-slate-200">
                      <p class="text-sm font-semibold text-slate-900">
                        {{ t('products.products.websites.tutorial.transitionAddedToReject.title') }}
                      </p>
                      <p class="mt-1 text-sm leading-6 text-slate-600">
                        {{ t('products.products.websites.tutorial.transitionAddedToReject.description') }}
                      </p>
                    </div>
                    <div class="rounded-xl bg-white p-4 ring-1 ring-inset ring-slate-200">
                      <p class="text-sm font-semibold text-slate-900">
                        {{ t('products.products.websites.tutorial.transitionTodoToAdded.title') }}
                      </p>
                      <p class="mt-1 text-sm leading-6 text-slate-600">
                        {{ t('products.products.websites.tutorial.transitionTodoToAdded.description') }}
                      </p>
                    </div>
                    <div class="rounded-xl bg-white p-4 ring-1 ring-inset ring-slate-200">
                      <p class="text-sm font-semibold text-slate-900">
                        {{ t('products.products.websites.tutorial.transitionRejectToTodo.title') }}
                      </p>
                      <p class="mt-1 text-sm leading-6 text-slate-600">
                        {{ t('products.products.websites.tutorial.transitionRejectToTodo.description') }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">
                  <p class="text-sm font-semibold uppercase tracking-[0.12em] text-orange-800">
                    {{ t('products.products.websites.tutorial.configurableWarning.title') }}
                  </p>
                  <p class="mt-2 text-sm leading-6 text-orange-800">
                    {{ t('products.products.websites.tutorial.configurableWarning.description') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </InfoModal>
    </div>

    <div v-if="loadingViews" class="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
      {{ t('products.products.websites.loadingViews') }}
    </div>

    <div v-else-if="rows.length === 0" class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
      {{ t('products.products.websites.empty') }}
    </div>

    <div v-else class="table-responsive custom-table-scroll">
      <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
        <thead>
          <tr>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {{ t('products.products.websites.columns.state') }}
            </th>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {{ t('shared.labels.name') }}
            </th>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {{ t('shared.labels.active') }}
            </th>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {{ t('shared.labels.status') }}
            </th>
            <th scope="col" class="px-3 py-3.5 text-sm font-semibold text-gray-900 !text-end">
              {{ t('shared.labels.actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr
            v-for="row in rows"
            :key="row.view.id"
            :class="row.status !== PRODUCT_VIEW_STATUS.ADDED ? 'bg-slate-50/50' : ''"
          >
            <td class="px-3 py-4">
              <div class="min-w-[156px] max-w-[156px]">
                <TriStateToggle
                  :model-value="row.status"
                  :options="toggleOptions"
                  :disabled="updatingViewId === row.view.id"
                  compact
                  show-labels-above
                  :name="`website-status-${row.view.id}`"
                  @update:modelValue="updateStatus(row, $event as ProductViewStatus)"
                />
              </div>
            </td>
            <td class="px-3 py-4 text-sm font-medium text-slate-900">
              {{ row.view.name }}
            </td>
            <td class="px-3 py-4">
              <Icon v-if="row.view.active" name="check-circle" class="ml-2 text-green-500" />
              <Icon v-else name="times-circle" class="ml-2 text-red-500" />
            </td>
            <td class="px-3 py-4">
              <div :class="row.status !== PRODUCT_VIEW_STATUS.ADDED ? 'opacity-70 grayscale-[0.4]' : ''">
                <ProgressBar
                  :progress="getProgressProps(row).progress"
                  :label="getProgressProps(row).label"
                  :label-color="getProgressProps(row).labelColor"
                  :bar-color="getProgressProps(row).barColor"
                />
              </div>
            </td>
            <td class="px-3 py-4">
              <div class="flex items-center justify-end gap-4">
                <Button
                  :disabled="!row.assign?.remoteProduct?.id"
                  :title="!row.assign?.remoteProduct?.id ? t('products.products.websites.actions.availableOnlyWhenAdded') : ''"
                  @click="setInfoId(row.assign?.remoteProduct?.id ?? null, row.assign?.integrationType ?? null)"
                >
                  <Icon name="clipboard-list" size="lg" class="text-gray-500" />
                </Button>

                <ApolloMutation
                  :mutation="resyncSalesChannelViewAssignMutation"
                  :variables="{ data: { id: row.assign?.id } }"
                  @done="onResyncSuccess"
                  @error="onResyncError"
                >
                  <template #default="{ mutate, loading }">
                    <Button
                      :disabled="!row.assign || row.assign.remoteProductPercentage !== 100 || loading"
                      :title="!row.assign ? t('products.products.websites.actions.availableOnlyWhenAdded') : ''"
                      @click="mutate()"
                    >
                      <Icon name="clock-rotate-left" size="lg" class="text-gray-500" />
                    </Button>
                  </template>
                </ApolloMutation>

                <Link v-if="row.assign?.remoteUrl" :path="row.assign.remoteUrl" external>
                  <Icon class="text-gray-500" size="xl" name="eye" />
                </Link>
                <Button
                  v-else
                  :disabled="true"
                  :title="row.assign ? t('integrations.salesChannel.labels.noFrontendUrl') : t('products.products.websites.actions.availableOnlyWhenAdded')"
                >
                  <Icon class="text-gray-500" size="xl" name="eye" />
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <LogsInfoModal
      v-model="showInfoModal"
      :id="infoId"
      :integration-type="infoIntegrationType"
      :product-id="product.id"
      :product-sku="product.sku"
      @modal-closed="modalClosed()"
    />
  </div>
</template>
