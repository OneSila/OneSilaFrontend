<script setup lang="ts">

import {Product} from "../../../../configs";
import {listingQuery, listingQueryKey, searchConfigConstructor, listingConfigConstructor} from "../../../../../../inventory/inventory/configs";
import { Button } from "../../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../../shared/components/atoms/link";
import { Card } from "../../../../../../../shared/components/atoms/card";
import { GeneralListing } from "../../../../../../../shared/components/organisms/general-listing";
import {useI18n} from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";
import { ProductType } from "../../../../../../../shared/utils/constants";
import {Icon} from "../../../../../../../shared/components/atoms/icon";
import {Label} from "../../../../../../../shared/components/atoms/label";

const { t } = useI18n();

const props = defineProps<{ product: Product }>();


const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t, props.product.id, props.product.type === ProductType.Supplier);

const filters = props.product.type === ProductType.Supplier ?
    {'product': {'id': {'exact': props.product.id}}} :
    {'product': { 'baseProducts': {'id': {'exact': props.product.id}} }};

</script>

<template>
  <TabContentTemplate>
    <template v-slot:buttons v-if="props.product.type === ProductType.Supplier">
      <Link :path="{ name: 'inventory.inventory.create', query: {productId: product.id} }">
        <Button type="button" class="btn btn-primary">
          {{ t('inventory.inventory.create.title') }}
        </Button>
      </Link>
    </template>

    <template v-slot:content>
      <div class="mt-2 border border-gray-300 p-3 rounded-lg">
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Flex vertical>
            <FlexCell>
              <Flex>
                <FlexCell>
                  <Icon name="store"/>
                </FlexCell>
                <FlexCell>
                  <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ t('inventory.inventory.labels.salable')}}</label>
                </FlexCell>
                <FlexCell class="mt-0.5">
                  <span>{{ product.inventorySalable }}</span>
                </FlexCell>
              </Flex>
            </FlexCell>
            <FlexCell>
               <p class="text-sm leading-6 text-gray-400">{{ t('inventory.inventory.help.salable') }}</p>
            </FlexCell>
          </Flex>
          <Flex vertical>
            <FlexCell>
              <Flex>
                <FlexCell>
                  <Icon name="warehouse"/>
                </FlexCell>
                <FlexCell>
                  <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ t('inventory.inventory.labels.physical')}}</label>
                </FlexCell>
                <FlexCell class="mt-0.5">
                  <span>{{ product.inventoryPhysical }}</span>
                </FlexCell>
              </Flex>
            </FlexCell>
            <FlexCell>
               <p class="text-sm leading-6 text-gray-400">{{ t('inventory.inventory.help.physical') }}</p>
            </FlexCell>
          </Flex>
          <Flex vertical>
            <FlexCell>
              <Flex>
                <FlexCell>
                  <Icon name="lock"/>
                </FlexCell>
                <FlexCell>
                  <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ t('inventory.inventory.labels.reserved')}}</label>
                </FlexCell>
                <FlexCell class="mt-0.5">
                  <span>{{ product.inventoryReserved }}</span>
                </FlexCell>
              </Flex>
            </FlexCell>
            <FlexCell>
               <p class="text-sm leading-6 text-gray-400">{{ t('inventory.inventory.help.reserved') }}</p>
            </FlexCell>
          </Flex>
          <Flex vertical>
            <FlexCell>
              <Flex>
                <FlexCell>
                  <Icon name="clock"/>
                </FlexCell>
                <FlexCell>
                  <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ t('inventory.inventory.labels.awaitInventory')}}</label>
                </FlexCell>
                <FlexCell class="mt-0.5">
                  <span>{{ product.inventoryAwaitInventory }}</span>
                </FlexCell>
              </Flex>
            </FlexCell>
            <FlexCell>
               <p class="text-sm leading-6 text-gray-400">{{ t('inventory.inventory.help.awaitInventory') }}</p>
            </FlexCell>
          </Flex>
        </div>
      </div>

      <GeneralListing
        v-if="[ProductType.Supplier, ProductType.Simple, ProductType.Dropship].includes(props.product.type)"
        :searchConfig="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="filters"
      />
    </template>
  </TabContentTemplate>
</template>
