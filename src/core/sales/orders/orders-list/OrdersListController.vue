<script setup lang="ts">

import {useI18n} from 'vue-i18n';
import {Breadcrumbs} from "../../../../shared/components/molecules/breadcrumbs";
import {Button} from "../../../../shared/components/atoms/button";
import {Link} from "../../../../shared/components/atoms/link";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue"
import {GeneralListing} from "../../../../shared/components/organisms/general-listing";
import {searchConfigConstructor, listingConfigConstructor, listingQueryKey, listingQuery} from "../configs";

const {t} = useI18n();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t, null, null, null, true);

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'sales.orders.list' }, name: t('sales.orders.title') }]"/>
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