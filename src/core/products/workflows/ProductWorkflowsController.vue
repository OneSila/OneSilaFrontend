<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import debounce from 'lodash.debounce';
import Swal from 'sweetalert2';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { VueDraggableNext } from 'vue-draggable-next';

import GeneralTemplate from '../../../shared/templates/GeneralTemplate.vue';
import { Breadcrumbs } from '../../../shared/components/molecules/breadcrumbs';
import { Card } from '../../../shared/components/atoms/card';
import { Button } from '../../../shared/components/atoms/button';
import { PrimaryButton } from '../../../shared/components/atoms/button-primary';
import { CancelButton } from '../../../shared/components/atoms/button-cancel';
import { Modal } from '../../../shared/components/atoms/modal';
import { Selector } from '../../../shared/components/atoms/selector';
import { Icon } from '../../../shared/components/atoms/icon';
import { Image } from '../../../shared/components/atoms/image';
import { Link } from '../../../shared/components/atoms/link';
import { Badge } from '../../../shared/components/atoms/badge';
import { LocalLoader } from '../../../shared/components/atoms/local-loader';
import { ApolloSubscription } from '../../../shared/components/molecules/apollo-subscription';
import { workflowAssignableProductsQuery, workflowBoardQuery } from '../../../shared/api/queries/workflows.js';
import { workflowSubscription } from '../../../shared/api/subscriptions/workflows.js';
import {
  createWorkflowProductAssignmentMutation,
  deleteWorkflowProductAssignmentMutation,
  updateWorkflowProductAssignmentMutation,
} from '../../../shared/api/mutations/workflows.js';
import apolloClient from '../../../../apollo-client';
import { processGraphQLErrors } from '../../../shared/utils';
import { Toast } from '../../../shared/modules/toast';
import { getProductTypeBadgeMap } from '../products/configs';

interface WorkflowStateNode {
  id: string;
  value: string;
  sortOrder: number;
  isDefault: boolean;
}

interface WorkflowProductNode {
  id: string;
  name: string | null;
  sku: string | null;
  type: string | null;
  active: boolean;
  createdAt: string | null;
  thumbnailUrl: string | null;
}

interface WorkflowAssignmentNode {
  id: string;
  workflowState: {
    id: string;
  } | null;
  product: WorkflowProductNode | null;
}

interface WorkflowSubscriptionNode {
  id: string;
  name: string;
  description: string | null;
  states: WorkflowStateNode[];
  productAssignments: WorkflowAssignmentNode[];
}

interface BoardAssignment {
  id: string;
  workflowStateId: string;
  product: WorkflowProductNode;
}

interface BoardColumn {
  id: string;
  value: string;
  isDefault: boolean;
  assignments: BoardAssignment[];
}

interface AssignableProductOption {
  id: string;
  label: string;
  thumbnailUrl: string | null;
}

const { t } = useI18n();
const route = useRoute();

const workflowLoading = ref(true);
const boardColumns = ref<BoardColumn[]>([]);
const selectedWorkflow = ref<WorkflowSubscriptionNode | null>(null);
const lastWorkflowSnapshot = ref<WorkflowSubscriptionNode | null>(null);
const apolloSubRef = ref<any>(null);
const showAddModal = ref(false);
const assignableProducts = ref<AssignableProductOption[]>([]);
const assignableProductId = ref<string | null>(null);
const assignableProductsLoading = ref(false);
const creatingAssignment = ref(false);
const mutatingAssignmentIds = ref<string[]>([]);
const clearingColumnId = ref<string | null>(null);

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    popup: 'sweet-alerts',
    confirmButton: 'btn btn-danger',
    cancelButton: 'btn btn-outline-primary ltr:mr-3 rtl:ml-3',
  },
  buttonsStyling: false,
});

const selectedWorkflowId = computed(() => {
  const rawId = route.params.id;
  if (!rawId) {
    return null;
  }

  return Array.isArray(rawId) ? rawId[0] : String(rawId);
});

const selectedWorkflowPk = computed(() => {
  if (!selectedWorkflowId.value) {
    return null;
  }

  try {
    const decoded = atob(selectedWorkflowId.value);
    const parts = decoded.split(':');
    return parts[parts.length - 1] || selectedWorkflowId.value;
  } catch {
    return selectedWorkflowId.value;
  }
});

const selectedWorkflowName = computed(() => selectedWorkflow.value?.name || '');
const defaultStateId = computed(() =>
  selectedWorkflow.value?.states?.find((state) => state.isDefault)?.id || null
);
const hasDefaultState = computed(() => !!defaultStateId.value);
const assignedProductIds = computed(() =>
  boardColumns.value.flatMap((column) => column.assignments.map((assignment) => assignment.product.id))
);
const productTypeBadgeMap = computed(() => getProductTypeBadgeMap(t));
const formatDate = (dateString?: string | null) => {
  if (!dateString) {
    return '—';
  }

  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const buildBoardColumns = (workflow: WorkflowSubscriptionNode) => {
  const sortedStates = [...(workflow.states || [])].sort(
    (left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0)
  );

  const assignmentsByStateId = new Map<string, BoardAssignment[]>();

  sortedStates.forEach((state) => {
    assignmentsByStateId.set(state.id, []);
  });

  (workflow.productAssignments || []).forEach((assignment) => {
    const stateId = assignment.workflowState?.id;
    const product = assignment.product;

    if (!stateId || !product || !assignmentsByStateId.has(stateId)) {
      return;
    }

    assignmentsByStateId.get(stateId)?.push({
      id: assignment.id,
      workflowStateId: stateId,
      product,
    });
  });

  boardColumns.value = sortedStates.map((state) => ({
    id: state.id,
    value: state.value,
    isDefault: !!state.isDefault,
    assignments: assignmentsByStateId.get(state.id) || [],
  }));
};

const handleWorkflowResultUpdated = (data: { workflow: WorkflowSubscriptionNode | null }) => {
  workflowLoading.value = false;

  if (!data?.workflow) {
    selectedWorkflow.value = null;
    lastWorkflowSnapshot.value = null;
    boardColumns.value = [];
    return;
  }

  selectedWorkflow.value = data.workflow;
  lastWorkflowSnapshot.value = data.workflow;
  buildBoardColumns(data.workflow);
};

const loadWorkflow = async () => {
  if (!selectedWorkflowId.value) {
    workflowLoading.value = false;
    selectedWorkflow.value = null;
    lastWorkflowSnapshot.value = null;
    boardColumns.value = [];
    return;
  }

  try {
    workflowLoading.value = true;
    const { data } = await apolloClient.query({
      query: workflowBoardQuery,
      variables: { id: selectedWorkflowId.value },
      fetchPolicy: 'network-only',
    });

    handleWorkflowResultUpdated({ workflow: data?.workflow ?? null });
  } catch (error) {
    workflowLoading.value = false;
    selectedWorkflow.value = null;
    lastWorkflowSnapshot.value = null;
    boardColumns.value = [];

    const validationErrors = processGraphQLErrors(error, t);
    Object.values(validationErrors).forEach((message) => Toast.error(String(message)));
  }
};

const fetchAssignableProducts = async (search = '') => {
  if (!selectedWorkflowId.value) {
    assignableProducts.value = [];
    return;
  }

  try {
    assignableProductsLoading.value = true;
    const filter: Record<string, any> = {};

    if (assignedProductIds.value.length) {
      filter.NOT = {
        id: {
          inList: assignedProductIds.value,
        },
      };
    }

    if (search.trim()) {
      filter.search = search.trim();
    }

    const { data } = await apolloClient.query({
      query: workflowAssignableProductsQuery,
      variables: {
        first: 50,
        filter,
        order: {
          name: 'ASC',
        },
      },
      fetchPolicy: 'network-only',
    });

    assignableProducts.value = data?.products?.edges?.map((edge: any) => {
      const product = edge.node;
      return {
        id: product.id,
        label: product.sku ? `${product.name} (${product.sku})` : product.name,
        thumbnailUrl: product.thumbnailUrl ?? null,
      };
    }) || [];
  } catch (error) {
    assignableProducts.value = [];
  } finally {
    assignableProductsLoading.value = false;
  }
};

const handleAssignableSearch = debounce(async (search: string, loading?: (state: boolean) => void) => {
  loading?.(true);
  await fetchAssignableProducts(search);
  loading?.(false);
}, 350);

const openAddModal = async () => {
  if (!hasDefaultState.value) {
    return;
  }

  showAddModal.value = true;
  assignableProductId.value = null;
  await fetchAssignableProducts();
};

const closeAddModal = () => {
  showAddModal.value = false;
  assignableProductId.value = null;
  assignableProducts.value = [];
};

const markAssignmentMutation = (assignmentId: string, active: boolean) => {
  if (active) {
    if (!mutatingAssignmentIds.value.includes(assignmentId)) {
      mutatingAssignmentIds.value = [...mutatingAssignmentIds.value, assignmentId];
    }
    return;
  }

  mutatingAssignmentIds.value = mutatingAssignmentIds.value.filter((id) => id !== assignmentId);
};

const createAssignment = async () => {
  if (!selectedWorkflowId.value || !defaultStateId.value || !assignableProductId.value || creatingAssignment.value) {
    return;
  }

  try {
    creatingAssignment.value = true;
    await apolloClient.mutate({
      mutation: createWorkflowProductAssignmentMutation,
      variables: {
        data: {
          workflow: { id: selectedWorkflowId.value },
          workflowState: { id: defaultStateId.value },
          product: { id: assignableProductId.value },
        },
      },
    });

    Toast.success(t('products.workflows.messages.assignmentCreated'));
    await loadWorkflow();
    apolloSubRef.value?.refresh?.();
    closeAddModal();
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    const messages = Object.values(validationErrors);
    if (messages.length) {
      messages.forEach((message) => Toast.error(String(message)));
    } else {
      Toast.error(t('products.workflows.messages.assignmentCreateError'));
    }
  } finally {
    creatingAssignment.value = false;
  }
};

const deleteAssignment = async (assignment: BoardAssignment) => {
  const result = await swalWithBootstrapButtons.fire({
    title: t('products.workflows.messages.removeAssignmentTitle'),
    text: t('products.workflows.messages.removeAssignmentText', {
      name: assignment.product.name || assignment.product.sku || assignment.product.id,
    }),
    confirmButtonText: t('products.workflows.messages.removeAssignmentConfirm'),
    cancelButtonText: t('products.workflows.messages.removeAssignmentCancel'),
    icon: 'warning',
    showCancelButton: true,
    reverseButtons: true,
    padding: '2em',
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    markAssignmentMutation(assignment.id, true);
    await apolloClient.mutate({
      mutation: deleteWorkflowProductAssignmentMutation,
      variables: {
        id: assignment.id,
      },
    });

    Toast.success(t('products.workflows.messages.assignmentDeleted'));
    await loadWorkflow();
    apolloSubRef.value?.refresh?.();
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    const messages = Object.values(validationErrors);
    if (messages.length) {
      messages.forEach((message) => Toast.error(String(message)));
    } else {
      Toast.error(t('products.workflows.messages.assignmentDeleteError'));
    }
  } finally {
    markAssignmentMutation(assignment.id, false);
  }
};

const clearColumnAssignments = async (column: BoardColumn) => {
  if (!column.assignments.length || clearingColumnId.value) {
    return;
  }

  const result = await swalWithBootstrapButtons.fire({
    title: t('products.workflows.messages.clearColumnTitle'),
    text: t('products.workflows.messages.clearColumnText', {
      state: column.value,
      count: column.assignments.length,
    }),
    confirmButtonText: t('products.workflows.messages.clearColumnConfirm'),
    cancelButtonText: t('products.workflows.messages.clearColumnCancel'),
    icon: 'warning',
    showCancelButton: true,
    reverseButtons: true,
    padding: '2em',
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    clearingColumnId.value = column.id;
    const assignmentIds = column.assignments.map((assignment) => assignment.id);
    mutatingAssignmentIds.value = [...new Set([...mutatingAssignmentIds.value, ...assignmentIds])];

    await Promise.all(
      assignmentIds.map((id) =>
        apolloClient.mutate({
          mutation: deleteWorkflowProductAssignmentMutation,
          variables: { id },
        })
      )
    );

    Toast.success(t('products.workflows.messages.columnCleared'));
    await loadWorkflow();
    apolloSubRef.value?.refresh?.();
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    const messages = Object.values(validationErrors);
    if (messages.length) {
      messages.forEach((message) => Toast.error(String(message)));
    } else {
      Toast.error(t('products.workflows.messages.columnClearError'));
    }
  } finally {
    clearingColumnId.value = null;
    mutatingAssignmentIds.value = mutatingAssignmentIds.value.filter((id) => !column.assignments.some((assignment) => assignment.id === id));
  }
};

const updateAssignmentState = async (assignment: BoardAssignment, stateId: string) => {
  const previousWorkflow = lastWorkflowSnapshot.value;
  const previousStateId = assignment.workflowStateId;

  if (!stateId || previousStateId === stateId) {
    return;
  }

  try {
    markAssignmentMutation(assignment.id, true);
    assignment.workflowStateId = stateId;
    await apolloClient.mutate({
      mutation: updateWorkflowProductAssignmentMutation,
      variables: {
        data: {
          id: assignment.id,
          workflowState: { id: stateId },
        },
      },
    });
    await loadWorkflow();
    apolloSubRef.value?.refresh?.();
  } catch (error) {
    assignment.workflowStateId = previousStateId;
    if (previousWorkflow) {
      buildBoardColumns(previousWorkflow);
    }

    const validationErrors = processGraphQLErrors(error, t);
    const messages = Object.values(validationErrors);
    if (messages.length) {
      messages.forEach((message) => Toast.error(String(message)));
    } else {
      Toast.error(t('products.workflows.messages.assignmentUpdateError'));
    }
  } finally {
    markAssignmentMutation(assignment.id, false);
  }
};

const handleColumnChange = async (stateId: string, event: any) => {
  const assignment = event?.added?.element as BoardAssignment | undefined;
  if (!assignment) {
    return;
  }

  await updateAssignmentState(assignment, stateId);
};

const isAssignmentMutating = (assignmentId: string) => mutatingAssignmentIds.value.includes(assignmentId);

watch(selectedWorkflowId, () => {
  workflowLoading.value = !!selectedWorkflowId.value;
  selectedWorkflow.value = null;
  lastWorkflowSnapshot.value = null;
  boardColumns.value = [];
  assignableProductId.value = null;
  closeAddModal();
  loadWorkflow();
}, { immediate: true });
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'workflows.list' }, name: t('products.workflows.title') },
          ...(selectedWorkflowName ? [{ path: { name: 'workflows.kanban', params: { id: selectedWorkflowId } }, name: selectedWorkflowName }] : []),
        ]"
      />
    </template>

    <template #content>
      <Card>
        <div v-if="!selectedWorkflowId" class="flex min-h-[360px] items-center justify-center text-sm text-gray-500">
          {{ t('products.workflows.empty.noWorkflowSelected') }}
        </div>

        <ApolloSubscription
          v-else
          :key="selectedWorkflowId"
          ref="apolloSubRef"
          :subscription="workflowSubscription"
          :variables="{ pk: selectedWorkflowPk }"
          @result-updated="handleWorkflowResultUpdated"
        >
          <template #default="{ loading }">
            <div v-if="(workflowLoading || loading) && !selectedWorkflow" class="flex min-h-[360px] items-center justify-center">
              <LocalLoader :loading="true" />
            </div>

            <template v-else-if="selectedWorkflow">
              <div class="flex flex-col gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 class="text-2xl font-semibold text-gray-900">
                    {{ selectedWorkflow.name }}
                  </h1>
                  <p v-if="selectedWorkflow.description" class="mt-2 max-w-4xl text-sm leading-6 text-gray-500">
                    {{ selectedWorkflow.description }}
                  </p>
                  <p v-if="!hasDefaultState" class="mt-2 text-sm text-amber-600">
                    {{ t('products.workflows.messages.noDefaultState') }}
                  </p>
                </div>
                <PrimaryButton
                  :disabled="!hasDefaultState"
                  @click="openAddModal"
                >
                  <span class="inline-flex items-center gap-2 text-sm">
                    <Icon name="plus" />
                    {{ t('products.workflows.buttons.addProduct') }}
                  </span>
                </PrimaryButton>
              </div>

              <div class="mt-4 overflow-x-auto pb-1">
                <div class="flex min-w-max items-start gap-2.5">
                  <div
                    v-for="column in boardColumns"
                    :key="column.id"
                    class="flex w-[320px] shrink-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50 md:w-[360px] xl:w-[390px]"
                  >
                    <div class="flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-2.5">
                      <div class="min-w-0">
                        <div class="truncate text-base font-semibold text-gray-900">
                          {{ column.value }}
                        </div>
                      </div>
                      <div class="flex shrink-0 items-center gap-1.5">
                        <Button
                          v-if="column.assignments.length"
                          :disabled="clearingColumnId === column.id"
                          custom-class="h-7 w-7 rounded-full bg-amber-100 p-0 text-amber-700 hover:bg-amber-200 disabled:opacity-50"
                          @click="clearColumnAssignments(column)"
                        >
                          <Icon name="broom" size="xs" />
                        </Button>
                        <span class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {{ column.assignments.length }}
                        </span>
                        <span
                          v-if="column.isDefault"
                          class="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                        >
                          {{ t('products.workflows.labels.defaultState') }}
                        </span>
                      </div>
                    </div>

                    <VueDraggableNext
                      tag="div"
                      :list="column.assignments"
                      group="workflow-kanban"
                      :animation="150"
                      :scroll="true"
                      :scroll-sensitivity="120"
                      class="kanban-column flex max-h-[calc(100vh-240px)] min-h-[420px] flex-1 flex-col gap-2 overflow-y-auto p-2"
                      @change="handleColumnChange(column.id, $event)"
                    >
                      <div
                        v-for="element in column.assignments"
                        :key="element.id"
                        class="relative cursor-grab rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm transition hover:border-primary/40 hover:shadow"
                        :class="{ 'opacity-60': isAssignmentMutating(element.id) }"
                      >
                        <Button
                          :disabled="isAssignmentMutating(element.id)"
                          custom-class="absolute right-2 top-2 h-5 w-5 rounded-full bg-red-500 p-0 text-white hover:bg-red-600"
                          @click="deleteAssignment(element)"
                        >
                          <Icon name="circle-xmark" size="xs" />
                        </Button>

                        <div class="flex min-h-[96px] flex-col gap-2 pr-5">
                          <div class="flex items-start gap-2.5">
                            <div class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                              <Image
                                v-if="element.product.thumbnailUrl"
                                :source="element.product.thumbnailUrl"
                                :alt="element.product.name || element.product.sku || t('shared.labels.product')"
                                class="h-14 w-14 rounded-md object-cover"
                              />
                              <Icon
                                v-else
                                name="box"
                                class="text-base text-gray-400"
                              />
                            </div>
                            <div class="min-w-0 flex-1">
                              <div class="text-sm font-semibold leading-5 text-gray-900 line-clamp-2">
                                {{ element.product.name || t('products.workflows.labels.untitledProduct') }}
                              </div>
                              <div class="mt-1">
                                <Link
                                  v-if="element.product.sku"
                                  :path="{ name: 'products.products.show', params: { id: element.product.id } }"
                                  class="text-sm font-medium text-primary hover:underline"
                                >
                                  {{ element.product.sku }}
                                </Link>
                                <div v-else class="text-sm text-gray-500">
                                  —
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="flex items-center justify-between gap-2 text-xs text-gray-400">
                            <div class="inline-flex items-center gap-2">
                              <div class="inline-flex items-center gap-1">
                                <span>{{ t('shared.labels.active') }}:</span>
                                <Icon
                                  v-if="element.product.active"
                                  name="check-circle"
                                  class="text-green-500"
                                />
                                <Icon
                                  v-else
                                  name="times-circle"
                                  class="text-red-500"
                                />
                              </div>
                              <Badge
                                v-if="element.product.type && productTypeBadgeMap[element.product.type]"
                                :text="productTypeBadgeMap[element.product.type].text"
                                :color="productTypeBadgeMap[element.product.type].color"
                              />
                            </div>
                            <div class="text-right">
                              {{ formatDate(element.product.createdAt) }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </VueDraggableNext>

                    <div
                      v-if="!column.assignments.length"
                      class="px-2 pb-2 text-sm text-gray-400"
                    >
                      {{ t('products.workflows.empty.noProductsInState') }}
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <div
              v-else
              class="flex min-h-[360px] items-center justify-center text-sm text-gray-500"
            >
              {{ t('products.workflows.empty.noWorkflowSelected') }}
            </div>
          </template>
        </ApolloSubscription>
      </Card>
    </template>
  </GeneralTemplate>

  <Modal v-model="showAddModal" @closed="closeAddModal">
    <div class="w-full max-w-2xl rounded-2xl bg-white p-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">
          {{ t('products.workflows.modals.addProduct.title') }}
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ t('products.workflows.modals.addProduct.description') }}
        </p>
      </div>

      <div class="mt-5">
        <label class="mb-2 block text-sm font-medium text-gray-900">
          {{ t('shared.labels.product') }}
        </label>
        <Selector
          v-model="assignableProductId"
          :options="assignableProducts"
          label-by="label"
          value-by="id"
          :placeholder="t('products.workflows.modals.addProduct.placeholder')"
          :filterable="true"
          :removable="false"
          :is-loading="assignableProductsLoading"
          @searched="handleAssignableSearch"
        />
        <p v-if="!assignableProductsLoading && !assignableProducts.length" class="mt-2 text-sm text-gray-500">
          {{ t('products.workflows.modals.addProduct.empty') }}
        </p>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <CancelButton @click="closeAddModal">
          {{ t('shared.button.cancel') }}
        </CancelButton>
        <PrimaryButton :loading="creatingAssignment" :disabled="!assignableProductId" @click="createAssignment">
          {{ t('products.workflows.buttons.addProduct') }}
        </PrimaryButton>
      </div>
    </div>
  </Modal>
</template>
