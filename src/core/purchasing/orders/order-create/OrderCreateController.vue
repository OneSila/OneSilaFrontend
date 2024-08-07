<script setup lang="ts">

import {Ref, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType, updateFieldConfigs, FieldConfigs } from '../../../../shared/components/organisms/general-form/formConfig';
import { createPurchaseOrderMutation } from "../../../../shared/api/mutations/purchasing.js"
import {baseFormConfigConstructor, invoiceAddressOnTheFlyConfig, shippingAddressOnTheFlyConfig} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute} from "vue-router";

const route = useRoute();
const { t } = useI18n();
const supplierId = ref(null);
const fieldsToClear: Ref<string[] | null> = ref(null);
const querySupplierId = route.query.supplierId ? route.query.supplierId.toString() : null;


const formConfig = ref({
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createPurchaseOrderMutation,
    'createPurchaseOrder',
      querySupplierId,
      route.query.source ? route.query.source.toString() : null
  ),
});


const handleFormUpdate = (form) => {
  fieldsToClear.value = []

  const newSupplierId = typeof form.supplier === 'object' && form.supplier !== null ? form.supplier.id : form.supplier;
  if (form.supplier !== supplierId.value) {
    const initialSupplierId = supplierId.value;
    supplierId.value = newSupplierId;

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

    updateFieldConfigs(supplierId.value, fieldConfigs, formConfig);

    if (initialSupplierId === null) {
      return;
    }
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
     <GeneralForm v-if="querySupplierId === null" :config="formConfig as FormConfig" :fields-to-clear="fieldsToClear" @form-updated="handleFormUpdate" />
     <GeneralForm v-else :config="formConfig as FormConfig" :fields-to-clear="fieldsToClear" @form-updated="handleFormUpdate" />
   </template>
  </GeneralTemplate>
</template>