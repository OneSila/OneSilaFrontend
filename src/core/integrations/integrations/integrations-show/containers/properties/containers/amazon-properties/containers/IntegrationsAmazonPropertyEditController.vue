<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import { GeneralForm } from "../../../../../../../../../shared/components/organisms/general-form";
import { useRoute } from "vue-router";
import { amazonPropertyEditFormConfigConstructor } from "../configs";

const { t } = useI18n();
const route = useRoute();

const propertyId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId ? route.query.integrationId.toString() : '';

const formConfig = amazonPropertyEditFormConfigConstructor(t, type.value, propertyId.value, integrationId);
</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.integrations.show', params: {id: integrationId, type: type}, query: {tab: 'properties'} }, name: t('integrations.show.amazon.title') }
        ]" />
    </template>
    <template v-slot:buttons>
        <div>
          <Link :path="{ name: 'properties.properties.create', query: { amazonRuleId: `${propertyId}__${integrationId}` } }">
            <Button type="button" class="btn btn-primary">
                {{  t('properties.properties.create.title') }}
            </Button>
          </Link>
      </div>
    </template>
    <template v-slot:content>
      <GeneralForm :config="formConfig" />
    </template>
  </GeneralTemplate>
</template>
