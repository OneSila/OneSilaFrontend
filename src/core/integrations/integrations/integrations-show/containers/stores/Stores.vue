<script setup lang="ts">
import {ref, watch} from 'vue';
import {useI18n} from 'vue-i18n';
import {GeneralListing} from "../../../../../../shared/components/organisms/general-listing";
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";
import { storesSearchConfigConstructor, storesListingConfigConstructor, listingQuery, listingQueryKey } from "./configs"
import { Button } from "../../../../../../shared/components/atoms/button";


const { t } = useI18n();
const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);

const searchConfig = storesSearchConfigConstructor(t);
const listingConfig = storesListingConfigConstructor(t, props.id);

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
        :fixed-filter-variables="{'salesChannel': {'id': {exact: salesChannelId }}}"
      />
    </template>
  </GeneralTemplate>
</template>