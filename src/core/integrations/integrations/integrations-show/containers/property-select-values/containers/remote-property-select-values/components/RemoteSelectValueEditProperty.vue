<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import debounce from 'lodash.debounce';
import {
  GeneralTemplate,
  Breadcrumbs,
  TextInput,
  Label,
  Flex,
  FlexCell,
  FieldQuery,
  SubmitButtons,
  getEnhancedConfig,
  Link,
  Toast,
  apolloClient,
} from '../sharedImports';
import type { FormConfig, QueryFormField } from '../sharedImports';
import type {
  MapPropertyDataResult,
  MapValueDataResult,
  Recommendation,
  RemoteSelectValueEditPropertyConfig,
  RemoteSelectValueEditPropertyContext,
} from '../types';

const props = defineProps<{ config: RemoteSelectValueEditPropertyConfig }>();

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const valueId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId ? route.query.integrationId.toString() : '';
const salesChannelId = route.query.salesChannelId ? route.query.salesChannelId.toString() : '';
const isWizard = route.query.wizard === '1';

const propertyId = ref<string | null>(null);
const propertyName = ref('');
const marketplaceId = ref<string | null>(null);
const marketplaceName = ref('');
const localPropertyId = ref<string | null>(null);
const localPropertyName = ref('');
const propertyMapped = ref(true);

const placeholderContext: RemoteSelectValueEditPropertyContext = {
  type: type.value,
  valueId: valueId.value,
  integrationId,
  salesChannelId,
  isWizard,
  propertyId: null,
  propertyName: '',
  marketplaceId: null,
  marketplaceName: '',
  localPropertyId: null,
  localPropertyName: '',
  form: {} as Record<string, any>,
  routeQuery: route.query,
};

const initialForm = props.config.formDefaults(placeholderContext);
if (!initialForm[props.config.localInstanceFieldKey]) {
  const queryKey = props.config.localInstanceQueryParamName ?? 'createPropertySelectValueId';
  const initialId = route.query[queryKey] ? route.query[queryKey]!.toString() : null;
  initialForm[props.config.localInstanceFieldKey] = { id: initialId };
}
const form = reactive<Record<string, any>>(initialForm);
placeholderContext.form = form;

const createContext = (): RemoteSelectValueEditPropertyContext => ({
  type: type.value,
  valueId: valueId.value,
  integrationId,
  salesChannelId,
  isWizard,
  propertyId: propertyId.value,
  propertyName: propertyName.value,
  marketplaceId: marketplaceId.value,
  marketplaceName: marketplaceName.value,
  localPropertyId: localPropertyId.value,
  localPropertyName: localPropertyName.value,
  form,
  routeQuery: route.query,
});

const defaultTranslations = props.config.getDefaultTranslations
  ? props.config.getDefaultTranslations(t)
  : {
      submitLabel: t('shared.button.save'),
      cancelLabel: t('shared.button.back'),
      submitAndContinueLabel: t('shared.button.saveAndContinue'),
      deleteLabel: t('shared.button.delete'),
      showLabel: t('shared.button.show'),
    };

const buildFormConfig = () => props.config.createFormConfig({ t, ctx: createContext() });
const enhancedConfig = ref<FormConfig>(getEnhancedConfig(buildFormConfig(), defaultTranslations));

const localInstanceField = ref<QueryFormField | null>(null);
const recommendations = ref<Recommendation[]>([]);
const loadingRecommendations = ref(false);

const remoteFields = computed(() => props.config.remoteFields);
const contextState = computed(() => createContext());

const propertyEditPath = computed(() => (props.config.propertyEditPath ? props.config.propertyEditPath(contextState.value) : null));
const marketplaceEditPath = computed(() => (props.config.marketplaceEditPath ? props.config.marketplaceEditPath(contextState.value) : null));
const localPropertyEditPath = computed(() => (props.config.localPropertyEditPath ? props.config.localPropertyEditPath(contextState.value) : null));
const generateValuePath = computed(() => (props.config.generateValuePath ? props.config.generateValuePath(contextState.value) : null));
const notMappedBannerLink = computed(() => (props.config.notMappedBanner ? props.config.notMappedBanner.linkPath(contextState.value) : null));

const breadcrumbsLinks = computed(() => [
  { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
  { path: props.config.listRoute(contextState.value), name: t(props.config.integrationTitleKey) },
  { name: t('integrations.show.mapSelectValue') },
]);

const updatableForm = computed(() => {
  const result: Record<string, any> = { id: form.id };
  const localInstance = form[props.config.localInstanceFieldKey] || { id: null };
  result[props.config.localInstanceFieldKey] = { id: localInstance?.id || null };
  for (const field of remoteFields.value) {
    const include = field.includeInSubmit !== undefined ? field.includeInSubmit : !field.disabled;
    if (include) {
      result[field.key] = form[field.key];
    }
  }
  return result;
});

const applyValueData = (result: MapValueDataResult | null | undefined) => {
  if (!result) {
    return;
  }
  if (result.form) {
    Object.entries(result.form).forEach(([key, value]) => {
      if (key === props.config.localInstanceFieldKey && typeof value === 'object' && value !== null) {
        form[key] = { ...(form[key] || {}), ...value };
      } else {
        form[key] = value;
      }
    });
  }
  if (result.localInstanceId !== undefined) {
    const currentLocalInstance = form[props.config.localInstanceFieldKey] || { id: null };
    if (!form[props.config.localInstanceFieldKey]) {
      form[props.config.localInstanceFieldKey] = currentLocalInstance;
    }
    if (result.localInstanceId !== null || currentLocalInstance.id === null || currentLocalInstance.id === undefined) {
      form[props.config.localInstanceFieldKey].id = result.localInstanceId;
    }
  }
  if (result.propertyId !== undefined) {
    propertyId.value = result.propertyId;
  }
  if (result.propertyName !== undefined) {
    propertyName.value = result.propertyName || '';
    form[props.config.propertyFieldKey] = result.propertyName || '';
  }
  if (result.marketplaceId !== undefined) {
    marketplaceId.value = result.marketplaceId;
  }
  if (result.marketplaceName !== undefined) {
    marketplaceName.value = result.marketplaceName || '';
    if (props.config.marketplaceFieldKey) {
      form[props.config.marketplaceFieldKey] = result.marketplaceName || '';
    }
  }
};

const applyPropertyData = (result: MapPropertyDataResult | null | undefined) => {
  if (!result) {
    return;
  }
  if (result.mapped !== undefined) {
    propertyMapped.value = result.mapped;
  }
  if (result.localPropertyId !== undefined) {
    localPropertyId.value = result.localPropertyId;
  }
  if (result.localPropertyName !== undefined) {
    localPropertyName.value = result.localPropertyName || '';
  }
  if (localPropertyId.value && props.config.buildLocalInstanceField) {
    localInstanceField.value = props.config.buildLocalInstanceField({ localPropertyId: localPropertyId.value, t, ctx: contextState.value });
  } else {
    localInstanceField.value = null;
  }
};

const fetchRecommendations = async () => {
  if (!props.config.recommendations || !localPropertyId.value) {
    recommendations.value = [];
    return;
  }
  const searchValue = props.config.recommendations.getSearchValue(form);
  if (!searchValue) {
    recommendations.value = [];
    return;
  }
  try {
    loadingRecommendations.value = true;
    const variables = props.config.recommendations.variables({ localPropertyId: localPropertyId.value, searchValue, ctx: contextState.value });
    const { data } = await apolloClient.mutate({
      mutation: props.config.recommendations.mutation,
      variables,
    });
    recommendations.value = props.config.recommendations.mapResult(data, form[props.config.localInstanceFieldKey]?.id || null);
  } finally {
    loadingRecommendations.value = false;
  }
};

const debouncedFetchRecommendations = props.config.recommendations ? debounce(fetchRecommendations, 500) : null;

if (props.config.recommendations) {
  watch(
    () => props.config.recommendations!.watchKeys.map(key => form[key]),
    () => {
      debouncedFetchRecommendations?.();
    }
  );
}

watch(localPropertyId, () => {
  if (props.config.recommendations) {
    debouncedFetchRecommendations?.();
  }
  if (localPropertyId.value && props.config.buildLocalInstanceField) {
    localInstanceField.value = props.config.buildLocalInstanceField({ localPropertyId: localPropertyId.value, t, ctx: contextState.value });
  } else {
    localInstanceField.value = null;
  }
});

watch(
  () => form[props.config.localInstanceFieldKey]?.id,
  () => {
    const currentId = form[props.config.localInstanceFieldKey]?.id;
    recommendations.value = recommendations.value.filter(recommendation => recommendation.id !== currentId);
  }
);

const selectRecommendation = (id: string) => {
  if (!form[props.config.localInstanceFieldKey]) {
    form[props.config.localInstanceFieldKey] = { id };
    return;
  }
  form[props.config.localInstanceFieldKey].id = id;
  recommendations.value = recommendations.value.filter(recommendation => recommendation.id !== id);
};

const fetchNextUnmapped = async (): Promise<{ nextId: string | null; last: boolean }> => {
  if (!props.config.wizard) {
    return { nextId: null, last: false };
  }
  const { data } = await apolloClient.query({
    query: props.config.wizard.query,
    variables: props.config.wizard.variables(contextState.value),
    fetchPolicy: 'network-only',
  });
  const edges = props.config.wizard.extractEdges(data) || [];
  let nextId: string | null = null;
  for (const edge of edges) {
    if (edge?.node?.id && edge.node.id !== valueId.value) {
      nextId = edge.node.id;
      break;
    }
  }
  const last = edges.length === 1 && edges[0]?.node?.id === valueId.value;
  return { nextId, last };
};

onMounted(async () => {
  const valueVariables = props.config.valueQueryVariables
    ? props.config.valueQueryVariables(contextState.value)
    : { id: valueId.value };
  const { data } = await apolloClient.query({
    query: props.config.valueQuery,
    variables: valueVariables,
    fetchPolicy: 'cache-first',
  });
  const valueData = data?.[props.config.valueDataKey];
  applyValueData(props.config.mapValueData(valueData, contextState.value));

  if (propertyId.value && props.config.propertyQuery) {
    const propertyVariables = props.config.propertyQueryVariables
      ? props.config.propertyQueryVariables({ ...contextState.value, propertyId: propertyId.value })
      : { id: propertyId.value };
    const { data: propertyResponse } = await apolloClient.query({
      query: props.config.propertyQuery,
      variables: propertyVariables,
      fetchPolicy: 'cache-first',
    });
    const propertyData = props.config.propertyQueryDataKey ? propertyResponse?.[props.config.propertyQueryDataKey] : propertyResponse;
    applyPropertyData(props.config.mapPropertyData ? props.config.mapPropertyData(propertyData, contextState.value) : undefined);
  }

  if (props.config.recommendations) {
    await fetchRecommendations();
  }

  enhancedConfig.value.cancelUrl = props.config.listRoute(contextState.value);

  if (!isWizard) {
    return;
  }

  const { nextId, last } = await fetchNextUnmapped();

  enhancedConfig.value.addSubmitAndContinue = false;

  if (nextId) {
    enhancedConfig.value.submitUrl = {
      name: 'integrations.remotePropertySelectValues.edit',
      params: { type: type.value, id: nextId },
      query: { integrationId, salesChannelId, wizard: '1' },
    };
    enhancedConfig.value.submitLabel = t(props.config.wizardSubmitLabelKey ?? 'integrations.show.mapping.saveAndMapNext');
    return;
  }

  if (last) {
    enhancedConfig.value.submitUrl = props.config.listRoute(contextState.value);
    return;
  }

  Toast.success(t('integrations.show.mapping.allMappedSuccess'));
  router.push(props.config.listRoute(contextState.value));
});
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs :links="breadcrumbsLinks" />
    </template>
    <template #content>
      <div class="space-y-10 divide-y divide-gray-900/10 mt-4">
        <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div class="px-4 py-6 sm:p-8">
              <div class="grid max-w grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                <div class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">{{ t(props.config.propertyLabelKey) }}</Label>
                    </FlexCell>
                    <FlexCell>
                      <Link v-if="propertyEditPath" :path="propertyEditPath">{{ propertyName }}</Link>
                      <span v-else>{{ propertyName }}</span>
                    </FlexCell>
                  </Flex>
                </div>
                <div v-if="localPropertyName" class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">{{ t(props.config.localPropertyLabelKey ?? 'integrations.show.propertySelectValues.labels.localProperty') }}</Label>
                    </FlexCell>
                    <FlexCell>
                      <Link v-if="localPropertyEditPath" :path="localPropertyEditPath">{{ localPropertyName }}</Link>
                      <span v-else>{{ localPropertyName }}</span>
                    </FlexCell>
                  </Flex>
                </div>
                <div v-if="marketplaceName" class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">{{ t(props.config.marketplaceLabelKey ?? 'integrations.show.propertySelectValues.labels.marketplace') }}</Label>
                    </FlexCell>
                    <FlexCell>
                      <Link v-if="marketplaceEditPath" :path="marketplaceEditPath">{{ marketplaceName }}</Link>
                      <span v-else>{{ marketplaceName }}</span>
                    </FlexCell>
                  </Flex>
                </div>
                <div v-for="field in remoteFields" :key="field.key" class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">{{ t(field.labelKey) }}</Label>
                    </FlexCell>
                    <FlexCell>
                      <TextInput v-model="form[field.key]" :disabled="field.disabled" class="w-full" />
                    </FlexCell>
                    <FlexCell v-if="field.helpKey">
                      <p class="mt-1 text-sm leading-6 text-gray-400">{{ t(field.helpKey) }}</p>
                    </FlexCell>
                  </Flex>
                </div>
                <div
                  v-if="props.config.notMappedBanner && !propertyMapped"
                  class="col-span-full p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
                  role="alert"
                >
                  <span class="font-medium flex items-center gap-1">
                    ⚠️ {{ t(props.config.notMappedBanner.titleKey) }}
                  </span>
                  <Link v-if="notMappedBannerLink" :path="notMappedBannerLink" class="underline">
                    {{ t(props.config.notMappedBanner.contentKey) }}
                  </Link>
                </div>
                <div v-else-if="localInstanceField" class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('properties.values.title') }}</Label>
                    </FlexCell>
                    <FlexCell>
                      <FieldQuery
                        :field="localInstanceField as QueryFormField"
                        v-model="form[props.config.localInstanceFieldKey].id"
                        @update:modelValue="form[props.config.localInstanceFieldKey].id = $event"
                      />
                    </FlexCell>
                    <FlexCell>
                      <p class="mt-1 text-sm leading-6 text-gray-400">{{ t(props.config.localPropertyHelpKey ?? 'integrations.show.propertySelectValues.help.selectValue') }}</p>
                    </FlexCell>
                  </Flex>
                  <div v-if="props.config.recommendations" class="mt-4 border border-gray-300 bg-gray-50 rounded p-4">
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
                          {{ item.value }}
                        </button>
                      </div>
                      <p v-else class="text-sm text-gray-500">{{ t('integrations.show.propertySelectValues.recommendation.none') }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <SubmitButtons :config="enhancedConfig" :form="updatableForm">
              <template #additional-button>
                <slot name="additional-button" :generate-value-path="generateValuePath" :context="contextState" />
              </template>
            </SubmitButtons>
          </div>
        </div>
      </div>
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
