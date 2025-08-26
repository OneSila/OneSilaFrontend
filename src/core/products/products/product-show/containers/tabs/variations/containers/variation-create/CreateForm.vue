<script setup lang="ts">

import { ref, onMounted, watch } from 'vue';
import debounce from 'lodash.debounce';
import { Product } from "../../../../../../configs";
import { useI18n } from "vue-i18n";
import { ProductType, variationTypes } from "../../../../../../../../../shared/utils/constants";
import { productsQuery } from "../../../../../../../../../shared/api/queries/products.js";
import { TextInput } from "../../../../../../../../../shared/components/atoms/input-text";
import { Selector } from "../../../../../../../../../shared/components/atoms/selector";
import { VariationForm } from "./VariationCreate.vue";
import apolloClient from "../../../../../../../../../../apollo-client";

const { t } = useI18n();

const props = defineProps<{ product: Product, form: VariationForm, variationIds: string[] }>();
const variations = ref([]);
const loading = ref(false);
const search = ref('');

const cleanedData = (rawData) => {
  return rawData?.edges ? rawData.edges.map(edge => edge.node) : rawData;
};

const fetchData = async () => {
  loading.value = true;
  let typeFilter;
  let type = props.product.type;

  if (type == ProductType.Alias) {
    type = props.product.aliasParentProduct.type;
  }

  switch (type) {
    case ProductType.Configurable:
    case ProductType.Bundle:
      typeFilter = variationTypes;
      break;

    default:
      typeFilter = variationTypes;
  }

  const filter: any = {
    NOT: { id: { inList: props.variationIds } },
    type: { inList: typeFilter },
  };

  if (search.value) {
    filter.search = search.value;
  }

  const { data } = await apolloClient.query({
    query: productsQuery,
    variables: { filter },
    fetchPolicy: 'network-only',
  });

  if (data) {
    variations.value = cleanedData(data.products);
  }

  loading.value = false;

};

const handleInput = debounce((value: string) => {
  search.value = value;
  fetchData();
}, 500);

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
  <Flex v-else gap="2">
    <FlexCell grow>
      <Selector v-if="variations.length > 0"
                v-model="form.variation"
                :options="variations"
                label-by="name"
                value-by="id"
                mandatory
                :removable="false"
                :placeholder="t('shared.placeholders.product')"
                filterable
                class="mr-2 w-full"
                @searched="handleInput" />
    </FlexCell>
    <FlexCell v-if="product.type !== ProductType.Configurable">
      <TextInput v-model="form.quantity" float :placeholder="t('shared.placeholders.quantity')" class="w-32" />
    </FlexCell>
  </Flex>
</template>
