<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';

import GeneralTemplate from '../../../../shared/templates/GeneralTemplate.vue';
import { Breadcrumbs } from '../../../../shared/components/molecules/breadcrumbs';
import { Card } from '../../../../shared/components/atoms/card';
import { productSubscription } from '../../../../shared/api/subscriptions/products.js';
import { ApolloSubscription } from '../../../../shared/components/molecules/apollo-subscription';
import { Icon } from '../../../../shared/components/atoms/icon';
import { Label } from '../../../../shared/components/atoms/label';
import { ProductType } from '../../../../shared/utils/constants';
import { deleteProductMutation, duplicateProductMutation } from '../../../../shared/api/mutations/products.js';
import { Button } from '../../../../shared/components/atoms/button';
import { PrimaryButton } from '../../../../shared/components/atoms/button-primary';
import { CancelButton } from '../../../../shared/components/atoms/button-cancel';
import { Modal } from '../../../../shared/components/atoms/modal';
import { Selector } from '../../../../shared/components/atoms/selector';
import { ApolloAlertMutation } from '../../../../shared/components/molecules/apollo-alert-mutation';
import { Badge } from '../../../../shared/components/atoms/badge';
import { Image } from '../../../../shared/components/atoms/image';
import { Link } from '../../../../shared/components/atoms/link';
import { Loader } from '../../../../shared/components/atoms/loader';
import ProductBundle from './containers/product-type/product-bundle/ProductBundle.vue';
import ProductConfigurable from './containers/product-type/product-configurable/ProductConfigurable.vue';
import ProductVariation from './containers/product-type/product-variation/ProductVariation.vue';
import { processGraphQLErrors, shortenText } from '../../../../shared/utils/index';

import { getProductTypeBadgeMap, ProductWithAliasFields } from '../configs';
import { ProductInspector } from './containers/product-inspector';
import apolloClient from '../../../../../apollo-client';
import { DuplicateProductModal } from './containers/duplicate-product-modal';
import { Toast } from '../../../../shared/modules/toast';
import { workflowAssignmentOptionsQuery } from '../../../../shared/api/queries/workflows.js';
import {
  createWorkflowProductAssignmentMutation,
  deleteWorkflowProductAssignmentMutation,
  updateWorkflowProductAssignmentMutation,
} from '../../../../shared/api/mutations/workflows.js';

interface ProductWorkflowState {
  id: string;
  value: string;
  sortOrder: number;
  isDefault: boolean;
}

interface ProductWorkflow {
  id: string;
  name: string;
  states: ProductWorkflowState[];
}

interface ProductWorkflowAssignment {
  id: string;
  workflow: ProductWorkflow | null;
  workflowState: ProductWorkflowState | null;
}

interface ProductSubscriptionProduct {
  id: string;
  name: string;
  sku: string;
  thumbnailUrl: string | null;
  hasParents: boolean;
  aliasParentProduct: {
    id: string;
    name: string;
    sku: string;
    type: string;
  } | null;
  vatRate: {
    name: string;
  } | null;
  type: string;
  active: boolean;
  allowBackorder: boolean;
  workflowproductassignmentSet: ProductWorkflowAssignment[];
}

interface ProductSubscriptionResult {
  product: ProductSubscriptionProduct;
}

interface WorkflowAssignmentOption {
  id: string;
  name: string;
  states: ProductWorkflowState[];
}

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(String(route.params.id));
const apolloSubRef = ref<any>(null);
const currentProduct = ref<ProductSubscriptionProduct | null>(null);
const showDuplicateModal = ref(false);
const isConfigurableProduct = ref(false);
const showWorkflowModal = ref(false);
const workflowOptionsLoading = ref(false);
const hasLoadedWorkflowOptions = ref(false);
const workflowOptions = ref<WorkflowAssignmentOption[]>([]);
const selectedWorkflowOptionId = ref<string | null>(null);
const selectedWorkflowStateId = ref<string | null>(null);
const creatingWorkflowAssignment = ref(false);
const mutatingWorkflowAssignmentIds = ref<string[]>([]);

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    popup: 'sweet-alerts',
    confirmButton: 'btn btn-danger',
    cancelButton: 'btn btn-outline-primary ltr:mr-3 rtl:ml-3',
  },
  buttonsStyling: false,
});

const productWorkflowAssignments = computed(() =>
  [...(currentProduct.value?.workflowproductassignmentSet || [])].sort((left, right) =>
    (left.workflow?.name || '').localeCompare(right.workflow?.name || '')
  )
);

const assignedWorkflowIds = computed(() =>
  productWorkflowAssignments.value.map((assignment) => assignment.workflow?.id).filter(Boolean)
);

const getSortedWorkflowStates = (workflow: WorkflowAssignmentOption | ProductWorkflow | null | undefined) => {
  if (!workflow?.states?.length) {
    return [];
  }

  return [...workflow.states].sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
};

const getDefaultState = (workflow: WorkflowAssignmentOption | ProductWorkflow | null | undefined) => {
  return getSortedWorkflowStates(workflow).find((state) => state.isDefault) || null;
};

const availableWorkflowOptions = computed(() =>
  workflowOptions.value
    .filter((workflow) => !assignedWorkflowIds.value.includes(workflow.id))
    .map((workflow) => ({
      id: workflow.id,
      label: workflow.name,
    }))
);

const showWorkflowCard = computed(() => {
  if (!hasLoadedWorkflowOptions.value) {
    return true;
  }

  return workflowOptions.value.length > 0 || productWorkflowAssignments.value.length > 0;
});

const topSectionGridClass = computed(() =>
  showWorkflowCard.value ? 'mb-6 grid grid-cols-1 gap-6 xl:grid-cols-10' : 'mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2'
);

const productCardClass = computed(() =>
  showWorkflowCard.value ? 'order-2 xl:order-1 xl:col-span-4 xl:h-[290px]' : 'order-1 xl:h-[290px]'
);

const inspectorCardClass = computed(() =>
  showWorkflowCard.value ? 'order-3 xl:order-2 xl:col-span-4 xl:h-[290px] [&>div]:h-full' : 'order-2 xl:h-[290px] [&>div]:h-full'
);

const workflowCardClass = computed(() => 'order-1 xl:order-3 xl:col-span-2 xl:h-[290px]');

const selectedWorkflowOption = computed(() =>
  workflowOptions.value.find((workflow) => workflow.id === selectedWorkflowOptionId.value) || null
);

const handleResultUpdated = (data: ProductSubscriptionResult) => {
  currentProduct.value = data.product;
  isConfigurableProduct.value = data.product.type === ProductType.Configurable;
  void ensureWorkflowOptionsLoaded();
};

const getResultData = (
  result: ProductSubscriptionResult,
  field: string | null = null,
  vatRateField: string | null = null,
  aliasParentProductField: string | null = null
) => {
  const product = result.product;

  if (vatRateField !== null) {
    return product.vatRate ? product.vatRate[vatRateField] : null;
  }

  if (aliasParentProductField !== null) {
    return product.aliasParentProduct ? product.aliasParentProduct[aliasParentProductField] : null;
  }

  if (field === null) {
    return product;
  }

  return product[field];
};

const getProductComponent = (type, aliasParentProduct: ProductWithAliasFields | null = null) => {
  if (type == ProductType.Alias && aliasParentProduct) {
    type = aliasParentProduct.type;
  }

  if (type == ProductType.Bundle) {
    return ProductBundle;
  }
  if (type == ProductType.Configurable) {
    return ProductConfigurable;
  }
  if (type == ProductType.Simple) {
    return ProductVariation;
  }
};

const getWorkflowStateOptions = (workflow: ProductWorkflow | null | undefined) => {
  if (!workflow?.states?.length) {
    return [];
  }

  return [...workflow.states]
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
    .map((state) => ({
      id: state.id,
      label: state.value,
    }));
};

const markWorkflowAssignmentMutation = (assignmentId: string, active: boolean) => {
  if (active) {
    if (!mutatingWorkflowAssignmentIds.value.includes(assignmentId)) {
      mutatingWorkflowAssignmentIds.value = [...mutatingWorkflowAssignmentIds.value, assignmentId];
    }
    return;
  }

  mutatingWorkflowAssignmentIds.value = mutatingWorkflowAssignmentIds.value.filter((id) => id !== assignmentId);
};

const isWorkflowAssignmentMutating = (assignmentId: string) =>
  mutatingWorkflowAssignmentIds.value.includes(assignmentId);

const refreshProductWorkflowData = async () => {
  apolloSubRef.value?.refresh?.();
};

const setLocalWorkflowAssignments = (assignments: ProductWorkflowAssignment[]) => {
  if (!currentProduct.value) {
    return;
  }

  currentProduct.value = {
    ...currentProduct.value,
    workflowproductassignmentSet: assignments,
  };
};

const loadWorkflowOptions = async () => {
  try {
    workflowOptionsLoading.value = true;
    const { data } = await apolloClient.query({
      query: workflowAssignmentOptionsQuery,
      variables: {
        first: 100,
        order: {
          sortOrder: 'ASC',
        },
      },
      fetchPolicy: 'network-only',
    });

    workflowOptions.value = data?.workflows?.edges?.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      states: edge.node.states || [],
    })) || [];
  } catch (error) {
    workflowOptions.value = [];
  } finally {
    hasLoadedWorkflowOptions.value = true;
    workflowOptionsLoading.value = false;
  }
};

const ensureWorkflowOptionsLoaded = async () => {
  if (workflowOptionsLoading.value || hasLoadedWorkflowOptions.value) {
    return;
  }

  await loadWorkflowOptions();
};

const openWorkflowModal = async () => {
  await ensureWorkflowOptionsLoaded();
  selectedWorkflowOptionId.value = null;
  selectedWorkflowStateId.value = null;
  showWorkflowModal.value = true;
};

const closeWorkflowModal = () => {
  showWorkflowModal.value = false;
  selectedWorkflowOptionId.value = null;
  selectedWorkflowStateId.value = null;
};

const updateSelectedWorkflowOption = (workflowId: string | null) => {
  selectedWorkflowOptionId.value = workflowId;
  const workflow = workflowOptions.value.find((entry) => entry.id === workflowId);
  const defaultState = getDefaultState(workflow);
  selectedWorkflowStateId.value = defaultState?.id || getSortedWorkflowStates(workflow)[0]?.id || null;
};

const createWorkflowAssignment = async () => {
  if (!currentProduct.value || !selectedWorkflowOptionId.value || !selectedWorkflowStateId.value || creatingWorkflowAssignment.value) {
    return;
  }

  const workflow = workflowOptions.value.find((entry) => entry.id === selectedWorkflowOptionId.value);
  const state = workflow?.states.find((entry) => entry.id === selectedWorkflowStateId.value) || null;

  if (!workflow || !state) {
    Toast.error(t('products.products.workflowCard.messages.addError'));
    return;
  }

  try {
    creatingWorkflowAssignment.value = true;
    const { data } = await apolloClient.mutate({
      mutation: createWorkflowProductAssignmentMutation,
      variables: {
        data: {
          workflow: { id: workflow.id },
          workflowState: { id: state.id },
          product: { id: currentProduct.value.id },
        },
      },
    });

    const assignmentId = data?.createWorkflowProductAssignment?.id;
    if (assignmentId) {
      setLocalWorkflowAssignments([
        ...(currentProduct.value.workflowproductassignmentSet || []),
        {
          id: assignmentId,
          workflow: {
            id: workflow.id,
            name: workflow.name,
            states: workflow.states,
          },
          workflowState: state,
        },
      ]);
    }

    Toast.success(t('products.products.workflowCard.messages.added'));
    closeWorkflowModal();
    await refreshProductWorkflowData();
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    const messages = Object.values(validationErrors);
    if (messages.length) {
      messages.forEach((message) => Toast.error(String(message)));
    } else {
      Toast.error(t('products.products.workflowCard.messages.addError'));
    }
  } finally {
    creatingWorkflowAssignment.value = false;
  }
};

const updateWorkflowAssignmentState = async (assignment: ProductWorkflowAssignment, workflowStateId: string) => {
  if (!assignment.workflow || !workflowStateId || assignment.workflowState?.id === workflowStateId || isWorkflowAssignmentMutating(assignment.id)) {
    return;
  }

  const nextState = assignment.workflow.states.find((state) => state.id === workflowStateId);
  if (!nextState || !currentProduct.value) {
    return;
  }

  const previousAssignments = [...currentProduct.value.workflowproductassignmentSet];
  setLocalWorkflowAssignments(
    currentProduct.value.workflowproductassignmentSet.map((entry) =>
      entry.id === assignment.id
        ? {
            ...entry,
            workflowState: nextState,
          }
        : entry
    )
  );

  try {
    markWorkflowAssignmentMutation(assignment.id, true);
    await apolloClient.mutate({
      mutation: updateWorkflowProductAssignmentMutation,
      variables: {
        data: {
          id: assignment.id,
          workflowState: { id: workflowStateId },
        },
      },
    });

    Toast.success(t('products.products.workflowCard.messages.updated'));
    await refreshProductWorkflowData();
  } catch (error) {
    setLocalWorkflowAssignments(previousAssignments);
    const validationErrors = processGraphQLErrors(error, t);
    const messages = Object.values(validationErrors);
    if (messages.length) {
      messages.forEach((message) => Toast.error(String(message)));
    } else {
      Toast.error(t('products.products.workflowCard.messages.updateError'));
    }
  } finally {
    markWorkflowAssignmentMutation(assignment.id, false);
  }
};

const deleteWorkflowAssignment = async (assignment: ProductWorkflowAssignment) => {
  if (!currentProduct.value || isWorkflowAssignmentMutating(assignment.id)) {
    return;
  }

  const result = await swalWithBootstrapButtons.fire({
    title: t('products.products.workflowCard.messages.removeTitle'),
    text: t('products.products.workflowCard.messages.removeText', {
      workflow: assignment.workflow?.name || t('products.products.workflowCard.title'),
    }),
    confirmButtonText: t('products.products.workflowCard.messages.removeConfirm'),
    cancelButtonText: t('products.products.workflowCard.messages.removeCancel'),
    icon: 'warning',
    showCancelButton: true,
    reverseButtons: true,
    padding: '2em',
  });

  if (!result.isConfirmed) {
    return;
  }

  const previousAssignments = [...currentProduct.value.workflowproductassignmentSet];
  setLocalWorkflowAssignments(currentProduct.value.workflowproductassignmentSet.filter((entry) => entry.id !== assignment.id));

  try {
    markWorkflowAssignmentMutation(assignment.id, true);
    await apolloClient.mutate({
      mutation: deleteWorkflowProductAssignmentMutation,
      variables: { id: assignment.id },
    });

    Toast.success(t('products.products.workflowCard.messages.removed'));
    await refreshProductWorkflowData();
  } catch (error) {
    setLocalWorkflowAssignments(previousAssignments);
    const validationErrors = processGraphQLErrors(error, t);
    const messages = Object.values(validationErrors);
    if (messages.length) {
      messages.forEach((message) => Toast.error(String(message)));
    } else {
      Toast.error(t('products.products.workflowCard.messages.removeError'));
    }
  } finally {
    markWorkflowAssignmentMutation(assignment.id, false);
  }
};

const redirectToList = (response) => {
  if (response.data.deleteProduct) {
    router.push({ name: 'products.products.list' });
  }
};

const handleDuplicate = async (sku: string | null, createAsAlias: boolean, createRelationships: boolean) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: duplicateProductMutation,
      variables: { product: { id: id.value }, sku, createAsAlias, createRelationships },
    });

    if (data && data.duplicateProduct) {
      Toast.success(t('products.products.duplicateSuccessfully'));
      router.push({ name: 'products.products.show', params: { id: data.duplicateProduct.id } });
    }
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    const generalError = (validationErrors as Record<string, string>).__all__;
    if (generalError) {
      Toast.error(generalError);
    }
  }
};

const copySkuToClipboard = async (sku: string) => {
  try {
    await navigator.clipboard.writeText(sku);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (err) {
    console.error('Failed to copy:', err);
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
};
</script>

<template>
  <div>
    <GeneralTemplate>
      <template #breadcrumbs>
        <Breadcrumbs
          :links="[
            { path: { name: 'products.products.list' }, name: t('products.title') },
            { path: { name: 'products.products.show', params: { id } }, name: t('products.products.show.title') },
          ]"
        />
      </template>

      <template #content>
        <ApolloSubscription
          ref="apolloSubRef"
          :subscription="productSubscription"
          :variables="{ pk: id }"
          @result-updated="handleResultUpdated"
        >
          <template #default="{ loading, result }">
            <Loader :loading="loading" />
            <template v-if="!loading && result">
              <Card>
                <div :class="topSectionGridClass">
                  <div :class="productCardClass">
                    <div class="h-full w-full rounded-lg border border-[#e0e6ed] bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
                      <div class="flex flex-col items-center p-5 text-left sm:flex-row sm:items-center">
                        <Link
                          v-if="getResultData(result, 'thumbnailUrl')"
                          :path="{ name: 'products.products.show', params: { id }, query: { ...route.query, tab: 'media' } }"
                        >
                          <div class="mb-5 h-20 w-20">
                            <Image class="h-20 w-20 rounded-md object-contain" :source="getResultData(result, 'thumbnailUrl')" />
                          </div>
                        </Link>
                        <div v-else class="mb-5 flex h-20 w-20 items-center justify-center rounded-md bg-gray-300">
                          <Icon class="text-white" size="xl" name="question" />
                        </div>
                        <div class="flex-1 text-left ltr:sm:pl-5 rtl:sm:pr-5">
                          <h5 class="mb-2 text-[15px] text-xl font-semibold text-[#3b3f5c] dark:text-white-light" :title="getResultData(result, 'name')">
                            {{ shortenText(getResultData(result, 'name'), 64) }}
                          </h5>
                          <Flex>
                            <Label semi-bold>{{ t('shared.labels.sku') }}:</Label>
                            <p class="text-white-dark">{{ getResultData(result, 'sku') }}</p>
                            <Button class="ml-1" @click="copySkuToClipboard(getResultData(result, 'sku'))">
                              <Icon name="clipboard" class="h-4 w-4 text-gray-500" aria-hidden="true" />
                            </Button>
                          </Flex>
                          <Flex v-if="getResultData(result, null, 'name')">
                            <Label semi-bold>{{ t('products.products.labels.vatRate') }}:</Label>
                            <p class="text-white-dark">{{ getResultData(result, null, 'name') }}</p>
                          </Flex>
                          <Flex>
                            <FlexCell>
                              <Label semi-bold>{{ t('products.products.labels.type.title') }}:</Label>
                            </FlexCell>
                            <FlexCell>
                              <Flex>
                                <FlexCell>
                                  <Badge
                                    :text="getProductTypeBadgeMap(t)[getResultData(result, 'type')].text"
                                    :color="getProductTypeBadgeMap(t)[getResultData(result, 'type')].color"
                                  />
                                </FlexCell>
                                <FlexCell v-if="getResultData(result, 'type') == ProductType.Alias">
                                  /
                                  <Badge
                                    :text="getProductTypeBadgeMap(t)[getResultData(result, 'type', null, 'type')].text"
                                    :color="getProductTypeBadgeMap(t)[getResultData(result, 'type', null, 'type')].color"
                                  />
                                </FlexCell>
                              </Flex>
                            </FlexCell>
                          </Flex>
                          <Flex class="gap-2 flex-col sm:flex-row">
                            <FlexCell>
                              <Label semi-bold>{{ t('shared.labels.active') }}:</Label>
                              <Icon v-if="getResultData(result, 'active')" name="check-circle" class="ml-1 text-green-500" />
                              <Icon v-else name="times-circle" class="ml-1 text-red-500" />
                            </FlexCell>
                            <FlexCell v-if="getResultData(result, 'type') == ProductType.Simple || getResultData(result, 'type', null, 'type') == ProductType.Simple">
                              <Flex>
                                <FlexCell>
                                  <Label semi-bold>{{ t('products.products.labels.allowBackorder') }}:</Label>
                                </FlexCell>
                                <FlexCell>
                                  <Icon v-if="getResultData(result, 'allowBackorder')" name="check-circle" class="ml-1 text-green-500" />
                                  <Icon v-else name="times-circle" class="ml-1 text-red-500" />
                                </FlexCell>
                              </Flex>
                            </FlexCell>
                          </Flex>

                          <Flex>
                            <FlexCell v-if="getResultData(result, 'type') == ProductType.Alias">
                              <Flex>
                                <FlexCell>
                                  <Label semi-bold>{{ t('products.products.labels.aliasParentProduct') }}:</Label>
                                </FlexCell>
                                <FlexCell>
                                  <Link :path="{ name: 'products.products.show', params: { id: getResultData(result, 'id', null, 'id') } }" :title="getResultData(result, 'name', null, 'name')">
                                    {{ shortenText(getResultData(result, 'name', null, 'name'), 64) }}
                                  </Link>
                                </FlexCell>
                              </Flex>
                            </FlexCell>
                          </Flex>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div :class="inspectorCardClass">
                    <ProductInspector :product="getResultData(result)" />
                  </div>

                  <div v-if="showWorkflowCard" :class="workflowCardClass">
                    <div class="flex h-full flex-col rounded-lg border border-[#e0e6ed] bg-white p-4 shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
                      <div class="flex items-center justify-between gap-3">
                        <h3 class="text-base font-semibold text-[#3b3f5c] dark:text-white-light">
                          {{ t('products.products.workflowCard.title') }}
                        </h3>
                        <Button
                          v-if="availableWorkflowOptions.length"
                          class="btn btn-sm btn-outline-primary h-8 px-2.5 py-1.5"
                          @click="openWorkflowModal"
                        >
                          <Icon name="plus" size="sm" />
                        </Button>
                      </div>

                      <div class="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
                        <div
                          v-for="assignment in productWorkflowAssignments"
                          :key="assignment.id"
                          class="rounded-lg border border-gray-200 p-2.5"
                          :class="{ 'opacity-60': isWorkflowAssignmentMutating(assignment.id) }"
                        >
                          <div class="flex items-start justify-between gap-2">
                            <div class="min-w-0 flex-1">
                              <div class="truncate text-sm font-semibold text-[#3b3f5c] dark:text-white-light">
                                {{ assignment.workflow?.name || '—' }}
                              </div>
                            </div>
                            <button
                              type="button"
                              class="shrink-0 p-0 text-red-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                              :disabled="isWorkflowAssignmentMutating(assignment.id)"
                              @click="deleteWorkflowAssignment(assignment)"
                            >
                              <Icon name="circle-xmark" size="lg" />
                            </button>
                          </div>

                          <div class="mt-2">
                            <Selector
                              class="text-sm"
                              :model-value="assignment.workflowState?.id || null"
                              :options="getWorkflowStateOptions(assignment.workflow)"
                              label-by="label"
                              value-by="id"
                              :placeholder="t('products.products.workflowCard.placeholders.state')"
                              :removable="false"
                              @update:model-value="(value) => updateWorkflowAssignmentState(assignment, value)"
                            />
                          </div>
                        </div>

                        <div
                          v-if="!productWorkflowAssignments.length"
                          class="rounded-lg border border-dashed border-gray-300 px-3 py-5 text-sm text-gray-500"
                        >
                          {{ t('products.products.workflowCard.empty.noAssignments') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Flex gap="2" between>
                  <FlexCell grow></FlexCell>
                  <FlexCell>
                    <Button class="btn btn-sm btn-outline-primary" @click="showDuplicateModal = true">
                      {{ t('shared.button.duplicate') }}
                    </Button>
                  </FlexCell>
                  <FlexCell>
                    <ApolloAlertMutation :mutation="deleteProductMutation" :mutation-variables="{ id }" @done="redirectToList">
                      <template #default="{ loading: mutationLoading, confirmAndMutate }">
                        <Button :disabled="mutationLoading" class="btn btn-sm btn-outline-danger" @click="confirmAndMutate">
                          {{ t('shared.button.delete') }}
                        </Button>
                      </template>
                    </ApolloAlertMutation>
                  </FlexCell>
                </Flex>
                <component
                  :is="getProductComponent(getResultData(result, 'type'), getResultData(result, 'aliasParentProduct'))"
                  :key="getResultData(result, 'type')"
                  :product="getResultData(result)"
                />
              </Card>
            </template>
          </template>
        </ApolloSubscription>
      </template>
    </GeneralTemplate>

    <Modal v-model="showWorkflowModal" @closed="closeWorkflowModal">
      <div class="w-full max-w-xl rounded-2xl bg-white p-6">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            {{ t('products.products.workflowCard.modals.add.title') }}
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ t('products.products.workflowCard.modals.add.description') }}
          </p>
        </div>

        <div class="mt-5">
          <Selector
            :model-value="selectedWorkflowOptionId"
            class="mt-2"
            :options="availableWorkflowOptions"
            label-by="label"
            value-by="id"
            :placeholder="t('products.products.workflowCard.placeholders.workflow')"
            :removable="false"
            :is-loading="workflowOptionsLoading"
            @update:model-value="updateSelectedWorkflowOption"
          />
        </div>

        <div class="mt-5">
          <Selector
            v-model="selectedWorkflowStateId"
            class="mt-2"
            :options="getWorkflowStateOptions(selectedWorkflowOption)"
            label-by="label"
            value-by="id"
            :placeholder="t('products.products.workflowCard.placeholders.state')"
            :removable="false"
            :is-loading="workflowOptionsLoading"
          />
        </div>

        <p v-if="!workflowOptionsLoading && !workflowOptions.length" class="mt-3 text-sm text-gray-500">
          {{ t('products.products.workflowCard.empty.noAvailableWorkflows') }}
        </p>

        <div class="mt-6 flex justify-end gap-3">
          <CancelButton @click="closeWorkflowModal">
            {{ t('shared.button.cancel') }}
          </CancelButton>
          <PrimaryButton :loading="creatingWorkflowAssignment" :disabled="!selectedWorkflowOptionId || !selectedWorkflowStateId" @click="createWorkflowAssignment">
            {{ t('products.products.workflowCard.buttons.add') }}
          </PrimaryButton>
        </div>
      </div>
    </Modal>

    <DuplicateProductModal v-model="showDuplicateModal" :is-configurable="isConfigurableProduct" @duplicate="handleDuplicate" />
  </div>
</template>
