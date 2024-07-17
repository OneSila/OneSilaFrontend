<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import {Product} from "../../../../configs";
import {Button} from "../../../../../../../shared/components/atoms/button";
import TabContentTemplate from "../TabContentTemplate.vue";
import apolloClient from "../../../../../../../../apollo-client";
import {reactive, watch, ref, onMounted, Ref} from "vue";
import {FieldQuery} from "../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import {supplierPricesQuery} from "../../../../../../../shared/api/queries/purchasing.js";
import {createSupplierPriceMutation, deleteSupplierPriceMutation, updateSupplierPriceMutation} from "../../../../../../../shared/api/mutations/purchasing.js";
import {QueryFormField} from "../../../../../../../shared/components/organisms/general-form/formConfig";
import {FieldType} from "../../../../../../../shared/utils/constants";
import {unitsQuery} from "../../../../../../../shared/api/queries/units.js";
import {Icon} from "../../../../../../../shared/components/atoms/icon";
import {TextInput} from "../../../../../../../shared/components/atoms/input-text";
import {Toast} from "../../../../../../../shared/modules/toast";

const { t } = useI18n();
const props = defineProps<{ product: Product }>();
const currencySymbol = ref(null);

interface Price {
  id?: string;
  quantity: number | null;
  unitPrice: number | null;
  unit: {
    id: string | null;
  };
}
const prices: Ref<Price[]> = ref([]);
const initialPrices: Ref<Price[]> = ref([]);
const saving = ref(false);

const loadPrices = async () => {
  saving.value = true;

  const { data } = await apolloClient.query({
    query: supplierPricesQuery,
    variables: { filter: { supplierProduct: {id: {exact: props.product.proxyId }} }},
    fetchPolicy: 'network-only'
  });

  prices.value = data.supplierPrices.edges.map(edge => ({
    id: edge.node.id,
    quantity: edge.node.quantity,
    unitPrice: edge.node.unitPrice,
    unit: {
      id: edge.node.unit.id
    }
  }));
  initialPrices.value = JSON.parse(JSON.stringify(prices.value));

  if (data.supplierPrices.edges.length > 0) {
    currencySymbol.value = data.supplierPrices.edges[0].node.supplierProduct.supplier.currencySymbol;
  }

  saving.value = false;
}

const addNewPrice = () => {
  prices.value.push({ quantity: null, unitPrice: null, unit: { id: null } });
}

const removePrice = (index) => {
  prices.value.splice(index, 1);
}

function isValidPrice(price) {
  return price.quantity > 0 && price.unitPrice > 0 && price.unit && price.unit.id;
}

const savePrices = async () => {
  saving.value = true;
  const existentIds: string[] = [];

  try {
    for (const price of prices.value) {

      if (!isValidPrice(price)) {
        continue;
      }

      if (price.id) {
        existentIds.push(price.id);

        const originalPrice = initialPrices.value.find(p => p.id === price.id);

        if (JSON.stringify(price) !== JSON.stringify(originalPrice)) {
          await apolloClient.mutate({
            mutation: updateSupplierPriceMutation,
            variables: { data: price }
          });
        }
      } else {
        const newPrice = {
          ...price,
          supplierProduct: { id: props.product.proxyId }
        };
        const response = await apolloClient.mutate({
          mutation: createSupplierPriceMutation,
          variables: { data: newPrice }
        });
      }
    }

    initialPrices.value.forEach((price) => {
      if (price.id && !existentIds.includes(price.id)) {
        apolloClient.mutate({
          mutation: deleteSupplierPriceMutation,
          variables: { id: price.id }
        });
      }
    });
    Toast.success(t('purchasing.products.alert.prices.successfullyUpdated'))
  } finally {
    await loadPrices();
    saving.value = false;
  }
}

const unitField = {
      type: FieldType.Query,
      name: 'unit',
      label: t('shared.labels.unit'),
      labelBy: 'name',
      valueBy: 'id',
      query: unitsQuery,
      dataKey: 'units',
      isEdge: true,
      multiple: false,
      filterable: true,
      removable: false,
      formMapIdentifier: 'id'
}

onMounted(loadPrices);

</script>

<template>
  <TabContentTemplate>

    <template v-slot:buttons>
      <Button :customClass="'btn btn-primary mr-2'" @click="savePrices">
        {{ t('shared.button.save') }}
      </Button>
    </template>

    <template v-slot:content>
    <table class="table-striped table-hover">
      <thead>
        <tr>
          <th>{{ t('shared.labels.quantity') }}</th>
          <th>{{ t('purchasing.products.labels.unitPrice') }}</th>
          <th>{{ t('shared.labels.unit') }}</th>
          <th>{{ t('shared.labels.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(price, index) in prices" :key="index">
          <td>
            <TextInput v-model="price.quantity" number :placeholder="t('shared.placeholders.quantity')" :disabled="saving" />
          </td>
          <td>
            <TextInput v-model="price.unitPrice" :prepend="currencySymbol" float :placeholder="t('purchasing.products.placeholders.unitPrice')" :disabled="saving" />
          </td>
          <td>
            <FieldQuery class="w-96" v-model="price.unit.id" :field="unitField as QueryFormField"  />
          </td>
          <td>
            <Button class="btn btn-sm btn-outline-danger" @click="removePrice(index)" :disabled="saving">
                <Icon name="trash" />
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
    <Button class="btn btn-primary mt-2" @click="addNewPrice()">
      <Icon class="mr-2" name="plus" />
      {{ t('shared.button.add') }}
    </Button>
    </template>
  </TabContentTemplate>
</template>