<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router';
import GeneralTemplate from "../../../../../../../../shared/templates/GeneralTemplate.vue";
import { GeneralListing } from "../../../../../../../../shared/components/organisms/general-listing";
import { Button } from "../../../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../../../shared/components/atoms/link";
import { Icon } from "../../../../../../../../shared/components/atoms/icon";
import { Title } from "../../../../../../../../shared/components/atoms/title";
import apolloClient from "../../../../../../../../../apollo-client";
import type { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import type { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";
import { buildFilterVariablesFromRouteQuery, buildNextQueryParamsFromRouteQuery } from '../../../../../../../../shared/components/molecules/filter-manager/filterQueryUtils';
import { displayApolloError } from "../../../../../../../../shared/utils";
import { Toast } from "../../../../../../../../shared/modules/toast";
import { PropertyTypes } from "../../../../../../../../shared/utils/constants";
import { IntegrationTypes } from "../../../../../integrations";

type RouteBuilderContext = {
  id: string;
  integrationId: string;
  salesChannelId: string;
};

type BaseFilterBuilderContext = {
  salesChannelId: string;
};

const props = defineProps<{
  id: string;
  salesChannelId: string;
  searchConfig: SearchConfig;
  listingConfig: ListingConfig;
  listingQuery: any;
  listingQueryKey: string;
  fixedFilterVariables?: Record<string, any>;
  buildBaseFilter?: (context: BaseFilterBuilderContext) => Record<string, any>;
  buildStartMappingRoute?: (context: RouteBuilderContext) => RouteLocationRaw;
  titleKey?: string;
  autoMapMutation?: any;
}>();

const emit = defineEmits(['pull-data']);
const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const canStartMapping = ref(false);
const isAutoMapping = ref(false);
const integrationType = computed(() => String(route.params.type || ''));

const selectValuesFilterKey = computed(() => {
  switch (integrationType.value) {
    case IntegrationTypes.Amazon:
      return 'amazonProperty';
    case IntegrationTypes.Ebay:
      return 'ebayProperty';
    case IntegrationTypes.Shein:
      return 'remoteProperty';
    default:
      return null;
  }
});

const isSelectPropertyType = (type?: string) => {
  return type === PropertyTypes.SELECT || type === PropertyTypes.MULTISELECT;
};

const canSeeValues = (item: any) => {
  return Boolean(selectValuesFilterKey.value && item?.node?.id && isSelectPropertyType(item?.node?.type));
};

const buildSelectValuesRoute = (item: any): RouteLocationRaw => ({
  name: 'integrations.integrations.show',
  params: { type: integrationType.value, id: props.id },
  query: {
    tab: 'propertySelectValues',
    [selectValuesFilterKey.value as string]: item?.node?.id,
  },
});

const baseFilter = computed(() => {
  if (props.buildBaseFilter) {
    return props.buildBaseFilter({ salesChannelId: props.salesChannelId });
  }

  if (!props.salesChannelId) {
    return {};
  }

  return { salesChannel: { id: { exact: props.salesChannelId } } };
});

const mergedFixedFilterVariables = computed(() => ({
  ...baseFilter.value,
  ...(props.fixedFilterVariables || {}),
}));

const hasStartMapping = computed(() => Boolean(props.buildStartMappingRoute));
const hasTitle = computed(() => Boolean(props.titleKey));
const hasAutoMap = computed(() => Boolean(props.autoMapMutation));

const fetchFirstUnmapped = async (): Promise<string | null> => {
  if (!hasStartMapping.value) {
    return null;
  }

  const filterFromQuery =
    buildFilterVariablesFromRouteQuery(props.searchConfig, route.query, {
      excludeKeys: ['mappedLocally'],
    }) || {};

  const { data } = await apolloClient.query({
    query: props.listingQuery,
    variables: {
      first: 1,
      filter: {
        ...mergedFixedFilterVariables.value,
        ...filterFromQuery,
        mappedLocally: false,
      },
    },
    fetchPolicy: 'network-only',
  });

  const listingData = data?.[props.listingQueryKey] ?? {};
  const edges = listingData?.edges || [];
  canStartMapping.value = edges.length > 0;
  return edges.length > 0 ? edges[0].node.id : null;
};

onMounted(() => {
  if (hasStartMapping.value) {
    fetchFirstUnmapped();
  }
});

watch(
  () => props.salesChannelId,
  () => {
    if (hasStartMapping.value) {
      fetchFirstUnmapped();
    }
  }
);

watch(
  () => props.fixedFilterVariables,
  () => {
    if (hasStartMapping.value) {
      fetchFirstUnmapped();
    }
  },
  { deep: true }
);

const startMapping = async () => {
  if (!props.buildStartMappingRoute) {
    return;
  }

  const id = await fetchFirstUnmapped();
  if (!id) {
    return;
  }

  const baseRoute = props.buildStartMappingRoute({
    id,
    integrationId: props.id,
    salesChannelId: props.salesChannelId,
  }) as any;

  const nextQuery = buildNextQueryParamsFromRouteQuery(props.searchConfig, route.query, {
    excludeKeys: ['mappedLocally'],
  });
  if ((route.query as any).usedInProducts === undefined && nextQuery['next__usedInProducts'] === undefined) {
    nextQuery['next__usedInProducts'] = true;
  }

  router.push({
    ...baseRoute,
    query: {
      ...(baseRoute.query || {}),
      ...nextQuery,
    },
  });
};

const autoMapPerfectMatches = async () => {
  if (!props.autoMapMutation || !props.salesChannelId || isAutoMapping.value) {
    return;
  }

  isAutoMapping.value = true;
  try {
    await apolloClient.mutate({
      mutation: props.autoMapMutation,
      variables: {
        salesChannel: { id: props.salesChannelId },
      },
      fetchPolicy: 'no-cache',
    });

    Toast.success(t('integrations.show.mapping.autoMapStarted'));
  } catch (error) {
    displayApolloError(error);
  } finally {
    isAutoMapping.value = false;
  }
};
</script>

<template>
  <GeneralTemplate>
    <template v-if="hasStartMapping" #buttons>
      <div class="flex items-center gap-2">
        <Button type="button" class="btn btn-secondary" :disabled="!canStartMapping" @click="startMapping">
          {{ t('integrations.show.mapping.startMapping') }}
        </Button>

        <div v-if="hasAutoMap" class="flex items-center gap-2">
          <Button
            type="button"
            class="btn btn-secondary"
            :disabled="isAutoMapping || !salesChannelId"
            :loading="isAutoMapping"
            @click="autoMapPerfectMatches"
          >
            <span class="flex items-center gap-2">
              <span>{{ t('integrations.show.mapping.autoMap') }}</span>
              <span class="relative flex items-center group" @click.stop.prevent>
                <Icon name="info-circle" class="text-white cursor-help" />
                <span
                  class="pointer-events-none absolute right-0 top-full z-50 mt-2 hidden w-96 rounded-md border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-lg group-hover:block dark:border-gray-700 dark:bg-black dark:text-white"
                >
                  {{ t('integrations.show.mapping.autoMapPropertiesHelp') }}
                </span>
              </span>
            </span>
          </Button>
        </div>
      </div>
    </template>

    <template #content>
      <div class="space-y-4">
        <Title v-if="hasTitle" level="3" semi-bold>
          {{ t(props.titleKey as string) }}
        </Title>
        <GeneralListing
          :search-config="searchConfig"
          :config="listingConfig"
          :query="listingQuery"
          :query-key="listingQueryKey"
          :fixed-filter-variables="mergedFixedFilterVariables"
          @pull-data="emit('pull-data')"
        >
          <template #additionalButtons="{ item }">
            <Link
              v-if="canSeeValues(item)"
              :path="buildSelectValuesRoute(item)"
            >
              <Button class="text-indigo-600 hover:text-indigo-900">
                {{ t('integrations.show.properties.actions.seeValues') }}
              </Button>
            </Link>
          </template>
        </GeneralListing>
      </div>
    </template>
  </GeneralTemplate>
</template>
