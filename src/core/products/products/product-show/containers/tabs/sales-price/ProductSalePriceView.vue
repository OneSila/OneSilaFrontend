<script setup lang="ts">

import { onMounted, ref, Ref } from "vue";
import { useI18n } from 'vue-i18n';
import { Product } from "../../../../configs";
import { Button } from "../../../../../../../shared/components/atoms/button";
import TabContentTemplate from "../TabContentTemplate.vue";
import apolloClient from "../../../../../../../../apollo-client";
import { salesPricesQuery } from "../../../../../../../shared/api/queries/salesPrices.js";
import { TextInput } from "../../../../../../../shared/components/atoms/input-text";
import { createSalesPriceMutation, updateSalesPriceMutation } from "../../../../../../../shared/api/mutations/salesPrices.js";
import { Toast } from "../../../../../../../shared/modules/toast";
import { currenciesQuery } from "../../../../../../../shared/api/queries/currencies.js";

const { t } = useI18n();
const props = defineProps<{ product: Product }>();
const loading = ref(false);
interface Price {
  id: string;
  price: string | number | null;
  rrp: string | number | null;
  currency: string;
  readonly: boolean;
}
const prices: Ref<Price[]> = ref([]);
const initialPrices: Ref<Price[]> = ref([]);
const defaultCurrency = ref({ id: '', isoCode: '' });

const getDefaultCurrency = async () => {
  const { data } = await apolloClient.query({
    query: currenciesQuery,
    variables: { filter: { isDefaultCurrency: true } },
  });

  defaultCurrency.value = data.currencies.edges[0].node;
}


const loadPrices = async () => {
  loading.value = true;

  // Fetch the default currency first
  await getDefaultCurrency();

  const { data } = await apolloClient.query({
    query: salesPricesQuery,
    variables: { filter: { product: {id: {exact: props.product.id }} }},
    fetchPolicy: 'network-only'
  });

  prices.value = data.salesPrices.edges.map(edge => ({
    id: edge.node.id,
    price: edge.node.price,
    rrp: edge.node.rrp,
    currency: edge.node.currency.isoCode,
    readonly: !edge.node.currency.isDefaultCurrency && !!edge.node.currency.inheritsFrom,
  }));

  initialPrices.value = JSON.parse(JSON.stringify(prices.value));

  const defaultCurrencyPrice = prices.value.find(price => price.currency === defaultCurrency.value.isoCode);

  if (!defaultCurrencyPrice) {

    prices.value.unshift({
      id: '',
      price: null,
      rrp: null,
      currency: defaultCurrency.value.isoCode,
      readonly: false,
    });
  }

  loading.value = false;
};

function isValidPrice(unformatedPrice) {
  const price = parseFloat(unformatedPrice.price);
  const rrp = parseFloat(unformatedPrice.rrp);


  if (isNaN(price) && isNaN(rrp)) {
    return false;
  }

  // Check if price is 0 or less
  if (price <= 0) {
    return false;
  }

  // Check if discount price is 0
  if (rrp <= 0) {
    return false;
  }

  // Check if the rrp is smaller than or equal to the price
  if (rrp <= price) {
    return false;
  }

  // If all checks pass, the price is valid
  return true;
}

const createPrice = async (price) => {
  try {
    await apolloClient.mutate({
      mutation: createSalesPriceMutation,
      variables: {
        data: {
          price: price.price,
          rrp: price.rrp,
          product: { id: props.product.id },
          currency: { id: defaultCurrency.value.id }
        }
      },
    });
    Toast.success(t('sales.prices.createdSuccessfully', { currency: price.currency }));
  } catch (error) {
    console.error("Sales price creation error:", error);
  }
}

const editPrice = async (price) => {
  const originalPrice = initialPrices.value.find(p => p.id === price.id);
  if (JSON.stringify(price) !== JSON.stringify(originalPrice)) {
    const priceData = {
      id: price.id,
      price: price.price,
      rrp: price.rrp == '' ? null : price.rrp
    };
    const { data } = await apolloClient.mutate({
      mutation: updateSalesPriceMutation,
      variables: { data: priceData }
    });

    if (data) {
      Toast.success(t('sales.prices.updatedSuccessfully', { currency: price.currency }));
    }
  }
}
const savePrices = async () => {
  loading.value = true;

  try {
    for (const price of prices.value) {

      if (!isValidPrice(price)) {
        Toast.error(t('sales.prices.updatedError', { currency: price.currency }));
        continue;
      }

      if (!price.id) {
        await createPrice(price);
      } else {
        await editPrice(price);
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
          <th>{{ t('sales.prices.labels.rrp') }}</th>
          <th>{{ t('sales.prices.labels.price') }}</th>
          <th>{{ t('shared.labels.currency') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(price, index) in prices" :key="index">
          <td>
            <TextInput v-model="price.rrp" float :placeholder="t('sales.prices.placeholders.rrp')" :disabled="loading || price.readonly" />
          </td>
          <td>
            <TextInput v-model="price.price" float :placeholder="t('sales.prices.placeholders.price')" :disabled="loading || price.readonly" />
          </td>
          <td>{{ price.currency }}</td>
        </tr>
      </tbody>
    </table>
    </template>
  </TabContentTemplate>
</template>