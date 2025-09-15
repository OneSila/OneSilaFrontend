<script setup lang="ts">

import { onMounted, ref, Ref, computed } from "vue";
import { useI18n } from 'vue-i18n';
import { Product } from "../../../../configs";
import { Button } from "../../../../../../../shared/components/atoms/button";
import TabContentTemplate from "../TabContentTemplate.vue";
import apolloClient from "../../../../../../../../apollo-client";
import { salesPricesQuery } from "../../../../../../../shared/api/queries/salesPrices.js";
import { TextInput } from "../../../../../../../shared/components/atoms/input-text";
import { createSalesPriceMutation, updateSalesPriceMutation } from "../../../../../../../shared/api/mutations/salesPrices.js";
import { Toast } from "../../../../../../../shared/modules/toast";
import { currenciesQuerySelector } from "../../../../../../../shared/api/queries/currencies.js";
import {TextInputPrepend} from "../../../../../../../shared/components/atoms/input-text-prepend";
import type { FetchPolicy } from "@apollo/client";

const { t } = useI18n();
const props = defineProps<{ product: Product }>();
const loading = ref(false);
interface Price {
  id: string;
  price: string | null;
  rrp: string | null;
  currency: string;
  symbol: string;
  readonly: boolean;
}
const prices: Ref<Price[]> = ref([]);
const initialPrices: Ref<Price[]> = ref([]);
const defaultCurrency = ref({ id: '', isoCode: '', symbol: '' });

const getDefaultCurrency = async (policy: FetchPolicy = 'cache-first') => {
  const { data } = await apolloClient.query({
    query: currenciesQuerySelector,
    variables: { filter: { isDefaultCurrency: { exact: true } } },
    fetchPolicy: policy,
  });

  defaultCurrency.value = data.currencies.edges[0].node;
}


const loadPrices = async (policy: FetchPolicy = 'cache-first') => {
  loading.value = true;

  // Fetch the default currency first
  await getDefaultCurrency(policy);

  const { data } = await apolloClient.query({
    query: salesPricesQuery,
    variables: { filter: { product: {id: { exact: props.product.id }} }, order: { currency: { isoCode: 'ASC' } } },
    fetchPolicy: policy
  });

  prices.value = data.salesPrices.edges.map(edge => ({
    id: edge.node.id,
    price: edge.node.price?.toString() || '',
    rrp: edge.node.rrp?.toString() || '',
    currency: edge.node.currency.isoCode,
    symbol: edge.node.currency.symbol,
    readonly: !edge.node.currency.isDefaultCurrency && !!edge.node.currency.inheritsFrom,
  }));

  const defaultCurrencyPrice = prices.value.find(price => price.currency === defaultCurrency.value.isoCode);

  if (!defaultCurrencyPrice) {

    prices.value.unshift({
      id: '',
      price: '',
      rrp: '',
      currency: defaultCurrency.value.isoCode,
      symbol: defaultCurrency.value.symbol,
    readonly: false,
  });
}

  initialPrices.value = JSON.parse(JSON.stringify(prices.value));

  loading.value = false;
};

function isValidPrice(unformatedPrice) {
  const price = parseFloat(unformatedPrice.price);
  const rrp = parseFloat(unformatedPrice.rrp);

  if (unformatedPrice.readonly) {
    return true; // if is readonly we skip the validaiton
  }

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
          price: parseFloat(price.price),
          rrp: price.rrp === '' ? null : parseFloat(price.rrp),
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
      price: parseFloat(price.price),
      rrp: price.rrp === '' ? null : parseFloat(price.rrp)
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
    await loadPrices('network-only');
    loading.value = false;
  }
}

onMounted(loadPrices);

const hasUnsavedChanges = computed(() => JSON.stringify(prices.value) !== JSON.stringify(initialPrices.value));

defineExpose({ hasUnsavedChanges });

</script>

<template>
  <TabContentTemplate>
    <template v-slot:buttons>
      <Button :customClass="'btn btn-primary mr-2'" @click="savePrices">
        {{ t('shared.button.save') }}
      </Button>
    </template>

    <template v-slot:content>
    <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
      <thead>
        <tr>
          <th>{{ t('sales.prices.labels.rrp') }}</th>
          <th>{{ t('sales.prices.labels.price') }}</th>
          <th>{{ t('shared.labels.currency') }}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 bg-white">
        <tr v-for="(price, index) in prices" :key="index">
          <td>
            <TextInputPrepend class="w-full md:w-1/2" id="amount" v-model="price.rrp" type="number" :disabled="loading || price.readonly">
              {{ price.symbol }}
            </TextInputPrepend>
          </td>
          <td>
            <TextInputPrepend class="w-full md:w-1/2" id="amount" v-model="price.price" type="number" :disabled="loading || price.readonly">
              {{ price.symbol }}
            </TextInputPrepend>
          </td>
          <td>{{ price.currency }}</td>
        </tr>
      </tbody>
    </table>
    </template>
  </TabContentTemplate>
</template>