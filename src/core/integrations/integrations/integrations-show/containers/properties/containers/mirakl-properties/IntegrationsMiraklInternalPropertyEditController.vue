<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import GeneralTemplate from "../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../../shared/components/molecules/breadcrumbs";
import { GeneralForm } from "../../../../../../../../shared/components/organisms/general-form";
import { miraklInternalPropertyEditFormConfigConstructor } from './configs';

const { t } = useI18n();
const route = useRoute();

const propertyId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId?.toString() || '';
const returnTab = route.query.fromTab?.toString() || 'inventoryFields';

const formConfig = computed(() =>
  miraklInternalPropertyEditFormConfigConstructor(t, type.value, propertyId.value, integrationId, returnTab),
);
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          {
            path: {
              name: 'integrations.integrations.show',
              params: { id: integrationId, type: type },
              query: { tab: returnTab },
            },
            name: t(`integrations.show.${type}.title`),
          },
          { name: t('integrations.show.mapProperty') },
        ]"
      />
    </template>
    <template #content>
      <GeneralForm :config="formConfig" />
    </template>
  </GeneralTemplate>
</template>
