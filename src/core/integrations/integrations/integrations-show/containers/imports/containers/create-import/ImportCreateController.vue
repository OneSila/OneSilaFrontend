<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import GeneralTemplate from "../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../../shared/components/molecules/breadcrumbs";
import { MagentoImporter } from "./containers/magento/magento-importer";


const { t } = useI18n();
const route = useRoute();
const router = useRouter();


const integrationId = ref(String(route.params.integrationId));
const type = ref(String(route.params.type));

</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.integrations.show', params: { id: integrationId, type: type }, query: { tab: 'imports' } }, name: t('integrations.show.title') },
          { name: t('integrations.imports.create.title') }
        ]"
      />
    </template>

    <template #content>
      <MagentoImporter :integration-id="integrationId" :type="type" />
    </template>
  </GeneralTemplate>
</template>
