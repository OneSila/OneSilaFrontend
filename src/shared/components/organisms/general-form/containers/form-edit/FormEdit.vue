<script setup lang="ts">
import {reactive, ref, onMounted, defineProps} from 'vue';
import { useRouter } from 'vue-router';
import { ApolloAlertMutation } from './../../../../../components/molecules/apollo-alert-mutation';
import { FormLayout } from './../form-layout';
import { Button } from './../../../../atoms/button';
import { Link } from './../../../../atoms/link';
import {FormConfig, FieldType, HiddenFormField, cleanUpDataForMutation} from '../../formConfig';

const props = defineProps<{ config: FormConfig }>();

const form = reactive({});
const router = useRouter();

const updateForm = (data: any) => {
  const dataToEdit = props.config.queryDataKey ? data[props.config.queryDataKey] : data;

  props.config.fields.forEach(field => {
    if (field.type === FieldType.Hidden) {
      const hiddenField = field as HiddenFormField;
      form[field.name] = hiddenField.value;
    } else if (field.type === FieldType.ProxyChoice) {
      if (field.multiple) {
        form[field.name] = field.options
          .filter(option => dataToEdit[option[field.valueBy]] === true)
          .map(option => option[field.valueBy]);
      } else {
        form[field.name] = field.options
          .find(option => dataToEdit[option[field.valueBy]] === true)?.[field.valueBy];
      }
    } else if (dataToEdit.hasOwnProperty(field.name)) {
      form[field.name] = dataToEdit[field.name];
    }
  });

  return true;
};


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

  const updatedData = response.data[props.config.mutationKey];
  for (const key in updatedData) {
    if (updatedData.hasOwnProperty(key) && form.hasOwnProperty(key)) {
      form[key] = updatedData[key];
    }
  }

  alert('Updates made!');

};

const cleanupAndMutate = async (mutate) => {
  const cleanedData = cleanUpDataForMutation(form, props.config.fields);
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
  <div>
    <ApolloQuery :query="config.query" :variables="config.queryVariables">
      <template v-slot="{ result: { loading, error, data } }">
        <div v-if="data && updateForm(data)">
          <FormLayout :config="config" :form="form" />
        </div>
        <p v-if="loading">Loading...</p>
        <p v-if="error">{{ error.message }}</p>
      </template>
    </ApolloQuery>

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
        <ApolloAlertMutation v-if="config.addDelete" :mutation="config.deleteMutation" :mutation-variables="{ id: config.mutationId }" @done="handleDelete">
          <template v-slot="{ loading, confirmAndMutate }">
            <Button custom-class="btn btn-danger" :disabled="loading" @click="confirmAndMutate">{{ config.deleteLabel }}</Button>
          </template>
        </ApolloAlertMutation>
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