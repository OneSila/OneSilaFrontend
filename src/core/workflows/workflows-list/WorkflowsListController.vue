<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Breadcrumbs } from '../../../shared/components/molecules/breadcrumbs';
import GeneralTemplate from '../../../shared/templates/GeneralTemplate.vue';
import { GeneralListing } from '../../../shared/components/organisms/general-listing';
import { listingConfigConstructor, listingQuery, listingQueryKey, searchConfigConstructor } from '../configs';

const { t } = useI18n();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t);
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'workflows.list' }, name: t('products.workflows.title') }]" />
    </template>

    <template #content>
      <GeneralListing
        :searchConfig="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
      />
    </template>
  </GeneralTemplate>
</template>
