<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../../apollo-client';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import { LocalLoader } from '../../../../../../../../shared/components/atoms/local-loader';
import { Toast } from '../../../../../../../../shared/modules/toast';
import { displayApolloError } from '../../../../../../../../shared/utils';
import { suggestEbayCategoryMutation } from '../../../../../../../../shared/api/mutations/salesChannels.js';

interface SuggestedCategory {
  categoryId: string;
  categoryName: string;
  categoryPath: string;
  leaf: boolean;
}

const props = defineProps<{
  marketplaceId: string | null;
  name: string | null;
}>();

const emit = defineEmits<{
  (e: 'select', categoryId: string): void;
}>();

const { t } = useI18n();

const expanded = ref(false);
const query = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const suggestions = ref<SuggestedCategory[]>([]);
const hasSearched = ref(false);

watch(
  () => props.name,
  (value) => {
    if (!expanded.value) {
      query.value = value || '';
    }
  },
  { immediate: true },
);

const open = () => {
  expanded.value = true;
  query.value = props.name || '';
  suggestions.value = [];
  error.value = null;
  hasSearched.value = false;
};

const close = () => {
  expanded.value = false;
  suggestions.value = [];
  error.value = null;
  hasSearched.value = false;
};

const suggest = async () => {
  if (!props.marketplaceId || !query.value.trim() || loading.value) {
    return;
  }

  loading.value = true;
  error.value = null;
  hasSearched.value = false;

  try {
    const { data } = await apolloClient.mutate({
      mutation: suggestEbayCategoryMutation,
      variables: {
        name: query.value.trim(),
        marketplace: { id: props.marketplaceId },
      },
    });

    suggestions.value = data?.suggestEbayCategory?.categories || [];
    hasSearched.value = true;
  } catch (err) {
    error.value = t('products.products.ebay.suggestion.error');
    displayApolloError(err);
  } finally {
    loading.value = false;
  }
};

const selectSuggestion = (suggestion: SuggestedCategory) => {
  if (!suggestion.leaf) {
    Toast.info(t('products.products.ebay.leafRestriction'));
    return;
  }

  emit('select', suggestion.categoryId);
  close();
};
</script>

<template>
  <div class="mt-6 border rounded bg-white p-4">
    <h6 class="font-semibold text-sm mb-1">
      {{ t('products.products.ebay.suggestion.title') }}
    </h6>
    <p class="text-xs text-gray-500 mb-3">
      {{ t('products.products.ebay.suggestion.description') }}
    </p>

    <div v-if="!expanded">
      <Button
        class="btn btn-sm btn-outline-primary"
        :disabled="!marketplaceId"
        @click="open"
      >
        {{ t('products.products.ebay.suggestion.openButton') }}
      </Button>
    </div>

    <div v-else>
      <div class="flex flex-col sm:flex-row gap-2">
        <input
          v-model="query"
          type="text"
          class="form-input flex-1"
          :placeholder="t('products.products.ebay.suggestion.placeholder')"
          @keyup.enter="suggest"
        />
        <Button
          class="btn btn-sm btn-outline-primary"
          :disabled="loading || !query.trim() || !marketplaceId"
          :loading="loading"
          @click="suggest"
        >
          {{ t('products.products.ebay.suggestion.button') }}
        </Button>
        <Button class="btn btn-sm btn-outline-dark" :disabled="loading" @click="close">
          {{ t('shared.button.cancel') }}
        </Button>
      </div>

      <p v-if="error" class="text-xs text-red-600 mt-2">
        {{ error }}
      </p>

      <div v-if="loading" class="mt-3">
        <LocalLoader :loading="true" />
      </div>

      <div v-else-if="hasSearched" class="mt-3">
        <div v-if="suggestions.length" class="max-h-80 space-y-2 overflow-y-auto pr-1">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion.categoryId"
            type="button"
            class="w-full rounded border border-blue-200 bg-blue-50 px-3 py-3 text-left transition hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!suggestion.leaf"
            @click="selectSuggestion(suggestion)"
          >
            <div class="text-sm font-medium text-gray-900">
              {{ suggestion.categoryName }}
            </div>
            <div class="mt-1 text-xs text-gray-600">
              {{ suggestion.categoryPath || suggestion.categoryId }}
            </div>
          </button>
        </div>

        <div v-else class="text-sm text-gray-500">
          {{ t('products.products.ebay.suggestion.empty') }}
        </div>
      </div>
    </div>
  </div>
</template>
