<script setup lang="ts">
import apolloClient from '../../../../../apollo-client';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { bulkAssignWorkflowStateMutation } from '../../../api/mutations/workflows.js';
import { workflowAssignmentOptionsQuery } from '../../../api/queries/workflows.js';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Label } from '../../atoms/label';
import { Selector } from '../../atoms/selector';
import { Toast } from '../../../modules/toast';
import { processGraphQLErrors } from '../../../utils';

interface WorkflowStateOption {
  id: string;
  value: string;
  sortOrder?: number | null;
  isDefault?: boolean;
}

interface WorkflowOption {
  id: string;
  name: string;
  states: WorkflowStateOption[];
}

const props = defineProps<{ selectedEntities: string[] }>();
const emit = defineEmits<{ (e: 'started'): void }>();

const { t } = useI18n();

const showPanel = ref(false);
const showAdvanced = ref(false);
const panelRef = ref<HTMLElement | null>(null);
const workflowOptions = ref<WorkflowOption[]>([]);
const loadingWorkflows = ref(false);
const submitting = ref(false);
const selectedWorkflowId = ref<string | null>(null);
const selectedWorkflowStateId = ref<string | null>(null);

const sortedStates = (states: WorkflowStateOption[]) =>
  [...states].sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));

const selectedWorkflow = computed(() =>
  workflowOptions.value.find((workflow) => workflow.id === selectedWorkflowId.value) || null,
);

const selectedWorkflowStateOptions = computed(() =>
  sortedStates(selectedWorkflow.value?.states || []).map((state) => ({
    id: state.id,
    label: state.value,
  })),
);

const workflowSelectorOptions = computed(() =>
  workflowOptions.value.map((workflow) => ({
    id: workflow.id,
    label: workflow.name,
  })),
);

const isSubmitDisabled = computed(() => {
  return submitting.value || !props.selectedEntities.length || !selectedWorkflowId.value || !selectedWorkflowStateId.value;
});

const selectedWorkflowHasStates = computed(() => selectedWorkflowStateOptions.value.length > 0);
const selectedWorkflowHasDefaultState = computed(() =>
  Boolean(selectedWorkflow.value?.states?.some((state) => state.isDefault)),
);

const handleGlobalClick = (event: MouseEvent) => {
  const clickedEl = event.target as HTMLElement;
  const clickedInsidePanel = panelRef.value?.contains(clickedEl);
  const clickedInsideSelectorDropdown = !!clickedEl.closest('.vs__dropdown-menu');

  if (!clickedInsidePanel && !clickedInsideSelectorDropdown) {
    showPanel.value = false;
  }
};

const fetchWorkflows = async () => {
  loadingWorkflows.value = true;

  try {
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
  } finally {
    loadingWorkflows.value = false;
  }
};

const onWorkflowChange = (workflowId: string | null) => {
  selectedWorkflowId.value = workflowId;
  const workflow = workflowOptions.value.find((entry) => entry.id === workflowId);
  const states = sortedStates(workflow?.states || []);
  const defaultState = states.find((state) => state.isDefault);
  selectedWorkflowStateId.value = defaultState?.id || null;
};

const handleAssign = async () => {
  if (isSubmitDisabled.value) {
    return;
  }

  try {
    submitting.value = true;

    const { data } = await apolloClient.mutate({
      mutation: bulkAssignWorkflowStateMutation,
      variables: {
        workflowState: { id: selectedWorkflowStateId.value },
        products: props.selectedEntities.map((productId) => ({ id: productId })),
      },
    });

    const updatedCount = data?.bulkAssignWorkflowState?.length ?? props.selectedEntities.length;

    Toast.success(
      t('shared.components.organisms.bulkWorkflowStateAssigner.success', {
        count: updatedCount,
        workflow: selectedWorkflow.value?.name || '—',
        state: selectedWorkflowStateOptions.value.find((state) => state.id === selectedWorkflowStateId.value)?.label || '—',
      }),
    );

    showPanel.value = false;
    showAdvanced.value = false;
    emit('started');
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    const messages = Object.values(validationErrors);

    if (messages.length) {
      messages.forEach((message) => Toast.error(String(message)));
    } else {
      Toast.error(t('shared.components.organisms.bulkWorkflowStateAssigner.error'));
    }
  } finally {
    submitting.value = false;
  }
};

watch(showPanel, (open) => {
  if (!open) {
    showAdvanced.value = false;
    return;
  }

  fetchWorkflows();
});

watch(workflowOptions, () => {
  if (!selectedWorkflowId.value) {
    return;
  }

  const selected = workflowOptions.value.find((workflow) => workflow.id === selectedWorkflowId.value);
  if (!selected) {
    selectedWorkflowId.value = null;
    selectedWorkflowStateId.value = null;
    return;
  }

  if (!selected.states.some((state) => state.id === selectedWorkflowStateId.value)) {
    onWorkflowChange(selected.id);
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
      class="inline-flex items-center rounded bg-cyan-50 px-4 py-1 text-sm font-semibold text-cyan-800 shadow-sm ring-1 ring-inset ring-cyan-300 hover:bg-cyan-100"
      @click="showPanel = !showPanel"
    >
      <Icon name="sitemap" size="sm" class="mr-2 text-cyan-600" />
      {{ t('shared.components.organisms.bulkWorkflowStateAssigner.button') }}
    </button>

    <div v-if="showPanel" class="absolute left-0 z-50 mt-2 w-[560px] rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
      <div class="mb-4 flex items-start justify-between border-b border-gray-200 pb-4">
        <div>
          <h3 class="text-sm font-semibold text-gray-800">
            {{ t('shared.components.organisms.bulkWorkflowStateAssigner.title', { count: props.selectedEntities.length }) }}
          </h3>
          <p class="mt-1 text-xs text-gray-500">
            {{ t('shared.components.organisms.bulkWorkflowStateAssigner.description') }}
          </p>
        </div>
        <button class="ml-auto text-gray-400 hover:text-gray-600" @click="showPanel = false">
          <Icon name="x" size="sm" />
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <Label class="mb-1 block text-sm font-semibold text-gray-700">
            {{ t('shared.components.organisms.bulkWorkflowStateAssigner.workflowLabel') }}
          </Label>
          <Selector
            :model-value="selectedWorkflowId"
            :options="workflowSelectorOptions"
            label-by="label"
            value-by="id"
            :placeholder="t('shared.components.organisms.bulkWorkflowStateAssigner.workflowPlaceholder')"
            :is-loading="loadingWorkflows"
            :removable="false"
            @update:model-value="onWorkflowChange"
          />
          <p v-if="!loadingWorkflows && !workflowSelectorOptions.length" class="mt-2 text-xs text-gray-500">
            {{ t('shared.components.organisms.bulkWorkflowStateAssigner.noWorkflows') }}
          </p>
        </div>

        <p v-if="selectedWorkflowId && !loadingWorkflows && !selectedWorkflowHasStates" class="text-xs text-gray-500">
          {{ t('shared.components.organisms.bulkWorkflowStateAssigner.noStates') }}
        </p>
        <p v-else-if="selectedWorkflowId && !loadingWorkflows && !selectedWorkflowHasDefaultState" class="text-xs text-gray-500">
          {{ t('shared.components.organisms.bulkWorkflowStateAssigner.noDefaultState') }}
        </p>

        <div>
          <button
            class="inline-flex items-center text-sm font-semibold text-cyan-700 hover:text-cyan-800"
            type="button"
            @click="showAdvanced = !showAdvanced"
          >
            <Icon :name="showAdvanced ? 'chevron-up' : 'chevron-down'" size="sm" class="mr-1 text-cyan-600" />
            {{ t(showAdvanced ? 'shared.components.organisms.bulkWorkflowStateAssigner.hideAdvanced' : 'shared.components.organisms.bulkWorkflowStateAssigner.showAdvanced') }}
          </button>
        </div>

        <div v-if="showAdvanced">
          <Label class="mb-1 block text-sm font-semibold text-gray-700">
            {{ t('shared.components.organisms.bulkWorkflowStateAssigner.stateLabel') }}
          </Label>
          <Selector
            v-model="selectedWorkflowStateId"
            :options="selectedWorkflowStateOptions"
            label-by="label"
            value-by="id"
            :placeholder="t('shared.components.organisms.bulkWorkflowStateAssigner.statePlaceholder')"
            :is-loading="loadingWorkflows"
            :removable="false"
          />
        </div>

        <div class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
          {{ t('shared.components.organisms.bulkWorkflowStateAssigner.replaceWarning') }}
        </div>
      </div>

      <div class="mt-4 border-t border-gray-200 pt-4">
        <Button
          class="w-full rounded bg-cyan-600 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
          :disabled="isSubmitDisabled"
          :loading="submitting"
          @click="handleAssign"
        >
          {{ t('shared.components.organisms.bulkWorkflowStateAssigner.assignButton') }}
        </Button>
      </div>
    </div>
  </div>
</template>
