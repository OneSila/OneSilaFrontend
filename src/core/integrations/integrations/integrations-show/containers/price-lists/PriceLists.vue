<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import { Button } from "../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../shared/components/atoms/link";
import {
  priceListsSearchConfigConstructor,
  priceListsListingConfigConstructor,
  listingQuery,
  listingQueryKey,
} from './configs';

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const { t } = useI18n();

const searchConfig = priceListsSearchConfigConstructor(t);
const listingConfig = priceListsListingConfigConstructor(t, props.id);
</script>

<template>
  <GeneralTemplate>
    <template v-slot:buttons>
      <div class="flex gap-2 flex-wrap justify-end">
        <Link :path="{ name: 'integrations.priceLists.create', params: { integrationId: id }, query: { salesChannelId: salesChannelId } }">
          <Button type="button" class="btn btn-primary">
            {{ t('sales.priceLists.create.title') }}
          </Button>
        </Link>
        <Button type="button" class="btn btn-primary" @click="$emit('pull-data')">
          {{ t('integrations.labels.pullData') }}
        </Button>
      </div>
    </template>

    <template v-slot:content>
      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="{ 'salesChannel': { 'id': { exact: salesChannelId } } }"
      />
    </template>
  </GeneralTemplate>
</template>
