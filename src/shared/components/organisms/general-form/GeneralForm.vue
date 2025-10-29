<script setup lang="ts" xmlns="http://www.w3.org/1999/html">

import { ref, watch } from 'vue';
import { FormCreate } from './containers/form-create';
import { FormEdit } from './containers/form-edit';
import { getEnhancedConfig, FormConfig, FormType, FormConfigDefaultTranslations } from './formConfig';
import { useI18n } from 'vue-i18n';
import { HelpSection } from "./containers/help-section";
import {SubmitButtons} from "./containers/submit-buttons";

const { t } = useI18n();
const props = withDefaults(
  defineProps<{
    config: FormConfig;
    fieldsToClear?: string[] | null
  }>(),
  { fieldsToClear: null },
);

const emit = defineEmits(['formUpdated', 'loaded','submit', 'setData']);
const enhancedConfig = ref();

const handleFormUpdate = (updatedForm) => {
  emit('formUpdated', updatedForm);
};

const handleSetData = (data) => {
  emit('setData', data);
};

watch(() => props.config, (newConfig) => {
  const defaultTranslations: FormConfigDefaultTranslations = {
    submitLabel: t('shared.button.save'),
    cancelLabel: t('shared.button.back'),
    submitAndContinueLabel: t('shared.button.saveAndContinue'),
    deleteLabel: t('shared.button.delete'),
    showLabel: t('shared.button.show')
  };

  enhancedConfig.value = getEnhancedConfig(newConfig, defaultTranslations);
}, { immediate: true, deep: true });

</script>

<template>
  <div v-if="enhancedConfig" class="space-y-10 divide-y divide-gray-900/10 mt-4">
    <div :class="['grid grid-cols-1 gap-x-8 gap-y-8', { 'md:grid-cols-3': !enhancedConfig.fullWidth }]">
      <HelpSection :config="enhancedConfig" />
      <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <FormCreate v-if="enhancedConfig.type === FormType.CREATE" :config="enhancedConfig" :fields-to-clear="fieldsToClear"  @submit="emit('submit')" @form-updated="handleFormUpdate" >
          <template #before-fields>
            <slot name="before-fields" />
          </template>
          <template #additional-button>
            <slot name="additional-button" />
          </template>
          <template #additional-fields>
            <slot name="additional-fields" />
          </template>
        </FormCreate>

        <FormEdit v-else-if="enhancedConfig.type === FormType.EDIT" :config="enhancedConfig" :fields-to-clear="fieldsToClear" @submit="emit('submit')"  @set-data="handleSetData" @form-updated="handleFormUpdate" >
          <template #before-fields>
            <slot name="before-fields" />
          </template>
          <template #additional-button>
            <slot name="additional-button" />
          </template>
          <template #additional-fields>
            <slot name="additional-fields" />
          </template>
        </FormEdit>
      </div>
    </div>
  </div>
</template>
