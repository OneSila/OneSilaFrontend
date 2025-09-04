<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import GeneralTemplate from "../../../../../../../../shared/templates/GeneralTemplate.vue";
import { GeneralListing } from "../../../../../../../../shared/components/organisms/general-listing";
import { Button } from "../../../../../../../../shared/components/atoms/button";
import { amazonProductTypesSearchConfigConstructor, amazonProductTypesListingConfigConstructor, listingQuery, listingQueryKey } from './configs';
import apolloClient from "../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../shared/modules/toast";
import { processGraphQLErrors } from "../../../../../../../../shared/utils";
import { createAmazonProductTypesFromLocalRulesMutation } from "../../../../../../../../shared/api/mutations/salesChannels.js";

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const { t } = useI18n();
const router = useRouter();

const canStartMapping = ref(false);
const pulling = ref(false);

const fetchFirstUnmapped = async () => {
  const { data } = await apolloClient.query({
    query: listingQuery,
    variables: {
      first: 1,
      filter: {
        salesChannel: { id: { exact: props.salesChannelId } },
        mappedLocally:  false ,
      },
    },
    fetchPolicy: 'network-only',
  });
  const edges = data?.amazonProductTypes?.edges || [];
  canStartMapping.value = edges.length > 0;
  return edges.length > 0 ? edges[0].node.id : null;
};

onMounted(fetchFirstUnmapped);

const startMapping = async () => {
  const id = await fetchFirstUnmapped();
  if (id) {
    router.push({
      name: 'integrations.amazonProductTypes.edit',
      params: { type: 'amazon', id },
      query: { integrationId: props.id, salesChannelId: props.salesChannelId, wizard: '1' },
    });
  }
};

const pullLocalRules = async () => {
  pulling.value = true;
  try {
    await apolloClient.mutate({
      mutation: createAmazonProductTypesFromLocalRulesMutation,
      variables: { data: { id: props.salesChannelId } },
    });
    Toast.success(t('shared.alert.toast.submitSuccessUpdate'));
    emit('pull-data');
  } catch (err) {
    const validationErrors = processGraphQLErrors(err, t);
    if (validationErrors['__all__']) {
      Toast.error(validationErrors['__all__']);
    }
  } finally {
    pulling.value = false;
  }
};

const searchConfig = amazonProductTypesSearchConfigConstructor(t);
const listingConfig = amazonProductTypesListingConfigConstructor(t, props.id);
</script>

<template>
  <GeneralTemplate>
    <template v-slot:buttons>
      <Button type="button" class="btn btn-primary" :disabled="pulling" @click="pullLocalRules">
        {{ t('integrations.show.pullLocalRules') }}
      </Button>
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
      />
    </template>
  </GeneralTemplate>
</template>
