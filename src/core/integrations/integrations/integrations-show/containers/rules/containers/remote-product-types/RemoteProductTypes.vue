<script setup lang="ts">
import { computed, onMounted, ref, toRef, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import GeneralTemplate from "../../../../../../../../shared/templates/GeneralTemplate.vue";
import { GeneralListing } from "../../../../../../../../shared/components/organisms/general-listing";
import { Button } from "../../../../../../../../shared/components/atoms/button";
import {
  getCreateProductTypesFromLocalRulesMutation,
  getListingQuery,
  getListingQueryKey,
  productTypesListingConfigConstructor,
  productTypesSearchConfigConstructor,
} from './configs';
import apolloClient from "../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../shared/modules/toast";
import { processGraphQLErrors } from "../../../../../../../../shared/utils";

const props = defineProps<{ id: string; salesChannelId: string; type: string }>();
const emit = defineEmits(['pull-data']);
const { t } = useI18n();
const router = useRouter();

const { salesChannelId, type } = toRefs(props);
const integrationId = toRef(props, 'id');

const canStartMapping = ref(false);
const pulling = ref(false);

const listingQueryKey = computed(() => getListingQueryKey(type.value));
const listingQuery = computed(() => getListingQuery(type.value));
const pullMutation = computed(() => getCreateProductTypesFromLocalRulesMutation(type.value));
const searchConfig = computed(() => productTypesSearchConfigConstructor(t, type.value, salesChannelId.value));
const listingConfig = computed(() => productTypesListingConfigConstructor(t, type.value, integrationId.value, salesChannelId.value));

const fetchFirstUnmapped = async () => {
  const { data } = await apolloClient.query({
    query: listingQuery.value,
    variables: {
      first: 1,
      filter: {
        salesChannel: { id: { exact: salesChannelId.value } },
        mappedLocally: false,
      },
    },
    fetchPolicy: 'network-only',
  });
  const edges = data?.[listingQueryKey.value]?.edges || [];
  canStartMapping.value = edges.length > 0;
  return edges.length > 0 ? edges[0].node.id : null;
};

onMounted(fetchFirstUnmapped);

const startMapping = async () => {
  const id = await fetchFirstUnmapped();
  if (id) {
    router.push({
      name: 'integrations.remoteProductTypes.edit',
      params: { type: type.value, id },
      query: { integrationId: integrationId.value, salesChannelId: salesChannelId.value, wizard: '1' },
    });
  }
};

const pullLocalRules = async () => {
  pulling.value = true;
  try {
    await apolloClient.mutate({
      mutation: pullMutation.value,
      variables: { data: { id: salesChannelId.value } },
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
