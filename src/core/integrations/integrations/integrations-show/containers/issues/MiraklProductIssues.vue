<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import { miraklProductIssuesListingQuery } from "../../../../../../shared/api/queries/miraklProductIssues.js";
import { miraklProductIssuesListingConfigConstructor, miraklProductIssuesSearchConfigConstructor } from "./configs";

const props = defineProps<{ salesChannelId: string; integrationId: string; type: string }>();
const { t } = useI18n();

const searchConfig = miraklProductIssuesSearchConfigConstructor(t, props.salesChannelId);
const listingConfig = miraklProductIssuesListingConfigConstructor(t, props.type, props.integrationId);
</script>

<template>
  <GeneralListing
    :search-config="searchConfig"
    :config="listingConfig"
    :query="miraklProductIssuesListingQuery"
    query-key="miraklProductIssues"
    :fixed-filter-variables="{ views: { salesChannel: { id: { exact: props.salesChannelId } } } }"
  />
</template>
