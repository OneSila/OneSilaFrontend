<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
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


const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));

const tabItems = ref();

tabItems.value = [
    { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info' },
    { name: 'translations', label: t('shared.tabs.translations'), icon: 'language' },
  ];

const formConfig = editFormConfigConstructor(t, id.value.toString());

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
            <GeneralForm :config="formConfig as FormConfig" />
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