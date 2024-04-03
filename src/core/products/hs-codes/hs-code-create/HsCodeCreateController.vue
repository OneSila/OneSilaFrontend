<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import { createHsCodeMutation } from "../../../../shared/api/mutations/hsCodes.js"
import { baseFormConfigConstructor } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute} from "vue-router";

const { t } = useI18n();
const route = useRoute();

const formConfig = {
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createHsCodeMutation,
    'createHsCode',
      route.query.productId ? route.query.productId.toString() : null
  ),
};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'products.hsCodes.list' }, name: t('products.hsCodes.title') },
                   { path: { name: 'products.hsCodes.create' }, name: t('products.hsCodes.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </GeneralTemplate>
</template>