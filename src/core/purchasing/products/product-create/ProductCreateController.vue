<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import {FieldConfigs, FormConfig, FormType, updateFieldConfigs} from '../../../../shared/components/organisms/general-form/formConfig';
import { createSupplierProductMutation } from "../../../../shared/api/mutations/purchasing.js"
import {baseFormConfigConstructor} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute} from "vue-router";
import {ref} from "vue";
import apolloClient from "../../../../../apollo-client";
import { getCompanyQuery } from "../../../../shared/api/queries/contacts.js";

const route = useRoute();
const { t } = useI18n();
const supplierId = ref(null);

const formConfig = ref({
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createSupplierProductMutation,
    'createSupplierProduct',
      route.query.supplierId ? route.query.supplierId.toString() : null,
      route.query.productId ? route.query.productId.toString() : null
  ),
});

const handleFormUpdate = async (form) => {

  const newSupplierId = typeof form.supplier === 'object' && form.supplier !== null ? form.supplier.id : form.supplier;
  if (form.supplier !== supplierId.value) {
    const initialSupplierId = supplierId.value;
    supplierId.value = newSupplierId;

    let isoCode = null;

    if (supplierId.value !== null) {
      const { data } = await apolloClient.query({
        query: getCompanyQuery,
        variables: {id: supplierId.value}
      });

      if (!data) {
        return
      }
      isoCode = data.company.currencySymbol;
    }

    const fieldConfigs: FieldConfigs = {
      'unitPrice': {
        enabled: {
          prepend: isoCode
        },
        disabled: {
          prepend: null
        }
      },
    };

    updateFieldConfigs(supplierId.value, fieldConfigs, formConfig);

    if (initialSupplierId === null) {
      return;
    }
  }
};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'purchasing.products.list' }, name: t('purchasing.products.title') },
                   { path: { name: 'purchasing.product.create' }, name: t('purchasing.products.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" @form-updated="handleFormUpdate" />
   </template>
  </GeneralTemplate>
</template>