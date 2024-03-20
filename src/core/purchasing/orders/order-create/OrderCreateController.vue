<script setup lang="ts">

import {Ref, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType, updateFieldConfigs, FieldConfigs } from '../../../../shared/components/organisms/general-form/formConfig';
import { createPurchaseOrderMutation } from "../../../../shared/api/mutations/purchasing.js"
import {baseFormConfigConstructor, invoiceAddressOnTheFlyConfig, shippingAddressOnTheFlyConfig} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../shared/components/atoms/card";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute} from "vue-router";

const route = useRoute();
const { t } = useI18n();
const supplierId = ref(null);
const fieldsToClear: Ref<string[] | null> = ref(null);

const formConfig = ref({
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createPurchaseOrderMutation,
    'createPurchaseOrder',
      route.query.supplierId ? route.query.supplierId.toString() : null
  ),
});


const handleFormUpdate = (form) => {
  fieldsToClear.value = []
  if (form.supplier !== supplierId.value) {
    supplierId.value = form.supplier;

    const fieldConfigs: FieldConfigs = {
      'invoiceAddress': {
        enabled: {
          disabled: false,
          queryVariables: { "filter": { "company": {"id": {"exact": supplierId.value }}}},
          createOnFlyConfig: invoiceAddressOnTheFlyConfig(t, supplierId.value)
        },
        disabled: {
          disabled: true,
          queryVariables: null,
          createOnFlyConfig: null
        }
      },
      'shippingAddress': {
        enabled: {
          disabled: false,
          queryVariables: { "filter": { "company": {"id": {"exact": supplierId.value }}}},
          createOnFlyConfig: shippingAddressOnTheFlyConfig(t, supplierId.value)
        },
        disabled: {
          disabled: true,
          queryVariables: null,
          createOnFlyConfig: null
        }
      }
    };

    updateFieldConfigs(supplierId, fieldConfigs, formConfig);
    fieldsToClear.value = ['invoiceAddress', 'shippingAddress']
  }
};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'purchasing.orders.list' }, name: t('purchasing.orders.title') },
                   { path: { name: 'purchasing.orders.create' }, name: t('purchasing.orders.create.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2">
        <GeneralForm :config="formConfig as FormConfig" :fields-to-clear="fieldsToClear" @form-updated="handleFormUpdate" />
      </Card>
   </template>
  </GeneralTemplate>
</template>