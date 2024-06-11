<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { FieldType } from "../../../../../shared/utils/constants";
import { CheckboxFormField, ValueFormField } from "../../../../../shared/components/organisms/general-form/formConfig";
import { onMounted, reactive, ref } from "vue";
import { FieldValue } from "../../../../../shared/components/organisms/general-form/containers/form-fields/field-value";
import { FieldCheckbox } from "../../../../../shared/components/organisms/general-form/containers/form-fields/field-checkbox";
import apolloClient from "../../../../../../apollo-client";
import { currenciesQuery } from "../../../../../shared/api/queries/currencies.js";
import { PrimaryButton } from "../../../../../shared/components/atoms/button-primary";
import { createCurrencyMutation, updateCurrencyMutation } from "../../../../../shared/api/mutations/currencies.js";
import {processGraphQLErrors} from "../../../../../shared/utils";
import {Toast} from "../../../../../shared/modules/toast";


const { t } = useI18n();
const emit = defineEmits(['currency-added']);
const isEdit = ref(false);
const mutation = ref(createCurrencyMutation);

const form = reactive({
  id: null,
  name: null,
  isoCode: null,
  symbol: null,
  isDefaultCurrency: true,
});

const fields = {
  name: {
    type: FieldType.Text,
    name: 'name',
    label: t('shared.labels.name'),
    placeholder: t('shared.placeholders.name'),
  },
  isoCode: {
    type: FieldType.Text,
    name: 'isoCode',
    label: t('settings.currencies.labels.isoCode'),
    placeholder: t('settings.currencies.placeholders.isoCode'),
  },
  symbol: {
    type: FieldType.Text,
    name: 'symbol',
    label: t('settings.currencies.labels.symbol'),
    placeholder: t('settings.currencies.placeholders.symbol'),
  },
}

const setCurrency = async () => {
  const { data } = await apolloClient.query({
    query: currenciesQuery,
  });

  if (data && data.currencies && data.currencies.edges && data.currencies.edges.length > 0) {
    isEdit.value = true;
    mutation.value = updateCurrencyMutation;
    const currency = data.currencies.edges[0].node;
    form.id = currency.id;
    form.name = currency.name;
    form.isoCode = currency.isoCode;
    form.symbol = currency.symbol;
    form.isDefaultCurrency = currency.isDefaultCurrency;
  }
}

onMounted(setCurrency);

const getMutationVariables = () => {
  let variables = {
    name: form.name,
    isoCode: form.isoCode,
    symbol: form.symbol,
    isDefaultCurrency: form.isDefaultCurrency,
  }

  if (form.id) {
    variables['id'] = form.id
  }

  return {data: variables};
}

const afterUpdate = () => {
  emit('currency-added');
}

const disableButton = () => {
  return !form.name || !form.isoCode || !form.symbol;
};

const onError = (error) => {
  const validationErrors = processGraphQLErrors(error, t);
  for (const key in validationErrors) {
    if (validationErrors.hasOwnProperty(key)) {
      Toast.error(validationErrors[key]);
    }
}};

</script>

<template>
  <div class="pb-10">
    <h1 class="text-xl text-primary mb-4">{{ t('dashboard.onboarding.addCurrency.subTitle') }}</h1>
    <hr>
    <h1 class="text-2xl my-4">{{ t('dashboard.onboarding.addCurrency.content') }}</h1>
    <div class="w-full lg:w-1/2">
      <div class="col-span-full mt-3">
        <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ fields['name'].label }}</label>
        <FieldValue :field="fields['name'] as ValueFormField" :model-value="form.name" @update:modelValue="form.name = $event" />
      </div>
      <div class="col-span-full mt-3">
        <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ fields['isoCode'].label }}</label>
        <FieldValue :field="fields['isoCode'] as ValueFormField" :model-value="form.isoCode" @update:modelValue="form.isoCode = $event" />
      </div>
      <div class="col-span-full mt-3">
        <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ fields['symbol'].label }}</label>
        <FieldValue :field="fields['symbol'] as ValueFormField" :model-value="form.symbol" @update:modelValue="form.symbol = $event" />
      </div>
    </div>
    <div class="col-span-full mt-3">
    <ApolloMutation :mutation="mutation" :variables="getMutationVariables()" @done="afterUpdate" @error="onError">
      <template v-slot="{ mutate, loading, error }">
        <PrimaryButton  :disabled="loading || disableButton()" @click="mutate()">
          {{ t('shared.button.save') }}
        </PrimaryButton>
      </template>
    </ApolloMutation>
    </div>
  </div>
</template>