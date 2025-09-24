<script setup lang="ts">
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import { GeneralForm } from "../../../../../../../../../shared/components/organisms/general-form";
import type { FormConfig } from "../../../../../../../../../shared/components/organisms/general-form/formConfig";

interface BreadcrumbLink {
  path?: {
    name: string;
    params?: Record<string, any>;
    query?: Record<string, any>;
  };
  name: string;
}

const props = defineProps<{
  breadcrumbsLinks: BreadcrumbLink[];
  formConfig: FormConfig | null;
}>();

const emit = defineEmits<{
  (e: 'set-data', value: any): void;
  (e: 'form-updated', value: Record<string, any>): void;
}>();

const handleSetData = (payload: any) => {
  emit('set-data', payload);
};

const handleFormUpdated = (form: Record<string, any>) => {
  emit('form-updated', form);
};
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs :links="props.breadcrumbsLinks" />
    </template>
    <template #content>
      <GeneralForm
        v-if="props.formConfig"
        :config="props.formConfig"
        @set-data="handleSetData"
        @form-updated="handleFormUpdated"
      >
        <template #before-fields>
          <slot name="before-form" />
        </template>
        <template #additional-button>
          <slot name="additional-button" />
        </template>
        <template #additional-fields>
          <slot name="additional-fields" />
        </template>
      </GeneralForm>
    </template>
  </GeneralTemplate>
</template>
