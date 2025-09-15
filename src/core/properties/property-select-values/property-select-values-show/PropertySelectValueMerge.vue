<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '../../../../shared/components/atoms/button';
import { Modal } from '../../../../shared/components/atoms/modal';
import { Selector } from '../../../../shared/components/atoms/selector';
import { Card } from '../../../../shared/components/atoms/card';
import { Icon } from '../../../../shared/components/atoms/icon';
import { LocalLoader } from '../../../../shared/components/atoms/local-loader';
import apolloClient from '../../../../../apollo-client';
import { propertySelectValuesQuerySimpleSelector, productPropertiesCountQuery } from '../../../../shared/api/queries/properties.js';
import { mergePropertySelectValueMutation } from '../../../../shared/api/mutations/properties.js';
import { Toast } from '../../../../shared/modules/toast';
import { processGraphQLErrors } from '../../../../shared/utils';
import debounce from "lodash.debounce";

const props = defineProps<{ id: string; propertyId: string; currentLabel: string }>();

const { t } = useI18n();
const showModal = ref(false);
const selectedOption = ref<string | null>(null);
const options = ref<{ label: string; value: string }[]>([]);
const sources = ref<{ id: string; label: string; count: number }[]>([]);
const currentCount = ref(0);
const loading = ref(false);

const fetchCount = async (id: string) => {
  const { data } = await apolloClient.query({
    query: productPropertiesCountQuery,
    variables: {
      filter: {
        valueSelect: { id: { exact: id } },
        OR: { valueMultiSelect: { id: { exact: id } } },
      },
    },
    fetchPolicy: 'cache-first',
  });
  return data?.productProperties?.totalCount || 0;
};

const openModal = () => {
  showModal.value = true;
  selectedOption.value = null;
  sources.value = [];
  void loadData();
};

const loadData = async () => {
  loading.value = true;
  try {
    await fetchOptions();
    currentCount.value = await fetchCount(props.id);
  } finally {
    loading.value = false;
  }
};

const fetchOptions = async (searchValue: string | null = null) => {
  const variables = { filter: { property: { id: { exact: props.propertyId } } }, search: null } as any;

  if (searchValue !== null && searchValue !== undefined) {
    variables.filter.search = searchValue;
  }

  const { data } = await apolloClient.query({
    query: propertySelectValuesQuerySimpleSelector,
    variables: variables,
    fetchPolicy: 'cache-first',
  });
  const fetched =
    data?.propertySelectValues?.edges?.map((e: any) => ({ label: e.node.value, value: e.node.id })) || [];
  options.value = fetched.filter((opt) => opt.value !== props.id && !sources.value.find((s) => s.id === opt.value));
};

const handleInput = debounce(async (searchValue: string) => {
  fetchOptions(searchValue);
}, 500);

onMounted(async () => {
  currentCount.value = await fetchCount(props.id);
});

const addSource = async () => {
  if (!selectedOption.value) return;
  const option = options.value.find((o) => o.value === selectedOption.value);
  if (!option) return;
  const count = await fetchCount(selectedOption.value);
  sources.value.push({ id: selectedOption.value, label: option.label, count });
  options.value = options.value.filter((o) => o.value !== selectedOption.value);
  selectedOption.value = null;
};

const removeSource = (id: string) => {
  const idx = sources.value.findIndex((s) => s.id === id);
  if (idx !== -1) {
    options.value.push({ label: sources.value[idx].label, value: id });
    sources.value.splice(idx, 1);
  }
};

const mergeValues = async () => {
  if (sources.value.length === 0) return;
  const sourcesInput = sources.value.map((s) => ({ id: s.id }));
  try {
    await apolloClient.mutate({
      mutation: mergePropertySelectValueMutation,
      variables: { sources: sourcesInput, target: { id: props.id } },
    });
    Toast.success(t('properties.values.merge.success'));
    showModal.value = false;
  } catch (err: any) {
    const errors = processGraphQLErrors(err, t);
    Toast.error(errors['__all__'] || t('properties.values.merge.error'));
  }
};
</script>

<template>
  <div>
    <Button type="button" class="rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm btn-secondary" @click="openModal">
      {{ t('properties.values.merge.button') }}
    </Button>

    <Modal v-model="showModal" @closed="showModal = false">
      <Card class="modal-content w-2/3">
        <LocalLoader :loading="loading" />
        <template v-if="!loading">
          <h3 class="text-xl font-semibold mb-4">{{ t('properties.values.merge.title') }}</h3>
          <p>{{ t('properties.values.merge.detailDescription', { value: props.currentLabel }) }}</p>
          <p class="mb-4 text-sm text-gray-500">{{ t('properties.values.merge.current', { value: props.currentLabel, count: currentCount }) }}</p>
          <hr class="my-4" />
          <div class="flex items-center gap-2 mb-4">
            <Selector
              v-model="selectedOption"
              :options="options"
              label-by="label"
              value-by="value"
              class="flex-1"
              @searched="fetchOptions"
              :placeholder="t('properties.values.merge.selectSource')"
            />
            <Button class="btn btn-secondary" :disabled="!selectedOption" @click="addSource">
              {{ t('shared.button.add') }}
            </Button>
          </div>
          <div v-for="src in sources" :key="src.id" class="flex items-center justify-between mb-2">
            <div>
              <div>{{ src.label }}</div>
              <div class="text-sm text-gray-500">{{ t('properties.values.merge.counter', { count: src.count }) }}</div>
            </div>
            <Button class="btn btn-outline-danger" @click="removeSource(src.id)">
              <Icon name="trash" size="sm" />
            </Button>
          </div>
          <p class="text-sm text-red-600 mt-4">{{ t('properties.values.merge.warning') }}</p>
          <div class="flex justify-end gap-4 mt-4">
            <Button class="btn btn-outline-dark" @click="showModal = false">{{ t('shared.button.cancel') }}</Button>
            <Button type="button" class="btn btn-primary" @click="mergeValues">
              {{ t('properties.values.merge.confirm') }}
            </Button>
          </div>
        </template>
      </Card>
    </Modal>
  </div>
</template>

