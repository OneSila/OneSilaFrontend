<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import { useRoute } from "vue-router";
import {Breadcrumbs} from "../../../../../../../shared/components/molecules/breadcrumbs";
import {storeEditFormConfigConstructor} from "../configs";
import {GeneralForm} from "../../../../../../../shared/components/organisms/general-form";

const route = useRoute();

const { t } = useI18n();
const id = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId ? route.query.integrationId.toString() : '';


const formConfig = storeEditFormConfigConstructor(t, type.value, id.value, integrationId);
</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.integrations.show', params: {id: integrationId, type: type}, query: {tab: 'stores'} }, name: t('integrations.show.title') },
          { name: t('integrations.show.mapRemoteStore') }
      ]" />
    </template>
    <template v-slot:content>
      <GeneralForm :config="formConfig" />
    </template>
  </GeneralTemplate>
</template>