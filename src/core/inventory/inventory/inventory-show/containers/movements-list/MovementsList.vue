<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { Link } from "../../../../../../shared/components/atoms/link";
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import { listingConfigConstructor, searchConfigConstructor, listingQueryKey, listingQuery } from "../configs";
import {PrimaryButton} from "../../../../../../shared/components/atoms/button-primary";
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";

const props = defineProps<{ productId: string; locationId: string }>();
const { t } = useI18n();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t);
</script>

<template>
  <GeneralTemplate>

  <template v-slot:buttons>
    <Link
      :path="{
        name: 'inventory.inventory.create',
        query: { from: 'location', 'fromId': locationId, 'productId': productId },
      }"
    >
      <PrimaryButton>
        {{ t('inventory.movements.button.move') }}
      </PrimaryButton>
    </Link>
  </template>

   <template v-slot:content>
    <GeneralListing
      :search-config="searchConfig"
      :config="listingConfig"
      :query="listingQuery"
      :query-key="listingQueryKey"
      :fixed-filter-variables="{
        product: { id: { exact: productId } },
      }" />
   </template>
  </GeneralTemplate>
</template>