<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import {Product} from "../../../../configs";
import {Button} from "../../../../../../../shared/components/atoms/button";
import TabContentTemplate from "../TabContentTemplate.vue";
import apolloClient from "../../../../../../../../apollo-client";
import {getSalesPriceByProductAndCurrencyQuery} from "../../../../../../../shared/api/queries/salesPrices.js";
import {createSalesPriceMutation, updateSalesPriceMutation} from "../../../../../../../shared/api/mutations/salesPrices.js";
import {Selector} from "../../../../../../../shared/components/atoms/selector";
import {TextInput} from "../../../../../../../shared/components/atoms/text-input";
import {reactive, watch, ref} from "vue";
import {currenciesQuery} from "../../../../../../../shared/api/queries/currencies.js";
import {Label} from "../../../../../../../shared/components/atoms/label";

const { t } = useI18n();
const props = defineProps<{ product: Product }>();

const initialForm = ref({
  amount: null,
  discountAmount: null,
});

const form = reactive({ ...initialForm.value });
const currentCurrency = ref(null);
const oldCurrency = ref(null);
const mutation = ref(null);
const salesPriceId = ref(null);

const cleanedData = (rawData) => {
  if (rawData?.edges) {
    const data = rawData.edges.map(edge => edge.node);
    data.forEach(currency => {
      if (currency.isDefaultCurrency) {
        if (currentCurrency.value === null) {
          currentCurrency.value = currency.id;
        }
      }
    });
    return data;
  }
  return rawData;
};

const setFormAndMutation = async (newCurrency) => {

  const {data} = await apolloClient.query({
    query: getSalesPriceByProductAndCurrencyQuery,
    variables: {currencyId: newCurrency, productId: props.product.id},
    fetchPolicy: 'network-only'
  });

  if (data.salesPrices.edges.length === 1) {
    const salesPrice = data.salesPrices.edges[0].node;
    form.amount = salesPrice.amount;
    form.discountAmount = salesPrice.discountAmount;
    salesPriceId.value = salesPrice.id;
    mutation.value = updateSalesPriceMutation;
  } else {
    form.amount = null;
    form.discountAmount = null;
    salesPriceId.value = null;
    mutation.value = createSalesPriceMutation;
  }
  initialForm.value = {...form};
};

const handleCurrencySelection = async (newCurrency) => {
  if (JSON.stringify(form) !== JSON.stringify(initialForm.value)) {
    const confirmChange = confirm(t('sales.prices.confirmCurrencyChange'));
    if (!confirmChange) {
      currentCurrency.value = oldCurrency.value;
      return;
    }
  }

  oldCurrency.value = newCurrency;
  await setFormAndMutation(newCurrency);
};



watch(currentCurrency, async (newCurrency, oldCurrencyValue) => {
  if (oldCurrencyValue === null) {
    await setFormAndMutation(newCurrency);
    oldCurrency.value = newCurrency;
  }
});


const getVariables = () => {
  const variables = {
    ...form,
    product: { id: props.product.id },
    currency: { id: currentCurrency.value }
  };

  if (salesPriceId.value) {
    variables['id'] = salesPriceId.value;
  }

  return {data: variables};
};

const onMutationCompleted = () => {
  alert("Successfully updated");
  initialForm.value = { ...form };
};

</script>

<template>
  <TabContentTemplate>
    <template v-slot:buttons>
    <ApolloMutation v-if="mutation" :mutation="mutation" :variables="getVariables()" @done="onMutationCompleted">
      <template v-slot="{ mutate, loading, error }">
        <Button :customClass="'btn btn-primary mr-2'"
                :disabled="loading"
                @click="mutate">
          {{ t('shared.button.save') }}
        </Button>
        <p v-if="error">{{ error.message }}</p>
      </template>
    </ApolloMutation>
    <ApolloQuery :query="currenciesQuery">
      <template v-slot="{ result: { data } }">
          <Selector v-if="data"
                    @update:modelValue="handleCurrencySelection"
                    v-model="currentCurrency"
                    :options="cleanedData(data.currencies)"
                    labelBy="isoCode"
                    valueBy="id"
                    mandatory
                    :removable="false"
                    :placeholder="t('shared.placeholders.currency')"
                    filterable
                    class="min-w-[100px]" />
      </template>
      </ApolloQuery>
    </template>

    <template v-slot:content>
      <Flex vertical>
        <FlexCell>
          <Label semi-bold>{{ t('sales.prices.labels.amount') }}</Label>
          <TextInput v-model="form.amount" float :placeholder="t('sales.prices.placeholders.amount')" class="mt-2 mb-2 w-1/6" />
        </FlexCell>
        <FlexCell>
          <Label semi-bold>{{ t('sales.prices.labels.discountAmount') }}</Label>
          <TextInput v-model="form.discountAmount" float :placeholder="t('sales.prices.placeholders.discountAmount')" class="mt-2  w-1/6" />
        </FlexCell>

      </Flex>
    </template>
  </TabContentTemplate>
</template>