<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { FieldType } from "../../../../../shared/utils/constants";
import { QueryFormField } from "../../../../../shared/components/organisms/general-form/formConfig";
import { onMounted, reactive, ref } from "vue";
import apolloClient from "../../../../../../apollo-client";
import {currenciesQuery, publicCurrenciesQuery} from "../../../../../shared/api/queries/currencies.js";
import { PrimaryButton } from "../../../../../shared/components/atoms/button-primary";
import { createCurrencyMutation, updateCurrencyMutation } from "../../../../../shared/api/mutations/currencies.js";
import {processGraphQLErrors} from "../../../../../shared/utils";
import {Toast} from "../../../../../shared/modules/toast";
import {FieldQuery} from "../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";

const { t } = useI18n();
const emit = defineEmits(['currency-added']);
const isEdit = ref(false);
const mutation = ref(createCurrencyMutation);

const form = reactive({
  id: null,
  publicId: null,
  isDefaultCurrency: true,
});

const getPublicCurrencies = async () => {
    const { data } = await apolloClient.query({
    query: publicCurrenciesQuery,
  });

    if (data && data.publicCurrencies) {
      return data.publicCurrencies.edges;
    }

   return [];
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
    form.isDefaultCurrency = currency.isDefaultCurrency;
    const isoCode = currency.isoCode;

    const publicCurrencies = await getPublicCurrencies();
    publicCurrencies.forEach(c => {
      if (c.node.isoCode == isoCode) {
        form.publicId = c.node.id;
      }
    });
  }
}

const getMutationVariables = () => {
  let variables = {
    publicCurrency: {
      id: form.publicId
    },
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
  return !form.publicId;
};

const onError = (error) => {
  const validationErrors = processGraphQLErrors(error, t);
  for (const key in validationErrors) {
    if (validationErrors.hasOwnProperty(key)) {
      Toast.error(validationErrors[key]);
    }
}};

const publicCurrencyField = {
    type: FieldType.Query,
    name: 'publicCurrency',
    label: t('shared.labels.currency'),
    labelBy: 'isoCode',
    valueBy: 'id',
    query: publicCurrenciesQuery,
    dataKey: 'publicCurrencies',
    isEdge: true,
    multiple: false,
    filterable: true,
    removable: false,
    formMapIdentifier: 'id'
}

onMounted(setCurrency);

</script>

<template>
  <div class="pb-10">
    <h1 class="text-xl text-primary mb-4">{{ t('dashboard.onboarding.addCurrency.subTitle') }}</h1>
    <hr>
    <h1 class="text-2xl my-4">{{ t('dashboard.onboarding.addCurrency.content') }}</h1>
    <div class="w-full lg:w-1/2">
      <div class="col-span-full mt-3">
        <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ t('shared.labels.currency') }}</label>
        <FieldQuery class="w-96" v-model="form.publicId" :field="publicCurrencyField as QueryFormField"  />
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