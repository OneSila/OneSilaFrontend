<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import { VueDraggableNext } from 'vue-draggable-next';

import { Breadcrumbs } from '../../../../shared/components/molecules/breadcrumbs';
import { Card } from '../../../../shared/components/atoms/card';
import { TextInput } from '../../../../shared/components/atoms/input-text';
import { TextEditor } from '../../../../shared/components/atoms/input-text-editor';
import { Checkbox } from '../../../../shared/components/atoms/checkbox';
import { Label } from '../../../../shared/components/atoms/label';
import { Icon } from '../../../../shared/components/atoms/icon';
import { PrimaryButton } from '../../../../shared/components/atoms/button-primary';
import { CancelButton } from '../../../../shared/components/atoms/button-cancel';
import { DangerButton } from '../../../../shared/components/atoms/button-danger';
import { Button } from '../../../../shared/components/atoms/button';
import { TabsMenu } from '../../../../shared/components/molecules/tabs-menu';
import { LocalLoader } from '../../../../shared/components/atoms/local-loader';
import SettingsTemplate from '../../SettingsTemplate.vue';
import { getTabsConfig } from '../../tabs';
import apolloClient from '../../../../../apollo-client';
import { getWorkflowQuery } from '../../../../shared/api/queries/workflows.js';
import {
  deleteWorkflowMutation,
  deleteWorkflowStateMutation,
  updateWorkflowMutation,
  createWorkflowStateMutation,
  updateWorkflowStateMutation,
} from '../../../../shared/api/mutations/workflows.js';
import { processGraphQLErrors } from '../../../../shared/utils';
import { Toast } from '../../../../shared/modules/toast';
import { ApolloAlertMutation } from '../../../../shared/components/molecules/apollo-alert-mutation';

interface WorkflowFormState {
  name: string;
  description: string;
  code: string;
  sortOrder: number;
  autoAddOnProduct: boolean;
}

interface WorkflowStateSnapshot {
  value: string;
  sortOrder: number;
  isDefault: boolean;
}

interface EditableWorkflowState extends WorkflowStateSnapshot {
  id: string | null;
  clientId: string;
  code: string;
  assignmentCount: number;
  original: WorkflowStateSnapshot | null;
}

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const id = ref(String(route.params.id));
const loading = ref(true);
const saving = ref(false);
const refreshKey = ref(0);
const nextClientId = ref(1);
const deleteStateIds = ref<string[]>([]);
const workflowForm = reactive<WorkflowFormState>({
  name: '',
  description: '',
  code: '',
  sortOrder: 0,
  autoAddOnProduct: false,
});
const initialWorkflow = ref<WorkflowFormState | null>(null);
const states = ref<EditableWorkflowState[]>([]);

const activeStates = computed(() => states.value);
const hasStates = computed(() => activeStates.value.length > 0);
const totalAssignments = computed(() => activeStates.value.reduce((sum, state) => sum + state.assignmentCount, 0));

const createClientId = () => `workflow-state-${nextClientId.value++}`;

const cloneWorkflow = (value: WorkflowFormState): WorkflowFormState => ({
  name: value.name,
  description: value.description,
  code: value.code,
  sortOrder: value.sortOrder,
  autoAddOnProduct: value.autoAddOnProduct,
});

const createSnapshot = (state: EditableWorkflowState, index: number): WorkflowStateSnapshot => ({
  value: state.value,
  sortOrder: index + 1,
  isDefault: state.isDefault,
});

const isStateDirty = (state: EditableWorkflowState, index: number) => {
  if (!state.id || !state.original) {
    return true;
  }

  const snapshot = createSnapshot(state, index);
  return (
    snapshot.value !== state.original.value
    || snapshot.sortOrder !== state.original.sortOrder
    || snapshot.isDefault !== state.original.isDefault
  );
};

const hasWorkflowChanges = computed(() => {
  if (!initialWorkflow.value) {
    return false;
  }

  return (
    workflowForm.name !== initialWorkflow.value.name
    || workflowForm.description !== initialWorkflow.value.description
    || Number(workflowForm.sortOrder) !== Number(initialWorkflow.value.sortOrder)
    || workflowForm.autoAddOnProduct !== initialWorkflow.value.autoAddOnProduct
  );
});

const hasStateChanges = computed(() => {
  if (deleteStateIds.value.length > 0) {
    return true;
  }

  return activeStates.value.some((state, index) => isStateDirty(state, index));
});

const hasChanges = computed(() => hasWorkflowChanges.value || hasStateChanges.value);

const hydrateWorkflow = (workflow: any) => {
  workflowForm.name = workflow?.name ?? '';
  workflowForm.description = workflow?.description ?? '';
  workflowForm.code = workflow?.code ?? '';
  workflowForm.sortOrder = workflow?.sortOrder ?? 0;
  workflowForm.autoAddOnProduct = !!workflow?.autoAddOnProduct;
  initialWorkflow.value = cloneWorkflow(workflowForm);

  states.value = [...(workflow?.states ?? [])]
    .sort((left: any, right: any) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
    .map((state: any, index: number) => ({
      id: state.id,
      clientId: createClientId(),
      value: state.value ?? '',
      code: state.code ?? '',
      sortOrder: state.sortOrder ?? index + 1,
      isDefault: !!state.isDefault,
      assignmentCount: state.assignments?.length ?? 0,
      original: {
        value: state.value ?? '',
        sortOrder: state.sortOrder ?? index + 1,
        isDefault: !!state.isDefault,
      },
    }));

  deleteStateIds.value = [];
  syncAutoAddConstraints();
};

const loadWorkflow = async () => {
  try {
    loading.value = true;
    const { data } = await apolloClient.query({
      query: getWorkflowQuery,
      variables: { id: id.value },
      fetchPolicy: 'network-only',
    });

    const workflow = data?.workflow;
    if (!workflow) {
      Toast.error(t('shared.alert.toast.unexpectedResult'));
      return;
    }

    hydrateWorkflow(workflow);
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    Object.values(validationErrors).forEach((message) => Toast.error(String(message)));
  } finally {
    loading.value = false;
  }
};

const setExclusiveDefault = (clientId: string) => {
  states.value = states.value.map((state) => ({
    ...state,
    isDefault: state.clientId === clientId,
  }));
};

const syncAutoAddConstraints = () => {
  if (activeStates.value.length === 0) {
    workflowForm.autoAddOnProduct = false;
    return;
  }

  if (!workflowForm.autoAddOnProduct) {
    return;
  }

  const existingDefault = activeStates.value.find((state) => state.isDefault);
  if (!existingDefault) {
    setExclusiveDefault(activeStates.value[0].clientId);
  }
};

const reindexStates = () => {
  states.value = states.value.map((state, index) => ({
    ...state,
    sortOrder: index + 1,
  }));
};

const addState = () => {
  states.value.push({
    id: null,
    clientId: createClientId(),
    value: '',
    code: '',
    sortOrder: states.value.length + 1,
    isDefault: false,
    assignmentCount: 0,
    original: null,
  });
  reindexStates();
  syncAutoAddConstraints();
};

const moveState = (index: number, direction: -1 | 1) => {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= states.value.length) {
    return;
  }

  const reordered = [...states.value];
  const [movedState] = reordered.splice(index, 1);
  reordered.splice(targetIndex, 0, movedState);
  states.value = reordered;
  reindexStates();
  syncAutoAddConstraints();
};

const onDragEnd = () => {
  reindexStates();
  syncAutoAddConstraints();
};

const toggleAutoAdd = (value: boolean) => {
  if (!hasStates.value) {
    workflowForm.autoAddOnProduct = false;
    return;
  }

  workflowForm.autoAddOnProduct = value;
  syncAutoAddConstraints();
};

const toggleDefault = (state: EditableWorkflowState, value: boolean) => {
  if (value) {
    setExclusiveDefault(state.clientId);
    return;
  }

  state.isDefault = false;
  syncAutoAddConstraints();
};

const removeState = async (state: EditableWorkflowState) => {
  if (state.assignmentCount > 0) {
    Toast.error(t('settings.workflows.messages.deleteBlockedState'));
    return;
  }

  if (state.id) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        popup: 'sweet-alerts',
        confirmButton: 'btn btn-secondary',
        cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3',
      },
      buttonsStyling: false,
    });

    const result = await swalWithBootstrapButtons.fire({
      title: t('shared.alert.mutationAlert.title'),
      text: t('settings.workflows.messages.confirmStateDelete'),
      confirmButtonText: t('shared.alert.mutationAlert.confirmButtonText'),
      cancelButtonText: t('shared.alert.mutationAlert.cancelButtonText'),
      icon: 'warning',
      showCancelButton: true,
      reverseButtons: true,
      padding: '2em',
    });

    if (!result.isConfirmed) {
      return;
    }

    deleteStateIds.value = [...deleteStateIds.value, state.id];
  }

  states.value = states.value.filter((currentState) => currentState.clientId !== state.clientId);
  reindexStates();
  syncAutoAddConstraints();
};

const validateBeforeSave = () => {
  if (!workflowForm.name.trim()) {
    Toast.error(t('settings.workflows.messages.requiredFields'));
    return false;
  }

  const invalidState = activeStates.value.find((state) => !state.value.trim());
  if (invalidState) {
    Toast.error(t('settings.workflows.messages.stateRequiredFields'));
    return false;
  }

  return true;
};

const handleMutationErrors = (error: any) => {
  const validationErrors = processGraphQLErrors(error, t);
  Object.values(validationErrors).forEach((message) => Toast.error(String(message)));
};

const saveWorkflow = async () => {
  syncAutoAddConstraints();

  if (!validateBeforeSave()) {
    return;
  }

  try {
    saving.value = true;

    await apolloClient.mutate({
      mutation: updateWorkflowMutation,
      variables: {
        data: {
          id: id.value,
          name: workflowForm.name.trim(),
          description: workflowForm.description?.trim() || '',
          sortOrder: Number(workflowForm.sortOrder) || 0,
          autoAddOnProduct: workflowForm.autoAddOnProduct,
        },
      },
    });

    const preparedStates = activeStates.value.map((state, index) => ({
      ...state,
      value: state.value.trim(),
      sortOrder: index + 1,
    }));

    const existingStates = preparedStates.filter((state) => !!state.id);
    const newStates = preparedStates.filter((state) => !state.id);
    const changedExistingStates = existingStates.filter((state, index) => {
      const existingIndex = preparedStates.findIndex((item) => item.clientId === state.clientId);
      return isStateDirty(state, existingIndex);
    });

    const nonDefaultExistingStates = changedExistingStates.filter((state) => !state.isDefault);
    const defaultExistingStates = changedExistingStates.filter((state) => state.isDefault);
    const nonDefaultNewStates = newStates.filter((state) => !state.isDefault);
    const defaultNewStates = newStates.filter((state) => state.isDefault);

    for (const state of nonDefaultExistingStates) {
      await apolloClient.mutate({
        mutation: updateWorkflowStateMutation,
        variables: {
          data: {
            id: state.id,
            value: state.value,
            sortOrder: state.sortOrder,
            isDefault: false,
          },
        },
      });
    }

    for (const state of nonDefaultNewStates) {
      await apolloClient.mutate({
        mutation: createWorkflowStateMutation,
        variables: {
          data: {
            workflow: { id: id.value },
            value: state.value,
            sortOrder: state.sortOrder,
            isDefault: false,
          },
        },
      });
    }

    for (const state of defaultExistingStates) {
      await apolloClient.mutate({
        mutation: updateWorkflowStateMutation,
        variables: {
          data: {
            id: state.id,
            value: state.value,
            sortOrder: state.sortOrder,
            isDefault: true,
          },
        },
      });
    }

    for (const state of defaultNewStates) {
      await apolloClient.mutate({
        mutation: createWorkflowStateMutation,
        variables: {
          data: {
            workflow: { id: id.value },
            value: state.value,
            sortOrder: state.sortOrder,
            isDefault: true,
          },
        },
      });
    }

    for (const stateId of deleteStateIds.value) {
      await apolloClient.mutate({
        mutation: deleteWorkflowStateMutation,
        variables: { id: stateId },
      });
    }

    Toast.success(t('shared.alert.toast.submitSuccessUpdate'));
    await loadWorkflow();
    refreshKey.value += 1;
  } catch (error) {
    handleMutationErrors(error);
  } finally {
    saving.value = false;
  }
};

loadWorkflow();
</script>

<template>
  <SettingsTemplate>
    <template #tabs>
      <TabsMenu :tabs="getTabsConfig(t)" :activeName="'workflows'" />
    </template>

    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'settings.workflows.list' }, name: t('settings.workflows.title') },
          { path: { name: 'settings.workflow.edit', params: { id } }, name: t('settings.workflows.edit.title') }
        ]"
      />
    </template>

    <template #content>
      <div class="space-y-6">
        <LocalLoader :loading="loading" />

        <template v-if="!loading">
          <Card>
            <div class="space-y-6">
              <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">{{ t('settings.workflows.edit.title') }}</h2>
                  <p class="mt-1 text-sm text-gray-500">{{ t('settings.workflows.messages.editIntro') }}</p>
                </div>
                <div class="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  {{ t('settings.workflows.messages.assignmentSummary', { count: totalAssignments }) }}
                </div>
              </div>

              <div class="grid gap-6 md:grid-cols-2">
                <div>
                  <Label semi-bold>{{ t('settings.workflows.labels.name') }}</Label>
                  <TextInput v-model="workflowForm.name" :placeholder="t('settings.workflows.placeholders.name')" class="mt-2 w-full" />
                </div>
                <div>
                  <Label semi-bold>{{ t('settings.workflows.labels.code') }}</Label>
                  <TextInput :model-value="workflowForm.code" :placeholder="t('settings.workflows.placeholders.codeGenerated')" disabled class="mt-2 w-full" />
                  <p class="mt-2 text-xs text-gray-500">
                    {{ t('settings.workflows.messages.codeGeneratedHelp') }}
                  </p>
                </div>
                <div>
                  <Label semi-bold>{{ t('settings.workflows.labels.sortOrder') }}</Label>
                  <TextInput v-model="workflowForm.sortOrder" :placeholder="t('settings.workflows.placeholders.sortOrder')" number class="mt-2 w-full" />
                </div>
                <div>
                  <Label semi-bold>{{ t('settings.workflows.labels.autoAddOnProduct') }}</Label>
                  <div class="mt-3 rounded-lg border border-gray-200 px-4 py-3">
                    <Checkbox :model-value="workflowForm.autoAddOnProduct" :disabled="!hasStates" @update:model-value="toggleAutoAdd">
                      {{ t('settings.workflows.messages.autoAddToggle') }}
                    </Checkbox>
                    <p class="mt-2 text-xs text-gray-500">
                      {{ hasStates ? t('settings.workflows.messages.autoAddHelp') : t('settings.workflows.messages.autoAddNeedsStates') }}
                    </p>
                  </div>
                </div>
                <div class="md:col-span-2">
                  <Label semi-bold>{{ t('shared.labels.description') }}</Label>
                  <TextEditor
                    v-model="workflowForm.description"
                    class="mt-2 h-28"
                    :placeholder="t('shared.placeholders.description')"
                    :scroll="true"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div class="space-y-5">
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ t('settings.workflows.states.title') }}</h3>
                  <p class="mt-1 text-sm text-gray-500">{{ t('settings.workflows.states.description') }}</p>
                  <p class="mt-1 text-xs text-gray-400">{{ t('settings.workflows.states.sortOrderHelp') }}</p>
                </div>
                <Button class="btn btn-primary flex items-center gap-2" @click="addState">
                  <Icon name="plus" size="sm" />
                  <span>{{ t('settings.workflows.states.add') }}</span>
                </Button>
              </div>

              <div v-if="activeStates.length === 0" class="rounded-lg border border-dashed border-gray-300 px-6 py-8 text-center text-sm text-gray-500">
                {{ t('settings.workflows.states.empty') }}
              </div>

              <VueDraggableNext
                v-else
                v-model="states"
                handle=".workflow-state-drag-handle"
                ghost-class="sortable-ghost"
                class="space-y-4"
                @end="onDragEnd"
              >
                <div
                  v-for="(state, index) in activeStates"
                  :key="state.clientId"
                  class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div v-if="state.assignmentCount > 0" class="mb-3 flex justify-end">
                    <span
                      class="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                      :title="t('settings.workflows.messages.deleteBlockedState')"
                    >
                      {{ t('settings.workflows.states.inUse', { count: state.assignmentCount }) }}
                    </span>
                  </div>

                  <div class="grid min-w-0 gap-3 lg:grid-cols-[36px,minmax(0,1.4fr),200px,auto] lg:items-end">
                    <div class="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 workflow-state-drag-handle cursor-grab text-gray-500">
                        <Icon name="fa-up-down-left-right" size="sm" />
                    </div>

                    <div class="min-w-0">
                      <Label semi-bold>{{ t('settings.workflows.states.labels.value') }}</Label>
                      <TextInput v-model="state.value" :placeholder="t('settings.workflows.states.placeholders.value')" class="mt-2 w-full" />
                    </div>

                    <div class="min-w-0">
                      <Label semi-bold>{{ t('settings.workflows.states.labels.code') }}</Label>
                      <TextInput :model-value="state.code" :placeholder="t('settings.workflows.states.placeholders.codeGenerated')" disabled class="mt-2 w-full" />
                    </div>

                    <div class="flex items-center justify-start lg:justify-end">
                      <div class="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
                        <Button
                          :class="state.isDefault ? 'btn btn-primary h-8 w-8 p-0' : 'btn btn-outline-primary h-8 w-8 p-0'"
                          :title="t('settings.workflows.states.labels.isDefault')"
                          @click="toggleDefault(state, !state.isDefault)"
                        >
                          <Icon :name="state.isDefault ? 'star' : 'circle'" size="sm" />
                        </Button>

                        <div class="mx-1 h-4 w-px bg-gray-200"></div>

                        <Button
                          class="btn btn-outline-primary h-8 w-8 p-0"
                          :disabled="index === 0"
                          :title="t('shared.button.moveUp')"
                          @click="moveState(index, -1)"
                        >
                          <Icon name="arrow-up" size="sm" />
                        </Button>
                        <Button
                          class="btn btn-outline-primary h-8 w-8 p-0"
                          :disabled="index === activeStates.length - 1"
                          :title="t('shared.button.moveDown')"
                          @click="moveState(index, 1)"
                        >
                          <Icon name="arrow-down" size="sm" />
                        </Button>
                        <Button
                          class="btn btn-outline-danger h-8 w-8 p-0"
                          :disabled="state.assignmentCount > 0"
                          :title="t('shared.button.delete')"
                          @click="removeState(state)"
                        >
                          <Icon name="trash" size="sm" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </VueDraggableNext>
            </div>
          </Card>

          <div class="flex items-center justify-between gap-3">
            <ApolloAlertMutation
              :mutation="deleteWorkflowMutation"
              :mutation-variables="{ id }"
              @done="() => router.push({ name: 'settings.workflows.list' })"
            >
              <template #default="{ loading: deleteLoading, confirmAndMutate }">
                <DangerButton :disabled="deleteLoading || totalAssignments > 0" @click="confirmAndMutate">
                  {{ t('shared.button.delete') }}
                </DangerButton>
              </template>
            </ApolloAlertMutation>

            <div class="flex items-center gap-3">
              <Link :path="{ name: 'settings.workflows.list' }">
                <CancelButton>{{ t('shared.button.cancel') }}</CancelButton>
              </Link>
              <PrimaryButton :loading="saving" :disabled="saving || !hasChanges" @click="saveWorkflow">
                {{ t('shared.button.save') }}
              </PrimaryButton>
            </div>
          </div>

          <p v-if="totalAssignments > 0" class="text-sm text-gray-500">
            {{ t('settings.workflows.messages.deleteBlockedWorkflow') }}
          </p>
        </template>
      </div>
    </template>
  </SettingsTemplate>
</template>
