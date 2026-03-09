<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import GeneralTemplate from '../../../../../../../../shared/templates/GeneralTemplate.vue';
import { GeneralListing } from '../../../../../../../../shared/components/organisms/general-listing';
import {
  listingQuery,
  listingQueryKey,
  remoteDocumentTypesListingConfigConstructor,
  remoteDocumentTypesSearchConfigConstructor,
} from './configs';

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const { t } = useI18n();

const searchConfig = remoteDocumentTypesSearchConfigConstructor(t);
const listingConfig = remoteDocumentTypesListingConfigConstructor(t, props.id, props.salesChannelId);
</script>

<template>
  <GeneralTemplate>
    <template #content>
      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="{ salesChannel: { id: { exact: salesChannelId } } }"
        @pull-data="emit('pull-data')"
      />
    </template>
  </GeneralTemplate>
</template>
