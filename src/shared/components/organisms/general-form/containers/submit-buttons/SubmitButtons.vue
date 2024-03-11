<script setup lang="ts">

import {useRouter} from 'vue-router';
import {Button} from './../../../../atoms/button';
import {Link} from './../../../../atoms/link';
import {cleanUpDataForMutation, FormConfig, FormType} from '../../formConfig';
import {ApolloAlertMutation} from "../../../../molecules/apollo-alert-mutation";

const props = defineProps<{ config: FormConfig; form: any;}>();
const emit = defineEmits(['submit']);
const router = useRouter();
const handleSubmitDone = (response) => {

  if (!response.data || !response.data[props.config.mutationKey]) {
      alert("Unexpected response from the server.");
    return;
  }

  props.config.afterSubmitCallback?.();

  if (props.config.submitUrl) {
    router.push(props.config.submitUrl);
    emit('submit', response);
  }
};

const handleSubmitAndContinueDoneEdit = (response) => {

  if (!response.data || !response.data[props.config.mutationKey]) {
    alert("Unexpected response from the server.");
    return;
  }

  props.config.afterSubmitCallback?.();

  alert('Updates made!');
};
const handleSubmitAndContinueDoneCreate = (response) => {
  if (!response.data || !response.data[props.config.mutationKey]) {
    alert("Unexpected response from the server.");
    return;
  }

  props.config.afterSubmitCallback?.();

  let redirectUrl = props.config.submitAndContinueUrl;
  if (redirectUrl) {
    const routePath = router.getRoutes().find(route => route.name === redirectUrl.name)?.path;
    const urlParamMatches = routePath?.match(/:(\w+)/g) || [];

    let query = redirectUrl.query || {};
    let params = redirectUrl.params || {};
    let allParamsAvailable = true;
    for (let param of urlParamMatches) {
      const paramName = param.substring(1);

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
      router.push({ name: redirectUrl.name, params: params, query: query });
    } else {
      alert('Response does not contain the necessary redirection parameters.');
    }
  }
}

const handleSubmitAndContinueDone = (response) => {
  if (props.config.type === FormType.CREATE) {
    handleSubmitAndContinueDoneCreate(response);
  } else {
     handleSubmitAndContinueDoneEdit(response);
  }
  emit('submit', response);
};

const cleanupAndMutate = async (mutate) => {
  const cleanedData = cleanUpDataForMutation(props.form, props.config.fields, props.config.type);
  await mutate({ variables: { data: cleanedData } });
};

const handleDelete = (response) => {
  alert('Deleted!');

  if (props.config.deleteUrl) {
    router.push(props.config.deleteUrl);
  }
}

</script>

<template>
    <Flex class="mt-3" gap="2" >
      <FlexCell class="mr-2">
        <ApolloMutation :mutation="config.mutation" @done="handleSubmitDone">
          <template v-slot="{ mutate, loading, error }">
            <Button custom-class="btn btn-primary" :disabled="loading" @click="cleanupAndMutate(mutate)">{{ config.submitLabel }}</Button>
            <p v-if="error">{{ error.message }}</p>
          </template>
        </ApolloMutation>
      </FlexCell>

      <FlexCell v-if="config.addSubmitAndContinue" class="mr-2">
        <ApolloMutation :mutation="config.mutation" @done="handleSubmitAndContinueDone">
          <template v-slot="{ mutate, loading, error }">
            <Button custom-class="btn btn-secondary" :disabled="loading" @click="cleanupAndMutate(mutate)">{{ config.submitAndContinueLabel }}</Button>
            <p v-if="error">{{ error.message }}</p>
          </template>
        </ApolloMutation>
      </FlexCell>

      <FlexCell v-if="config.addDelete && config.type === FormType.EDIT" class="mr-2">
        <ApolloAlertMutation :mutation="config.deleteMutation" :mutation-variables="{ id: config.mutationId }" @done="handleDelete">
          <template v-slot="{ loading, confirmAndMutate }">
            <Button custom-class="btn btn-danger" :disabled="loading" @click="confirmAndMutate">{{ config.deleteLabel }}</Button>
          </template>
        </ApolloAlertMutation>
      </FlexCell>

      <FlexCell v-if="config.addCancel" class="mr-2">
        <Link :path="config.cancelUrl">
          <Button class="btn btn-dark">
            {{ config.cancelLabel }}
          </Button>
        </Link>
      </FlexCell>
    </Flex>
</template>
