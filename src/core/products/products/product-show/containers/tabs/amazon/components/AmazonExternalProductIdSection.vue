<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { amazonExternalProductIdsQuery } from '../../../../../../../../shared/api/queries/amazonExternalProductIds.js';
import {
  createAmazonExternalProductIdMutation,
  updateAmazonExternalProductIdMutation,
  deleteAmazonExternalProductIdMutation,
} from '../../../../../../../../shared/api/mutations/amazonExternalProductIds.js';
import { processGraphQLErrors } from '../../../../../../../../shared/utils';
import { Toast } from '../../../../../../../../shared/modules/toast';
import { FieldValue } from '../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-value';
import { FieldChoice } from '../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-choice';
import { ValueFormField, ChoiceFormField } from '../../../../../../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../../../../../../shared/utils/constants';
import apolloClient from '../../../../../../../../../apollo-client';
import { Button } from '../../../../../../../../shared/components/atoms/button';

const props = defineProps<{ product: any; view: any }>();
const { t } = useI18n();

const type = ref('ASIN');
const value = ref('');
const createdAsin = ref('');
const externalId = ref<string | null>(null);
const lastSavedType = ref('ASIN');
const lastSavedValue = ref('');
const errors = ref<Record<string, string>>({});
const loading = ref(false);
const isMissing = ref(false);

const typeOptions = [
  { label: 'ASIN', value: 'ASIN' },
  { label: 'UPC', value: 'UPC' },
  { label: 'ISBN', value: 'ISBN' },
  { label: 'GCID', value: 'GCID' },
  { label: 'GTIN', value: 'GTIN' },
  { label: 'JAN', value: 'JAN' },
];

const typeField = (): ChoiceFormField => ({
  type: FieldType.Choice,
  name: 'type',
  label: t('products.products.amazon.identifierType'),
  options: typeOptions,
  labelBy: 'label',
  valueBy: 'value',
});

const valueField = (): ValueFormField => ({
  type: FieldType.Text,
  name: 'value',
  label: t('products.products.amazon.identifierValue'),
  placeholder: t('products.products.amazon.externalProductIdPlaceholder'),
});

const fetchExternalId = async () => {
  if (!props.product?.id || !props.view?.id) return;
  loading.value = true;
  const { data } = await apolloClient.query({
    query: amazonExternalProductIdsQuery,
    variables: {
      filter: {
        product: { id: { exact: props.product.id } },
        view: { id: { exact: props.view.id } },
      },
    },
    fetchPolicy: 'cache-first',
  });
  const node = data?.amazonExternalProductIds?.edges?.[0]?.node;
  externalId.value = node?.id || null;
  type.value = node?.type || 'ASIN';
  value.value = node?.value || '';
  createdAsin.value = node?.createdAsin || '';
  lastSavedType.value = type.value;
  lastSavedValue.value = value.value;
  isMissing.value = !node;
  loading.value = false;
};

watch(
  () => [props.product?.id, props.view?.id],
  () => {
    type.value = 'ASIN';
    value.value = '';
    externalId.value = null;
    createdAsin.value = '';
    lastSavedType.value = 'ASIN';
    lastSavedValue.value = '';
    fetchExternalId();
  },
  { immediate: true },
);

const handleSave = async () => {
  errors.value = {};
  const trimmed = value.value.trim();
  try {
    if (!trimmed) {
      if (externalId.value) {
        await apolloClient.mutate({
          mutation: deleteAmazonExternalProductIdMutation,
          variables: { id: externalId.value },
        });
        Toast.success(t('products.products.amazon.externalProductIdDeleted'));
        externalId.value = null;
        createdAsin.value = '';
        lastSavedType.value = 'ASIN';
        lastSavedValue.value = '';
      }
      return;
    }

    if (externalId.value) {
      await apolloClient.mutate({
        mutation: updateAmazonExternalProductIdMutation,
        variables: { data: { id: externalId.value, type: type.value, value: trimmed } },
      });
    } else {
      await apolloClient.mutate({
        mutation: createAmazonExternalProductIdMutation,
        variables: {
          data: {
            product: { id: props.product.id },
            view: { id: props.view.id },
            type: type.value,
            value: trimmed,
          },
        },
      });
    }
    Toast.success(t('products.products.amazon.externalProductIdSaved'));
    lastSavedType.value = type.value;
    lastSavedValue.value = trimmed;
    fetchExternalId();
  } catch (err) {
    errors.value = processGraphQLErrors(err, t);
  }
};

const isSaveDisabled = computed(
  () => type.value === lastSavedType.value && value.value === lastSavedValue.value,
);
const showAlert = computed(
  () => !props.view?.isDefault && !loading.value && isMissing.value,
);
</script>

<template>
  <div>
    <Flex gap="2">
      <FlexCell>
        <h4 class="font-semibold mb-2">{{ t('products.products.amazon.externalProductId') }}</h4>
      </FlexCell>
      <FlexCell>
        <div v-if="showAlert" class="text-danger text-small blink-animation ml-1 mb-1">
          <Icon size="sm" name="exclamation-circle"/>
          <span class="ml-1">
            {{ t('products.products.amazon.defaultMarketplaceFallback') }}
          </span>
        </div>
      </FlexCell>
    </Flex>

    <p class="text-xs text-gray-500 mb-2">
      {{ t('products.products.amazon.externalProductIdDescription') }}
    </p>

    <div v-if="errors.value || errors.type" class="text-danger text-small mb-2">
      {{ errors.value || errors.type }}
    </div>
    <Flex middle gap="2" class="mb-2">
      <FlexCell>
        <FieldChoice class="w-48" v-model="type" :field="typeField()" />
      </FlexCell>
      <FlexCell>
        <FieldValue class="w-96" v-model="value" :field="valueField()" />
      </FlexCell>
      <FlexCell>
        <Button class="btn btn-sm btn-primary" :disabled="isSaveDisabled" @click="handleSave">
          {{ t('shared.button.save') }}
        </Button>
      </FlexCell>
    </Flex>

    <div v-if="createdAsin" class="text-xs text-gray-500">
      {{ t('products.products.amazon.createdAsin') }}: {{ createdAsin }}
    </div>
  </div>
</template>
