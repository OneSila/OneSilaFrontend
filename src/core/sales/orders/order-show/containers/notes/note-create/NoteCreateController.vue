<script setup lang="ts">

import {onMounted, Ref} from 'vue'
import { useI18n} from 'vue-i18n';
import { GeneralForm } from "../../../../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from '../../../../../../../shared/components/organisms/general-form/formConfig';
import { createOrderNoteMutation } from "../../../../../../../shared/api/mutations/salesOrders.js"
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../shared/components/molecules/breadcrumbs";
import { ref} from "vue";
import { useRoute, useRouter } from "vue-router";
import { baseFormConfigConstructor} from "../../notes/configs";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const orderId = ref(route.params.orderId);

const formConfig = {
    ...baseFormConfigConstructor(
      t,
      FormType.CREATE,
      createOrderNoteMutation,
      'createOrderNote',
      orderId.value.toString(),
    ),
    submitAndContinueUrl: { name: 'sales.orders.notes.edit', params: { orderId: orderId.value } }
  };


</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'sales.orders.list' }, name: t('sales.orders.title') },
                   { path: { name: 'sales.orders.show', params: { id: orderId } }, name: t('sales.orders.show.title') },
                   { path: { name: 'sales.orders.notes.create', params: { orderId: orderId } }, name: t('sales.orders.notes.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </GeneralTemplate>
</template>