<script setup lang="ts">

import {DocumentNode} from "graphql";
import { useI18n } from 'vue-i18n';
import {  ref } from 'vue';
import { Card } from '../../../../../../atoms/card';
import { Button } from '../../../../../../atoms/button';
import {cleanUpDataForMutation, FormConfig, QueryFormField} from "../../../../formConfig";
import {FormCreate} from "../../../form-create";
import apolloClient from "../../../../../../../../../apollo-client";


const { t } = useI18n();

const props = defineProps<{ field: QueryFormField }>();
const emit = defineEmits(['cancel-clicked', 'submit-clicked']);

const form = ref({});
const config = ref(props.field.createOnFlyConfig?.config);

if (config.value) {
  config.value['hideButtons'] = true;
}

const handleFormUpdate = (updatedForm) => {
  form.value = updatedForm;
};

const cancel = () => {
  emit('cancel-clicked');
};

const submit = async () => {

  if (!config.value) {
    alert('Something went wrong!')
    return;
  }

  const cleanedData = cleanUpDataForMutation(form.value, config.value.fields, config.value.type);
  try {
    const {data} = await apolloClient.mutate({
      mutation: config.value.mutation as unknown as DocumentNode,
      variables: {data: cleanedData},
    });

    if (!data || !data[config.value.mutationKey]) {
      alert("Unexpected response from the server.");
      return;
    }

    config.value.afterSubmitCallback?.();

    emit('submit-clicked', data[config.value.mutationKey]);

  } catch (err) {
    console.error('Token authentication failed:', err);
  }

};

</script>

<template>
  <Card v-if="config" class="w-1/2">
    <FormCreate :config="config as FormConfig" :defaults="field.createOnFlyConfig?.defaults" @formUpdated="handleFormUpdate"/>

    <div class="flex justify-end gap-4 mt-4">
      <Button class="btn btn-outline-dark" @click="cancel">{{ t('shared.button.cancel') }}</Button>
      <Button class="btn btn-primary" @click="submit">{{ t('shared.button.submit') }}</Button>
    </div>
  </Card>
</template>