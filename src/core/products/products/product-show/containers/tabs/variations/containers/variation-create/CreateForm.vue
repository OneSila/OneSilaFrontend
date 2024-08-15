<script setup lang="ts">

import { ref, onMounted, watch } from 'vue';
import { Product } from "../../../../../../configs";
import { useI18n } from "vue-i18n";
import { ProductType, variationTypes, billOfMaterialsTypes } from "../../../../../../../../../shared/utils/constants";
import { productsQuery } from "../../../../../../../../../shared/api/queries/products.js";
import { TextInput } from "../../../../../../../../../shared/components/atoms/input-text";
import { Selector } from "../../../../../../../../../shared/components/atoms/selector";
import { VariationForm } from "./VariationCreate.vue";
import apolloClient from "../../../../../../../../../../apollo-client";

const { t } = useI18n();

const props = defineProps<{ product: Product, form: VariationForm, variationIds: string[] }>();
const variations = ref([]);
const loading = ref(false);

const cleanedData = (rawData) => {
  return rawData?.edges ? rawData.edges.map(edge => edge.node) : rawData;
};

const fetchData = async () => {
  loading.value = true;
  let typeFilter;

  switch (props.product.type) {
    case ProductType.Configurable:
    case ProductType.Bundle:
      typeFilter = variationTypes;
      break;
    case ProductType.Manufacturable:
      typeFilter = billOfMaterialsTypes;
      break;
    default:
      typeFilter = variationTypes;
  }


  const { data } = await apolloClient.query({
    query: productsQuery,
    variables: { filter: { id: { "nInList": props.variationIds },  type: { "inList": typeFilter } } },
    fetchPolicy: 'network-only'
  });

  if (data) {
    variations.value = cleanedData(data.products);
  }

  loading.value = false;

};

onMounted(fetchData);

watch(() => props.variationIds, fetchData, { deep: true });

</script>

<template>
  <Flex v-if="loading">
    <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </Flex>
  <Flex v-else>
    <FlexCell>
      <Selector v-if="variations.length > 0"
                v-model="form.variation"
                :options="variations"
                label-by="name"
                value-by="id"
                mandatory
                :removable="false"
                :placeholder="t('shared.placeholders.product')"
                filterable
                class="min-w-[200px] mr-2" />
    </FlexCell>
    <FlexCell v-if="product.type !== ProductType.Configurable" >
      <TextInput v-model="form.quantity" float :placeholder="t('shared.placeholders.quantity')" class="w-32" />
    </FlexCell>
  </Flex>
</template>
