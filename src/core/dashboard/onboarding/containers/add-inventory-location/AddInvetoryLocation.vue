<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { FieldType } from "../../../../../shared/utils/constants";
import { CheckboxFormField, ValueFormField, QueryFormField } from "../../../../../shared/components/organisms/general-form/formConfig";
import { onMounted, reactive, ref } from "vue";
import { FieldValue } from "../../../../../shared/components/organisms/general-form/containers/form-fields/field-value";
import { FieldCheckbox } from "../../../../../shared/components/organisms/general-form/containers/form-fields/field-checkbox";
import { FieldQuery } from "../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import apolloClient from "../../../../../../apollo-client";
import { PrimaryButton } from "../../../../../shared/components/atoms/button-primary";
import { internalShippingAddressesQuery } from "../../../../../shared/api/queries/contacts.js";
import { createInventoryLocationMutation, updateInventoryLocationMutation } from "../../../../../shared/api/mutations/inventory.js";
import { inventoryLocationsQuery } from "../../../../../shared/api/queries/inventory.js";
import {displayApolloError, processGraphQLErrors} from "../../../../../shared/utils";
import {Toast} from "../../../../../shared/modules/toast";

const { t } = useI18n();
const emit = defineEmits(['inventory-location-added']);
const isEdit = ref(false);
const mutation = ref(createInventoryLocationMutation);

const form = reactive({
  id: null,
  location: {
    id: null
  },
  name: null,
  description: null,
});

const fields = {
  location: {
    type: FieldType.Query,
    name: 'location',
    label: t('inventory.inventoryLocations.labels.parent'),
    labelBy: 'fullAddress',
    valueBy: 'id',
    query: internalShippingAddressesQuery,
    dataKey: 'internalShippingAddresses',
    isEdge: true,
    multiple: false,
    filterable: true,
    formMapIdentifier: 'id',
    optional: false
  },
  name: {
    type: FieldType.Text,
    name: 'name',
    label: t('shared.labels.name'),
    placeholder: t('shared.placeholders.name'),
  },
  description: {
    type: FieldType.Textarea,
    name: 'description',
    label: t('shared.labels.description'),
    placeholder: t('shared.placeholders.description'),
    scroll: true,
    optional: true
  },
}

const setInventoryLocation = async () => {
  const { data } = await apolloClient.query({
    query: inventoryLocationsQuery,
  });

  if (data && data.inventoryLocations && data.inventoryLocations.edges && data.inventoryLocations.edges.length > 0) {
    isEdit.value = true;
    mutation.value = updateInventoryLocationMutation;
    const location = data.inventoryLocations.edges[0].node;
    form.id = location.id;
    form.location.id = location.location.id;
    form.name = location.name;
    form.description = location.description;
  }
}

onMounted(setInventoryLocation);

const getMutationVariables = () => {
  let variables = {
    location: {
      id: form.location.id
    },
    name: form.name,
    description: form.description,
  }

  if (form.id) {
    variables['id'] = form.id
  }

  return {data: variables};
}

const afterUpdate = () => {
  emit('inventory-location-added');
}

const disableButton = () => {
  return !form.name || !form.location.id;
};

const skip = () => {
  emit('inventory-location-added');
};

const setLocationField = (value) => {
  form.location.id = value;
}

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
    <h1 class="text-xl text-primary mb-4">{{ t('dashboard.onboarding.createInventoryLocation.subTitle') }}</h1>
    <hr>
    <h1 class="text-2xl my-4">{{ t('dashboard.onboarding.createInventoryLocation.content') }}</h1>
    <div class="w-full lg:w-1/2">
      <div class="col-span-full mt-3">
        <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ fields['location'].label }}</label>
        <FieldQuery :field="fields['location'] as QueryFormField" :model-value="form.location.id" @update:modelValue="setLocationField" />
      </div>
      <div class="col-span-full mt-3">
        <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ fields['name'].label }}</label>
        <FieldValue :field="fields['name'] as ValueFormField" :model-value="form.name" @update:modelValue="form.name = $event" />
      </div>
      <div class="col-span-full mt-3">
        <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ fields['description'].label }}</label>
        <FieldValue :field="fields['description'] as ValueFormField" :model-value="form.description" @update:modelValue="form.description = $event" />
      </div>
    </div>
    <div class="col-span-full mt-3">
      <ApolloMutation :mutation="mutation" :variables="getMutationVariables()" @done="afterUpdate" @error="onError">
        <template v-slot="{ mutate, loading, error }">
          <PrimaryButton :disabled="loading || disableButton()" @click="mutate()">
            {{ t('shared.button.save') }}
          </PrimaryButton>
          <PrimaryButton class="ml-2" @click="skip">
            {{ t('shared.button.skip') }}
          </PrimaryButton>
        </template>
      </ApolloMutation>
    </div>
  </div>
</template>
