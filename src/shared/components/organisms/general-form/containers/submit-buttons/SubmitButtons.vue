<script setup lang="ts">

import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {Link} from './../../../../atoms/link';
import {cleanUpDataForMutation, FormConfig, FormType} from '../../formConfig';
import {ApolloAlertMutation} from "../../../../molecules/apollo-alert-mutation";
import {CancelButton} from "../../../../atoms/button-cancel";
import {DangerButton} from "../../../../atoms/button-danger";
import {SecondaryButton} from "../../../../atoms/button-secondary";
import {PrimaryButton} from "../../../../atoms/button-primary";
import {Toast} from '../../../../../modules/toast';
import {useI18n} from "vue-i18n";
import {processGraphQLErrors} from "../../../../../utils";
import {
  useEnterKeyboardListener,
  useShiftBackspaceKeyboardListener,
  useShiftDeleteKeyboardListener,
  useShiftEnterKeyboardListener,
} from "../../../../../modules/keyboard";
import {FieldType} from "../../../../../utils/constants";
import apolloClient from "../../../../../../../apollo-client";

const props = defineProps<{ config: FormConfig; form: any;}>();
const emit = defineEmits(['submit', 'update-errors']);
const router = useRouter();
const { t } = useI18n();

const deleteButtonRef = ref();
const submitContinueButtonRef = ref();
const submitButtonRef = ref();

const handleSubmitDone = (response) => {

  if (!response.data || (!props.config.allowNull && !response.data[props.config.mutationKey])) {
    Toast.error(t('shared.alert.toast.unexpectedResult'));
    return;
  }

  if (props.config.type == FormType.CREATE) {
      handleInlineFieldsCreate(response);
  }

  props.config.afterSubmitCallback?.();

  if (props.config.submitUrl) {
    router.push(props.config.submitUrl);
    emit('submit', response);
    if (props.config.type === FormType.CREATE) {
      const message = props.config.submitSuccessCreate || t('shared.alert.toast.submitSuccessCreate');
      Toast.success(message);
    } else {
      const message = props.config.submitSuccessUpdate || t('shared.alert.toast.submitSuccessUpdate');
      Toast.success(message);
    }
  }

};

const handleSubmitAndContinueDoneEdit = (response) => {

  if (!response.data || !response.data[props.config.mutationKey]) {
    Toast.error(t('shared.alert.toast.unexpectedResult'));
    return;
  }

  props.config.afterSubmitCallback?.();

  emit('update-errors', {});
  Toast.success(t('shared.alert.toast.submitSuccessUpdate'));

};

const handleSubmitAndContinueDoneCreate = (response) => {

  props.config.afterSubmitCallback?.();

  const redirectUrl = props.config.submitAndContinueUrl;
  if (redirectUrl) {
    const routePath = router.getRoutes().find(route => route.name === redirectUrl.name)?.path;
    const urlParamMatches = routePath?.match(/:(\w+)/g) || [];

    let query = redirectUrl.query || {};
    let params = redirectUrl.params || {};
    let allParamsAvailable = true;

    const hasMapping = Boolean(props.config.redirectIdentifiers && Object.keys(props.config.redirectIdentifiers).length);
    let mappingLookup = {};

    if (hasMapping) {
      if (props.config.redirectIdentifiers) {
        props.config.redirectIdentifiers.forEach(identifier => {
        const key = Object.keys(identifier)[0];
        mappingLookup[key] = identifier[key];
      });
    }
    }


    for (let param of urlParamMatches) {
      const paramName = param.substring(1);

        if (params[paramName] === undefined) {
            if (response.data[props.config.mutationKey][paramName] !== undefined) {

              if (hasMapping) {
                  const mappedParamName = mappingLookup[paramName] || paramName;
                  if (response.data[props.config.mutationKey][mappedParamName] !== undefined) {
                    params[paramName] = response.data[props.config.mutationKey][mappedParamName];
                  }
              } else {
                params[paramName] = response.data[props.config.mutationKey][paramName];
              }


            } else {
                allParamsAvailable = false;
                break;
            }
        }
    }

    if (allParamsAvailable) {
      router.push({ name: redirectUrl.name, params: params, query: query });
      Toast.success(t('shared.alert.toast.submitSuccessCreate'));
    }
  }
}

const handleSubmitAndContinueDone = (response) => {
  if (props.config.type === FormType.CREATE) {

    if (!response.data || !response.data[props.config.mutationKey]) {
      Toast.error(t('shared.alert.toast.unexpectedResult'));
      return;
    }

    handleInlineFieldsCreate(response);
    handleSubmitAndContinueDoneCreate(response);
  } else {
     handleSubmitAndContinueDoneEdit(response);
  }
  emit('submit', response);
};

const handleInlineFieldsCreate = async (response) => {
  if (props.config.type == FormType.CREATE) {
    for (const field of props.config.fields) {
      if (field.type == FieldType.InlineItems) {
        let finalData: any[] = [];
        props.form[field.name].forEach(row => {
          const d = cleanUpDataForMutation(row, field.fields, FormType.CREATE)
          d[field.valueKey] = {'id': response.data[props.config.mutationKey]["id"]}
          finalData.push(d);
        });

        try {
          const { data } = await apolloClient.mutate({
            mutation: field.createMutation,
            variables: {data: finalData},
          });
        } catch (errors) {
          handleError(errors);
        }
      }
    }
  }
}

const cleanupAndMutate = async (mutate) => {
  const cleanedData = cleanUpDataForMutation(props.form, props.config.fields, props.config.type);
  const result = await mutate({ variables: { data: cleanedData } });
};

const handleDelete = (response) => {

  if (props.config.deleteUrl) {
    router.push(props.config.deleteUrl);
  }
}

const handleError = (errors) => {
  const validationErrors = processGraphQLErrors(errors, t);
  emit('update-errors', validationErrors);
}

const goBack = () => {
  if (props.config.addCancel && props.config.cancelUrl !== undefined) {
    router.push(props.config.cancelUrl);
  }
}

const onDeletePressed = () => {
  deleteButtonRef.value?.$el.click();
};

const onSubmitAndContinuePressed = () => {
  submitContinueButtonRef.value?.$el.click();
};

const onSubmitPressed = () => {
  submitButtonRef.value?.$el.click();
};


useShiftDeleteKeyboardListener(onDeletePressed);
useShiftEnterKeyboardListener(onSubmitAndContinuePressed);
useEnterKeyboardListener(onSubmitPressed);
useShiftBackspaceKeyboardListener(goBack);

</script>

<template>
    <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">

        <Link v-if="config.addCancel" :path="config.cancelUrl">
          <CancelButton>
            {{ config.cancelLabel }}
          </CancelButton>
        </Link>

        <ApolloAlertMutation v-if="config.deleteMutation && config.addDelete && config.type === FormType.EDIT" :mutation="config.deleteMutation" :mutation-variables="{ id: config.mutationId }" @done="handleDelete">
          <template v-slot="{ loading, confirmAndMutate }">
            <DangerButton ref="deleteButtonRef" :disabled="loading" @click="confirmAndMutate">{{ config.deleteLabel }}</DangerButton>
          </template>
        </ApolloAlertMutation>

        <ApolloMutation v-if="config.addSubmitAndContinue" :mutation="config.mutation" @done="handleSubmitAndContinueDone" @error="handleError">
          <template v-slot="{ mutate, loading }">
            <SecondaryButton ref="submitContinueButtonRef" :disabled="loading" @click="cleanupAndMutate(mutate)">{{ config.submitAndContinueLabel }}</SecondaryButton>
          </template>
        </ApolloMutation>

        <ApolloMutation :mutation="config.mutation" @done="handleSubmitDone" @error="handleError">
          <template v-slot="{ mutate, loading }">
            <PrimaryButton ref="submitButtonRef" :disabled="loading" @click="cleanupAndMutate(mutate)">{{ config.submitLabel }}</PrimaryButton>
          </template>
        </ApolloMutation>

    </div>
</template>
