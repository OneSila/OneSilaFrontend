<script setup lang="ts">

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import { createSupplierProductMutation } from "../../../../shared/api/mutations/purchasing.js"
import {baseFormConfigConstructor} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../shared/components/atoms/card";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute} from "vue-router";

const route = useRoute();
const { t } = useI18n();

const formConfig = {
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createSupplierProductMutation,
    'createSupplierProduct',
      route.query.supplierId ? route.query.supplierId.toString() : null,
      route.query.productId ? route.query.productId.toString() : null
  ),
}

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'purchasing.products.list' }, name: t('purchasing.products.title') },
                   { path: { name: 'purchasing.product.create' }, name: t('purchasing.products.create.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2">
        <GeneralForm :config="formConfig as FormConfig" />
      </Card>
   </template>
  </GeneralTemplate>
</template>