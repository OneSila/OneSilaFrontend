<script setup lang="ts">

import {onMounted, ref, Ref} from "vue";
import { useI18n } from 'vue-i18n';
import {Product} from "../../../../configs";
import {Button} from "../../../../../../../shared/components/atoms/button";
import TabContentTemplate from "../TabContentTemplate.vue";
import apolloClient from "../../../../../../../../apollo-client";
import { salesPricesQuery } from "../../../../../../../shared/api/queries/salesPrices.js";
import {TextInput} from "../../../../../../../shared/components/atoms/input-text";
import { updateSalesPriceMutation } from "../../../../../../../shared/api/mutations/salesPrices.js";
import {Toast} from "../../../../../../../shared/modules/toast";

const { t } = useI18n();
const props = defineProps<{ product: Product }>();
const loading = ref(false);
interface Price {
  id: string;
  amount: string | number | null;
  discountAmount: string | number | null;
  currency: string;
  readonly: boolean;
}
const prices: Ref<Price[]> = ref([]);
const initialPrices: Ref<Price[]> = ref([]);

const loadPrices = async () => {
  loading.value = true;

  const { data } = await apolloClient.query({
    query: salesPricesQuery,
    variables: { filter: { product: {id: {exact: props.product.id }} }},
    fetchPolicy: 'network-only'
  });

  prices.value = data.salesPrices.edges.map(edge => ({
    id: edge.node.id,
    amount: edge.node.amount,
    discountAmount: edge.node.discountAmount,
    currency: edge.node.currency.isoCode,
    readonly: !edge.node.currency.isDefaultCurrency && !edge.node.currency.followOfficialRate,
  }));
  initialPrices.value = JSON.parse(JSON.stringify(prices.value));

  loading.value = false;
}

function isValidPrice(price) {
  const amount = parseFloat(price.amount);
  const discountAmount = parseFloat(price.discountAmount);


  if (isNaN(amount)) {
    return false;
  }

  // Check if price is 0 or less
  if (amount <= 0) {
    return false;
  }

  // Check if discount amount is 0
  if (discountAmount <= 0) {
    return false;
  }

  // Check if the discount is greater than or equal to the price
  if (discountAmount >= amount) {
    return false;
  }

  // If all checks pass, the price is valid
  return true;
}

const savePrices = async () => {
  loading.value = true;

  try {
    for (const price of prices.value) {

      if (!isValidPrice(price)) {
        Toast.error(t('sales.prices.updatedError', {currency: price.currency}));
        continue
      }

      const originalPrice = initialPrices.value.find(p => p.id === price.id);
      if (JSON.stringify(price) !== JSON.stringify(originalPrice)) {
        const priceData = {
            id: price.id,
            amount: price.amount,
            discountAmount: price.discountAmount == '' ? null : price.discountAmount
        }
        const { data } = await apolloClient.mutate({
          mutation: updateSalesPriceMutation,
          variables: { data: priceData }
        });

        if (data) {
            Toast.success(t('sales.prices.updatedSuccessfully', {currency: price.currency}));
        }
      }
    }

  } finally {
    await loadPrices();
    loading.value = false;
  }
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
          <th>{{ t('sales.prices.labels.amount') }}</th>
          <th>{{ t('sales.prices.labels.discountAmount') }}</th>
          <th>{{ t('shared.labels.currency') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(price, index) in prices" :key="index">
          <td>
            <TextInput v-model="price.amount" float :placeholder="t('sales.prices.placeholders.discountAmount')" :disabled="loading || price.readonly" />
          </td>
          <td>
            <TextInput v-model="price.discountAmount" float :placeholder="t('sales.prices.placeholders.discountAmount')" :disabled="loading || price.readonly" />
          </td>
          <td>{{ price.currency }}</td>
        </tr>
      </tbody>
    </table>
    </template>
  </TabContentTemplate>
</template>