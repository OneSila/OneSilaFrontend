<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import GeneralTemplate from "../../../../../../../../shared/templates/GeneralTemplate.vue";
import { GeneralListing } from "../../../../../../../../shared/components/organisms/general-listing";
import { Button } from "../../../../../../../../shared/components/atoms/button";
import { amazonPropertySelectValuesSearchConfigConstructor, amazonPropertySelectValuesListingConfigConstructor, listingQuery, listingQueryKey } from './configs';
import BulkAmazonPropertySelectValueAssigner from './BulkAmazonPropertySelectValueAssigner.vue';
import apolloClient from "../../../../../../../../../apollo-client";

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const { t } = useI18n();
const router = useRouter();

const canStartMapping = ref(false);

const fetchFirstUnmapped = async () => {
  const { data } = await apolloClient.query({
    query: listingQuery,
    variables: {
      first: 1,
      filter: {
        salesChannel: { id: { exact: props.salesChannelId } },
        mappedLocally: false,
      },
    },
    fetchPolicy: 'network-only',
  });
  const edges = data?.amazonPropertySelectValues?.edges || [];
  canStartMapping.value = edges.length > 0;
  return edges.length > 0 ? edges[0].node.id : null;
};

onMounted(fetchFirstUnmapped);

const startMapping = async () => {
  const id = await fetchFirstUnmapped();
  if (id) {
    router.push({
      name: 'integrations.amazonPropertySelectValues.edit',
      params: { type: 'amazon', id },
      query: { integrationId: props.id, salesChannelId: props.salesChannelId, wizard: '1' },
    });
  }
};

const searchConfig = amazonPropertySelectValuesSearchConfigConstructor(t, props.salesChannelId);
const listingConfig = amazonPropertySelectValuesListingConfigConstructor(t, props.id);
</script>

<template>
  <GeneralTemplate>
    <template v-slot:buttons>
      <Button type="button" class="btn btn-secondary" :disabled="!canStartMapping" @click="startMapping">
        {{ t('integrations.show.mapping.startMapping') }}
      </Button>
    </template>

    <template v-slot:content>
      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="{'salesChannel': {'id': {exact: salesChannelId}}}"
      >
        <template #bulkActions="{ selectedEntities }">
          <BulkAmazonPropertySelectValueAssigner
            :selected-entities="selectedEntities"
            @started="emit('pull-data')"
          />
        </template>
      </GeneralListing>
    </template>
  </GeneralTemplate>
</template>
