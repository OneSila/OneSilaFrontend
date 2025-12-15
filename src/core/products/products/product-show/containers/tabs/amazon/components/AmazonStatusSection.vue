<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ProgressBar } from '../../../../../../../../shared/components/molecules/progress-bar';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { ApolloMutation } from '@vue/apollo-components';
import { Link } from "../../../../../../../../shared/components/atoms/link";
import { getProgressBarUiForStatus } from '../../../../../../../../shared/utils/constants';

const props = defineProps<{
  selectedProduct: any | null;
  lastSyncAt: string | null;
  syncingCurrentPercentage: number | null;
  remoteProductId: string | null;
  amazonProductUrl: string | null;
  selectedView: any | null;
  resyncAmazonProductMutation: any;
  refreshAmazonProductIssuesMutation: any;
  refreshAmazonProductFromRemoteMutation: any;
  productId: string;
}>();

const emit = defineEmits<{
  (e: 'resync-success'): void;
  (e: 'import-success'): void;
  (e: 'validate-success'): void;
  (e: 'fetch-issues-success'): void;
  (e: 'error', err: unknown): void;
}>();

const { t } = useI18n();

const getProgressStatus = (percentage: number) => (percentage < 100 ? 'PROCESSING' : 'COMPLETED');

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
          :mutation="refreshAmazonProductFromRemoteMutation"
          :variables="{ product: { id: productId }, view: { id: selectedView?.id } }"
          @done="() => emit('import-success')"
          @error="(e) => emit('error', e)"
        >
          <template #default="{ mutate, loading }">
            <Button class="btn btn-sm btn-outline-primary" :disabled="loading" @click.stop="mutate">
              {{ t('shared.button.import') }}
            </Button>
          </template>
        </ApolloMutation>
        <ApolloMutation
          v-if="remoteProductId"
          :mutation="resyncAmazonProductMutation"
          :variables="{ remoteProduct: { id: remoteProductId }, view: { id: selectedView?.id }, forceValidationOnly: false, forceFullUpdate: true }"
          @done="() => emit('resync-success')"
          @error="(e) => emit('error', e)"
        >
          <template #default="{ mutate, loading }">
            <Button class="btn btn-sm btn-outline-primary" :disabled="loading" @click.stop="mutate">
              {{ t('shared.button.fullUpdate') }}
            </Button>
          </template>
        </ApolloMutation>
        <ApolloMutation
          :mutation="resyncAmazonProductMutation"
          :variables="{ remoteProduct: { id: remoteProductId }, view: { id: selectedView?.id }, forceValidationOnly: false, forceFullUpdate: false }"
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
          v-if="remoteProductId"
          :mutation="resyncAmazonProductMutation"
          :variables="{ remoteProduct: { id: remoteProductId }, view: { id: selectedView?.id }, forceValidationOnly: true, forceFullUpdate: false }"
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
            <ProgressBar
              :progress="syncingCurrentPercentage ?? 0"
              :label="t(getProgressBarUiForStatus(getProgressStatus(syncingCurrentPercentage ?? 0)).labelKey)"
              :label-color="getProgressBarUiForStatus(getProgressStatus(syncingCurrentPercentage ?? 0)).labelColor"
              :bar-color="getProgressBarUiForStatus(getProgressStatus(syncingCurrentPercentage ?? 0)).barColor"
            />
          </div>
        </div>
        <div v-if="amazonProductUrl" class="mt-2">
          <Link
            :path="amazonProductUrl"
            class="inline-flex items-center gap-1 text-primary hover:text-primary-dark"
            target="_blank"
            external
          >
            <Icon name="eye" class="w-4 h-4" />
            <span class="text-xs">{{ t('products.products.amazon.viewOnAmazon') }}</span>
          </Link>
        </div>
      </div>
    </div>
  </div>
</template>
