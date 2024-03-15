<script setup lang="ts">

import {Product} from "../../../../../../configs";
import {useI18n} from "vue-i18n";
import {PRODUCT_BUNDLE} from "../../../../../../../../../shared/utils/constants";
import {productVariationsQuery} from "../../../../../../../../../shared/api/queries/products.js";
import {TextInput} from "../../../../../../../../../shared/components/atoms/input-text";
import {Selector} from "../../../../../../../../../shared/components/atoms/selector";
import {VariationForm} from "./VariationCreate.vue";

const { t } = useI18n();

const props = defineProps<{ product: Product, form: VariationForm }>();

const cleanedData = (rawData) => {
  if (rawData?.edges) {
    return  rawData.edges.map(edge => edge.node);
  }
  return rawData;
};

</script>

<template>
  <Flex>
    <FlexCell>
      <ApolloQuery :query="productVariationsQuery">
      <template v-slot="{ result: { data } }">
          <Selector v-if="data"
                    v-model="form.variation"
                    :options="cleanedData(data.productVariations)"
                    labelBy="sku"
                    valueBy="id"
                    mandatory
                    :removable="false"
                    :placeholder="t('shared.placeholders.product')"
                    filterable
                    class="min-w-[200px] mr-2" />
      </template>
      </ApolloQuery>
    </FlexCell>
    <FlexCell v-if="product.type === PRODUCT_BUNDLE">
      <TextInput v-model="form.quantity" number :placeholder="t('shared.placeholders.quantity')" class="w-20" />
    </FlexCell>
  </Flex>
</template>
