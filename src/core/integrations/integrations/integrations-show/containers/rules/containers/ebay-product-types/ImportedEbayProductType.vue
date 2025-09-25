<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
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
import type { NormalizedSuggestion } from "../remote-product-types/configTypes";
import { ebayImportedRemoteProductTypeConfig } from "../remote-product-types/configs";
import { ebayCategoriesQuery } from "../../../../../../../../shared/api/queries/ebayCategories.js";

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

const state = reactive(ebayImportedRemoteProductTypeConfig.createState());

const localInstancePath = computed(() => {
  const id = props.productType?.localInstance?.id;
  return id ? { name: 'properties.rule.show', params: { id } } : null;
});
const localInstanceName = computed(() => props.productType?.localInstance?.value || '');
const marketplaceName = computed(() => props.productType?.marketplace?.name || '');
const marketplaceId = computed(() => props.productType?.marketplace?.id || '');
const marketplaceDefaultTreeId = computed(
  () => props.productType?.marketplace?.defaultCategoryTreeId || null,
);

const productName = ref('');
const suggestions = ref<NormalizedSuggestion[]>([]);
const selectedSuggestion = ref<NormalizedSuggestion | null>(null);
const selectedCode = ref<string>('');
const selectedName = ref<string>('');
const manualCategoryId = ref<string | null>(null);
const saving = ref(false);
const loadingSuggestions = ref(false);
const errors = ref<Record<string, string>>({});

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
  () => props.productType?.categoryId,
  (value) => {
    if (value) {
      selectedCode.value = value;
      manualCategoryId.value = value;
      state.categoryTreeId = marketplaceDefaultTreeId.value;
    }
  },
  { immediate: true },
);

const listingQuery = computed(() => ebayImportedRemoteProductTypeConfig.listingQuery);
const listingQueryKey = computed(() => ebayImportedRemoteProductTypeConfig.listingQueryKey);
const integrationTitle = computed(() =>
  ebayImportedRemoteProductTypeConfig.getIntegrationTitle(t, type.value),
);

const categoryField = computed<QueryFormField>(() => {
  const filter: Record<string, any> = {};
  if (marketplaceDefaultTreeId.value) {
    filter.marketplaceDefaultTreeId = { exact: marketplaceDefaultTreeId.value };
  }
  return {
    type: FieldType.Query,
    name: 'ebayCategoryId',
    label: t('integrations.show.productRules.labels.ebayCategory'),
    labelBy: 'name',
    valueBy: 'remoteId',
    query: ebayCategoriesQuery,
    dataKey: 'ebayCategories',
    isEdge: false,
    multiple: false,
    filterable: true,
    minSearchLength: 1,
    disabled: !marketplaceDefaultTreeId.value,
    queryVariables: { filter },
  };
});

const selectSuggestion = (suggestion: NormalizedSuggestion | null) => {
  selectedSuggestion.value = suggestion;
  selectedCode.value = suggestion?.code || '';
  selectedName.value = suggestion?.displayName || '';
  if (suggestion) {
    manualCategoryId.value = suggestion.code;
  }
};

const resetState = () => {
  Object.assign(state, ebayImportedRemoteProductTypeConfig.createState());
};

const handleEmptySuggestions = (list: NormalizedSuggestion[]) => {
  if (!list.length) {
    errors.value.__all__ = t('integrations.show.productRules.errors.noSuggestions');
  }
};

const runSuggestion = async (name: string | null): Promise<NormalizedSuggestion[]> => {
  resetState();
  const { data } = await apolloClient.mutate({
    mutation: ebayImportedRemoteProductTypeConfig.suggestMutation,
    variables: ebayImportedRemoteProductTypeConfig.getSuggestionVariables({
      name,
      marketplace: marketplaceId.value,
    }),
  });

  return ebayImportedRemoteProductTypeConfig.mapSuggestions(data || {}, state);
};

const fetchSuggestions = async () => {
  errors.value = {};
  selectSuggestion(null);

  if (!productName.value) {
    errors.value.name = t('shared.validationErrors.required');
  }
  if (!marketplaceId.value) {
    errors.value.__all__ = t('integrations.show.productRules.errors.missingMarketplace');
  }
  if (Object.keys(errors.value).length) {
    return;
  }

  loadingSuggestions.value = true;
  try {
    const result = await runSuggestion(productName.value);
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
    query: listingQuery.value,
    variables: {
      first: 2,
      filter: {
        salesChannel: { id: { exact: salesChannelId } },
        mappedLocally: false,
      },
    },
    fetchPolicy: 'network-only',
  });
  const edges = data?.[listingQueryKey.value]?.edges || [];
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

const fetchCategoryDetails = async (remoteId: string): Promise<{ name?: string } | null> => {
  if (!marketplaceDefaultTreeId.value) {
    return null;
  }

  const { data } = await apolloClient.query({
    query: ebayCategoriesQuery,
    variables: {
      filter: {
        marketplaceDefaultTreeId: { exact: marketplaceDefaultTreeId.value },
        remoteId: { exact: remoteId },
      },
    },
    fetchPolicy: 'network-only',
  });

  const categories = data?.ebayCategories || [];
  return categories.length ? categories[0] : null;
};

const handleManualCategoryChange = async (value: string | null) => {
  manualCategoryId.value = value;
  if (!value) {
    selectedCode.value = '';
    selectedName.value = '';
    selectedSuggestion.value = null;
    return;
  }

  errors.value = {};
  selectedSuggestion.value = null;
  selectedCode.value = value;
  state.categoryTreeId = marketplaceDefaultTreeId.value;
  try {
    const details = await fetchCategoryDetails(value);
    selectedName.value = details?.name || '';
  } catch (error) {
    Toast.error(t('integrations.show.productRules.errors.categoryLookupFailed'));
  }
};

const save = async () => {
  const payload = ebayImportedRemoteProductTypeConfig.buildSaveInput({
    productTypeId: productTypeId.value,
    selectedSuggestion: selectedSuggestion.value,
    selectedCode: selectedCode.value,
    selectedName: selectedName.value,
    state,
  });

  if (!payload) {
    errors.value.__all__ = t('integrations.show.productRules.errors.noSelection');
    return;
  }

  saving.value = true;
  try {
    await apolloClient.mutate(payload);
    Toast.success(t('shared.success'));

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
        name: ebayImportedRemoteProductTypeConfig.editRouteName,
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
                    <div v-if="errors.name" class="text-danger text-small blink-animation ml-1 mb-1">
                      <Icon size="sm" name="exclamation-circle" />
                      <span class="ml-1">{{ errors.name }}</span>
                    </div>
                    <p class="mt-1 text-sm leading-6 text-gray-400">
                      {{ t('integrations.show.productRules.help.productName') }}
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
                  <div v-if="errors.__all__" class="text-danger text-small blink-animation ml-1 mb-1">
                    <Icon size="sm" name="exclamation-circle" />
                    <span class="ml-1">{{ errors.__all__ }}</span>
                  </div>
                  <div v-if="suggestions.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      v-for="s in suggestions"
                      :key="s.code"
                      class="p-4 border rounded cursor-pointer"
                      :class="{ 'border-primary': selectedCode === s.code }"
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
                  </div>
                  <p class="mt-1 text-sm leading-6 text-gray-400">
                    {{ t('integrations.show.productRules.help.ebayCategory') }}
                  </p>
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
