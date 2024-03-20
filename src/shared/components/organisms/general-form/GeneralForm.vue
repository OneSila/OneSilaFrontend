<script setup lang="ts">

import { ref, watch } from 'vue';
import { FormCreate } from './containers/form-create';
import { FormEdit } from './containers/form-edit';
import { getEnhancedConfig, FormConfig, FormType, FormConfigDefaultTranslations } from './formConfig';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = withDefaults(
  defineProps<{
    config: FormConfig;
    fieldsToClear?: string[] | null
  }>(),
  { fieldsToClear: null },
);

const emits = defineEmits(['formUpdated', 'loaded']);
const enhancedConfig = ref();

const handleFormUpdate = (updatedForm) => {
  emits('formUpdated', updatedForm);
};

watch(() => props.config, (newConfig) => {
  const defaultTranslations: FormConfigDefaultTranslations = {
    submitLabel: t('shared.button.save'),
    cancelLabel: t('shared.button.back'),
    submitAndContinueLabel: t('shared.button.saveAndContinue'),
    deleteLabel: t('shared.button.delete')
  };

  enhancedConfig.value = getEnhancedConfig(newConfig, defaultTranslations);
}, { immediate: true, deep: true });

</script>

<template>
  <div v-if="enhancedConfig">
    <FormCreate v-if="enhancedConfig.type === FormType.CREATE" :config="enhancedConfig" :fields-to-clear="fieldsToClear" @form-updated="handleFormUpdate" />
    <FormEdit v-else-if="enhancedConfig.type === FormType.EDIT" :config="enhancedConfig" :fields-to-clear="fieldsToClear" @form-updated="handleFormUpdate" />
  </div>
</template>
