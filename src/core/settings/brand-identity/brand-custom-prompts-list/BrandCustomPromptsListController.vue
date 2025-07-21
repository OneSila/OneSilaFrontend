<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Button } from "../../../../shared/components/atoms/button";
import { Link } from "../../../../shared/components/atoms/link";
import { GeneralListing } from "../../../../shared/components/organisms/general-listing";
import { searchConfigConstructor, listingConfigConstructor, listingQueryKey, listingQuery } from '../configs';
import { TabsMenu } from "../../../../shared/components/molecules/tabs-menu";
import { getTabsConfig } from "../../tabs";
import SettingsTemplate from "../../SettingsTemplate.vue";

const { t } = useI18n();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t);
</script>

<template>
  <SettingsTemplate>
    <template v-slot:tabs>
      <TabsMenu :tabs="getTabsConfig(t)" :activeName="'brandIdentity'" />
    </template>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'settings.brandIdentity.list' }, name: t('settings.brandIdentity.title') }]" />
    </template>

    <template v-slot:buttons>
      <div>
        <Link :path="{ name: 'settings.brandIdentity.create' }">
          <Button type="button" class="btn btn-primary">
            {{ t('settings.brandIdentity.create.title') }}
          </Button>
        </Link>
      </div>
    </template>

    <template v-slot:content>
      <div class="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
        <span class="font-medium flex items-center gap-1">
          ⚠️ {{ t('settings.brandIdentity.descriptionCard.title') }}
        </span>
        {{ t('settings.brandIdentity.descriptionCard.content') }}
      </div>
      <GeneralListing
        :searchConfig="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
      />
    </template>
  </SettingsTemplate>
</template>
