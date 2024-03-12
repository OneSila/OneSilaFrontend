<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import { createInventoryLocationMutation } from "../../../../shared/api/mutations/inventory.js"
import { baseFormConfigConstructor } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../shared/components/atoms/card";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";

const { t } = useI18n();

const formConfig = {
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createInventoryLocationMutation,
    'createInventoryLocationType'
  ),
  submitAndContinueUrl: { name: 'inventory.inventoryLocations.edit' }
};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'inventory.inventoryLocations.list' }, name: t('inventory.inventoryLocations.title') },
                   { path: { name: 'inventory.inventoryLocations.create' }, name: t('inventory.inventoryLocations.create.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2">
        <GeneralForm :config="formConfig" />
      </Card>
   </template>
  </GeneralTemplate>
</template>