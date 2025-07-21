<script setup lang="ts">
import { useI18n} from 'vue-i18n';
import { useRoute, useRouter} from "vue-router";
import { ref} from "vue";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";

import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../shared/components/atoms/card";
import { productSubscription } from "../../../../shared/api/subscriptions/products.js";
import { ApolloSubscription } from "../../../../shared/components/molecules/apollo-subscription";
import { Icon } from "../../../../shared/components/atoms/icon";
import { Label } from "../../../../shared/components/atoms/label";
import { ProductType } from "../../../../shared/utils/constants";
import { deleteProductMutation } from "../../../../shared/api/mutations/products.js";
import { Button } from "../../../../shared/components/atoms/button";
import { ApolloAlertMutation } from "../../../../shared/components/molecules/apollo-alert-mutation";
import { Badge } from "../../../../shared/components/atoms/badge";
import { Image } from "../../../../shared/components/atoms/image";
import { Link } from "../../../../shared/components/atoms/link";
import ProductBundle from "./containers/product-type/product-bundle/ProductBundle.vue";
import ProductConfigurable from "./containers/product-type/product-configurable/ProductConfigurable.vue";
import ProductVariation from "./containers/product-type/product-variation/ProductVariation.vue";
import { shortenText } from "../../../../shared/utils/index"

import {getProductTypeBadgeMap, ProductWithAliasFields} from "../configs";
import {ProductInspector} from "./containers/product-inspector";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(String(route.params.id));

interface  ProductSubscriptionResult {
  product: {
    name: string;
    sku: string;
    thumbnailUrl: string;
    hasParents: boolean;
    aliasParentProduct: {
      id: string;
      name: string;
      sku: string;
      type: string;
    },
    vatRate: {
      name: string;
    };
    type: string;
    active: boolean;
    allowBackorder: boolean;
  };
}

const getResultData = (result, field: string | null = null, vatRateField: string | null = null, aliasParentProductField: string | null = null) => {
  const r: ProductSubscriptionResult = result;

  if (vatRateField !== null){
    if (r.product.vatRate) {
      return r.product.vatRate[vatRateField];
    } else {
      return null
    }
  }

  if (aliasParentProductField !== null){
    if (r.product.aliasParentProduct) {
      return r.product.aliasParentProduct[aliasParentProductField];
    } else {
      return null
    }
  }

  if (field === null) {
    return r.product;
  }

  return r.product[field]
}


const getProductComponent = (type, aliasParentProduct: ProductWithAliasFields | null = null) => {


  if (type == ProductType.Alias && aliasParentProduct) {
    type = aliasParentProduct.type;
  }

  if (type == ProductType.Bundle) {
    return ProductBundle;
  }
  if (type == ProductType.Configurable) {
    return ProductConfigurable;
  }
  if (type == ProductType.Simple) {
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
            <div class="grid xl:grid-cols-2 gap-8 mb-6">
              <div class="w-full bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] rounded border border-[#e0e6ed] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none sm:max-h-48 max-h-none">
                <div class="p-5 flex items-center sm:items-center flex-col sm:flex-row">
                  <Link v-if="getResultData(result, 'thumbnailUrl')" :path="{ name: 'products.products.show', params: { id: id }, query: { ...route.query, tab: 'media' } }">
                    <div class="mb-5 w-20 h-20 overflow-hidden">
                      <Image class="w-20 h-20 rounded-md overflow-hidden object-cover" :source="getResultData(result, 'thumbnailUrl')" />
                    </div>
                  </Link>
                  <div v-else class="mb-5 w-20 h-20 overflow-hidden rounded-md bg-gray-300 flex justify-center items-center">
                    <Icon class="text-white" size="xl" name="question" />
                  </div>
                  <div class="flex-1 ltr:sm:pl-5 rtl:sm:pr-5 text-left">
                    <h5 class="text-[#3b3f5c] text-[15px] font-semibold text-xl mb-2 dark:text-white-light" :title="getResultData(result, 'name')">
                      {{ shortenText(getResultData(result, 'name'), 64) }}
                    </h5>
                    <Flex>
                      <Label semi-bold>{{ t('shared.labels.sku') }}:</Label>
                      <p class="text-white-dark">{{ getResultData(result, 'sku') }}</p>
                    </Flex>
                    <Flex v-if="getResultData(result, null, 'name')">
                      <Label semi-bold>{{ t('products.products.labels.vatRate') }}:</Label>
                      <p class="text-white-dark">{{ getResultData(result, null, 'name') }}</p>
                    </Flex>
                    <Flex>
                      <FlexCell>
                        <Label semi-bold>{{ t('products.products.labels.type.title') }}:</Label>
                      </FlexCell>
                      <FlexCell>
                        <Flex>
                          <FlexCell>
                            <Badge :text="getProductTypeBadgeMap(t)[getResultData(result, 'type')].text"
                                   :color="getProductTypeBadgeMap(t)[getResultData(result, 'type')].color" />
                          </FlexCell>
                          <FlexCell v-if="getResultData(result, 'type') == ProductType.Alias">
                            / <Badge :text="getProductTypeBadgeMap(t)[getResultData(result, 'type', null, 'type')].text" :color="getProductTypeBadgeMap(t)[getResultData(result, 'type', null, 'type')].color" />
                          </FlexCell>
                        </Flex>
                      </FlexCell>

                    </Flex>
                    <Flex class="gap-2 flex-col sm:flex-row">
                      <FlexCell>
                        <Label semi-bold>{{ t('shared.labels.active') }}:</Label>
                          <Icon v-if="getResultData(result, 'active')" name="check-circle" class="ml-1 text-green-500" />
                          <Icon v-else name="times-circle" class="ml-1 text-red-500" />
                      </FlexCell>
                      <FlexCell v-if="getResultData(result, 'type') == ProductType.Simple || getResultData(result, 'type', null, 'type') == ProductType.Simple">
                        <Flex>
                          <FlexCell>
                            <Label semi-bold>{{ t('products.products.labels.allowBackorder') }}: </Label>
                          </FlexCell>
                          <FlexCell>
                            <Icon v-if="getResultData(result, 'allowBackorder')" name="check-circle" class="ml-1 text-green-500" />
                            <Icon v-else name="times-circle" class="ml-1 text-red-500" />
                          </FlexCell>
                        </Flex>
                      </FlexCell>
                    </Flex>

                    <Flex>
                      <FlexCell v-if="getResultData(result, 'type') == ProductType.Alias">
                        <Flex>
                          <FlexCell>
                            <Label semi-bold>{{ t('products.products.labels.aliasParentProduct') }}: </Label>
                          </FlexCell>
                          <FlexCell>
                            <Link :path="{ name: 'products.products.show', params: { id: getResultData(result, 'id', null, 'id') } }">
                              {{ getResultData(result, 'name', null, 'name') }}
                            </Link>
                          </FlexCell>
                        </Flex>
                      </FlexCell>
                    </Flex>
                  </div>
                </div>
              </div>
              <ProductInspector :product="getResultData(result)" />
            </div>
            <Flex between>
              <FlexCell grow></FlexCell>
              <FlexCell>
                <ApolloAlertMutation :mutation="deleteProductMutation" :mutation-variables="{id: id}" @done="redirectToList">
                  <template v-slot="{ loading, confirmAndMutate }">
                    <Button :disabled="loading" class="btn btn-sm btn-outline-danger" @click="confirmAndMutate">
                      {{ t('shared.button.delete') }}
                    </Button>
                  </template>
                </ApolloAlertMutation>
              </FlexCell>
            </Flex>
            <component :key="getResultData(result, 'type')" :is="getProductComponent(getResultData(result, 'type'), getResultData(result, 'aliasParentProduct'))" :product="getResultData(result)"/>
          </Card>
        </template>
      </template>
     </ApolloSubscription>
   </template>
  </GeneralTemplate>
</template>