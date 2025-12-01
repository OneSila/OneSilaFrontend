<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { DocumentNode } from 'graphql';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../apollo-client';
import { Toast } from '../../../modules/toast';
import { processGraphQLErrors } from '../../../utils';
import { Button } from '../../atoms/button';
import { Card } from '../../atoms/card';
import { Modal } from '../../atoms/modal';
import { Selector } from '../../atoms/selector';

type ChannelOption = {
  id: string;
  label: string | null;
};

const props = withDefaults(defineProps<{
  targetSalesChannelId: string;
  channelsQuery: DocumentNode;
  channelsQueryKey: string;
  syncMutation: DocumentNode;
  channelLabelKey: string;
  labelField?: string;
  queryVariables?: Record<string, any>;
}>(), {
  labelField: 'hostname',
  queryVariables: () => ({}),
});

const emit = defineEmits<{
  (e: 'imported'): void;
}>();

const { t } = useI18n();

const availableChannels = ref<ChannelOption[]>([]);
const selectedSourceId = ref<string | null>(null);
const showModal = ref(false);
const loadingChannels = ref(false);
const submitting = ref(false);
const initialFetchDone = ref(false);

const channelLabel = computed(() => t(props.channelLabelKey));
const fallbackLabel = computed(() =>
  t('integrations.show.mapping.importFallbackLabel', { channelLabel: channelLabel.value })
);
const descriptionText = computed(() =>
  t('integrations.show.mapping.importMappingDescription', { channelLabel: channelLabel.value })
);
const placeholderText = computed(() =>
  t('integrations.show.mapping.importMappingPlaceholder', { channelLabel: channelLabel.value })
);
const noSourcesMessage = computed(() =>
  t('integrations.show.mapping.importNoSources', { channelLabel: channelLabel.value })
);

const channelOptions = computed(() =>
  availableChannels.value.map((channel) => ({
    id: channel.id,
    label: channel.label || fallbackLabel.value,
  }))
);

const hasSources = computed(() => availableChannels.value.length > 0);
const shouldShowButton = computed(() => initialFetchDone.value && hasSources.value);

const fetchChannels = async () => {
  loadingChannels.value = true;

  try {
    const { data } = await apolloClient.query<Record<string, any>>({
      query: props.channelsQuery,
      variables: props.queryVariables,
      fetchPolicy: 'cache-first',
    });

    const listing = data?.[props.channelsQueryKey] || {};
    const edges = listing?.edges || [];

    const nodes = edges
      .map((edge: any) => edge?.node)
      .filter((node: any) => Boolean(node?.id));

    availableChannels.value = nodes
      .filter((node: any) => node.id !== props.targetSalesChannelId)
      .map((node: any) => ({
        id: node.id,
        label: node[props.labelField] || null,
      }));
  } catch (err) {
    console.error(err);
  } finally {
    loadingChannels.value = false;
    initialFetchDone.value = true;
  }
};

onMounted(fetchChannels);

watch(
  () => props.targetSalesChannelId,
  () => {
    fetchChannels();
  }
);

watch(
  () => props.queryVariables,
  () => {
    fetchChannels();
  },
  { deep: true }
);

const closeModal = () => {
  showModal.value = false;
  selectedSourceId.value = null;
};

const openModal = async () => {
  await fetchChannels();

  if (!hasSources.value) {
    Toast.error(noSourcesMessage.value);
    return;
  }

  selectedSourceId.value = null;
  showModal.value = true;
};

const importMappings = async () => {
  if (!selectedSourceId.value) {
    return;
  }

  submitting.value = true;

  try {
    await apolloClient.mutate({
      mutation: props.syncMutation,
      variables: {
        sourceId: selectedSourceId.value,
        targetId: props.targetSalesChannelId,
      },
    });

    Toast.success(t('integrations.show.mapping.importSuccess'));
    emit('imported');
    closeModal();
  } catch (err) {
    const validationErrors = processGraphQLErrors(err, t);
    if (validationErrors['__all__']) {
      Toast.error(validationErrors['__all__']);
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div v-if="shouldShowButton">
    <Button type="button" class="btn btn-outline-dark" @click="openModal">
      {{ t('integrations.show.mapping.importMapping') }}
    </Button>

    <Modal v-model="showModal" @closed="closeModal">
      <Card class="modal-content w-full max-w-xl">
        <h3 class="text-xl font-semibold mb-2">{{ t('integrations.show.mapping.importMapping') }}</h3>
        <p class="text-sm text-gray-500 mb-4">
          {{ descriptionText }}
        </p>
        <label class="text-sm font-medium text-gray-700">{{ t('integrations.show.mapping.importMappingSelectLabel') }}</label>
        <Selector
          v-model="selectedSourceId"
          :options="channelOptions"
          label-by="label"
          value-by="id"
          :placeholder="placeholderText"
          :is-loading="loadingChannels"
          class="mt-2"
        />
        <div class="flex justify-end gap-4 mt-6">
          <Button type="button" class="btn btn-outline-dark" @click="closeModal">
            {{ t('shared.button.cancel') }}
          </Button>
          <Button
            type="button"
            class="btn btn-primary"
            :disabled="!selectedSourceId || submitting"
            @click="importMappings"
          >
            {{ t('shared.button.import') }}
          </Button>
        </div>
      </Card>
    </Modal>
  </div>
</template>
