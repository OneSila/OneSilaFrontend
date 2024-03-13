<script setup lang="ts">

import {onMounted, Ref} from 'vue'
import { useI18n} from 'vue-i18n';
import { GeneralForm } from "../../../../../../../shared/components/organisms/general-form";
import { FormType } from '../../../../../../../shared/components/organisms/general-form/formConfig';
import { createOrderItemMutation } from "../../../../../../../shared/api/mutations/salesOrders.js"
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../../../../shared/components/atoms/card";
import { ref} from "vue";
import { useRoute, useRouter } from "vue-router";
import { baseFormConfigConstructor} from "../configs";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const orderId = ref(route.params.orderId);

const formConfig = {
    ...baseFormConfigConstructor(
      t,
      FormType.CREATE,
      createOrderItemMutation,
      'createOrderItem',
      orderId.value.toString(),
    ),
    submitAndContinueUrl: { name: 'sales.orders.items.edit', params: { orderId: orderId.value } }
  };


</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'sales.orders.list' }, name: t('sales.orders.title') },
                   { path: { name: 'sales.orders.show', params: { id: orderId } }, name: t('sales.orders.show.title') },
                   { path: { name: 'sales.orders.items.create', params: { orderId: orderId } }, name: t('sales.orders.items.create.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2">
        <GeneralForm :config="formConfig" />
      </Card>
   </template>
  </GeneralTemplate>
</template>