<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Button } from "../../../../shared/components/atoms/button";
import { Link } from "../../../../shared/components/atoms/link";
import GeneralTemplate  from "../../../../shared/templates/GeneralTemplate.vue"
import { GeneralListing } from "../../../../shared/components/organisms/general-listing";
import { searchConfigConstructor, listingConfigConstructor, listingQueryKey, listingQuery } from '../configs'
import {useRoute} from "vue-router";

const { t } = useI18n();
const route = useRoute();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t, route.params.productId ? route.params.productId.toString() : null);

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'products.eanCodes.list' }, name: t('products.eanCodes.title') }]" />
    </template>

    <template v-slot:buttons>
        <div>
          <Link :path="{ name: 'products.eanCodes.create' }">
          <Button type="button" class="btn btn-primary">
              {{  t('products.eanCodes.button') }}
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
      />
   </template>
  </GeneralTemplate>
</template>