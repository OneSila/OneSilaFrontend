<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import { createInventoryMutation } from "../../../../shared/api/mutations/inventory.js"
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
    createInventoryMutation,
    'createInventory',
    route.query.productId ? route.query.productId.toString() : null
  ),
};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'inventory.inventory.list' }, name: t('inventory.title') },
                   { path: { name: 'inventory.inventory.create' }, name: t('inventory.inventory.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </GeneralTemplate>
</template>