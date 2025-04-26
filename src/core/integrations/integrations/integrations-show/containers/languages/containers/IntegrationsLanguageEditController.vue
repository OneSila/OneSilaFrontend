<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../shared/components/molecules/breadcrumbs";
import { GeneralForm } from "../../../../../../../shared/components/organisms/general-form";
import { useRoute } from "vue-router";
import {languageEditFormConfigConstructor} from "../configs";

const { t } = useI18n();
const route = useRoute();

const languageId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId ? route.query.integrationId.toString() : '';

const formConfig = languageEditFormConfigConstructor(t, type.value, languageId.value, integrationId);

</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.integrations.show', params: {id: integrationId, type: type}, query: {tab: 'languages'} }, name: t('integrations.show.title') }
        ]" />
    </template>
    <template v-slot:content>
      <GeneralForm :config="formConfig" />
    </template>
  </GeneralTemplate>
</template>
