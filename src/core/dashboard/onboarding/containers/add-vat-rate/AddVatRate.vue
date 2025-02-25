<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { FieldType } from "../../../../../shared/utils/constants";
import { ValueFormField } from "../../../../../shared/components/organisms/general-form/formConfig";
import { onMounted, reactive, ref } from "vue";
import { FieldValue } from "../../../../../shared/components/organisms/general-form/containers/form-fields/field-value";
import apolloClient from "../../../../../../apollo-client";
import { vatRatesQuery } from "../../../../../shared/api/queries/vatRates.js";
import { PrimaryButton } from "../../../../../shared/components/atoms/button-primary";
import { createVatRateMutation, updateVatRateMutation } from "../../../../../shared/api/mutations/vatRates.js";

const { t } = useI18n();
const emit = defineEmits(['vat-rate-added']);
const isEdit = ref(false);
const mutation = ref(createVatRateMutation);

const form = reactive({
  id: null,
  name: null,
  rate: null,
});

const fields = {
  name: {
    type: FieldType.Text,
    name: 'name',
    label: t('settings.vatRates.labels.name'),
    placeholder: t('settings.vatRates.placeholders.name'),
  },
  rate: {
    type: FieldType.Text,
    name: 'rate',
    label: t('settings.vatRates.labels.rate'),
    placeholder: t('settings.vatRates.placeholders.rate'),
    number: true,
  },
}

const setVatRate = async () => {
  const { data } = await apolloClient.query({
    query: vatRatesQuery,
  });

  if (data && data.vatRates && data.vatRates.edges && data.vatRates.edges.length > 0) {
    isEdit.value = true;
    mutation.value = updateVatRateMutation;
    const vatRate = data.vatRates.edges[0].node;
    form.id = vatRate.id;
    form.name = vatRate.name;
    form.rate = vatRate.rate;
  }
}

onMounted(setVatRate);

const getMutationVariables = () => {
  let variables = {
    name: form.name,
    rate: form.rate,
  }

  if (form.id) {
    variables['id'] = form.id
  }

  return {data: variables};
}

const afterUpdate = () => {
  emit('vat-rate-added');
}

const disableButton = () => {
  return !form.name || !form.rate;
};

</script>

<template>
  <div class="pb-10">
    <h1 class="text-xl text-primary mb-4">{{ t('dashboard.onboarding.confirmVatRate.subTitle') }}</h1>
    <hr>
    <h1 class="text-2xl my-4">{{ t('dashboard.onboarding.confirmVatRate.content') }}</h1>
    <div class="w-full lg:w-1/2">
      <div class="col-span-full mt-3">
        <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ fields['name'].label }}</label>
        <FieldValue :field="fields['name'] as ValueFormField" :model-value="form.name" @update:modelValue="form.name = $event" />
      </div>
      <div class="col-span-full mt-3">
        <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ fields['rate'].label }}</label>
        <FieldValue :field="fields['rate'] as ValueFormField" :model-value="form.rate" @update:modelValue="form.rate = $event" />
      </div>
    </div>

    <hr class="my-6"/>

    <div class="flex items-center justify-end">
      <ApolloMutation :mutation="mutation" :variables="getMutationVariables()" @done="afterUpdate">
        <template v-slot="{ mutate, loading, error }">
          <PrimaryButton  :disabled="loading || disableButton()" @click="mutate()">
            {{ t('shared.button.next') }}
          </PrimaryButton>
        </template>
      </ApolloMutation>
    </div>
  </div>
</template>
