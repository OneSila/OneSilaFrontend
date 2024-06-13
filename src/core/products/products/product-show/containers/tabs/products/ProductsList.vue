<script setup lang="ts">

import {onMounted, Ref, ref} from "vue";
import {BaseProduct, getProductTypeBadgeMap, Product} from "../../../../configs";
import { Button } from "../../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../../shared/components/atoms/link";
import {useI18n} from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";
import {Icon} from "../../../../../../../shared/components/atoms/icon";
import {Badge} from "../../../../../../../shared/components/atoms/badge";
import {Image} from "../../../../../../../shared/components/atoms/image";
import {ApolloAlertMutation} from "../../../../../../../shared/components/molecules/apollo-alert-mutation";
import {updateProductMutation} from "../../../../../../../shared/api/mutations/products.js";
import ProductAdd from "./product-add/ProductAdd.vue";
import {processGraphQLErrors} from "../../../../../../../shared/utils";
import {Toast} from "../../../../../../../shared/modules/toast";
import {PrimaryButton} from "../../../../../../../shared/components/atoms/button-primary";

const { t } = useI18n();
const props = defineProps<{ product: Product }>();
const baseProducts: Ref<BaseProduct[]> = ref([]);

onMounted(() => {
  baseProducts.value = props.product.baseProducts || [];
});

const getVariatbles = (id) => {
  const ids = baseProducts.value
    .filter(baseProduct => baseProduct.id !== id)
    .map(baseProduct => ({ id: baseProduct.id }));

  return { data: { id: props.product.id, baseProducts: ids } };
};

const updateBaseProducts = (response) => {
  if (response && response.data && response.data.updateProduct) {
    baseProducts.value = response.data.updateProduct.baseProducts || [];
  }
};

const onError = (error) => {
    const errors = processGraphQLErrors(error, t);
    if (errors['__all__']) {
      Toast.error(errors['__all__']);
    }
};

</script>

<template>
  <TabContentTemplate>
    <template v-slot:buttons>
      <ProductAdd :product="product" :base-products="baseProducts" @product-added="updateBaseProducts" />
      <Link :path="{ name: 'products.products.create', query: {productId: product.id} }">
        <PrimaryButton type="button" class="ml-2">
          {{ t('products.products.create.title') }}
        </PrimaryButton>
      </Link>
    </template>

    <template v-slot:content>
      <table class="table-striped table-hover">
            <thead>
              <tr>
                <th>{{ t('shared.labels.name') }}</th>
                <th>{{ t('products.products.labels.type.title') }}</th>
                <th>{{ t('shared.labels.active') }}</th>
                <th>{{ t('shared.labels.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in baseProducts">
                <td>
                  <Link :path="{name: 'products.products.show', params: {id: p.id}}">
                    <Flex class="gap-4">
                      <FlexCell center>
                        <div v-if="p.thumbnailUrl" class="w-8 h-8 overflow-hidden">
                          <Image class="w-8 h-8 rounded-md overflow-hidden object-cover" :source="p.thumbnailUrl" :alt="p.name" />
                        </div>
                          <div v-else class="w-8 h-8 overflow-hidden rounded-md bg-gray-200 flex justify-center items-center">
                        </div>
                      </FlexCell>
                      <FlexCell center>{{ p.name }}</FlexCell>
                    </Flex>
                  </Link>
                </td>
                <td>
                  <Badge :color="getProductTypeBadgeMap(t)[p.type].color" :text="getProductTypeBadgeMap(t)[p.type].text" />
                </td>
                <td>
                  <Icon v-if="p.active" name="check-circle" class="text-green-500" />
                  <Icon v-else name="times-circle" class="text-red-500" />
                </td>
                <td>
                  <ApolloAlertMutation
                      :mutation="updateProductMutation"
                      :mutation-variables="getVariatbles(p.id)"
                      @done="updateBaseProducts"
                      @error="onError"
                    >
                    <template v-slot="{ loading, confirmAndMutate }">
                      <Button :disabled="loading" class="btn btn-sm btn-outline-danger" @click="confirmAndMutate">
                        {{ t('shared.button.delete') }}
                      </Button>
                    </template>
                  </ApolloAlertMutation>
                </td>
              </tr>
            </tbody>
        </table>
    </template>
  </TabContentTemplate>
</template>
