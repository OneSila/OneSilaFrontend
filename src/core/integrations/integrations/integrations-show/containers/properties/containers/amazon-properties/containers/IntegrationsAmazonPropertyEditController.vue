<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import { GeneralForm } from "../../../../../../../../../shared/components/organisms/general-form";
import { amazonPropertyEditFormConfigConstructor } from "../configs";
import { FieldType } from "../../../../../../../../../shared/utils/constants";
import { propertiesQuerySelector } from "../../../../../../../../../shared/api/queries/properties.js";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { Label } from "../../../../../../../../../shared/components/atoms/label";
import apolloClient from "../../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import { amazonPropertiesQuery } from "../../../../../../../../../shared/api/queries/salesChannels";
import { checkPropertyForDuplicatesMutation } from "../../../../../../../../../shared/api/mutations/properties.js";
import debounce from 'lodash.debounce';
import { FormConfig } from "../../../../../../../../../shared/components/organisms/general-form/formConfig";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const amazonPropertyId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId?.toString() || '';
const salesChannelId = route.query.salesChannelId?.toString() || '';
const isWizard = route.query.wizard == '1';
const propertyId = route.query.propertyId?.toString() || null;
const amazonCreateValue = route.query.amazonCreateValue?.toString() || null;
const formConfig = ref<FormConfig | null>(null);
const formData = ref<Record<string, any>>({});
const nextWizardId = ref<string | null>(null);

const recommendations = ref<{ id: string; name: string }[]>([]);
const loadingRecommendations = ref(false);

const fetchNextUnmapped = async (): Promise<{ nextId: string | null; last: boolean }> => {
  const { data } = await apolloClient.query({
    query: amazonPropertiesQuery,
    variables: {
      first: 2,
      filter: {
        salesChannel: { id: { exact: salesChannelId } },
        mappedLocally: false,
      },
    },
    fetchPolicy: 'network-only',
  });

  const edges = data?.amazonProperties?.edges || [];
  let nextId: string | null = null;
  for (const edge of edges) {
    if (edge.node.id !== amazonPropertyId.value) {
      nextId = edge.node.id;
      break;
    }
  }
  const last = edges.length === 1 && edges[0].node.id === amazonPropertyId.value;
  return { nextId, last };
};

onMounted(async () => {
  formConfig.value = amazonPropertyEditFormConfigConstructor(t, type.value, amazonPropertyId.value, integrationId, propertyId);

  if (amazonCreateValue) {
    formConfig.value.submitUrl = {
      name: 'integrations.remotePropertySelectValues.edit',
      params: { type: type.value, id: amazonCreateValue },
      query: { integrationId, salesChannelId, ...(isWizard ? { wizard: '1' } : {}) },
    };
    return;
  }

  if (!isWizard) return;

  const { nextId, last } = await fetchNextUnmapped();
  nextWizardId.value = nextId;

  formConfig.value.addSubmitAndContinue = false;
  formConfig.value.cancelUrl = {
    name: 'integrations.integrations.show',
    params: { type: type.value, id: integrationId },
    query: { tab: 'properties' }
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
      query: { tab: 'properties' }
    };
  } else {
    Toast.success(t('integrations.show.mapping.allMappedSuccess'));
    router.push({
      name: 'integrations.integrations.show',
      params: { type: type.value, id: integrationId },
      query: { tab: 'properties' }
    });
  }
});

const handleSetData = (data: any) => {
  const propertyType = data?.amazonProperty?.type;
  if (!formConfig.value || !propertyType) return;

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
    ...(propertyId ? { default: propertyId } : {})
  };

  const index = formConfig.value.fields.findIndex(f => f.name === 'localInstance');
  if (index === -1) {
    formConfig.value.fields.push(field as any);
  } else {
    formConfig.value.fields[index] = field as any;
  }
};

const handleFormUpdate = (form) => {
  formData.value = form;
};

const fetchRecommendations = async () => {
  const searchValue = formData.value.name;
  if (!searchValue) {
    recommendations.value = [];
    return;
  }
  loadingRecommendations.value = true;
  try {
    const { data } = await apolloClient.mutate({
      mutation: checkPropertyForDuplicatesMutation,
      variables: { name: searchValue }
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

watch(() => formData.value.name, () => {
  debouncedFetchRecommendations();
});

watch(() => formData.value.localInstance, () => {
  recommendations.value = recommendations.value.filter(r => r.id !== formData.value.localInstance);
});

const selectRecommendation = (id: string) => {
  formData.value.localInstance = id;
  recommendations.value = recommendations.value.filter(r => r.id !== id);
};

</script>


<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.integrations.show', params: {id: integrationId, type: type}, query: {tab: 'properties'} }, name: t('integrations.show.amazon.title') },
          { name: t('integrations.show.mapProperty') }
        ]" />
    </template>
    <template v-slot:content>
      <GeneralForm v-if="formConfig" :config="formConfig" @form-updated="handleFormUpdate" @set-data="handleSetData" >
        <template #additional-button>
          <Link :path="{ name: 'properties.properties.create', query: {
            amazonRuleId: `${amazonPropertyId}__${integrationId}__${salesChannelId}`,
            name: formData.name,
            type: formData.type,
            amazonWizard: isWizard ? '1' : '0',
            ...(amazonCreateValue ? { amazonCreateValue } : {}) } }">
            <Button type="button" class="btn btn-info">
              {{ t('integrations.show.generateProperty') }}
            </Button>
          </Link>
        </template>
        <template #additional-fields>
          <div class="mt-4 border border-gray-300 bg-gray-50 rounded p-4">
            <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-2">{{ t('integrations.show.propertySelectValues.recommendation.title') }}</Label>
            <div v-if="loadingRecommendations" class="flex items-center gap-2">
              <div class="loader-mini"></div>
              <span class="text-sm text-gray-500">{{ t('integrations.show.propertySelectValues.recommendation.searching') }}</span>
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
              <p v-else class="text-sm text-gray-500">{{ t('integrations.show.propertySelectValues.recommendation.none') }}</p>
            </div>
          </div>
        </template>
      </GeneralForm>
    </template>
  </GeneralTemplate>
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
