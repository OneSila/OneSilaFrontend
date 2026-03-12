<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import {
  currenciesSearchConfigConstructor,
  currenciesListingConfigConstructor,
  listingQueryConstructor,
  listingQueryKeyConstructor
} from "./configs";
import { Button } from "../../../../../../shared/components/atoms/button";
import { useRoute } from 'vue-router';

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const route = useRoute();

const { t } = useI18n();
const integrationType = String(route.params.type);

const searchConfig = currenciesSearchConfigConstructor(t);
const listingConfig = currenciesListingConfigConstructor(t, props.id, integrationType);
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
        :query="listingQueryConstructor(integrationType)"
        :query-key="listingQueryKeyConstructor(integrationType)"
        :fixed-filter-variables="{'salesChannel': {'id': {exact: salesChannelId}}}"
      />
    </template>
  </GeneralTemplate>
</template>
