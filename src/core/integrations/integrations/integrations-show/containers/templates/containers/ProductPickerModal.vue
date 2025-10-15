<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../apollo-client';
import { Modal } from '../../../../../../../shared/components/atoms/modal';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { TextInput } from '../../../../../../../shared/components/atoms/input-text';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import { minimalProductsQuery } from '../../../../../../../shared/api/queries/products.js';

const props = defineProps<{ modelValue: boolean }>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (
    e: 'selected',
    payload: { id: string; name: string; sku: string | null; thumbnailUrl: string | null },
  ): void;
}>();

const { t } = useI18n();

const localValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const searchTerm = ref('');
const results = ref<any[]>([]);
const loading = ref(false);
const errorMessage = ref('');
const selectedProductId = ref<string | null>(null);

const close = () => {
  emit('update:modelValue', false);
};

const resetState = () => {
  searchTerm.value = '';
  results.value = [];
  errorMessage.value = '';
  selectedProductId.value = null;
};

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      fetchProducts();
    } else {
      resetState();
    }
  },
);

const fetchProducts = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const variables: Record<string, any> = { first: 10 };
    const trimmed = searchTerm.value.trim();
    if (trimmed) {
      variables.filter = { search: trimmed };
    }

    const { data } = await apolloClient.query({
      query: minimalProductsQuery,
      variables,
      fetchPolicy: 'network-only',
    });

    results.value = data?.products?.edges?.map((edge: any) => edge.node) ?? [];
  } catch (error) {
    console.error('Failed to load products', error);
    errorMessage.value = t('integrations.show.template.productPicker.loadError');
  } finally {
    loading.value = false;
  }
};

const handleSearch = async () => {
  await fetchProducts();
};

const confirmSelection = () => {
  if (!selectedProductId.value) return;
  const product = results.value.find((item) => item.id === selectedProductId.value);
  if (!product) return;
  emit('selected', {
    id: product.id,
    name: product.name,
    sku: product.sku ?? null,
    thumbnailUrl: product.thumbnailUrl ?? null,
  });
  close();
};
</script>

<template>
  <Modal v-model="localValue" @closed="close">
    <div class="w-full max-w-5xl p-6 bg-white rounded-lg shadow-lg">
      <header class="space-y-2">
        <h3 class="text-xl font-semibold text-gray-900">
          {{ t('integrations.show.template.productPicker.title') }}
        </h3>
        <p class="text-sm text-gray-600">
          {{ t('integrations.show.template.productPicker.description') }}
        </p>
      </header>

      <div class="mt-4 flex flex-col gap-3 sm:flex-row">
        <div class="flex-1">
          <TextInput
            v-model="searchTerm"
            :placeholder="t('integrations.show.template.productPicker.searchPlaceholder')"
            class="w-full"
          />
        </div>
        <div class="flex justify-end gap-2">
          <Button :customClass="'btn btn-secondary px-4'" @click="handleSearch">
            <Icon name="search" class="mr-2" />
            {{ t('shared.button.search') }}
          </Button>
          <Button :customClass="'btn btn-secondary px-4'" @click="fetchProducts">
            <Icon name="refresh" class="mr-2" />
            {{ t('shared.button.refresh') }}
          </Button>
        </div>
      </div>

      <div class="mt-6 border border-gray-200 rounded-lg divide-y">
        <div v-if="loading" class="flex items-center justify-center p-6 text-sm text-gray-600">
          <Icon name="spinner" class="mr-2 animate-spin" />
          {{ t('shared.labels.loading') }}
        </div>
        <div v-else>
          <p v-if="errorMessage" class="p-4 text-sm text-red-600">{{ errorMessage }}</p>
          <p v-else-if="!results.length" class="p-4 text-sm text-gray-600">
            {{ t('integrations.show.template.productPicker.empty') }}
          </p>
          <ul v-else class="divide-y">
            <li
              v-for="product in results"
              :key="product.id"
              class="flex items-start justify-between gap-4 p-4 hover:bg-gray-50"
            >
              <label class="flex flex-1 cursor-pointer items-start gap-4">
                <input
                  v-model="selectedProductId"
                  :value="product.id"
                  class="mt-1 h-4 w-4"
                  name="template-product"
                  type="radio"
                />
                <div class="flex items-start gap-4">
                  <div
                    class="flex h-12 w-12 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-50"
                  >
                    <img
                      v-if="product.thumbnailUrl"
                      :alt="
                        t('integrations.show.template.productPicker.thumbnailAlt', {
                          name: product.name || t('shared.labels.unnamed'),
                        })
                      "
                      :src="product.thumbnailUrl"
                      class="h-full w-full object-cover"
                    />
                    <Icon v-else name="image" class="text-gray-400" />
                  </div>
                  <div class="space-y-1">
                    <p class="text-sm font-semibold text-gray-900">
                      {{ product.name || t('shared.labels.unnamed') }}
                      <span
                        v-if="product.sku"
                        class="ml-2 text-xs font-medium uppercase tracking-wide text-gray-500"
                      >
                        [{{ product.sku }}]
                      </span>
                    </p>
                    <p v-if="product.sku" class="text-xs text-gray-500">
                      {{ t('integrations.show.template.productPicker.skuLabel', { sku: product.sku }) }}
                    </p>
                  </div>
                </div>
              </label>
            </li>
          </ul>
        </div>
      </div>

      <footer class="mt-6 flex justify-end gap-3">
        <Button :customClass="'btn btn-secondary px-4'" @click="close">
          {{ t('shared.button.cancel') }}
        </Button>
        <Button
          :customClass="'btn btn-primary px-4'"
          :disabled="!selectedProductId"
          @click="confirmSelection"
        >
          {{ t('integrations.show.template.productPicker.confirm') }}
        </Button>
      </footer>
    </div>
  </Modal>
</template>
