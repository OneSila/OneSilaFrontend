<script setup lang="ts">
import {onMounted, ref} from 'vue';
import { FormCreate } from './containers/form-create';
import { FormEdit } from './containers/form-edit';
import { getEnhancedConfig, FormConfig, FormType, FormConfigDefaultTranslations } from './formConfig';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps<{ config: FormConfig;}>();
const enhancedConfig = ref();

onMounted(() => {
  const defaultTranslations: FormConfigDefaultTranslations = {
    submitLabel: t('shared.button.save'),
    cancelLabel: t('shared.button.back'),
    submitAndContinueLabel: t('shared.button.saveAndContinue'),
    deleteLabel: t('shared.button.delete')
  };

  enhancedConfig.value = getEnhancedConfig(props.config, defaultTranslations);
});

</script>

<template>
  <div v-if="enhancedConfig">
    <FormCreate v-if="enhancedConfig.type === FormType.CREATE" :config="enhancedConfig" />
    <FormEdit v-else-if="enhancedConfig.type === FormType.EDIT" :config="enhancedConfig" />
  </div>
</template>
