<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Breadcrumbs } from '../../../../shared/components/molecules/breadcrumbs';
import { Button } from '../../../../shared/components/atoms/button';
import { GeneralListing } from '../../../../shared/components/organisms/general-listing';
import { Link } from '../../../../shared/components/atoms/link';
import { TabsMenu } from '../../../../shared/components/molecules/tabs-menu';
import SettingsTemplate from '../../SettingsTemplate.vue';
import { getTabsConfig } from '../../tabs';
import { listingConfigConstructor, listingQuery, listingQueryKey, searchConfigConstructor } from '../configs';

const { t } = useI18n();

const searchConfig = searchConfigConstructor();
const listingConfig = listingConfigConstructor(t);
</script>

<template>
  <SettingsTemplate>
    <template #tabs>
      <TabsMenu :tabs="getTabsConfig(t)" :activeName="'documentTypes'" />
    </template>

    <template #breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'settings.documentTypes.list' }, name: t('settings.documentTypes.title') }]" />
    </template>

    <template #buttons>
      <div>
        <Link :path="{ name: 'settings.documentType.create' }">
          <Button type="button" class="btn btn-primary">
            {{ t('settings.documentTypes.create.title') }}
          </Button>
        </Link>
      </div>
    </template>

    <template #content>
      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
      >
        <template #additionalButtons="{ item }">
          <Link :path="{ name: 'media.documents.list', query: { documentType: item.node.id } }">
            <Button class="text-indigo-600 hover:text-indigo-900">
              {{ t('settings.documentTypes.actions.showDocuments') }}
            </Button>
          </Link>
        </template>
      </GeneralListing>
    </template>
  </SettingsTemplate>
</template>
