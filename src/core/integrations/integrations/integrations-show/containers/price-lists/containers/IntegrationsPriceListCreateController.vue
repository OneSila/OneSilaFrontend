<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../shared/components/molecules/breadcrumbs";
import { GeneralForm } from "../../../../../../../shared/components/organisms/general-form";
import { priceListCreateFormConfigConstructor } from '../configs';

const route = useRoute();
const { t } = useI18n();

const type = ref(String(route.params.type));
const integrationId = route.params.integrationId ? route.params.integrationId.toString() : '';
const salesChannelId = route.query.salesChannelId ? route.query.salesChannelId.toString() : '';

const formConfig = priceListCreateFormConfigConstructor(t, type.value, salesChannelId, integrationId);
</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.integrations.show', params: { id: integrationId, type: type }, query: { tab: 'priceLists' } }, name: t('integrations.show.title') },
          { name: t('sales.priceLists.create.title') }
        ]"
      />
    </template>
    <template v-slot:content>
      <GeneralForm :config="formConfig" />
    </template>
  </GeneralTemplate>
</template>
