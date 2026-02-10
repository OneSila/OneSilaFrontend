<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import RemotePropertyEdit from "../../remote-properties/components/RemotePropertyEdit.vue";
import { sheinPropertyEditFormConfigConstructor } from "../configs";
import { FieldType, PropertyTypes } from "../../../../../../../../../shared/utils/constants";
import { propertiesQuerySelector } from "../../../../../../../../../shared/api/queries/properties.js";
import apolloClient from "../../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import { sheinPropertiesQuery } from "../../../../../../../../../shared/api/queries/salesChannels";
import type { FormConfig } from "../../../../../../../../../shared/components/organisms/general-form/formConfig";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { Label } from "../../../../../../../../../shared/components/atoms/label";
import { checkPropertyForDuplicatesMutation } from "../../../../../../../../../shared/api/mutations/properties.js";
import debounce from 'lodash.debounce';
import { sheinPropertiesSearchConfigConstructor } from '../configs';
import { buildFilterVariablesFromRouteQuery, extractPrefixedQueryParams } from '../../../../../../../../../shared/components/molecules/filter-manager/filterQueryUtils';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const sheinPropertyId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId?.toString() || '';
const salesChannelId = route.query.salesChannelId?.toString() || '';
const isWizard = route.query.wizard === '1';
const propertyId = route.query.propertyId?.toString() || null;
const returnTab = route.query.fromTab?.toString() || 'properties';

const formConfig = ref<FormConfig | null>(null);
const formData = ref<Record<string, any>>({});
const propertyType = ref<string | null>(null);
const recommendations = ref<{ id: string; name: string }[]>([]);
const loadingRecommendations = ref(false);

const isSelectPropertyType = (type?: string | null) => {
  return type === PropertyTypes.SELECT || type === PropertyTypes.MULTISELECT;
};

const canSeeValues = computed(() => isSelectPropertyType(propertyType.value));

const selectValuesRoute = computed(() => ({
  name: 'integrations.integrations.show',
  params: { type: type.value, id: integrationId },
  query: {
    tab: 'propertySelectValues',
    remoteProperty: sheinPropertyId.value,
  },
}));

const breadcrumbsLinks = computed(() => [
  { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
  {
    path: {
      name: 'integrations.integrations.show',
      params: { id: integrationId, type: type.value },
      query: { tab: returnTab },
    },
    name: t(`integrations.show.${type.value}.title`),
  },
  { name: t('integrations.show.mapProperty') },
]);

const remoteRuleId = computed(() =>
  [sheinPropertyId.value, integrationId, salesChannelId, type.value]
    .map((part) => part ?? '')
    .join('__'),
);

const fetchNextUnmapped = async (): Promise<{ nextId: string | null; last: boolean }> => {
  const queryNext = async (filter: Record<string, any>) => {
    const { data } = await apolloClient.query({
      query: sheinPropertiesQuery,
      variables: {
        first: 2,
        filter,
      },
      fetchPolicy: 'network-only',
    });

    const edges = data?.sheinProperties?.edges || [];
    let nextId: string | null = null;
    for (const edge of edges) {
      if (edge.node.id !== sheinPropertyId.value) {
        nextId = edge.node.id;
        break;
      }
    }
    const last = edges.length === 1 && edges[0].node.id === sheinPropertyId.value;
    return { nextId, last };
  };

  const nextFilters =
    buildFilterVariablesFromRouteQuery(sheinPropertiesSearchConfigConstructor(t), route.query, {
      prefix: 'next__',
      excludeKeys: ['mappedLocally'],
    }) || {};

  const baseFilter = {
    salesChannel: { id: { exact: salesChannelId } },
    mappedLocally: false,
    ...nextFilters,
  };

  const primary = await queryNext(baseFilter);
  if (primary.nextId || primary.last || !('usedInProducts' in baseFilter)) {
    return primary;
  }

  const { usedInProducts, ...fallbackFilter } = baseFilter as any;
  return queryNext(fallbackFilter);
};

onMounted(async () => {
  formConfig.value = sheinPropertyEditFormConfigConstructor(t, type.value, sheinPropertyId.value, integrationId);

  if (!formConfig.value) {
    return;
  }

  formConfig.value.cancelUrl = {
    name: 'integrations.integrations.show',
    params: { type: type.value, id: integrationId },
    query: { tab: returnTab },
  };

  formConfig.value.submitUrl = {
    name: 'integrations.integrations.show',
    params: { type: type.value, id: integrationId },
    query: { tab: returnTab },
  };

  if (!isWizard) {
    return;
  }

  const { nextId, last } = await fetchNextUnmapped();

  formConfig.value.addSubmitAndContinue = false;

  if (nextId) {
    formConfig.value.submitUrl = {
      name: 'integrations.remoteProperties.edit',
      params: { type: type.value, id: nextId },
      query: { integrationId, salesChannelId, wizard: '1', fromTab: returnTab },
    };
    formConfig.value.submitLabel = t('integrations.show.mapping.saveAndMapNext');
    return;
  }

  if (last) {
    formConfig.value.submitUrl = {
      name: 'integrations.integrations.show',
      params: { type: type.value, id: integrationId },
      query: { tab: returnTab },
    };
    return;
  }

  Toast.success(t('integrations.show.mapping.allMappedSuccess'));
  router.push({
    name: 'integrations.integrations.show',
    params: { type: type.value, id: integrationId },
    query: { tab: returnTab },
  });
});

const handleSetData = (data: any) => {
  if (!formConfig.value) {
    return;
  }

  const nextPropertyType = data?.sheinProperty?.type;
  if (!nextPropertyType) {
    return;
  }

  propertyType.value = nextPropertyType;

  const defaultValue = propertyId || data?.sheinProperty?.localInstance?.id || null;

  const field = {
    type: FieldType.Query,
    name: 'localInstance',
    label: t('integrations.show.properties.labels.property'),
    help: t('integrations.show.properties.help.property'),
    labelBy: 'name',
    valueBy: 'id',
    query: propertiesQuerySelector,
    queryVariables: { filter: { type: { exact: nextPropertyType } } },
    dataKey: 'properties',
    isEdge: true,
    multiple: false,
    filterable: true,
    formMapIdentifier: 'id',
    ...(defaultValue ? { default: defaultValue } : {}),
  };

  const index = formConfig.value.fields.findIndex((f) => f.name === 'localInstance');
  if (index === -1) {
    formConfig.value.fields.push(field as any);
  } else {
    formConfig.value.fields[index] = field as any;
  }
};

const handleFormUpdate = (form: Record<string, any>) => {
  formData.value = form;
};

const fetchRecommendations = async () => {
  const searchValue = formData.value.nameEn || formData.value.name;
  if (!searchValue) {
    recommendations.value = [];
    return;
  }

  loadingRecommendations.value = true;

  try {
    const { data } = await apolloClient.mutate({
      mutation: checkPropertyForDuplicatesMutation,
      variables: { name: searchValue },
    });

    if (data && data.checkPropertyForDuplicates && data.checkPropertyForDuplicates.duplicateFound) {
      recommendations.value = data.checkPropertyForDuplicates.duplicates
        .filter((p: any) => p.id !== formData.value.localInstance?.id)
        .map((p: any) => ({ id: p.id, name: p.name }));
    } else {
      recommendations.value = [];
    }
  } finally {
    loadingRecommendations.value = false;
  }
};

const debouncedFetchRecommendations = debounce(fetchRecommendations, 500);

watch(
  () => formData.value.name,
  () => {
    debouncedFetchRecommendations();
  },
);

watch(
  () => formData.value.nameEn,
  () => {
    debouncedFetchRecommendations();
  },
);

watch(
  () => formData.value.localInstance,
  () => {
    recommendations.value = recommendations.value.filter((r) => r.id !== formData.value.localInstance);
  },
);

const selectRecommendation = (id: string) => {
  formData.value.localInstance = id;
  recommendations.value = recommendations.value.filter((r) => r.id !== id);
};
</script>

<template>
  <RemotePropertyEdit
    :breadcrumbs-links="breadcrumbsLinks"
    :form-config="formConfig"
    @set-data="handleSetData"
    @form-updated="handleFormUpdate"
  >
    <template #additional-button>
      <div class="flex items-center gap-2">
        <Link
          v-if="remoteRuleId"
          :path="{
            name: 'properties.properties.create',
            query: {
              remoteRuleId,
              ...(formData.name ? { name: formData.name } : {}),
              ...(formData.nameEn ? { translatedName: formData.nameEn } : {}),
              ...(formData.type ? { type: formData.type } : {}),
              remoteWizard: isWizard ? '1' : '0',
              ...extractPrefixedQueryParams(route.query, 'next__'),
            },
          }"
        >
          <Button type="button" class="btn btn-info">
            {{ t('integrations.show.generateProperty') }}
          </Button>
        </Link>
        <Link v-if="canSeeValues" :path="selectValuesRoute">
          <Button type="button" class="btn btn-secondary">
            {{ t('integrations.show.properties.actions.seeValues') }}
          </Button>
        </Link>
      </div>
    </template>
    <template #additional-fields>
      <div class="mt-4 border border-gray-300 bg-gray-50 rounded p-4">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-2">
          {{ t('integrations.show.propertySelectValues.recommendation.title') }}
        </Label>
        <div v-if="loadingRecommendations" class="flex items-center gap-2">
          <div class="loader-mini"></div>
          <span class="text-sm text-gray-500">
            {{ t('integrations.show.propertySelectValues.recommendation.searching') }}
          </span>
        </div>
        <div v-else>
          <div v-if="recommendations.length" class="flex flex-wrap gap-2">
            <button
              v-for="item in recommendations"
              :key="item.id"
              type="button"
              class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm hover:bg-purple-200"
              @click="selectRecommendation(item.id)"
            >
              {{ item.name }}
            </button>
          </div>
          <p v-else class="text-sm text-gray-500">
            {{ t('integrations.show.propertySelectValues.recommendation.none') }}
          </p>
        </div>
      </div>
    </template>
  </RemotePropertyEdit>
</template>

<style scoped>
.loader-mini {
  width: 24px;
  aspect-ratio: 1;
  display: grid;
}

.loader-mini::before,
.loader-mini::after {
  content: "";
  grid-area: 1/1;
  --c: no-repeat radial-gradient(farthest-side, currentColor 92%, #0000);
  background:
    var(--c) 50% 0,
    var(--c) 50% 100%,
    var(--c) 100% 50%,
    var(--c) 0 50%;
  background-size: 5px 5px;
  animation: l2 1s infinite;
}

.loader-mini::after {
  margin: 2px;
  filter: hue-rotate(45deg);
  background-size: 3px 3px;
  animation-direction: reverse;
}

@keyframes l2 {
  100% {
    transform: rotate(0.5turn);
  }
}
</style>
