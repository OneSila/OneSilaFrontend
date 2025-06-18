<script setup lang="ts">
import {onMounted, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, RouterLink } from 'vue-router';
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import { GeneralForm } from "../../../../../../../../../shared/components/organisms/general-form";
import { useRoute } from "vue-router";
import { amazonPropertySelectValueEditFormConfigConstructor, listingQuery } from "../configs";
import { getAmazonPropertySelectValueQuery, getAmazonPropertyQuery } from "../../../../../../../../../shared/api/queries/salesChannels";
import { selectValueOnTheFlyConfig } from "../../../../../../../../properties/property-select-values/configs";
import apolloClient from "../../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../../shared/modules/toast";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const valueId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId ? route.query.integrationId.toString() : '';
const salesChannelId = route.query.salesChannelId ? route.query.salesChannelId.toString() : '';
const isWizard = route.query.wizard === '1';

const amazonPropertyId = ref<string | null>(null);
const localPropertyId = ref<string | null>(null);
const propertyMapped = ref(true);

const formConfig = amazonPropertySelectValueEditFormConfigConstructor(t, type.value, valueId.value, integrationId);

onMounted(async () => {
  const { data } = await apolloClient.query({
    query: getAmazonPropertySelectValueQuery,
    variables: { id: valueId.value },
    fetchPolicy: 'network-only'
  });

  const valueData = data?.amazonPropertySelectValue;
  amazonPropertyId.value = valueData?.amazonProperty?.id || null;
  formConfig.queryData = { amazonPropertySelectValue: { ...valueData, amazonProperty: valueData?.amazonProperty?.name, marketplace: valueData?.marketplace?.name } };

  if (amazonPropertyId.value) {
    const { data: propData } = await apolloClient.query({
      query: getAmazonPropertyQuery,
      variables: { id: amazonPropertyId.value },
      fetchPolicy: 'network-only'
    });
    propertyMapped.value = propData?.amazonProperty?.mappedLocally ?? true;
    localPropertyId.value = propData?.amazonProperty?.localInstance?.id || null;
    const field = formConfig.fields.find(f => f.name === 'localInstance');
    if (field && localPropertyId.value) {
      field.queryVariables = { filter: { property: { id: { exact: localPropertyId.value } } } };
      field.createOnFlyConfig = selectValueOnTheFlyConfig(t, localPropertyId.value);
    }
  }
});

const fetchNextUnmapped = async () => {
  const { data } = await apolloClient.query({
    query: listingQuery,
    variables: {
      first: 1,
      filter: {
        salesChannel: { id: { exact: salesChannelId } },
        mappedLocally: { exact: false },
        amazonProperty: { mappedLocally: { exact: true } },
      },
    },
    fetchPolicy: 'network-only',
  });
  const edges = data?.amazonPropertySelectValues?.edges || [];
  return edges.length > 0 ? edges[0].node.id : null;
};

const handleSubmit = async () => {
  if (!isWizard) return;
  const nextId = await fetchNextUnmapped();
  if (nextId) {
    router.replace({
      name: 'integrations.amazonPropertySelectValues.edit',
      params: { type: type.value, id: nextId },
      query: { integrationId, salesChannelId, wizard: '1' },
    });
  } else {
    Toast.success(t('integrations.show.mapping.allMappedSuccess'));
    router.push({ name: 'integrations.integrations.show', params: { type: type.value, id: integrationId }, query: { tab: 'propertySelectValues' } });
  }
};
</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.integrations.show', params: {id: integrationId, type: type}, query: {tab: 'propertySelectValues'} }, name: t('integrations.show.amazon.title') }
        ]" />
    </template>
    <template v-slot:content>
      <div v-if="!propertyMapped" class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
        <span class="font-medium flex items-center gap-1">
          ⚠️ {{ t('integrations.show.propertySelectValues.notMappedBanner.title') }}
        </span>
        <RouterLink :to="{ name: 'integrations.amazonProperties.edit', params: { type: type, id: amazonPropertyId }, query: { integrationId } }" class="underline">
          {{ t('integrations.show.propertySelectValues.notMappedBanner.content') }}
        </RouterLink>
      </div>
      <GeneralForm :config="formConfig" @submit="handleSubmit" />
    </template>
  </GeneralTemplate>
</template>
