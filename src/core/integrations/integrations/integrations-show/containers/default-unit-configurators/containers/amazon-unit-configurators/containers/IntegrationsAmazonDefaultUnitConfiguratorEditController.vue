<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import { GeneralForm } from "../../../../../../../../../shared/components/organisms/general-form";
import { amazonDefaultUnitConfiguratorEditFormConfigConstructor } from '../configs';
import { FormConfig } from "../../../../../../../../../shared/components/organisms/general-form/formConfig";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const configuratorId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId?.toString() || '';
const salesChannelId = route.query.salesChannelId?.toString() || '';
const isWizard = route.query.wizard === '1';
const formConfig = ref<FormConfig | null>(null);

onMounted(() => {
  formConfig.value = amazonDefaultUnitConfiguratorEditFormConfigConstructor(t, type.value, configuratorId.value, integrationId);
  if (isWizard) {
    formConfig.value.addSubmitAndContinue = false;
    formConfig.value.cancelUrl = { name: 'integrations.integrations.show', params: { type: type.value, id: integrationId }, query: { tab: 'defaultUnits' } };
    formConfig.value.submitUrl = { name: 'integrations.integrations.show', params: { type: type.value, id: integrationId }, query: { tab: 'defaultUnits' } };
  }
});
</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.integrations.show', params: {id: integrationId, type: type}, query: {tab: 'defaultUnits'} }, name: t('integrations.show.amazon.title') },
          { name: t('integrations.show.mapSelectValue') }
        ]" />
    </template>
    <template v-slot:content>
      <GeneralForm v-if="formConfig" :config="formConfig" />
    </template>
  </GeneralTemplate>
</template>
