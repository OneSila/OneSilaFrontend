<script setup lang="ts">

import  {Ref, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import { createProductMutation } from "../../../../shared/api/mutations/products.js"
import {baseFormConfigConstructor} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute} from "vue-router";

const { t } = useI18n();
const route = useRoute();

const customerId = ref(null);
const fieldsToClear: Ref<string[] | null> = ref(null);


const  baseForm = {
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createProductMutation,
    'createProduct',
      {name: 'products.products.show'}
  ),
};

const formConfig = ref(baseForm);

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'products.products.list' }, name: t('products.title') },
                   { path: { name: 'products.products.create' }, name: t('products.products.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" :fields-to-clear="fieldsToClear" />
   </template>
  </GeneralTemplate>
</template>