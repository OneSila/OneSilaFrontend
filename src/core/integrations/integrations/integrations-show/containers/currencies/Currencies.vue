<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import {
  currenciesSearchConfigConstructor,
  currenciesListingConfigConstructor,
  listingQuery,
  listingQueryKey
} from "./configs";
import { Button } from "../../../../../../shared/components/atoms/button";

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);

const { t } = useI18n();

const searchConfig = currenciesSearchConfigConstructor(t);
const listingConfig = currenciesListingConfigConstructor(t, props.id);
</script>

<template>
  <GeneralTemplate>

    <template v-slot:buttons>
      <Button type="button" class="btn btn-primary" @click="$emit('pull-data')">
        {{ t('integrations.labels.pullData') }}
      </Button>
    </template>

    <template v-slot:content>
      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="{'salesChannel': {'id': {exact: salesChannelId}}}"
      />
    </template>
  </GeneralTemplate>
</template>
