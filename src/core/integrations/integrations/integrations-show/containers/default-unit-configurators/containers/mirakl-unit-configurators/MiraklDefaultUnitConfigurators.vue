<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import GeneralTemplate from "../../../../../../../../shared/templates/GeneralTemplate.vue";
import { GeneralListing } from "../../../../../../../../shared/components/organisms/general-listing";
import { Button } from "../../../../../../../../shared/components/atoms/button";
import apolloClient from "../../../../../../../../../apollo-client";
import {
  listingQuery,
  listingQueryKey,
  miraklDefaultUnitConfiguratorsListingConfigConstructor,
  miraklDefaultUnitConfiguratorsSearchConfigConstructor,
} from './configs';
import { MIRAKL_REPRESENTATION_TYPE_UNIT } from '../../../properties/containers/mirakl-properties/representationTypes';

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const { t } = useI18n();
const router = useRouter();

const canStartMapping = ref(false);

const fixedFilterVariables = {
  salesChannel: { id: { exact: props.salesChannelId } },
  representationType: { exact: MIRAKL_REPRESENTATION_TYPE_UNIT },
};

const fetchFirstUnmapped = async () => {
  const { data } = await apolloClient.query({
    query: listingQuery,
    variables: {
      first: 100,
      filter: fixedFilterVariables,
    },
    fetchPolicy: 'network-only',
  });

  const edges = data?.miraklProperties?.edges || [];
  const nextItem = edges.find((edge: any) => !edge?.node?.defaultValue);
  canStartMapping.value = Boolean(nextItem);
  return nextItem?.node?.id || null;
};

onMounted(fetchFirstUnmapped);

const startMapping = async () => {
  const id = await fetchFirstUnmapped();
  if (!id) {
    return;
  }

  router.push({
    name: 'integrations.miraklDefaultUnitConfigurators.edit',
    params: { type: 'mirakl', id },
    query: { integrationId: props.id, salesChannelId: props.salesChannelId, wizard: '1' },
  });
};

const searchConfig = miraklDefaultUnitConfiguratorsSearchConfigConstructor();
const listingConfig = miraklDefaultUnitConfiguratorsListingConfigConstructor(t, props.id);
</script>

<template>
  <GeneralTemplate>
    <template #buttons>
      <Button type="button" class="btn btn-secondary" :disabled="!canStartMapping" @click="startMapping">
        {{ t('integrations.show.mapping.startMapping') }}
      </Button>
    </template>

    <template #content>
      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="fixedFilterVariables"
        @pull-data="emit('pull-data')"
      />
    </template>
  </GeneralTemplate>
</template>
