<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { Button } from "../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../shared/components/atoms/link";
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";
import { listingConfigConstructor, searchConfigConstructor, listingQueryKey, listingQuery } from "../../../../../sales/orders/configs";

const props = defineProps<{ id: string, source?: string }>();

const { t } = useI18n();
const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t, props.id, null, props.source);

</script>

<template>
  <GeneralTemplate>

    <template v-slot:buttons>
        <div>
          <Link :path="{ name: 'sales.orders.create', query: {customerId: id, source: source} }">
          <Button type="button" class="btn btn-primary">
              {{  t('sales.orders.create.title') }}
          </Button>
        </Link>
      </div>
    </template>


   <template v-slot:content>
     <GeneralListing
         :searchConfig="searchConfig"
         :config="listingConfig"
         :query="listingQuery"
         :query-key="listingQueryKey"
         :fixed-filter-variables="{'customer': {'id': {'exact': id}}}"
      />
   </template>
  </GeneralTemplate>
</template>