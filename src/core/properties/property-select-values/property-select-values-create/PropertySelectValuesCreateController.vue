<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import { createPropertySelectValueMutation } from "../../../../shared/api/mutations/properties.js"
import { baseFormConfigConstructor } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute} from "vue-router";
import {ref} from "vue";

const { t } = useI18n();
const route = useRoute();

const tabItems = ref();

const formConfig = {
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createPropertySelectValueMutation,
    'createPropertySelectValue',
  ),
};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'properties.values.list' }, name: t('properties.values.title') },
                   { path: { name: 'properties.values.create' }, name: t('properties.values.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </GeneralTemplate>
</template>