<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../shared/components/molecules/breadcrumbs";
import { GeneralForm } from "../../../../../../../shared/components/organisms/general-form";
import { currencyEditFormConfigConstructor } from "../configs";

const { t } = useI18n();
const route = useRoute();

const currencyId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId ? route.query.integrationId.toString() : '';

const formConfig = currencyEditFormConfigConstructor(t, type.value, currencyId.value, integrationId);
</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.integrations.show' }, name: t('integrations.show.title') },
          { name: t('integrations.show.mapRemoteCurrency') }
      ]" />
    </template>
    <template v-slot:content>
      <GeneralForm :config="formConfig" />
    </template>
  </GeneralTemplate>
</template>
