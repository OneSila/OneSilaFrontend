<script setup lang="ts">

import {BaseProduct, getProductTypeBadgeMap, Product} from "../../../../configs";
import {listingQuery, listingQueryKey, searchConfigConstructor, listingConfigConstructor} from "../../../../../../purchasing/products/configs";
import { Button } from "../../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../../shared/components/atoms/link";
import { Icon } from "../../../../../../../shared/components/atoms/icon";
import { GeneralListing } from "../../../../../../../shared/components/organisms/general-listing";
import {useI18n} from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";
import ProductAdd from "./supplier-product-add/ProductAdd.vue";
import {PrimaryButton} from "../../../../../../../shared/components/atoms/button-primary";
import {supplierProductsQuery} from "../../../../../../../shared/api/queries/purchasing.js";
import apolloClient from "../../../../../../../../apollo-client";
import {onMounted, ref, Ref} from "vue";
import {updateProductMutation} from "../../../../../../../shared/api/mutations/products.js";
import {processGraphQLErrors} from "../../../../../../../shared/utils";
import {Toast} from "../../../../../../../shared/modules/toast";
import {ApolloAlertMutation} from "../../../../../../../shared/components/molecules/apollo-alert-mutation";

const { t } = useI18n();


interface Suppier {
  id: string;
  name: string;
}
export interface SupplierProduct {
  id: string;
  name: string;
  sku: string;
  active: boolean;
  supplier: Suppier;
  baseProducts: BaseProduct[]
}

const props = defineProps<{ product: Product }>();
const supplierProducts: Ref<SupplierProduct[]> = ref([]);

const fetchSupplierProducts = async () => {

  const {data} = await apolloClient.query({
    query: supplierProductsQuery,
    variables: { filter: {baseProducts: {id: {exact: props.product.id}}} },
    fetchPolicy: 'network-only'
  });
  
  supplierProducts.value = data.supplierProducts.edges.map(edge => ({
    id: edge.node.proxyId,
    name: edge.node.name,
    active: edge.node.active,
    sku: edge.node.sku,
    baseProducts: edge.node.baseProducts,
    supplier: {
      id: edge.node.supplier.id,
      name: edge.node.supplier.name
    },
  }));

  return [];
}

const onError = (error) => {
    const errors = processGraphQLErrors(error, t);
    if (errors['__all__']) {
      Toast.error(errors['__all__']);
    }
};

const getVariatbles = (supplierProduct) => {
  const ids = supplierProduct.baseProducts
    .filter(baseProduct => baseProduct.id !== props.product.id)
    .map(baseProduct => ({ id: baseProduct.id }));

  return { data: { id: supplierProduct.id, baseProducts: ids } };
};

onMounted(fetchSupplierProducts);

</script>

<template>
  <TabContentTemplate>
    <template v-slot:buttons>
      <ProductAdd :product="product" :supplier-products="supplierProducts" @product-added="fetchSupplierProducts" />
      <Link :path="{ name: 'purchasing.product.create', query: {productId: product.id} }">
        <PrimaryButton type="button" class="ml-2">
          {{ t('purchasing.products.create.title') }}
        </PrimaryButton>
      </Link>
    </template>

    <template v-slot:content>
        <table class="table-striped table-hover">
            <thead>
              <tr>
                <th>{{ t('shared.labels.name') }}</th>
                <th>{{ t('shared.labels.sku') }}</th>
                <th>{{ t('shared.labels.active') }}</th>
                <th>{{ t('purchasing.products.labels.supplier') }}</th>
                <th>{{ t('shared.labels.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in supplierProducts">
                <td>
                  <Link :path="{name: 'products.products.show', params: {id: p.id}}">
                    <Flex class="gap-4">
                      <FlexCell>{{ p.name }}</FlexCell>
                    </Flex>
                  </Link>
                </td>
                <td>{{ p.sku }}</td>
                <td>
                  <Icon v-if="p.active" name="check-circle" class="text-green-500" />
                  <Icon v-else name="times-circle" class="text-red-500" />
                </td>
                <td>
                  <Link :path="{name: 'purchasing.suppliers.show', params: {id: p.supplier.id}}">
                    <Flex class="gap-4">
                      <FlexCell>{{ p.supplier.name }}</FlexCell>
                    </Flex>
                  </Link>
                </td>
                <td>
                  <ApolloAlertMutation
                      :mutation="updateProductMutation"
                      :mutation-variables="getVariatbles(p)"
                      @done="fetchSupplierProducts"
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
