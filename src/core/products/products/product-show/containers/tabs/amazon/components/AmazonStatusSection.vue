<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { AssignProgressBar } from '../../../../../../../../shared/components/molecules/assign-progress-bar';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import { ApolloMutation } from '@vue/apollo-components';

const props = defineProps<{
  selectedProduct: any | null;
  lastSyncAt: string | null;
  syncingCurrentPercentage: number | null;
  remoteProductId: string | null;
  selectedView: any | null;
  resyncAmazonProductMutation: any;
  refreshAmazonProductIssuesMutation: any;
}>();

const emit = defineEmits<{
  (e: 'resync-success'): void;
  (e: 'validate-success'): void;
  (e: 'fetch-issues-success'): void;
  (e: 'error', err: unknown): void;
}>();

const { t } = useI18n();

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};
</script>

<template>
  <div>
    <Flex between>
      <FlexCell>
          <h4 class="font-semibold mb-2">{{ t('products.products.amazon.status') }}</h4>
          <p class="text-xs text-gray-500 mb-2">
            {{ t('products.products.amazon.statusDescription') }}
          </p>
        <p v-if="remoteProductId == null">{{ t('products.products.amazon.noStatus') }}</p>

      </FlexCell>
      <FlexCell>
        <div class="flex gap-2 sm:ml-auto">
        <ApolloMutation
          :mutation="resyncAmazonProductMutation"
          :variables="{ remoteProduct: { id: remoteProductId }, view: { id: selectedView?.id }, forceValidationOnly: false }"
          @done="() => emit('resync-success')"
          @error="(e) => emit('error', e)"
        >
          <template #default="{ mutate, loading }">
            <Button class="btn btn-sm btn-outline-primary" :disabled="loading" @click.stop="mutate">
              {{ t('shared.button.resync') }}
            </Button>
          </template>
        </ApolloMutation>
        <ApolloMutation
          :mutation="resyncAmazonProductMutation"
          :variables="{ remoteProduct: { id: remoteProductId }, view: { id: selectedView?.id }, forceValidationOnly: true }"
          @done="() => emit('validate-success')"
          @error="(e) => emit('error', e)"
        >
          <template #default="{ mutate, loading }">
            <Button class="btn btn-sm btn-outline-primary" :disabled="loading" @click.stop="mutate">
              {{ t('shared.button.validate') }}
            </Button>
          </template>
        </ApolloMutation>
        <ApolloMutation
          v-if="remoteProductId"
          :mutation="refreshAmazonProductIssuesMutation"
          :variables="{ remoteProduct: { id: remoteProductId }, view: { id: selectedView?.id } }"
          @done="() => emit('fetch-issues-success')"
          @error="(e) => emit('error', e)"
        >
          <template #default="{ mutate, loading }">
            <Button class="btn btn-sm btn-outline-primary" :disabled="loading" @click.stop="mutate">
              {{ t('shared.button.fetchIssues') }}
            </Button>
          </template>
        </ApolloMutation>
      </div>
      </FlexCell>
    </Flex>
    <div class="flex flex-col sm:flex-row sm:items-start gap-2">
      <div
        v-if="selectedProduct"
        class="flex flex-col gap-2 text-sm text-gray-500 flex-1"
      >
        <div>
          <span class="font-medium">{{ t('shared.labels.lastSyncAt') }}:</span>
          {{ formatDate(lastSyncAt) }}
        </div>
        <div>
          <span class="font-medium">{{ t('shared.labels.progress') }}:</span>
          <div class="w-48 mt-1">
            <AssignProgressBar :progress="syncingCurrentPercentage ?? 0" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

