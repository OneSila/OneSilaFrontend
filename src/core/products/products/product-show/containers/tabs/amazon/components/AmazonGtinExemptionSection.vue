<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../../apollo-client';
import { Toggle } from '../../../../../../../../shared/components/atoms/toggle';
import { Toast } from '../../../../../../../../shared/modules/toast';
import { displayApolloError } from '../../../../../../../../shared/utils';
import { amazonGtinExemptionsQuery } from '../../../../../../../../shared/api/queries/amazonGtinExemptions.js';
import {
  createAmazonGtinExemptionMutation,
  updateAmazonGtinExemptionMutation,
} from '../../../../../../../../shared/api/mutations/amazonGtinExemptions.js';
import { Button } from "../../../../../../../../shared/components/atoms/button";

const props = defineProps<{ productId?: string; viewId?: string }>();

const { t } = useI18n();

const loading = ref(false);
const saving = ref(false);
const exemptionId = ref<string | null>(null);
const value = ref(false);
const initialValue = ref(false);

const fetchExemption = async () => {
  if (!props.productId || !props.viewId) return;
  loading.value = true;
  try {
    const { data } = await apolloClient.query({
      query: amazonGtinExemptionsQuery,
      variables: { productId: props.productId, viewId: props.viewId },
      fetchPolicy: 'network-only',
    });
    const node = data.amazonGtinExemptions?.edges?.[0]?.node;
    if (node) {
      exemptionId.value = node.id;
      value.value = node.value;
      initialValue.value = node.value;
    } else {
      exemptionId.value = null;
      value.value = false;
      initialValue.value = false;
    }
  } catch (error) {
    displayApolloError(error);
  }
  loading.value = false;
};

watch(
  () => [props.productId, props.viewId],
  () => {
    fetchExemption();
  },
  { immediate: true },
);

const save = async () => {
  if (!props.productId || !props.viewId) return;
  saving.value = true;
  try {
    if (exemptionId.value) {
      const { data } = await apolloClient.mutate({
        mutation: updateAmazonGtinExemptionMutation,
        variables: { data: { id: exemptionId.value, value: value.value } },
      });
      exemptionId.value = data.updateAmazonGtinExemption.id;
      initialValue.value = data.updateAmazonGtinExemption.value;
    } else {
      const { data } = await apolloClient.mutate({
        mutation: createAmazonGtinExemptionMutation,
        variables: {
          data: {
            product: { id: props.productId },
            view: { id: props.viewId },
            value: value.value,
          },
        },
      });
      exemptionId.value = data.createAmazonGtinExemption.id;
      initialValue.value = data.createAmazonGtinExemption.value;
    }
    Toast.success(t('products.products.amazon.gtinExemptionSaved'));
  } catch (error) {
    displayApolloError(error);
  }
  saving.value = false;
};
</script>

<template>
  <div>
    <h4 class="font-semibold mb-2">{{ t('products.products.amazon.gtinExemption') }}</h4>
    <p class="text-xs text-gray-500 mb-2">{{ t('products.products.amazon.gtinExemptionDescription') }}</p>
    <div class="flex items-center gap-4">
      <Toggle v-model="value" :disabled="loading" />
      <Button class="btn btn-sm btn-primary" :disabled="saving || value === initialValue" @click="save">
        {{ t('shared.button.save') }}
      </Button>
    </div>
  </div>
</template>
