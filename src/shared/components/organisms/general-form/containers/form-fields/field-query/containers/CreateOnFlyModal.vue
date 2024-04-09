<script setup lang="ts">

import {DocumentNode} from "graphql";
import { useI18n } from 'vue-i18n';
import {Ref, ref} from 'vue';
import { Card } from '../../../../../../atoms/card';
import { Button } from '../../../../../../atoms/button';
import {cleanUpDataForMutation, FormConfig, QueryFormField} from "../../../../formConfig";
import {FormCreate} from "../../../form-create";
import apolloClient from "../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../modules/toast";
import { processGraphQLErrors } from "../../../../../../../utils";

const { t } = useI18n();

const props = defineProps<{ field: QueryFormField }>();
const emit = defineEmits(['cancel-clicked', 'submit-clicked']);
const errors: Ref<Record<string, string> | null> = ref(null);

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
    Toast.error(t('shared.alert.toast.somethingWentWrong'));
    return;
  }

  const cleanedData = cleanUpDataForMutation(form.value, config.value.fields, config.value.type);
  try {
    const {data } = await apolloClient.mutate({
      mutation: config.value.mutation as unknown as DocumentNode,
      variables: {data: cleanedData},
    });

    if (!data || !data[config.value.mutationKey]) {
      Toast.error(t('shared.alert.toast.unexpectedResult'));
      return;
    }

    config.value.afterSubmitCallback?.();

    emit('submit-clicked', data[config.value.mutationKey]);

  } catch (err) {
    const graphqlError = err as { graphQLErrors: Array<{ message: string }> };
    if (graphqlError.graphQLErrors) {
      errors.value = processGraphQLErrors(graphqlError, t);
      if (errors.value['__all__']) {
        Toast.error(errors.value['__all__']);
      }

    }
  }

};

</script>

<template>
  <Card v-if="config" class="w-1/3">
    <FormCreate :config="config as FormConfig" :defaults="field.createOnFlyConfig?.defaults" :outside-errors="errors" @formUpdated="handleFormUpdate"/>

    <div class="flex justify-end gap-4 mt-4">
      <Button class="btn btn-outline-dark" @click="cancel">{{ t('shared.button.cancel') }}</Button>
      <Button class="btn btn-primary" @click="submit">{{ t('shared.button.submit') }}</Button>
    </div>
  </Card>
</template>