<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import { createEanCodeMutation } from "../../../../shared/api/mutations/eanCodes.js"
import {baseFormConfigConstructor, baseFormGenerateConfigConstructor} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute} from "vue-router";

const route = useRoute();
const { t } = useI18n();

const formConfig = baseFormGenerateConfigConstructor(t);

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'products.eanCodes.list' }, name: t('products.eanCodes.title') },
                   { path: { name: 'products.eanCodes.create' }, name: t('products.eanCodes.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </GeneralTemplate>
</template>