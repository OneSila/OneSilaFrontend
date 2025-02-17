<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Button } from "../../../../shared/components/atoms/button";
import { Link } from "../../../../shared/components/atoms/link";
import GeneralTemplate  from "../../../../shared/templates/GeneralTemplate.vue"
import { GeneralListing } from "../../../../shared/components/organisms/general-listing";
import { searchConfigConstructor, listingConfigConstructor, listingQueryKey, listingQuery } from '../configs'
import {PrimaryButton} from "../../../../shared/components/atoms/button-primary";

const { t } = useI18n();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t);

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'inventory.inventory.list' }, name: t('inventory.title') }]" />
    </template>

    <template v-slot:buttons>
        <!-- Add from Purchase Button -->
        <Link :path="{ name: 'inventory.inventory.create', query: { from: 'purchase' } }">
          <PrimaryButton>
            {{ t('inventory.movements.button.addFromPurchase') }}
          </PrimaryButton>
        </Link>

        <!-- Move Button -->
        <Link :path="{ name: 'inventory.inventory.create', query: { from: 'location' } }">
          <PrimaryButton>
            {{ t('inventory.movements.button.move') }}
          </PrimaryButton>
        </Link>

        <!-- Get Return Button -->
        <!--
        <Link :path="{ name: 'inventory.inventory.create', query: { from: 'return' } }">
          <PrimaryButton>
            {{ t('inventory.movements.button.getReturn') }}
          </PrimaryButton>
        </Link>
        -->

        <!-- Create Movement Button -->
        <Link :path="{ name: 'inventory.inventory.create' }">
          <PrimaryButton>
            {{ t('inventory.movements.button.createMovement') }}
          </PrimaryButton>
        </Link>
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