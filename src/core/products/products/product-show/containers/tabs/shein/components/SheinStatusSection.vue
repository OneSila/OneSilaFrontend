<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import apolloClient from '../../../../../../../../../apollo-client';

const props = defineProps<{
  productId: string;
  salesChannelId: string | null;
  remoteProductId: string | null;
  refreshLatestSheinIssuesMutation: any;
  createSheinProductMutation: any;
  updateSheinProductMutation: any;
}>();

const emit = defineEmits<{
  (e: 'create-success'): void;
  (e: 'force-update-success'): void;
  (e: 'fetch-issues-success'): void;
  (e: 'error', err: unknown): void;
}>();

const { t } = useI18n();
const isRefreshingIssues = ref(false);
const isCreating = ref(false);
const isForcingUpdate = ref(false);

const hasRemoteProduct = computed(() => Boolean(props.remoteProductId));
const canFetchIssues = computed(() => Boolean(props.remoteProductId && props.salesChannelId));
const canCreate = computed(() => Boolean(props.productId && props.salesChannelId));
const canForceUpdate = computed(() => Boolean(props.productId && props.salesChannelId));

const handleFetchIssues = async () => {
  if (!canFetchIssues.value || !props.remoteProductId || !props.salesChannelId) return;

  isRefreshingIssues.value = true;
  try {
    await apolloClient.mutate({
      mutation: props.refreshLatestSheinIssuesMutation,
      variables: {
        remoteProduct: { id: props.remoteProductId },
        salesChannel: { id: props.salesChannelId },
      },
      fetchPolicy: 'no-cache',
    });
    emit('fetch-issues-success');
  } catch (error) {
    emit('error', error);
  } finally {
    isRefreshingIssues.value = false;
  }
};

const handleCreateSheinProduct = async () => {
  if (!canCreate.value || !props.productId || !props.salesChannelId) return;

  isCreating.value = true;
  try {
    await apolloClient.mutate({
      mutation: props.createSheinProductMutation,
      variables: {
        product: { id: props.productId },
        salesChannel: { id: props.salesChannelId },
      },
      fetchPolicy: 'no-cache',
    });
    emit('create-success');
  } catch (error) {
    emit('error', error);
  } finally {
    isCreating.value = false;
  }
};

const handleForceUpdate = async () => {
  if (!canForceUpdate.value || !props.productId || !props.salesChannelId) return;

  isForcingUpdate.value = true;
  try {
    await apolloClient.mutate({
      mutation: props.updateSheinProductMutation,
      variables: {
        product: { id: props.productId },
        salesChannel: { id: props.salesChannelId },
        forceUpdate: true,
      },
      fetchPolicy: 'no-cache',
    });
    emit('force-update-success');
  } catch (error) {
    emit('error', error);
  } finally {
    isForcingUpdate.value = false;
  }
};
</script>

<template>
  <div>
    <Flex between>
      <FlexCell>
        <h4 class="font-semibold mb-2">{{ t('products.products.shein.status.title') }}</h4>
        <p class="text-xs text-gray-500 mb-2">{{ t('products.products.shein.status.description') }}</p>
      </FlexCell>
      <FlexCell>
        <div class="flex gap-2 sm:ml-auto">
          <Button
            v-if="hasRemoteProduct"
            class="btn btn-sm btn-outline-primary"
            :disabled="!canForceUpdate || isForcingUpdate"
            @click.stop="handleForceUpdate"
          >
            {{ t('shared.button.forceUpdate') }}
          </Button>
          <Button
            v-else
            class="btn btn-sm btn-outline-primary"
            :disabled="!canCreate || isCreating"
            @click.stop="handleCreateSheinProduct"
          >
            {{ t('shared.button.create') }}
          </Button>
          <Button
            class="btn btn-sm btn-outline-primary"
            :disabled="!canFetchIssues || isRefreshingIssues"
            @click.stop="handleFetchIssues"
          >
            {{ t('shared.button.fetchIssues') }}
          </Button>
        </div>
      </FlexCell>
    </Flex>
  </div>
</template>
