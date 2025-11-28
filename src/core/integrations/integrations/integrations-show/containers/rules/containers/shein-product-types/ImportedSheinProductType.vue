<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Breadcrumbs } from "../../../../../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../../../../../shared/templates/GeneralTemplate.vue";
import { TextInput } from "../../../../../../../../shared/components/atoms/input-text";
import { Button } from "../../../../../../../../shared/components/atoms/button";
import { FieldQuery } from "../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import { Link } from "../../../../../../../../shared/components/atoms/link";
import apolloClient from "../../../../../../../../../apollo-client";
import { QueryFormField } from "../../../../../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../../../../../shared/utils/constants";
import { Toast } from "../../../../../../../../shared/modules/toast";
import { CancelButton } from "../../../../../../../../shared/components/atoms/button-cancel";
import { Loader } from "../../../../../../../../shared/components/atoms/loader";
import { processGraphQLErrors } from "../../../../../../../../shared/utils";
import { Icon } from "../../../../../../../../shared/components/atoms/icon";
import { ImageAssigner } from "../../../../../../../../shared/components/organisms/image-assigner";
import { sheinCategoriesQuery } from "../../../../../../../../shared/api/queries/sheinCategories.js";
import {
  sheinProductTypesQuery,
} from "../../../../../../../../shared/api/queries/salesChannels.js";
import {
  suggestSheinCategoryMutation,
  updateSheinProductTypeMutation,
} from "../../../../../../../../shared/api/mutations/salesChannels.js";
import type { NormalizedSuggestion } from '../remote-product-types/configTypes';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const props = defineProps<{
  productType: any | null;
}>();

const productTypeId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId?.toString() || '';
const salesChannelId = route.query.salesChannelId?.toString() || '';
const isWizard = route.query.wizard === '1';

const productName = ref('');
const suggestions = ref<NormalizedSuggestion[]>([]);
const selectedSuggestion = ref<NormalizedSuggestion | null>(null);
const selectedName = ref('');
const selectedCategoryId = ref('');
const selectedRemoteId = ref('');
const manualCategoryId = ref<string | null>(null);
const saving = ref(false);
const loadingSuggestions = ref(false);
const errors = ref<Record<string, string>>({});
const selectedImage = ref<any | null>(null);
const externalImageUrl = ref('');
const siteRemoteId = ref('');

const localInstancePath = computed(() => {
  const id = props.productType?.localInstance?.id;
  return id ? { name: 'properties.rule.show', params: { id } } : null;
});
const localInstanceName = computed(() => props.productType?.localInstance?.value || '');
const marketplaceName = computed(() => props.productType?.marketplace?.name || '');
const marketplaceId = computed(() => props.productType?.marketplace?.id || '');
const integrationTitle = computed(() => t(`integrations.show.${type.value}.title`));

const listingQuery = sheinProductTypesQuery;
const listingQueryKey = 'sheinProductTypes';

watch(
  () => props.productType?.localInstance?.value,
  (value) => {
    productName.value = value || '';
  },
  { immediate: true },
);

watch(
  () => props.productType?.name,
  (value) => {
    if (value) {
      selectedName.value = value;
    }
  },
  { immediate: true },
);

watch(
  () => props.productType?.remoteId,
  (value) => {
    selectedRemoteId.value = value || '';
  },
  { immediate: true },
);

watch(
  () => props.productType?.categoryId,
  (value) => {
    if (value) {
      selectedCategoryId.value = value;
      manualCategoryId.value = value;
    } else {
      selectedCategoryId.value = '';
      manualCategoryId.value = null;
    }
  },
  { immediate: true },
);

watch(
  () => props.productType?.marketplace?.remoteId,
  (value) => {
    siteRemoteId.value = value || '';
  },
  { immediate: true },
);

watch(
  () => externalImageUrl.value,
  (value) => {
    if (value && selectedImage.value) {
      selectedImage.value = null;
    }
  },
);

watch(
  () => selectedImage.value,
  (value) => {
    if (value && externalImageUrl.value) {
      externalImageUrl.value = '';
    }
  },
);

const categoryField = computed<QueryFormField>(() => {
  const filter: Record<string, any> = {};
  if (siteRemoteId.value) {
    filter.siteRemoteId = { exact: siteRemoteId.value };
  }
  return {
    type: FieldType.Query,
    name: 'sheinCategoryId',
    label: t('integrations.show.shein.productRules.labels.category'),
    labelBy: 'name',
    valueBy: 'remoteId',
    query: sheinCategoriesQuery,
    dataKey: 'sheinCategories',
    isEdge: true,
    multiple: false,
    filterable: true,
    minSearchLength: 1,
    disabled: !siteRemoteId.value,
    limit: 100,
    queryVariables: {
      filter,
    },
  };
});

const handleImageChange = (image: any | null) => {
  selectedImage.value = image;
};

const mapSuggestions = (data: Record<string, any>): NormalizedSuggestion[] => {
  const payload = data?.suggestSheinCategory || {};

  if (payload?.siteRemoteId) {
    siteRemoteId.value = payload.siteRemoteId;
  }

  const categories = payload?.categories || [];
  return categories.map((entry: any) => ({
    code: entry?.categoryId || '',
    displayName: entry?.categoryName || entry?.categoryId || '',
    secondary: entry?.categoryPath || '',
    raw: entry,
  }));
};

const selectSuggestion = (suggestion: NormalizedSuggestion | null) => {
  selectedSuggestion.value = suggestion;
  if (suggestion) {
    const raw = suggestion.raw || {};
    selectedCategoryId.value = raw.categoryId || '';
    selectedRemoteId.value = raw.productTypeId || raw.categoryId || '';
    selectedName.value = suggestion.displayName || '';
    manualCategoryId.value = raw.categoryId || null;
  } else {
    selectedCategoryId.value = '';
    selectedRemoteId.value = '';
    manualCategoryId.value = null;
  }
};

const handleEmptySuggestions = (list: NormalizedSuggestion[]) => {
  if (!list.length) {
    errors.value.__all__ = t('integrations.show.productRules.errors.noSuggestions');
  }
};

const buildSuggestionVariables = (name: string | null) => {
  const variables: Record<string, any> = {
    marketplace: { id: marketplaceId.value },
  };

  if (name) {
    variables.name = name;
  }

  if (selectedImage.value?.id) {
    variables.image = { id: selectedImage.value.id };
  }

  const explicitUrl = externalImageUrl.value.trim();
  if (explicitUrl) {
    variables.externalImageUrl = explicitUrl;
  }

  return variables;
};

const runSuggestion = async (name: string | null): Promise<NormalizedSuggestion[]> => {
  const { data } = await apolloClient.mutate({
    mutation: suggestSheinCategoryMutation,
    variables: buildSuggestionVariables(name),
  });

  return mapSuggestions(data || {});
};

const fetchSuggestions = async () => {
  errors.value = {};
  selectSuggestion(null);
  suggestions.value = [];

  const searchTerm = productName.value.trim();
  const hasImage = Boolean(selectedImage.value || externalImageUrl.value.trim());

  if (!searchTerm && !hasImage) {
    errors.value.criteria = t('integrations.show.shein.productRules.errors.missingCriteria');
  }

  if (!marketplaceId.value) {
    errors.value.__all__ = t('integrations.show.productRules.errors.missingMarketplace');
  }

  if (Object.keys(errors.value).length) {
    return;
  }

  loadingSuggestions.value = true;
  try {
    const result = await runSuggestion(searchTerm || null);
    suggestions.value = result;
    handleEmptySuggestions(result);
  } catch (err) {
    const validationErrors = processGraphQLErrors(err, t);
    if (validationErrors['__all__']) {
      Toast.error(validationErrors['__all__']);
    }
  } finally {
    loadingSuggestions.value = false;
  }
};

const fetchNextUnmapped = async (): Promise<{ nextId: string | null; last: boolean }> => {
  const { data } = await apolloClient.query({
    query: listingQuery,
    variables: {
      first: 2,
      filter: {
        salesChannel: { id: { exact: salesChannelId } },
        mappedLocally: false,
      },
    },
    fetchPolicy: 'network-only',
  });
  const edges = data?.[listingQueryKey]?.edges || [];
  let nextId: string | null = null;
  for (const edge of edges) {
    if (edge.node.id !== productTypeId.value) {
      nextId = edge.node.id;
      break;
    }
  }
  const last = edges.length === 1 && edges[0].node.id === productTypeId.value;
  return { nextId, last };
};

const fetchCategoryDetails = async (remoteId: string): Promise<any | null> => {
  if (!siteRemoteId.value) {
    return null;
  }

  const { data } = await apolloClient.query({
    query: sheinCategoriesQuery,
    variables: {
      first: 1,
      filter: {
        siteRemoteId: { exact: siteRemoteId.value },
        remoteId: { exact: remoteId },
      },
    },
    fetchPolicy: 'network-only',
  });

  const edges = data?.sheinCategories?.edges || [];
  return edges.length ? edges[0].node : null;
};

const handleManualCategoryChange = async (value: string | null) => {
  manualCategoryId.value = value;
  if (!value) {
    selectSuggestion(null);
    selectedName.value = '';
    return;
  }

  errors.value = {};
  selectedSuggestion.value = null;
  try {
    const details = await fetchCategoryDetails(value);
    if (!details) {
      Toast.error(t('integrations.show.shein.productRules.errors.categoryLookupFailed'));
      return;
    }
    selectedCategoryId.value = details.remoteId || value;
    selectedRemoteId.value = details.productTypeRemoteId || details.remoteId || '';
    selectedName.value = details.name || '';
    if (details.siteRemoteId) {
      siteRemoteId.value = details.siteRemoteId;
    }
  } catch {
    Toast.error(t('integrations.show.shein.productRules.errors.categoryLookupFailed'));
  }
};

const save = async () => {
  if (!selectedCategoryId.value || !selectedRemoteId.value) {
    errors.value.__all__ = t('integrations.show.productRules.errors.noSelection');
    return;
  }

  saving.value = true;
  try {
    await apolloClient.mutate({
      mutation: updateSheinProductTypeMutation,
      variables: {
        data: {
          id: productTypeId.value,
          remoteId: selectedRemoteId.value,
          categoryId: selectedCategoryId.value,
          imported: true,
        },
      },
    });
    Toast.success(t('shared.alert.toast.submitSuccessUpdate'));

    if (!isWizard) {
      router.push({
        name: 'integrations.integrations.show',
        params: { type: type.value, id: integrationId },
        query: { tab: 'productRules' },
      });
      return;
    }

    const { nextId, last } = await fetchNextUnmapped();
    if (nextId) {
      router.push({
        name: 'integrations.remoteProductTypes.edit',
        params: { type: type.value, id: nextId },
        query: { integrationId, salesChannelId, wizard: '1' },
      });
    } else if (last) {
      router.push({
        name: 'integrations.integrations.show',
        params: { type: type.value, id: integrationId },
        query: { tab: 'productRules' },
      });
    } else {
      router.push({
        name: 'integrations.integrations.show',
        params: { type: type.value, id: integrationId },
        query: { tab: 'productRules' },
      });
    }
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    if (validationErrors['__all__']) {
      Toast.error(validationErrors['__all__']);
    }
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          {
            path: {
              name: 'integrations.integrations.show',
              params: { id: integrationId, type: type },
              query: { tab: 'productRules' },
            },
            name: integrationTitle,
          },
          { name: t('integrations.show.mapProductType') },
        ]"
      />
    </template>
    <template #content>
      <div class="space-y-10 divide-y divide-gray-900/10 mt-4">
        <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <Loader :loading="loadingSuggestions" />
            <div class="px-4 py-6 sm:p-8 space-y-6">
              <div v-if="localInstanceName">
                <label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.show.productRules.labels.productRule') }}
                </label>
                <Link v-if="localInstancePath" :path="localInstancePath">{{ localInstanceName }}</Link>
                <span v-else>{{ localInstanceName }}</span>
              </div>
              <div v-if="selectedName">
                <label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.show.productRules.labels.selectedProductType') }}
                </label>
                <p class="mt-1 text-sm">{{ selectedName }}</p>
              </div>
              <div v-if="marketplaceName">
                <label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.show.propertySelectValues.labels.marketplace') }}
                </label>
                <p class="mt-1 text-sm">{{ marketplaceName }}</p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 md:gap-6 md:divide-x">
                <div class="space-y-4">
                  <h3 class="font-semibold text-lg">
                    {{ t('integrations.show.productRules.titles.suggestUsingName') }}
                  </h3>
                  <div>
                    <label class="font-semibold block text-sm leading-6 text-gray-900">
                      {{ t('integrations.show.productRules.labels.productName') }}
                    </label>
                    <TextInput v-model="productName" class="w-full" />
                    <p class="mt-1 text-sm leading-6 text-gray-400">
                      {{ t('integrations.show.shein.productRules.help.productName') }}
                    </p>
                  </div>
                  <div>
                    <label class="font-semibold block text-sm leading-6 text-gray-900">
                      {{ t('integrations.show.shein.productRules.labels.productImage') }}
                    </label>
                    <ImageAssigner :model-value="selectedImage" @update:model-value="handleImageChange" />
                    <p class="mt-1 text-sm leading-6 text-gray-400">
                      {{ t('integrations.show.shein.productRules.help.productImage') }}
                    </p>
                  </div>
                  <div>
                    <label class="font-semibold block text-sm leading-6 text-gray-900">
                      {{ t('integrations.show.shein.productRules.labels.externalImageUrl') }}
                    </label>
                    <TextInput v-model="externalImageUrl" class="w-full" />
                    <p class="mt-1 text-sm leading-6 text-gray-400">
                      {{ t('integrations.show.shein.productRules.help.externalImageUrl') }}
                    </p>
                  </div>
                  <div>
                    <Button
                      type="button"
                      class="btn btn-secondary"
                      :loading="loadingSuggestions"
                      :disabled="loadingSuggestions"
                      @click="fetchSuggestions"
                    >
                      {{ t('shared.button.search') }}
                    </Button>
                  </div>
                  <div v-if="errors.criteria" class="text-danger text-small blink-animation ml-1 mb-1">
                    <Icon size="sm" name="exclamation-circle" />
                    <span class="ml-1">{{ errors.criteria }}</span>
                  </div>
                  <div v-if="errors.__all__" class="text-danger text-small blink-animation ml-1 mb-1">
                    <Icon size="sm" name="exclamation-circle" />
                    <span class="ml-1">{{ errors.__all__ }}</span>
                  </div>
                  <div v-if="suggestions.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      v-for="s in suggestions"
                      :key="s.code"
                      class="p-4 border rounded cursor-pointer"
                      :class="{ 'border-primary': selectedCategoryId === s.raw?.categoryId }"
                      @click="selectSuggestion(s)"
                    >
                      <strong>{{ s.displayName }}</strong>
                      <p v-if="s.secondary" class="text-sm text-gray-500">{{ s.secondary }}</p>
                    </div>
                  </div>
                </div>
                <div class="space-y-4 md:pl-6">
                  <h3 class="font-semibold text-lg">
                    {{ t('integrations.show.productRules.titles.searchInAll') }}
                  </h3>
                  <div>
                    <label class="font-semibold block text-sm leading-6 text-gray-900">
                      {{ categoryField.label }}
                    </label>
                    <FieldQuery
                      :field="categoryField"
                      :model-value="manualCategoryId"
                      @update:modelValue="handleManualCategoryChange"
                    />
                    <p class="mt-1 text-sm leading-6 text-gray-400">
                      {{ t('integrations.show.shein.productRules.help.category') }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <hr />
            <div class="flex items-center justify-end gap-x-3 px-4 py-4 sm:px-8">
              <Link
                :path="{
                  name: 'integrations.integrations.show',
                  params: { type: type, id: integrationId },
                  query: { tab: 'productRules' },
                }"
              >
                <CancelButton>
                  {{ t('shared.button.back') }}
                </CancelButton>
              </Link>
              <Button
                type="button"
                class="btn btn-primary"
                :loading="saving"
                :disabled="saving"
                @click="save"
              >
                {{ t('shared.button.save') }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </GeneralTemplate>
</template>
