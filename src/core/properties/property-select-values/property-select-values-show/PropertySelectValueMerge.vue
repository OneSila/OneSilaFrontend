<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '../../../../shared/components/atoms/button';
import { Modal } from '../../../../shared/components/atoms/modal';
import { Selector } from '../../../../shared/components/atoms/selector';
import apolloClient from '../../../../../apollo-client';
import { propertySelectValuesQuerySimpleSelector, productPropertiesCountQuery } from '../../../../shared/api/queries/properties.js';
import { mergePropertySelectValueMutation } from '../../../../shared/api/mutations/properties.js';
import { Toast } from '../../../../shared/modules/toast';
import { processGraphQLErrors } from '../../../../shared/utils';

const props = defineProps<{ id: string; propertyId: string }>();

const { t } = useI18n();
const showModal = ref(false);
const target = ref<string | null>(null);
const options = ref<{ label: string; value: string }[]>([]);
const currentCount = ref(0);
const targetCount = ref(0);

const fetchCount = async (id: string) => {
  const { data } = await apolloClient.query({
    query: productPropertiesCountQuery,
    variables: {
      filter: {
        valueSelect: { id: { exact: id } },
        OR: { valueMultiSelect: { id: { exact: id } } },
      },
    },
    fetchPolicy: 'network-only',
  });
  return data?.productProperties?.totalCount || 0;
};

const openModal = async () => {
  await fetchOptions();
  showModal.value = true;
};

const fetchOptions = async () => {
  const { data } = await apolloClient.query({
    query: propertySelectValuesQuerySimpleSelector,
    variables: { filter: { property: { id: { exact: props.propertyId } } } },
    fetchPolicy: 'network-only',
  });
  options.value =
    data?.propertySelectValues?.edges
      ?.map((e: any) => ({ label: e.node.value, value: e.node.id }))
      .filter((opt: any) => opt.value !== props.id) || [];
};

onMounted(async () => {
  currentCount.value = await fetchCount(props.id);
});

watch(target, async (val) => {
  if (val) {
    targetCount.value = await fetchCount(val);
  } else {
    targetCount.value = 0;
  }
});

const mergeValues = async () => {
  if (!target.value) return;
  const sources = [{ id: props.id }];
  try {
    await apolloClient.mutate({
      mutation: mergePropertySelectValueMutation,
      variables: { sources, target: { id: target.value } },
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
    <Button type="button" class="btn btn-secondary" @click="openModal">
      {{ t('properties.values.merge.button') }}
    </Button>

    <Modal v-model="showModal" @closed="showModal = false">
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-4">{{ t('properties.values.merge.title') }}</h3>
        <p class="text-sm mb-2">
          {{ t('properties.values.merge.counter', { count: currentCount }) }}
        </p>
        <Selector
          v-model="target"
          :options="options"
          label-by="label"
          value-by="value"
          class="w-full mb-2"
          :placeholder="t('properties.values.merge.selectTarget')"
        />
        <p v-if="target" class="text-sm mb-4">
          {{ t('properties.values.merge.counter', { count: targetCount }) }}
        </p>
        <p class="text-sm text-red-600">{{ t('properties.values.merge.warning') }}</p>
        <div class="mt-4 text-right">
          <Button type="button" class="btn btn-primary" @click="mergeValues">
            {{ t('properties.values.merge.confirm') }}
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

