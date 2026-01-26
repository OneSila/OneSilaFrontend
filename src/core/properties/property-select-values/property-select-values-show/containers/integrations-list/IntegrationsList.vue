<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RouteLocationRaw } from 'vue-router';
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";
import { Button } from "../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../shared/components/atoms/icon";
import { Link } from "../../../../../../shared/components/atoms/link";
import { Loader } from "../../../../../../shared/components/atoms/loader";
import apolloClient from "../../../../../../../apollo-client";
import { displayApolloError } from "../../../../../../shared/utils";
import { IntegrationTypes } from "../../../../../integrations/integrations/integrations";
import { remotePropertySelectValueMirrorsQuery } from "../../../../../../shared/api/queries/properties.js";

const props = defineProps<{ id: string }>();
const { t } = useI18n();

const loading = ref(false);
const mirrors = ref<any[]>([]);

const allowedTypes = new Set([
  IntegrationTypes.Amazon,
  IntegrationTypes.Ebay,
  IntegrationTypes.Shein,
]);

const fetchMirrors = async () => {
  loading.value = true;
  try {
    const { data } = await apolloClient.query({
      query: remotePropertySelectValueMirrorsQuery,
      variables: { propertySelectValue: props.id },
      fetchPolicy: 'cache-first',
    });
    mirrors.value = data?.remotePropertySelectValueMirrors || [];
  } catch (error) {
    displayApolloError(error);
  } finally {
    loading.value = false;
  }
};

const buildIntegrationRoute = (item: any): RouteLocationRaw | undefined => {
  const salesChannel = item?.remoteProperty?.salesChannel || {};
  const type = salesChannel?.type;
  const salesChannelProxyId = salesChannel?.proxyId;
  const selectValueProxyId = item?.proxyId;

  if (!type || !salesChannelProxyId || !selectValueProxyId) {
    return undefined;
  }

  if (!allowedTypes.has(type)) {
    return undefined;
  }

  return {
    name: 'integrations.remotePropertySelectValues.edit',
    params: { type, id: selectValueProxyId },
    query: { integrationId: salesChannelProxyId, salesChannelId: salesChannelProxyId },
  };
};

onMounted(fetchMirrors);
</script>

<template>
  <GeneralTemplate>
    <template #content>
      <Loader :loading="loading" />
      <div :class="mirrors.length > 0 ? 'table-responsive custom-table-scroll' : ''">
        <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
          <thead>
            <tr>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                {{ t('properties.values.integrations.labels.value') }}
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                {{ t('properties.values.integrations.labels.translatedValue') }}
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                {{ t('properties.values.integrations.labels.marketplace') }}
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                {{ t('properties.values.integrations.labels.remoteProperty') }}
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 !text-end">
                {{ t('shared.labels.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="item in mirrors" :key="item.proxyId">
              <td class="whitespace-nowrap px-3 py-4 text-sm">
                {{ item.value || '-' }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm">
                {{ item.translatedValue || '-' }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm">
                {{ item.marketplace?.name || '-' }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm">
                {{ item.remoteProperty?.remoteName || '-' }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm">
                <div class="flex items-center justify-end">
                  <Link v-if="buildIntegrationRoute(item)" :path="buildIntegrationRoute(item)" target="_blank">
                    <Button class="text-indigo-600 hover:text-indigo-900 flex items-center gap-2">
                      <Icon name="globe" class="w-4 h-4" />
                      {{ t('properties.integrations.actions.openIntegration') }}
                    </Button>
                  </Link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </GeneralTemplate>
</template>
