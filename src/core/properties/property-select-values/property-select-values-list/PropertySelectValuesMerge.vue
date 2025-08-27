<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '../../../../shared/components/atoms/button';
import { Modal } from '../../../../shared/components/atoms/modal';
import { Card } from '../../../../shared/components/atoms/card';
import { Toggle } from '../../../../shared/components/atoms/toggle';
import { Icon } from '../../../../shared/components/atoms/icon';
import apolloClient from '../../../../../apollo-client';
import { propertySelectValuesQuery, productPropertiesCountQuery } from '../../../../shared/api/queries/properties.js';
import { mergePropertySelectValueMutation } from '../../../../shared/api/mutations/properties.js';
import { Toast } from '../../../../shared/modules/toast';
import { processGraphQLErrors } from '../../../../shared/utils';

const props = defineProps<{ selectedEntities: string[] }>();
const emit = defineEmits<{ (e: 'merged'): void }>();

const { t } = useI18n();
const showModal = ref(false);
const values = ref<{ id: string; value: string; count: number }[]>([]);
const target = ref<string | null>(null);

const openModal = async () => {
  await fetchValues();
  showModal.value = true;
};

const fetchValues = async () => {
  const { data } = await apolloClient.query({
    query: propertySelectValuesQuery,
    variables: { filter: { id: { inList: props.selectedEntities } } },
    fetchPolicy: 'network-only',
  });
  const edges = data?.propertySelectValues?.edges || [];
  const result = await Promise.all(
    edges.map(async (edge: any) => {
      const id = edge.node.id;
      const { data: countData } = await apolloClient.query({
        query: productPropertiesCountQuery,
        variables: {
          filter: {
            valueSelect: { id: { exact: id } },
            OR: { valueMultiSelect: { id: { exact: id } } },
          },
        },
        fetchPolicy: 'network-only',
      });
      return {
        id,
        value: edge.node.value,
        count: countData?.productProperties?.totalCount || 0,
      };
    })
  );
  values.value = result;
  if (result.length > 0) {
    target.value = result.reduce((max, item) => (item.count > max.count ? item : max), result[0]).id;
  }
};

const onToggle = (id: string) => {
  target.value = id;
};

const mergeValues = async () => {
  if (!target.value) return;
  const sources = values.value
    .filter((v) => v.id !== target.value)
    .map((v) => ({ id: v.id }));
  try {
    await apolloClient.mutate({
      mutation: mergePropertySelectValueMutation,
      variables: { sources, target: { id: target.value } },
    });
    Toast.success(t('properties.values.merge.success'));
    showModal.value = false;
    emit('merged');
  } catch (err: any) {
    const errors = processGraphQLErrors(err, t);
    Toast.error(errors['__all__'] || t('properties.values.merge.error'));
  }
};
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center rounded bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-800 shadow-sm ring-1 ring-inset ring-blue-300 hover:bg-blue-100 disabled:opacity-50"
    :disabled="selectedEntities.length <= 1"
    @click="openModal"
  >
    <Icon name="code-merge" size="sm" class="mr-2 text-blue-600" />
    {{ t('properties.values.merge.button') }}
  </button>

  <Modal v-model="showModal" @closed="showModal = false">
    <Card class="modal-content w-2/3">
      <h3 class="text-xl font-semibold mb-4">{{ t('properties.values.merge.title') }}</h3>
      <p class="mb-4">{{ t('properties.values.merge.description') }}</p>
      <div v-for="val in values" :key="val.id" class="flex items-center justify-between py-2">
        <div>
          <div>{{ val.value }}</div>
          <div class="text-sm text-gray-500">{{ t('properties.values.merge.counter', { count: val.count }) }}</div>
        </div>
        <Toggle
          :model-value="target === val.id"
          @update:model-value="() => onToggle(val.id)"
        />
      </div>
      <p class="text-sm text-red-600 mt-4">{{ t('properties.values.merge.warning') }}</p>
      <div class="flex justify-end gap-4 mt-4">
        <Button class="btn btn-outline-dark" @click="showModal = false">{{ t('shared.button.cancel') }}</Button>
        <Button type="button" class="btn btn-primary" @click="mergeValues">
          {{ t('properties.values.merge.confirm') }}
        </Button>
      </div>
    </Card>
  </Modal>
</template>

