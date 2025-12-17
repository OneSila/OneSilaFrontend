<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router';
import GeneralTemplate from "../../../../../../../../shared/templates/GeneralTemplate.vue";
import { GeneralListing } from "../../../../../../../../shared/components/organisms/general-listing";
import { Button } from "../../../../../../../../shared/components/atoms/button";
import { Title } from "../../../../../../../../shared/components/atoms/title";
import apolloClient from "../../../../../../../../../apollo-client";
import type { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import type { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";
import { buildFilterVariablesFromRouteQuery, buildNextQueryParamsFromRouteQuery } from '../../../../../../../../shared/components/molecules/filter-manager/filterQueryUtils';

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
}>();

const emit = defineEmits(['pull-data']);
const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const canStartMapping = ref(false);

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
</script>

<template>
  <GeneralTemplate>
    <template v-if="hasStartMapping" #buttons>
      <Button type="button" class="btn btn-secondary" :disabled="!canStartMapping" @click="startMapping">
        {{ t('integrations.show.mapping.startMapping') }}
      </Button>
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
        />
      </div>
    </template>
  </GeneralTemplate>
</template>
