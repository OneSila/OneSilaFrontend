<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import { GeneralForm } from "../../../../../../../../../shared/components/organisms/general-form";
import { useRoute } from "vue-router";
import { amazonPropertyEditFormConfigConstructor, listingQuery } from "../configs";
import apolloClient from "../../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../../shared/modules/toast";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const propertyId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId ? route.query.integrationId.toString() : '';
const salesChannelId = route.query.salesChannelId ? route.query.salesChannelId.toString() : '';
const isWizard = route.query.wizard === '1';

const formConfig = amazonPropertyEditFormConfigConstructor(t, type.value, propertyId.value, integrationId);

if (isWizard) {
  formConfig.submitUrl = undefined;
  formConfig.submitLabel = t('integrations.show.mapping.saveAndMapNext');
}

const fetchNextUnmapped = async () => {
  const { data } = await apolloClient.query({
    query: listingQuery,
    variables: {
      first: 1,
      filter: {
        salesChannel: { id: { exact: salesChannelId } },
        mappedLocally: { exact: false },
      },
    },
    fetchPolicy: 'network-only',
  });
  const edges = data?.amazonProperties?.edges || [];
  return edges.length > 0 ? edges[0].node.id : null;
};

const handleSubmit = async () => {
  if (!isWizard) return;
  const nextId = await fetchNextUnmapped();
  if (nextId) {
    router.replace({
      name: 'integrations.amazonProperties.edit',
      params: { type: type.value, id: nextId },
      query: { integrationId, salesChannelId, wizard: '1' },
    });
  } else {
    Toast.success(t('integrations.show.mapping.allMappedSuccess'));
    router.push({ name: 'integrations.integrations.show', params: { type: type.value, id: integrationId }, query: { tab: 'properties' } });
  }
};
</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.integrations.show', params: {id: integrationId, type: type}, query: {tab: 'properties'} }, name: t('integrations.show.amazon.title') }
        ]" />
    </template>
    <template v-slot:content>
      <GeneralForm :config="formConfig" @submit="handleSubmit" />
    </template>
  </GeneralTemplate>
</template>
