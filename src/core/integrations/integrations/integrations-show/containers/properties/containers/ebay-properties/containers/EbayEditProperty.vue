<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import RemotePropertyEdit from "../../remote-properties/components/RemotePropertyEdit.vue";
import { ebayPropertyEditFormConfigConstructor } from "../configs";
import { FieldType } from "../../../../../../../../../shared/utils/constants";
import { propertiesQuerySelector } from "../../../../../../../../../shared/api/queries/properties.js";
import apolloClient from "../../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import { ebayPropertiesQuery } from "../../../../../../../../../shared/api/queries/salesChannels";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { Label } from "../../../../../../../../../shared/components/atoms/label";
import { checkPropertyForDuplicatesMutation } from "../../../../../../../../../shared/api/mutations/properties.js";
import debounce from 'lodash.debounce';
import type { FormConfig } from "../../../../../../../../../shared/components/organisms/general-form/formConfig";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const ebayPropertyId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId?.toString() || '';
const salesChannelId = route.query.salesChannelId?.toString() || '';
const isWizard = route.query.wizard === '1';
const propertyId = route.query.propertyId?.toString() || null;
const remoteCreateValue = route.query.remoteCreateValue?.toString() || null;

const formConfig = ref<FormConfig | null>(null);
const formData = ref<Record<string, any>>({});
const recommendations = ref<{ id: string; name: string }[]>([]);
const loadingRecommendations = ref(false);
const currentMarketplace = ref<{ id: string; name: string } | null>(null);

const breadcrumbsLinks = computed(() => [
  { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
  {
    path: {
      name: 'integrations.integrations.show',
      params: { id: integrationId, type: type.value },
      query: { tab: 'properties' },
    },
    name: t('integrations.show.ebay.title'),
  },
  { name: t('integrations.show.mapProperty') },
]);

const marketplaceLink = computed(() => {
  if (!currentMarketplace.value) {
    return null;
  }

  const query: Record<string, string> = {};
  if (integrationId) {
    query.integrationId = integrationId;
  }

  return {
    name: 'integrations.stores.edit',
    params: { type: type.value, id: currentMarketplace.value.id },
    ...(Object.keys(query).length ? { query } : {}),
  };
});

const generatePropertyLink = computed(() => {
  if (!formData.value || !formConfig.value || !formData.value.type) {
    return null;
  }

  const query: Record<string, string> = {
    remoteRuleId: `${ebayPropertyId.value}__${integrationId}__${salesChannelId}`,
    remoteIntegrationType: type.value,
    type: formData.value.type || '',
    remoteWizard: isWizard ? '1' : '0',
  };

  const propertyName = formData.value.translatedName || formData.value.localizedName;
  if (propertyName) {
    query.name = propertyName;
  }

  if (remoteCreateValue) {
    query.remoteCreateValue = remoteCreateValue;
  }

  return { name: 'properties.properties.create', query };
});

const fetchNextUnmapped = async (): Promise<{ nextId: string | null; last: boolean }> => {
  const { data } = await apolloClient.query({
    query: ebayPropertiesQuery,
    variables: {
      first: 2,
      filter: {
        salesChannel: { id: { exact: salesChannelId } },
        mappedLocally: false,
      },
    },
    fetchPolicy: 'network-only',
  });

  const edges = data?.ebayProperties?.edges || [];
  let nextId: string | null = null;
  for (const edge of edges) {
    if (edge.node.id !== ebayPropertyId.value) {
      nextId = edge.node.id;
      break;
    }
  }
  const last = edges.length === 1 && edges[0].node.id === ebayPropertyId.value;
  return { nextId, last };
};

onMounted(async () => {
  formConfig.value = ebayPropertyEditFormConfigConstructor(t, type.value, ebayPropertyId.value, integrationId);

  if (!formConfig.value) {
    return;
  }

  if (remoteCreateValue) {
    formConfig.value.submitUrl = {
      name: 'integrations.remotePropertySelectValues.edit',
      params: { type: type.value, id: remoteCreateValue },
      query: { integrationId, salesChannelId, ...(isWizard ? { wizard: '1' } : {}) },
    };
    return;
  }

  if (!isWizard) {
    return;
  }

  const { nextId, last } = await fetchNextUnmapped();

  formConfig.value.addSubmitAndContinue = false;
  formConfig.value.cancelUrl = {
    name: 'integrations.integrations.show',
    params: { type: type.value, id: integrationId },
    query: { tab: 'properties' },
  };

  if (nextId) {
    formConfig.value.submitUrl = {
      name: 'integrations.remoteProperties.edit',
      params: { type: type.value, id: nextId },
      query: { integrationId, salesChannelId, wizard: '1' },
    };
    formConfig.value.submitLabel = t('integrations.show.mapping.saveAndMapNext');
  } else if (last) {
    formConfig.value.submitUrl = {
      name: 'integrations.integrations.show',
      params: { type: type.value, id: integrationId },
      query: { tab: 'properties' },
    };
  } else {
    Toast.success(t('integrations.show.mapping.allMappedSuccess'));
    router.push({
      name: 'integrations.integrations.show',
      params: { type: type.value, id: integrationId },
      query: { tab: 'properties' },
    });
  }
});

const handleSetData = (data: any) => {
  if (!formConfig.value) {
    return;
  }

  const marketplace = data?.ebayProperty?.marketplace;
  currentMarketplace.value = marketplace ? { id: marketplace.id, name: marketplace.name } : null;

  const propertyType = data?.ebayProperty?.type;
  if (!propertyType) {
    return;
  }

  const defaultValue = propertyId || data?.ebayProperty?.localInstance?.id || null;

  const field = {
    type: FieldType.Query,
    name: 'localInstance',
    label: t('integrations.show.properties.labels.property'),
    help: t('integrations.show.properties.help.property'),
    labelBy: 'name',
    valueBy: 'id',
    query: propertiesQuerySelector,
    queryVariables: { filter: { type: { exact: propertyType } } },
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
  const searchValue = formData.value.translatedName || formData.value.localizedName;
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

    if (data?.checkPropertyForDuplicates?.duplicateFound) {
      const currentId =
        typeof formData.value.localInstance === 'string'
          ? formData.value.localInstance
          : formData.value.localInstance?.id || null;

      recommendations.value = data.checkPropertyForDuplicates.duplicates
        .filter((p: any) => p.id !== currentId)
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
  () => [formData.value.translatedName, formData.value.localizedName],
  () => {
    debouncedFetchRecommendations();
  },
);

watch(
  () => formData.value.localInstance,
  () => {
    const currentId =
      typeof formData.value.localInstance === 'string'
        ? formData.value.localInstance
        : formData.value.localInstance?.id || null;

    if (!currentId) {
      return;
    }

    recommendations.value = recommendations.value.filter((recommendation) => recommendation.id !== currentId);
  },
  { deep: true },
);

const selectRecommendation = (id: string) => {
  formData.value.localInstance = id;
  recommendations.value = recommendations.value.filter((recommendation) => recommendation.id !== id);
};
</script>

<template>
  <RemotePropertyEdit
    :breadcrumbs-links="breadcrumbsLinks"
    :form-config="formConfig"
    @set-data="handleSetData"
    @form-updated="handleFormUpdate"
  >
    <template #before-form>
      <div v-if="currentMarketplace" class="mb-6">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-2">
          {{ t('integrations.show.propertySelectValues.labels.marketplace') }}
        </Label>
        <Link
          v-if="marketplaceLink"
          :path="marketplaceLink"
          class="text-purple-600 hover:text-purple-500 text-sm"
        >
          {{ currentMarketplace.name }}
        </Link>
        <span v-else class="text-sm text-gray-500">{{ currentMarketplace.name }}</span>
      </div>
    </template>
    <template #additional-button>
      <Link v-if="generatePropertyLink" :path="generatePropertyLink">
        <Button type="button" class="btn btn-info">
          {{ t('integrations.show.generateProperty') }}
        </Button>
      </Link>
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
  border-radius: 50%;
  background:
    radial-gradient(farthest-side, #7c3aed 94%, #0000) top/4px 4px no-repeat,
    conic-gradient(#0000 10%, #7c3aed);
  -webkit-mask: radial-gradient(farthest-side, #0000 calc(100% - 4px), #000 0);
  animation: spinner-rotate 1s infinite linear;
}

@keyframes spinner-rotate {
  100% {
    transform: rotate(1turn);
  }
}
</style>
