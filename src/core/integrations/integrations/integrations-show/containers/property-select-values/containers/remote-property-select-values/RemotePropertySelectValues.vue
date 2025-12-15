<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router';
import GeneralTemplate from "../../../../../../../../shared/templates/GeneralTemplate.vue";
import { GeneralListing } from "../../../../../../../../shared/components/organisms/general-listing";
import { Button } from "../../../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../../../shared/components/atoms/icon";
import apolloClient from "../../../../../../../../../apollo-client";
import type { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import type { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";
import { buildFilterVariablesFromRouteQuery, buildNextQueryParamsFromRouteQuery } from '../../../../../../../../shared/components/molecules/filter-manager/filterQueryUtils';
import { displayApolloError } from "../../../../../../../../shared/utils";
import { Toast } from "../../../../../../../../shared/modules/toast";

type RouteBuilderContext = {
  id: string;
  integrationId: string;
  salesChannelId: string;
};

type BaseFilterBuilderContext = {
  salesChannelId: string;
};

type FirstUnmappedQueryVariables = {
  filter?: Record<string, any>;
  [key: string]: any;
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
  firstUnmappedQueryVariables?: FirstUnmappedQueryVariables;
  autoMapMutation?: any;
}>();

const emit = defineEmits(['pull-data']);
const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const canStartMapping = ref(false);
const generalListingRef = ref<any>(null);
const isAutoMapping = ref(false);

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
const hasAutoMap = computed(() => Boolean(props.autoMapMutation));

const fetchFirstUnmapped = async (): Promise<string | null> => {
  if (!hasStartMapping.value) {
    return null;
  }

  const { filter: additionalFilter = {}, ...restVariables } = props.firstUnmappedQueryVariables || {};

  const baseVariables = {
    first: 1,
    ...restVariables,
  };

  const filterFromQuery =
    buildFilterVariablesFromRouteQuery(props.searchConfig, route.query, {
      excludeKeys: ['mappedLocally'],
    }) || {};

  const { data } = await apolloClient.query({
    query: props.listingQuery,
    variables: {
      ...baseVariables,
      filter: {
        ...additionalFilter,
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

watch(
  () => props.firstUnmappedQueryVariables,
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

const clearSelection = (query?: any) => {
  generalListingRef.value?.clearSelected?.();
  query?.refetch?.();
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
                  {{ t('integrations.show.mapping.autoMapHelp') }}
                </span>
              </span>
            </span>
          </Button>
        </div>
      </div>
    </template>

    <template #content>
      <GeneralListing
        ref="generalListingRef"
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="mergedFixedFilterVariables"
        @pull-data="emit('pull-data')"
      >
        <template v-if="$slots.bulkActions" #bulkActions="slotProps">
          <slot name="bulkActions" v-bind="{ ...slotProps, clearSelection }" />
        </template>
      </GeneralListing>
    </template>
  </GeneralTemplate>
</template>
