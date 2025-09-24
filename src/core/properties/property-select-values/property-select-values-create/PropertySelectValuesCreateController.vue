<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { FieldValue } from "../../../../shared/components/organisms/general-form/containers/form-fields/field-value";
import { FieldQuery } from "../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import { FieldImage } from "../../../../shared/components/organisms/general-form/containers/form-fields/field-image";
import { FormType, FormConfig, cleanUpDataForMutation, ValueFormField, QueryFormField, ImageFormField } from '../../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../../shared/utils/constants';
import { createPropertySelectValueMutation, checkPropertySelectValueForDuplicatesMutation } from "../../../../shared/api/mutations/properties.js";
import { baseFormConfigConstructor } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import apolloClient from "../../../../../apollo-client";
import { getPropertyQuery } from "../../../../shared/api/queries/properties.js";
import { PrimaryButton } from "../../../../shared/components/atoms/button-primary";
import { SecondaryButton } from "../../../../shared/components/atoms/button-secondary";
import { CancelButton } from "../../../../shared/components/atoms/button-cancel";
import { DuplicateModal } from "../../../../shared/components/molecules/duplicate-modal";
import { Toast } from "../../../../shared/modules/toast";
import { processGraphQLErrors } from "../../../../shared/utils";
import { useEnterKeyboardListener, useShiftBackspaceKeyboardListener, useShiftEnterKeyboardListener } from "../../../../shared/modules/keyboard";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const formConfig = ref<FormConfig | null>(null);
const fields = reactive<Record<string, any>>({});
const form = reactive<Record<string, any>>({});
const showDuplicateModal = ref(false);
const duplicateItems = ref<{ label: string; urlParam: any }[]>([]);
const checkingDuplicates = ref(false);
const skippedCheck = ref(false);
let duplicateCheckController: AbortController | null = null;
const duplicateSteps = computed(() => [
  t('properties.duplicateModal.steps.step1'),
  t('properties.duplicateModal.steps.step2'),
]);
const continueEditing = ref(false);
const defaultValue = route.query.value ? route.query.value.toString() : '';

onMounted(async () => {
  let addImage = false;
  const propertyId = route.query.propertyId ? route.query.propertyId.toString() : null;
  const isRule = route.query.isRule ? route.query.isRule.toString() : null;
  const amazonRuleId = route.query.amazonRuleId ? route.query.amazonRuleId.toString() : null;
  const remoteSelectValueId = route.query.remoteSelectValueId
    ? route.query.remoteSelectValueId.toString()
    : route.query.amazonSelectValueId
    ? route.query.amazonSelectValueId.toString()
    : null;
  const remoteSelectValueType = route.query.remoteSelectValueType
    ? route.query.remoteSelectValueType.toString()
    : route.query.amazonSelectValueId
    ? 'amazon'
    : null;

  if (propertyId) {
    const { data } = await apolloClient.query({
      query: getPropertyQuery,
      variables: { id: propertyId }
    });

    const property = data.property;
    addImage = Boolean(property && property.hasImage);
  }

  formConfig.value = baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createPropertySelectValueMutation,
    'createPropertySelectValue',
    propertyId,
    addImage,
    isRule !== null,
    amazonRuleId,
    remoteSelectValueId,
    remoteSelectValueType
  );

  if (formConfig.value) {
    formConfig.value.fields.forEach(field => {
      fields[field.name] = field;
      if (field.type === FieldType.Hidden) {
        const hiddenField = field as any;
        form[field.name] = hiddenField.value;
      } else if (field.default !== undefined) {
        form[field.name] = field.default;
      } else if (field.type === FieldType.Query) {
        const qField = field as QueryFormField;
        form[field.name] = qField.multiple ? [] : { id: null };
      } else {
        form[field.name] = null;
      }
    });
    if (defaultValue) {
      form['value'] = defaultValue;
    }
  }
});

const onDuplicate = () => {
  Toast.error(t('properties.properties.error.duplicate'));
};

const onTooLong = () => {
  Toast.error(t('shared.alert.toast.tooLongError', { fieldName: t('properties.values.labels.value').toLowerCase(), max: 255 }));
};

const onError = (error) => {
  const validationErrors = processGraphQLErrors(error, t);
  for (const key in validationErrors) {
    if (validationErrors.hasOwnProperty(key)) {
      const errorMessage = validationErrors[key];
      if (errorMessage.includes('duplicate')) {
        onDuplicate();
        break;
      }
      if (errorMessage.includes('255')) {
        onTooLong();
        break;
      }
    }
  }
};

const createSelectValue = async () => {
  if (!formConfig.value) return;
  try {
    const cleanedData = cleanUpDataForMutation(form, formConfig.value.fields, FormType.CREATE);
    const { data } = await apolloClient.mutate({
      mutation: createPropertySelectValueMutation,
      variables: { data: cleanedData },
    });

    const resultData = data?.createPropertySelectValue;
    if (!data || !resultData) {
      Toast.error(t('shared.alert.toast.unexpectedResult'));
      return;
    }

    const finalUrl: any = { ...formConfig.value.submitUrl };
    if (formConfig.value.addIdAsQueryParamInSubmitUrl && resultData.id) {
      const queryParamKey = `${formConfig.value.mutationKey}Id`;
      finalUrl.query = {
        ...(formConfig.value.submitUrl.query || {}),
        [queryParamKey]: resultData.id,
      };
    }

    if (continueEditing.value && formConfig.value.submitAndContinueUrl) {
      const redirectUrl = formConfig.value.submitAndContinueUrl;
      const routePath = router.getRoutes().find(r => r.name === redirectUrl.name)?.path;
      const urlParamMatches = routePath?.match(/:(\w+)/g) || [];
      let query = redirectUrl.query || {};
      let params = redirectUrl.params || {};
      let allParamsAvailable = true;

      const hasMapping = Boolean(formConfig.value.redirectIdentifiers && Object.keys(formConfig.value.redirectIdentifiers).length);
      const mappingLookup: Record<string, string> = {};
      if (hasMapping && formConfig.value.redirectIdentifiers) {
        formConfig.value.redirectIdentifiers.forEach(identifier => {
          const key = Object.keys(identifier)[0];
          mappingLookup[key] = identifier[key];
        });
      }

      for (let param of urlParamMatches) {
        const paramName = param.substring(1);
        if (params[paramName] === undefined) {
          if (resultData[paramName] !== undefined) {
            if (hasMapping) {
              const mappedParamName = mappingLookup[paramName] || paramName;
              if (resultData[mappedParamName] !== undefined) {
                params[paramName] = resultData[mappedParamName];
              }
            } else {
              params[paramName] = resultData[paramName];
            }
          } else {
            allParamsAvailable = false;
            break;
          }
        }
      }

      if (allParamsAvailable) {
        router.push({ name: redirectUrl.name, params, query });
        Toast.success(t('shared.alert.toast.submitSuccessCreate'));
        return;
      }
    }

    router.push(finalUrl);
    Toast.success(t('shared.alert.toast.submitSuccessCreate'));
  } catch (err) {
    onError(err);
  }
};

const checkDuplicatesAndCreate = (editAfter = false) => {
  continueEditing.value = editAfter;
  if (!formConfig.value) return;
  const cleanedData = cleanUpDataForMutation(form, formConfig.value.fields, FormType.CREATE);
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
      onError(err);
    });
};

const cancel = () => {
  if (formConfig.value?.cancelUrl) {
    router.push(formConfig.value.cancelUrl);
  } else if (formConfig.value?.submitUrl) {
    router.push(formConfig.value.submitUrl);
  }
};

const saveAndContinue = () => checkDuplicatesAndCreate(true);
const save = () => checkDuplicatesAndCreate(false);

const createAnywayHandler = async () => {
  skippedCheck.value = true;
  duplicateCheckController?.abort();
  checkingDuplicates.value = false;
  showDuplicateModal.value = false;
  await createSelectValue();
};

useShiftEnterKeyboardListener(saveAndContinue);
useEnterKeyboardListener(save);
useShiftBackspaceKeyboardListener(cancel);

</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'properties.values.list' }, name: t('properties.values.title') },
          { path: { name: 'properties.values.create' }, name: t('properties.values.create.title') }
        ]"
      />
    </template>
    <template v-slot:content>
      <div v-if="formConfig && Object.keys(fields).length" class="space-y-10 divide-y divide-gray-900/10 mt-4">
        <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div class="px-4 py-6 sm:p-8">
              <div class="grid max-w grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                <div v-if="fields.property && fields.property.type !== FieldType.Hidden" class="col-span-full">
                  <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ fields.property.label }}</label>
                  <FieldQuery :field="fields.property as QueryFormField" :model-value="form.property.id" @update:modelValue="form.property.id = $event" />
                </div>

            <div class="col-span-full mt-3">
              <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ fields.value.label }}</label>
              <FieldValue :field="fields.value as ValueFormField" :model-value="form.value" @update:modelValue="form.value = $event" />
            </div>

            <div v-if="fields.image" class="col-span-full mt-3">
              <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ fields.image.label }}</label>
              <FieldImage :field="fields.image as ImageFormField" :model-value="form.image" @update:modelValue="form.image = $event" />
            </div>
              </div>
            </div>
            <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
              <CancelButton @click="cancel">{{ t('shared.button.cancel') }}</CancelButton>
              <SecondaryButton v-if="formConfig.addSubmitAndContinue" @click="checkDuplicatesAndCreate(true)">
                {{ t('shared.button.saveAndContinue') }}
              </SecondaryButton>
              <PrimaryButton @click="checkDuplicatesAndCreate(false)">
                {{ t('shared.button.save') }}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </template>
  </GeneralTemplate>
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
