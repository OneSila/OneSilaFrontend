<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { advancedFormConfigConstructor, editFormConfigConstructor} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import { TranslatedFields } from "../../../../shared/components/organisms/translated-fields";
import { propertyTranslationsQuery, getPropertyQuery } from "../../../../shared/api/queries/properties.js";
import { createPropertyTranslationMutation, updatePropertyTranslationMutation, updatePropertyMutation } from "../../../../shared/api/mutations/properties.js";
import {Tabs} from "../../../../shared/components/molecules/tabs";


const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));

const tabItems = ref();

tabItems.value = [
    { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info' },
    { name: 'translations', label: t('shared.tabs.translations'), icon: 'language' },
    { name: 'advanced', label: t('shared.tabs.advanced'), icon: 'cog' },
  ];

const editConfig = editFormConfigConstructor(t, id.value.toString());
const advancedConfig = advancedFormConfigConstructor(t, id.value.toString());


</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'properties.properties.list' }, name: t('properties.title') },
                   { path: { name: 'properties.properties.edit' }, name: t('properties.properties.edit.title') }]" />
    </template>

   <template v-slot:content>
       <div>
        <Tabs :tabs="tabItems">
          <template v-slot:general>
            <GeneralForm :config="editConfig as FormConfig" />
          </template>
          <template v-slot:translations>
            <TranslatedFields
             :field-name="'name'"
             :label="t('shared.labels.name')"
             :placeholder="t('shared.placeholders.name')"
             :query="propertyTranslationsQuery"
             :query-key="'propertyTranslations'"
             :variables="{ filter: { property: { id: { exact: id }}}}"
             :create-mutation="createPropertyTranslationMutation"
             :create-mutation-key="'createPropertyTranslation'"
             :edit-mutation="updatePropertyTranslationMutation"
             :edit-mutation-key="'updatePropertyTranslation'"
             :back-url="{ name: 'properties.properties.list' }"
             :related-name="'property'"
             :related-id="id"
         />
          </template>
          <template v-slot:advanced>
            <GeneralForm :config="advancedConfig as FormConfig" />
          </template>
        </Tabs>
      </div>

   </template>
  </GeneralTemplate>
</template>