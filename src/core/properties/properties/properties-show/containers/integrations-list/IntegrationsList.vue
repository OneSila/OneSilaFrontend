<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RouteLocationRaw } from 'vue-router';
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import { Link } from "../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../shared/components/atoms/icon";
import { IntegrationTypes } from "../../../../../integrations/integrations/integrations";
import { listingConfigConstructor, listingQuery, listingQueryKey, searchConfigConstructor } from "./configs";

const props = defineProps<{ id: string }>();
const { t } = useI18n();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t);

const allowedTypes = new Set([
  IntegrationTypes.Amazon,
  IntegrationTypes.Ebay,
  IntegrationTypes.Shein,
]);

const buildIntegrationRoute = (item: any): RouteLocationRaw | undefined => {
  const salesChannel = item?.node?.salesChannel || {};
  const type = salesChannel?.type;
  const salesChannelProxyId = salesChannel?.proxyId;
  const propertyProxyId = item?.node?.proxyId;

  if (!type || !salesChannelProxyId || !propertyProxyId) {
    return undefined;
  }

  if (!allowedTypes.has(type)) {
    return undefined;
  }

  return {
    name: 'integrations.remoteProperties.edit',
    params: { type, id: propertyProxyId },
    query: { integrationId: salesChannelProxyId, salesChannelId: salesChannelProxyId },
  };
};

const fixedFilterVariables = computed(() => ({
  localInstance: { id: { exact: props.id } },
}));
</script>

<template>
  <GeneralTemplate>
    <template #content>
      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="fixedFilterVariables"
      >
        <template #additionalButtons="{ item }">
          <Link v-if="buildIntegrationRoute(item)" :path="buildIntegrationRoute(item)" target="_blank">
            <Button class="text-indigo-600 hover:text-indigo-900 flex items-center gap-2">
              <Icon name="globe" class="w-4 h-4" />
              {{ t('properties.integrations.actions.openIntegration') }}
            </Button>
          </Link>
        </template>
      </GeneralListing>
    </template>
  </GeneralTemplate>
</template>
