<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import {onMounted, ref} from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import { TranslatedFields } from "../../../../shared/components/organisms/translated-fields";
import { propertySelectValueTranslationsQuery, getPropertySelectValueQuery } from "../../../../shared/api/queries/properties.js";
import {
  updatePropertySelectValueMutation,
  updatePropertySelectValueTranslationMutation,
  createPropertySelectValueTranslationMutation
} from "../../../../shared/api/mutations/properties.js";

import {Tabs} from "../../../../shared/components/molecules/tabs";
import { editFormConfigConstructor } from "../configs";
import {FieldType} from "../../../../shared/utils/constants";
import apolloClient from "../../../../../apollo-client";


const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const formConfig = ref<FormConfig | null>(null)
const tabItems = ref();

tabItems.value = [
  { name: 'translations', label: t('shared.tabs.translations'), icon: 'language' },
  { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info' },
];

;

onMounted(async () => {
  const { data } = await apolloClient.query({
    query: getPropertySelectValueQuery,
    variables: { id: id.value }
  });

  const propertySelectValue = data.propertySelectValue;
  const addImage = propertySelectValue && propertySelectValue.property
                  ? Boolean(propertySelectValue.property.hasImage)
                  : false;

  formConfig.value = editFormConfigConstructor(t, id.value, data, addImage);

});

</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'properties.values.list' }, name: t('properties.values.title') },
                   { path: { name: 'properties.values.edit' }, name: t('properties.values.edit.title') }]" />
    </template>

   <template v-slot:content>
       <div>
        <Tabs :tabs="tabItems">
          <template v-slot:general>
            <GeneralForm v-if="formConfig" :config="formConfig as FormConfig" />
          </template>
          <template v-slot:translations>
            <TranslatedFields
             :field-name="'value'"
             :label="t('shared.labels.name')"
             :placeholder="t('shared.placeholders.name')"
             :query="propertySelectValueTranslationsQuery"
             :query-key="'propertySelectValueTranslations'"
             :variables="{ filter: { propertyselectvalue: { id: { exact: id }}}}"
             :create-mutation="createPropertySelectValueTranslationMutation"
             :create-mutation-key="'createPropertySelectValueTranslation'"
             :edit-mutation="updatePropertySelectValueTranslationMutation"
             :edit-mutation-key="'updatePropertySelectValueTranslation'"
             :back-url="{ name: 'properties.values.list' }"
             :related-name="'propertyselectvalue'"
             :related-id="id"
         />
          </template>
        </Tabs>
      </div>

   </template>
  </GeneralTemplate>
</template>