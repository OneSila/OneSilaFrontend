<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Button } from "../../../../shared/components/atoms/button";
import { Link } from "../../../../shared/components/atoms/link";
import { GeneralListing } from "../../../../shared/components/organisms/general-listing";
import { searchConfigConstructor, listingConfigConstructor, listingQueryKey, listingQuery } from '../configs'
import SettingsTemplate from "../../SettingsTemplate.vue";
import { getTabsConfig } from "../../tabs";
import { TabsMenu } from "../../../../shared/components/molecules/tabs-menu";

const { t } = useI18n();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t);

</script>

<template>
  <SettingsTemplate>
    <template v-slot:tabs>
      <TabsMenu :tabs="getTabsConfig(t)" :activeName="'vatRates'" />
    </template>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'settings.vatRates.list' }, name: t('settings.vatRates.title') }]" />
    </template>

    <template v-slot:buttons>
        <div>
          <Link :path="{ name: 'settings.vatRate.create' }">
          <Button type="button" class="btn btn-primary">
              {{  t('settings.vatRates.create.title') }}
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
  </SettingsTemplate>
</template>