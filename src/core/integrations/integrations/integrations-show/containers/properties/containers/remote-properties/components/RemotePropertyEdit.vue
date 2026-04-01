<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import { GeneralForm } from "../../../../../../../../../shared/components/organisms/general-form";
import type { FormConfig } from "../../../../../../../../../shared/components/organisms/general-form/formConfig";
import { Tabs } from "../../../../../../../../../shared/components/molecules/tabs";
import { CollaborationTab } from "../../../../../../../../../shared/components/organisms/collaboration-tab";

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
const { t } = useI18n();
const route = useRoute();
const targetId = ref(String(route.params.id));
const tabItems = [
  { name: 'general', label: t('shared.tabs.mapping'), icon: 'circle-info', alwaysRender: true },
  { name: 'collaboration', label: t('shared.tabs.collaboration'), icon: 'comment-dots' },
];

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
      <Tabs :tabs="tabItems">
        <template #general>
          <GeneralForm
            v-if="props.formConfig"
            :config="props.formConfig"
            @set-data="handleSetData"
            @form-updated="handleFormUpdated"
          >
            <template #before-fields>
              <slot name="before-form" />
            </template>
            <template #help-section>
              <slot name="help-section" />
            </template>
            <template #additional-button>
              <slot name="additional-button" />
            </template>
            <template #additional-fields>
              <slot name="additional-fields" />
            </template>
          </GeneralForm>
        </template>
        <template #collaboration>
          <CollaborationTab :target-id="targetId" />
        </template>
      </Tabs>
    </template>
  </GeneralTemplate>
</template>
