<script setup lang="ts">

import {DocumentNode} from "graphql";
import { useI18n } from 'vue-i18n';
import {Ref, ref, computed} from 'vue';
import { Card } from '../../../../../../atoms/card';
import { Button } from '../../../../../../atoms/button';
import {cleanUpDataForMutation, FormConfig, QueryFormField} from "../../../../formConfig";
import {FormCreate} from "../../../form-create";
import apolloClient from "../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../modules/toast";
import { processGraphQLErrors } from "../../../../../../../utils";
import { useEnterKeyboardListener } from "../../../../../../../modules/keyboard";
import { DuplicateModal } from '../../../../../../molecules/duplicate-modal';
import { checkPropertySelectValueForDuplicatesMutation } from '../../../../../../../api/mutations/properties.js';

const { t } = useI18n();

const props = defineProps<{ field: QueryFormField }>();
const emit = defineEmits(['cancel-clicked', 'submit-clicked']);
const errors: Ref<Record<string, string> | null> = ref(null);

const form = ref({});
const config = ref(props.field.createOnFlyConfig?.config);
const submitButtonRef = ref();

const showDuplicateModal = ref(false);
const duplicateItems = ref<{ label: string; urlParam: any }[]>([]);
const checkingDuplicates = ref(false);
const skippedCheck = ref(false);
let duplicateCheckController: AbortController | null = null;
const duplicateSteps = computed(() => [
  t('properties.duplicateModal.steps.step1'),
  t('properties.duplicateModal.steps.step2'),
]);

if (config.value) {
  config.value['hideButtons'] = true;
}

const handleFormUpdate = (updatedForm) => {
  form.value = updatedForm;
};

const cancel = () => {
  emit('cancel-clicked');
};

const handleError = (err) => {
  const graphqlError = err as { graphQLErrors: Array<{ message: string }> };
  if (graphqlError.graphQLErrors) {
    errors.value = processGraphQLErrors(graphqlError, t);
    if (errors.value['__all__']) {
      Toast.error(errors.value['__all__']);
    }
  }
};

const createSelectValue = async () => {
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
    handleError(err);
  }
};

const checkDuplicatesAndCreate = () => {
  if (!config.value) {
    Toast.error(t('shared.alert.toast.somethingWentWrong'));
    return;
  }

  const cleanedData = cleanUpDataForMutation(form.value, config.value.fields, config.value.type);
  const propertyId = cleanedData.property.id || cleanedData.property;
  showDuplicateModal.value = true;
  checkingDuplicates.value = true;
  skippedCheck.value = false;
  duplicateCheckController = new AbortController();
  apolloClient
    .mutate({
      mutation: checkPropertySelectValueForDuplicatesMutation,
      variables: { property: { id: propertyId }, value: cleanedData.value },
      context: { fetchOptions: { signal: duplicateCheckController.signal } },
    })
    .then(({ data }) => {
      if (skippedCheck.value) return;
      checkingDuplicates.value = false;
      if (data && data.checkPropertySelectValueForDuplicates && data.checkPropertySelectValueForDuplicates.duplicateFound) {
        duplicateItems.value = data.checkPropertySelectValueForDuplicates.duplicates.map((p: any) => ({
          label: p.value || p.id,
          urlParam: { name: 'properties.values.show', params: { id: p.id } }
        }));
        return;
      }
      showDuplicateModal.value = false;
      createSelectValue();
    })
    .catch((err) => {
      if ((err as any)?.name === 'AbortError') return;
      showDuplicateModal.value = false;
      handleError(err);
    });
};

const submit = async () => {
  if (props.field.createOnFlyConfig?.isSelectValue) {
    checkDuplicatesAndCreate();
  } else {
    await createSelectValue();
  }
};

const createAnywayHandler = async () => {
  skippedCheck.value = true;
  duplicateCheckController?.abort();
  checkingDuplicates.value = false;
  showDuplicateModal.value = false;
  await createSelectValue();
};

const onSubmitPressed = () => {
  submitButtonRef.value?.$el.click();
};
useEnterKeyboardListener(onSubmitPressed);

</script>

<template>
  <Card v-if="config" class="w-1/3">
    <FormCreate :config="config as FormConfig" :defaults="field.createOnFlyConfig?.defaults" :outside-errors="errors" @formUpdated="handleFormUpdate"/>

    <div class="flex justify-end gap-4 mt-4">
      <Button class="btn btn-outline-dark" @click="cancel">{{ t('shared.button.cancel') }}</Button>
      <Button ref="submitButtonRef"  class="btn btn-primary" @click="submit">{{ t('shared.button.submit') }}</Button>
    </div>
  </Card>
  <DuplicateModal
    v-model="showDuplicateModal"
    :title="t('properties.duplicateModal.title')"
    :content="t('properties.duplicateModal.content')"
    :items="duplicateItems"
    :loading="checkingDuplicates"
    modal-title="properties.duplicateModal.checkingTitle"
    :steps="duplicateSteps"
    @create-anyway="createAnywayHandler"
  />
</template>

