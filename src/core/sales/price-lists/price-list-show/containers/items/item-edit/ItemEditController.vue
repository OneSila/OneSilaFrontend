<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { Ref, ref} from "vue";
import { GeneralForm } from "../../../../../../../shared/components/organisms/general-form";
import { FormType } from "../../../../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../../../../shared/utils/constants";
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../../../../shared/components/atoms/card";
import { baseFormConfigConstructor } from "../configs";
import { getSalesPriceListItemQuery } from "../../../../../../../shared/api/queries/salesPrices.js";
import { updateSalesPriceListItemMutation } from "../../../../../../../shared/api/mutations/salesPrices.js";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(route.params.id);
const priceListId = ref(route.params.priceListId);

const formConfig: Ref<any| null> = ref(null);

const baseForm = baseFormConfigConstructor(
  t,
  FormType.EDIT,
  updateSalesPriceListItemMutation,
  'updateSalesPriceListItem',
  priceListId.value.toString()
);

formConfig.value = {
  ...baseForm,
  mutationId: id.value.toString(),
  query: getSalesPriceListItemQuery,
  queryVariables: { id: id.value },
  queryDataKey: 'salesPriceListItem',
  fields: [
    {
      type: FieldType.Hidden,
      name: 'id',
      value: id.value.toString()
    },
    ...baseForm.fields
  ]
};



</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'sales.priceLists.list' }, name: t('sales.priceLists.title') },
                   { path: { name: 'sales.priceLists.show', params: { id: priceListId } }, name: t('sales.priceLists.show.title') },
                   { path: { name: 'sales.priceLists.items.edit', params: { priceListId: priceListId, id: id } }, name: t('sales.priceLists.items.edit.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2" v-if="formConfig !== null">
        <GeneralForm :config="formConfig" />
      </Card>
   </template>
  </GeneralTemplate>

</template>