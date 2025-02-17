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
import ProductBundle from "./containers/product-type/product-bundle/ProductBundle.vue";
import ProductConfigurable from "./containers/product-type/product-configurable/ProductConfigurable.vue";
import ProductVariation from "./containers/product-type/product-variation/ProductVariation.vue";
import ProductManufacturable from "./containers/product-type/product-manufacturable/ProductManufacturable.vue";
import ProductDropship from "./containers/product-type/product-dropship/ProductDropship.vue";
import ProductSupplier from "./containers/product-type/product-supplier/ProductSupplier.vue";

import { getProductTypeBadgeMap } from "../configs";
import {ProductInspector} from "./containers/product-inspector";
import {Link} from "../../../../shared/components/atoms/link";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(String(route.params.id));

interface ProductSubscriptionResult {
  product: {
    name: string;
    sku: string;
    productionTime: string;
    thumbnailUrl: string;
    vatRate: {
      name: string;
    };
    supplier: {
      id: string;
      name: string;
    };
    type: string;
    active: boolean;
    allowBackorder: boolean;
    forSale: boolean;
  };
}

const getResultData = (result, field: string | null = null, vatRateField: string | null = null, supplierField: string | null = null) => {
  const r: ProductSubscriptionResult = result;

  if (vatRateField !== null){
    if (r.product.vatRate) {
      return r.product.vatRate[vatRateField];
    } else {
      return null
    }
  }

    if (supplierField !== null){
    if (r.product.supplier) {
      return r.product.supplier[supplierField];
    } else {
      return null
    }
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
  if (type == ProductType.Configurable) {
    return ProductConfigurable;
  }
  if (type == ProductType.Simple) {
    return ProductVariation;
  }
  if (type == ProductType.Manufacturable) {
    return ProductManufacturable;
  }
  if (type == ProductType.Dropship) {
    return ProductDropship;
  }
  if (type == ProductType.Supplier) {
    return ProductSupplier;
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
              <div class="w-full bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] rounded border border-[#e0e6ed] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none sm:max-h-48 max-h-72">
                <div class="p-5 flex items-center flex-col sm:flex-row">
                  <div v-if="getResultData(result, 'thumbnailUrl')" class="mb-5 w-20 h-20 overflow-hidden">
                    <Image class="w-20 h-20 rounded-md overflow-hidden object-cover" :source="getResultData(result, 'thumbnailUrl')" />
                  </div>
                  <div v-else class="mb-5 w-20 h-20 overflow-hidden rounded-md bg-gray-300 flex justify-center items-center">
                    <Icon class="text-white" size="xl" name="question" />
                  </div>
                  <div class="flex-1 ltr:sm:pl-5 rtl:sm:pr-5 text-center sm:text-left">
                    <h5 class="text-[#3b3f5c] text-[15px] font-semibold text-xl mb-2 dark:text-white-light">{{ getResultData(result, 'name') }}</h5>
                    <Flex>
                      <Label semi-bold>{{ t('shared.labels.sku') }}:</Label>
                      <p class="text-white-dark">{{ getResultData(result, 'sku') }}</p>
                    </Flex>
                    <Flex v-if="getResultData(result, null, 'name')">
                      <Label semi-bold>{{ t('products.products.labels.vatRate') }}:</Label>
                      <p class="text-white-dark">{{ getResultData(result, null, 'name') }}</p>
                    </Flex>
                    <Flex>
                      <Label semi-bold>{{ t('products.products.labels.type.title') }}:</Label>
                      <Badge
                        :text="getProductTypeBadgeMap(t)[getResultData(result, 'type')].text"
                        :color="getProductTypeBadgeMap(t)[getResultData(result, 'type')].color" />
                    </Flex>
                    <Flex v-if="getResultData(result, 'type') === ProductType.Supplier">
                      <Label semi-bold>{{ t('contacts.companies.labels.supplier') }}:</Label>
                      <Link :path="{name: 'purchasing.suppliers.show', params: {id: getResultData(result, null, null, 'id')}}">
                        <Flex class="gap-4">
                          <FlexCell>{{ getResultData(result, null, null, 'name') }}</FlexCell>
                        </Flex>
                      </Link>
                    </Flex>
                    <Flex class="gap-2">
                      <FlexCell>
                        <Label semi-bold>{{ t('shared.labels.active') }}:</Label>
                          <Icon v-if="getResultData(result, 'active')" name="check-circle" class="ml-1 text-green-500" />
                          <Icon v-else name="times-circle" class="ml-1 text-red-500" />
                      </FlexCell>
                      <FlexCell v-if="getResultData(result, 'type') == ProductType.Simple">
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
                      <FlexCell>
                        <Flex>
                          <FlexCell>
                            <Label semi-bold>{{ t('products.products.labels.forSale') }}: </Label>
                          </FlexCell>
                          <FlexCell>
                            <Icon v-if="getResultData(result, 'forSale')" name="check-circle" class="ml-1 text-green-500" />
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
              <ProductInspector :product="getResultData(result)" />
            </div>
            <component :key="getResultData(result, 'type')" :is="getProductComponent(getResultData(result, 'type'))" :product="getResultData(result)"/>
          </Card>
        </template>
      </template>
     </ApolloSubscription>
   </template>
  </GeneralTemplate>
</template>