<script setup lang="ts">
import {reactive, ref, defineProps} from 'vue';
import { useRouter } from 'vue-router';
import { FormLayout } from './../form-layout';
import { Button } from './../../../../atoms/button';
import { Link } from './../../../../atoms/link';
import { FormConfig, FieldType, HiddenFormField, cleanUpDataForMutation } from '../../formConfig';

const props = defineProps<{ config: FormConfig }>();

const form = reactive(props.config.fields.reduce((acc, field) => {
  if (field.type === FieldType.Hidden) {
    const hiddenField = field as HiddenFormField;
    acc[field.name] = hiddenField.value;
  } else {
    acc[field.name] = null;
  }
  return acc;
}, {}));

const router = useRouter();
const handleSubmitDone = (response) => {

    if (!response.data || !response.data[props.config.mutationKey]) {
      alert("Unexpected response from the server.");
    return;
  }

  props.config.afterSubmitCallback?.();

  if (props.config.submitUrl) {
    router.push(props.config.submitUrl);
  }
};

const handleSubmitAndContinueDone = (response) => {
  if (!response.data || !response.data[props.config.mutationKey]) {
    alert("Unexpected response from the server.");
    return;
  }

  props.config.afterSubmitCallback?.();

  let redirectUrl = props.config.submitAndContinueUrl;
  if (redirectUrl) {
    const routePath = router.getRoutes().find(route => route.name === redirectUrl.name)?.path;
    const urlParamMatches = routePath?.match(/:(\w+)/g) || [];

    let params = redirectUrl.params || {};
    let allParamsAvailable = true;
    for (let param of urlParamMatches) {
      const paramName = param.substring(1);

        // populate params only if not already presend from redirectUrl.params
        if (params[paramName] === undefined) {
            if (response.data[props.config.mutationKey][paramName] !== undefined) {
                params[paramName] = response.data[props.config.mutationKey][paramName];
            } else {
                allParamsAvailable = false;
                break;
            }
        }
    }

    if (allParamsAvailable) {
      router.push({ name: redirectUrl.name, params: params });
    } else {
      alert('Response does not contain the necessary redirection parameters.');
    }
  }
}

const cleanupAndMutate = async (mutate) => {
  const cleanedData = cleanUpDataForMutation(form, props.config.fields);
  await mutate({ variables: { data: cleanedData } });
};

</script>

<template>
  <div>
    <FormLayout :config="config" :form="form" />

    <Flex class="mt-3" gap="2" wrap >
      <FlexCell>
        <ApolloMutation :mutation="config.mutation" @done="handleSubmitDone">
          <template v-slot="{ mutate, loading, error }">
            <Button custom-class="btn btn-primary" :disabled="loading" @click="cleanupAndMutate(mutate)">{{ config.submitLabel }}</Button>
            <p v-if="error">{{ error.message }}</p>
          </template>
        </ApolloMutation>
      </FlexCell>

      <FlexCell>
        <ApolloMutation v-if="config.addSubmitAndContinue" :mutation="config.mutation" @done="handleSubmitAndContinueDone">
          <template v-slot="{ mutate, loading, error }">
            <Button custom-class="btn btn-secondary" :disabled="loading" @click="cleanupAndMutate(mutate)">{{ config.submitAndContinueLabel }}</Button>
            <p v-if="error">{{ error.message }}</p>
          </template>
        </ApolloMutation>
      </FlexCell>

      <FlexCell>
            <Link v-if="config.addCancel" :path="config.cancelUrl">
        <Button class="btn btn-dark">
          {{ config.cancelLabel }}
        </Button>
      </Link>
      </FlexCell>
    </Flex>
  </div>
</template>
