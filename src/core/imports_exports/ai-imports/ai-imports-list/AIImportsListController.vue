<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import GeneralTemplate from '../../../../shared/templates/GeneralTemplate.vue';
import { Breadcrumbs } from '../../../../shared/components/molecules/breadcrumbs';
import { GeneralListing } from '../../../../shared/components/organisms/general-listing';
import {
  MCP_TOOL_RUNS_LISTING_QUERY,
  MCP_TOOL_RUNS_LISTING_QUERY_KEY,
  aiImportsListingConfigConstructor,
  aiImportsSearchConfigConstructor,
} from '../../configs';

const { t } = useI18n();
const searchConfig = aiImportsSearchConfigConstructor(t);
const listingConfig = aiImportsListingConfigConstructor(t);
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'importsExports.aiImports.list' }, name: t('importsExports.aiImports.title') }]" />
    </template>

    <template #content>
      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="MCP_TOOL_RUNS_LISTING_QUERY"
        :query-key="MCP_TOOL_RUNS_LISTING_QUERY_KEY"
      />
    </template>
  </GeneralTemplate>
</template>
