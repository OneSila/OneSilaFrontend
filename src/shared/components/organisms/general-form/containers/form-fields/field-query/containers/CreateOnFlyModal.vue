<script setup lang="ts">

import {DocumentNode} from "graphql";
import { useI18n } from 'vue-i18n';
import {Ref, ref, computed, watch, onUnmounted} from 'vue';
import { Card } from '../../../../../../atoms/card';
import { Button } from '../../../../../../atoms/button';
import { Link } from '../../../../../../atoms/link';
import { Icon } from '../../../../../../atoms/icon';
import {cleanUpDataForMutation, FormConfig, QueryFormField} from "../../../../formConfig";
import {FormCreate} from "../../../form-create";
import apolloClient from "../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../modules/toast";
import { processGraphQLErrors } from "../../../../../../../utils";
import { useEnterKeyboardListener } from "../../../../../../../modules/keyboard";
import { checkPropertySelectValueForDuplicatesMutation } from '../../../../../../../api/mutations/properties.js';

const { t } = useI18n();

const props = defineProps<{ field: QueryFormField }>();
const emit = defineEmits(['cancel-clicked', 'submit-clicked']);
const errors: Ref<Record<string, string> | null> = ref(null);

const form = ref({});
const config = ref(props.field.createOnFlyConfig?.config);
const submitButtonRef = ref();

const showDuplicateCard = ref(false);
const duplicateItems = ref<{ label: string; urlParam: any }[]>([]);
const checkingDuplicates = ref(false);
const skippedCheck = ref(false);
let duplicateCheckController: AbortController | null = null;
const simulatedProgress = ref(0);
let progressInterval: ReturnType<typeof setInterval> | null = null;
const duplicateSteps = computed(() => [
  t('properties.duplicateModal.steps.step1'),
  t('properties.duplicateModal.steps.step2'),
]);

const startSimulatedProgress = () => {
  simulatedProgress.value = 0;
  progressInterval = setInterval(() => {
    if (simulatedProgress.value < duplicateSteps.value.length) {
      simulatedProgress.value += 1;
    } else {
      clearInterval(progressInterval!);
      progressInterval = null;
    }
  }, 1000);
};

const stopSimulatedProgress = () => {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
};

watch(checkingDuplicates, (val) => {
  if (val) {
    startSimulatedProgress();
  } else {
    stopSimulatedProgress();
    simulatedProgress.value = 0;
  }
});

onUnmounted(() => {
  stopSimulatedProgress();
});

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
  showDuplicateCard.value = true;
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
      showDuplicateCard.value = false;
      createSelectValue();
    })
    .catch((err) => {
      if ((err as any)?.name === 'AbortError') return;
      showDuplicateCard.value = false;
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
  showDuplicateCard.value = false;
  await createSelectValue();
};

const onSubmitPressed = () => {
  submitButtonRef.value?.$el.click();
};
useEnterKeyboardListener(onSubmitPressed);

</script>

<template>
  <Card v-if="config && !showDuplicateCard" class="w-1/3">
    <FormCreate :config="config as FormConfig" :defaults="field.createOnFlyConfig?.defaults" :outside-errors="errors" @formUpdated="handleFormUpdate"/>

    <div class="flex justify-end gap-4 mt-4">
      <Button class="btn btn-outline-dark" @click="cancel">{{ t('shared.button.cancel') }}</Button>
      <Button ref="submitButtonRef"  class="btn btn-primary" @click="submit">{{ t('shared.button.submit') }}</Button>
    </div>
  </Card>
  <Card v-else class="w-1/3">
    <template v-if="checkingDuplicates">
      <h3 class="text-lg text-center font-bold mb-2">{{ t('properties.duplicateModal.checkingTitle') }}</h3>
      <hr />
      <ul class="mt-2">
        <li
          v-for="(step, index) in duplicateSteps"
          :key="index"
          class="flex items-center mb-1 py-2 px-4"
        >
          <template v-if="simulatedProgress > index">
            <Icon name="check-circle" class="text-green-600 w-5 h-5 mr-2" />
            <span class="text-green-600">{{ step }}</span>
          </template>
          <template v-else>
            <Icon name="circle" class="text-gray-400 w-5 h-5 mr-2" />
            <span class="text-gray-400">{{ step }}</span>
          </template>
        </li>
      </ul>
      <div class="flex justify-end gap-4 mt-4">
        <Button class="btn btn-primary" @click="createAnywayHandler">{{ t('shared.button.skip') }}</Button>
      </div>
    </template>
    <template v-else>
      <h1 class="text-xl font-semibold text-center mb-4">{{ t('properties.duplicateModal.title') }}</h1>
      <p v-if="duplicateItems.length" class="mb-4">{{ t('properties.duplicateModal.content') }}</p>
      <ul v-if="duplicateItems.length" class="list-disc pl-5 mb-4">
        <li v-for="(item, index) in duplicateItems" :key="index">
          <Link :path="item.urlParam" target="_blank">
            {{ item.label }}
          </Link>
        </li>
      </ul>
      <div class="flex justify-end gap-4 mt-4">
        <Button class="btn btn-primary" @click="createAnywayHandler">{{ t('shared.button.createAnyway') }}</Button>
        <Button class="btn btn-outline-dark" @click="showDuplicateCard = false">{{ t('shared.button.abort') }}</Button>
      </div>
    </template>
  </Card>
</template>

