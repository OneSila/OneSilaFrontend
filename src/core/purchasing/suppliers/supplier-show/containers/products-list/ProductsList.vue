<script setup lang="ts">

import { SearchConfig} from "../../../../../../shared/components/organisms/general-search/searchConfig";
import { useI18n } from 'vue-i18n';
import { Button } from "../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../shared/components/atoms/link";
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";
import { listingConfigConstructor, searchConfigConstructor, listingQueryKey, listingQuery } from "../../../../products/configs";
import {Breadcrumbs} from "../../../../../../shared/components/molecules/breadcrumbs";

const props = defineProps<{ id: string }>();

const { t } = useI18n();
const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t, props.id);

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'purchasing.products.list' }, name: t('purchasing.products.title') }]" />
    </template>

    <template v-slot:buttons>
        <div>
          <Link :path="{ name: 'purchasing.product.create', query: {supplierId: id} }">
          <Button type="button" class="btn btn-primary">
              {{  t('purchasing.products.button') }}
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
         :fixed-filter-variables="{'supplier': {'id': {'exact': id}}}"
      />
   </template>
  </GeneralTemplate>
</template>