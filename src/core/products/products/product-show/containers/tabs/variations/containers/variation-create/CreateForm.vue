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

const cleanedData = (rawData) => {
  return rawData?.edges ? rawData.edges.map(edge => edge.node) : rawData;
};

const fetchData = async () => {

    let typeFilter;

  switch (props.product.type) {
    case ProductType.Umbrella:
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

};

onMounted(fetchData);

watch(() => props.variationIds, fetchData, { deep: true });

</script>

<template>
  <Flex>
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
    <FlexCell v-if="product.type !== ProductType.Umbrella" >
      <TextInput v-model="form.quantity" number :placeholder="t('shared.placeholders.quantity')" class="w-20" />
    </FlexCell>
  </Flex>
</template>
