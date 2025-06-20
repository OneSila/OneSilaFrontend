<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormType, FormConfig } from '../../../../shared/components/organisms/general-form/formConfig';
import { createPropertySelectValueMutation } from "../../../../shared/api/mutations/properties.js";
import { baseFormConfigConstructor } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import apolloClient from "../../../../../apollo-client";
import { getPropertyQuery } from "../../../../shared/api/queries/properties.js";

const { t } = useI18n();
const route = useRoute();
const formConfig = ref<FormConfig | null>(null);
const defaultValue = route.query.value ? route.query.value.toString() : '';

onMounted(async () => {
  let addImage = false;
  const propertyId = route.query.propertyId ? route.query.propertyId.toString() : null;
  const isRule = route.query.isRule ? route.query.isRule.toString() : null;
  const amazonRuleId = route.query.amazonRuleId ? route.query.amazonRuleId.toString() : null;

  if (propertyId) {
    const { data } = await apolloClient.query({
      query: getPropertyQuery,
      variables: { id: propertyId }
    });

    const property = data.property;
    addImage = Boolean(property && property.hasImage);
  }

  formConfig.value = baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createPropertySelectValueMutation,
    'createPropertySelectValue',
    propertyId,
    addImage,
    isRule !== null,
    amazonRuleId
  );

  if (defaultValue && formConfig.value) {
    const valueField = formConfig.value.fields.find(field => field.name === 'value');
    if (valueField) {
      valueField.default = defaultValue;
    }
  }
});

</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'properties.values.list' }, name: t('properties.values.title') },
          { path: { name: 'properties.values.create' }, name: t('properties.values.create.title') }
        ]"
      />
    </template>
    <template v-slot:content>
      <GeneralForm v-if="formConfig" :config="formConfig as FormConfig" />
    </template>
  </GeneralTemplate>
</template>
