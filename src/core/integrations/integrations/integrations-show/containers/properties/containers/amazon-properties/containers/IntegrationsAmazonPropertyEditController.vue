<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import { GeneralForm } from "../../../../../../../../../shared/components/organisms/general-form";
import { useRoute } from "vue-router";
import { amazonPropertyEditFormConfigConstructor } from "../configs";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../../../shared/components/atoms/button";

const { t } = useI18n();
const route = useRoute();

const amazonPropertyId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId ? route.query.integrationId.toString() : '';
const propertyId = route.query.propertyId ? route.query.propertyId.toString() : null;
const formData = ref<Record<string, any>>({});

const formConfig = amazonPropertyEditFormConfigConstructor(t, type.value, amazonPropertyId.value, integrationId, propertyId);

const handleFormUpdate = (form) => {
  formData.value = form;
};
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
          <Link :path="{ name: 'properties.properties.create', query: { amazonRuleId: `${amazonPropertyId}__${integrationId}`, name: formData.name, type: formData.type } }">
            <Button type="button" class="btn btn-primary">
                {{  t('properties.properties.create.title') }}
            </Button>
          </Link>
      </div>
    </template>
    <template v-slot:content>
      <GeneralForm :config="formConfig" @form-updated="handleFormUpdate" />
    </template>
  </GeneralTemplate>
</template>
