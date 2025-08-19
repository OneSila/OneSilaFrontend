<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { amazonMerchantAsinsQuery } from '../../../../../../../../shared/api/queries/amazonMerchantAsins.js';
import {
  createAmazonMerchantAsinMutation,
  updateAmazonMerchantAsinMutation,
  deleteAmazonMerchantAsinMutation,
} from '../../../../../../../../shared/api/mutations/amazonMerchantAsins.js';
import { processGraphQLErrors } from '../../../../../../../../shared/utils';
import { Toast } from '../../../../../../../../shared/modules/toast';
import { PrimaryButton } from '../../../../../../../../shared/components/atoms/button-primary';
import { FieldValue } from '../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-value';
import { ValueFormField } from '../../../../../../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../../../../../../shared/utils/constants';
import { Label } from '../../../../../../../../shared/components/atoms/label';
import apolloClient from "../../../../../../../../../apollo-client";

const props = defineProps<{ product: any; view: any }>();
const { t } = useI18n();

const asin = ref('');
const asinId = ref<string | null>(null);
const lastSavedAsin = ref('');
const errors = ref<Record<string, string>>({});

const field = (): ValueFormField => ({
  type: FieldType.Text,
  name: 'asin',
  label: t('products.products.amazon.asin'),
  placeholder: t('products.products.amazon.asinPlaceholder'),
});

const fetchAsin = async () => {
  if (!props.product?.id || !props.view?.id) return;
  const { data } = await apolloClient.query({
    query: amazonMerchantAsinsQuery,
    variables: {
      filter: {
        product: { id: { exact: props.product.id } },
        view: { id: { exact: props.view.id } },
      },
    },
    fetchPolicy: 'network-only',
  });
  const node = data?.amazonMerchantAsins?.edges?.[0]?.node;
  asinId.value = node?.id || null;
  asin.value = node?.asin || '';
  lastSavedAsin.value = asin.value;
};

watch(
  () => [props.product?.id, props.view?.id],
  () => {
    asin.value = '';
    asinId.value = null;
    lastSavedAsin.value = '';
    fetchAsin();
  },
  { immediate: true },
);

const handleSave = async () => {
  errors.value = {};
  const value = asin.value.trim();
  try {
    if (!value) {
      if (asinId.value) {
        await apolloClient.mutate({
          mutation: deleteAmazonMerchantAsinMutation,
          variables: { id: asinId.value },
        });
        Toast.success(t('products.products.amazon.asinDeleted'));
        asinId.value = null;
        lastSavedAsin.value = '';
      }
      return;
    }

    if (asinId.value) {
      await apolloClient.mutate({
        mutation: updateAmazonMerchantAsinMutation,
        variables: { data: { id: asinId.value, asin: value } },
      });
    } else {
      await apolloClient.mutate({
        mutation: createAmazonMerchantAsinMutation,
        variables: {
          data: {
            product: { id: props.product.id },
            view: { id: props.view.id },
            asin: value,
          },
        },
      });
    }
    Toast.success(t('products.products.amazon.asinSaved'));
    lastSavedAsin.value = value;
    fetchAsin();
  } catch (err) {
    errors.value = processGraphQLErrors(err, t);
  }
};

const isSaveDisabled = computed(() => asin.value === lastSavedAsin.value);
</script>

<template>
  <div>
    <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
      {{ t('products.products.amazon.asin') }}
    </Label>
    <p class="text-xs text-gray-500 mb-2">
      {{ t('products.products.amazon.asinDescription') }}
    </p>
    <div v-if="errors.asin" class="text-danger text-small mb-2">
      {{ errors.asin }}
    </div>
    <Flex middle gap="2">
      <FlexCell>
        <FieldValue class="w-96" v-model="asin" :field="field()" />
      </FlexCell>
      <FlexCell>
          <PrimaryButton :disabled="isSaveDisabled" @click="handleSave">
            {{ t('shared.button.save') }}
          </PrimaryButton>
      </FlexCell>
    </Flex>
  </div>
</template>
