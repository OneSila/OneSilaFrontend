<script setup lang="ts">
import { useI18n} from 'vue-i18n';
import { useRoute, useRouter} from "vue-router";
import { ref} from "vue";
import {Breadcrumbs} from "../../../../shared/components/molecules/breadcrumbs";
import {Card} from "../../../../shared/components/atoms/card";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {productSubscription} from "../../../../shared/api/subscriptions/products.js";
import { ApolloSubscription} from "../../../../shared/components/molecules/apollo-subscription";
import {Icon} from "../../../../shared/components/atoms/icon";
import {Label} from "../../../../shared/components/atoms/label";
import {ProductType} from "../../../../shared/utils/constants";
import ProductBundle from "./containers/product-type/product-bundle/ProductBundle.vue";
import ProductUmbrella from "./containers/product-type/product-umbrella/ProductUmbrella.vue";
import ProductVariation from "./containers/product-type/product-variation/ProductVariation.vue";
import {deleteProductMutation} from "../../../../shared/api/mutations/products.js";
import {Button} from "../../../../shared/components/atoms/button";
import {ApolloAlertMutation} from "../../../../shared/components/molecules/apollo-alert-mutation";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(String(route.params.id));

interface ProductSubscriptionResult {
  product: {
    name: string;
    sku: string;
    vatRate: {
      name: string;
    };
    type: string;
    active: boolean;
    alwaysOnStock: boolean;
  };
}

const getResultData = (result, field: string | null = null, vatRateField: string | null = null) => {
  const r: ProductSubscriptionResult = result;

  if (vatRateField !== null){
    return r.product.vatRate[vatRateField];
  }

  if (field === null) {
    return r.product;
  }

  return r.product[field]
}


const getProductComponent = (type) => {
  if (type == ProductType.Bundle) {
    return ProductBundle;
  }
  if (type == ProductType.Umbrella) {
    return ProductUmbrella;
  }
  if (type == ProductType.Variation) {
    return ProductVariation;
  }
}

const redirectToList = (response) => {
  if (response.data.deleteProduct) {
    router.push({ name: 'products.products.list' });
  }
}

</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'products.products.list' }, name: t('products.title') },
                   { path: { name: 'products.products.show', params: {id: id} }, name: t('products.products.show.title') }]" />
    </template>

   <template v-slot:content>
   <ApolloSubscription :subscription="productSubscription" :variables="{pk: id}" ref="apolloSubRef">
      <template v-slot:default="{ loading, error, result }">
        <template v-if="!loading && result">
          <Card>
            <div class="grid md:grid-cols-2 xl:grid-cols-2 gap-8 mb-6">
              <div class="w-full bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] rounded border border-[#e0e6ed] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
                <div class="p-5 flex items-center flex-col sm:flex-row">
                  <div class="mb-5 w-20 h-20 rounded-full overflow-hidden">
                    <img class="w-20 h-20 rounded-md overflow-hidden object-cover" src="" alt="" />
                  </div>
                  <div class="flex-1 ltr:sm:pl-5 rtl:sm:pr-5 text-center sm:text-left">
                    <h5 class="text-[#3b3f5c] text-[15px] font-semibold text-xl mb-2 dark:text-white-light">{{ getResultData(result, 'name') }}</h5>
                    <Flex>
                      <Label semi-bold>{{ t('shared.labels.sku') }}:</Label>
                      <p class="text-white-dark">{{ getResultData(result, 'sku') }}</p>
                    </Flex>
                    <Flex>
                      <Label semi-bold>{{ t('products.products.labels.vatRate') }}:</Label>
                      <p class="text-white-dark">{{ getResultData(result, null, 'name') }}</p>
                    </Flex>
                    <Flex>
                      <Label semi-bold>{{ t('products.products.labels.type.title') }}:</Label>
                      <p class="text-white-dark">{{ getResultData(result, 'type') }}</p>
                    </Flex>
                    <Flex class="gap-2">
                      <FlexCell>
                        <Label semi-bold>{{ t('shared.labels.active') }}:</Label>
                          <Icon v-if="getResultData(result, 'active')" name="check-circle" class="ml-1 text-green-500" />
                          <Icon v-else name="times-circle" class="ml-1 text-red-500" />
                      </FlexCell>
                      <FlexCell>
                        <Flex>
                          <FlexCell>
                            <Label semi-bold>{{ t('products.products.labels.alwaysOnStock') }}: </Label>
                          </FlexCell>
                          <FlexCell>
                            <Icon v-if="getResultData(result, 'alwaysOnStock')" name="check-circle" class="ml-1 text-green-500" />
                            <Icon v-else name="times-circle" class="ml-1 text-red-500" />
                          </FlexCell>
                        </Flex>
                      </FlexCell>
                    </Flex>
                  </div>
                  <div class="self-start">
                    <ApolloAlertMutation :mutation="deleteProductMutation" :mutation-variables="{id: id}" @done="redirectToList">
                      <template v-slot="{ loading, confirmAndMutate }">
                        <Button :disabled="loading" class="btn btn-sm btn-outline-danger" @click="confirmAndMutate">
                          {{ t('shared.button.delete') }}
                        </Button>
                      </template>
                    </ApolloAlertMutation>
                  </div>
                </div>
            </div>
            <div class="w-full bg-red-400 shadow-[4px_6px_10px_-3px_#bfc9d4] rounded border-2 border-red-500 dark:border-2 dark:bg-secondary-dark-light dark:shadow-none p-5">
              <Label semi-bold class="text-white">{{ t('products.products.inspector.labels.missingInfo') }}:</Label>
              <div class="grid l:grid-cols-2 xl:grid-cols-2 text-white gap-2 mt-2">
                  <p class="font-semibold border-white border-2 p-2 rounded">Product missing images.</p>
                  <p class="font-semibold border-white border-2 p-2 rounded">Product valid price.</p>
                  <p class="font-semibold border-white border-2 p-2 rounded">Product valid price.</p>
                </div>
              </div>
            </div>
            <component :key="getResultData(result, 'type')" :is="getProductComponent(getResultData(result, 'type'))" :product="getResultData(result)"/>
          </Card>
        </template>
      </template>
     </ApolloSubscription>
   </template>
  </GeneralTemplate>
</template>