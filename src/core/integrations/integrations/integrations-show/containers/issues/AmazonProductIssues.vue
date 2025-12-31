<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import { amazonProductIssuesListingQuery } from "../../../../../../shared/api/queries/amazonProductIssues.js";
import { amazonProductIssuesListingConfigConstructor, amazonProductIssuesSearchConfigConstructor } from "./configs";

const props = defineProps<{ salesChannelId: string; integrationId: string; type: string }>();
const { t } = useI18n();

const searchConfig = amazonProductIssuesSearchConfigConstructor(t, props.salesChannelId);
const listingConfig = amazonProductIssuesListingConfigConstructor(t, props.type, props.integrationId);
</script>

<template>
  <GeneralListing
    :search-config="searchConfig"
    :config="listingConfig"
    :query="amazonProductIssuesListingQuery"
    query-key="amazonProductIssues"
    :fixed-filter-variables="{ view: {salesChannel: { id: { exact: props.salesChannelId } }} }"
  />
</template>
