<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Breadcrumbs } from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import { TextInput } from "../../../../../../../../../shared/components/atoms/input-text";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { FieldQuery } from "../../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import { salesChannelViewsQuerySelector } from "../../../../../../../../../shared/api/queries/salesChannels.js";
import {
  suggestAmazonProductTypeMutation,
  suggestEbayCategoryMutation,
  updateAmazonProductTypeMutation,
  updateEbayProductTypeMutation,
} from "../../../../../../../../../shared/api/mutations/salesChannels.js";
import { getListingQuery, getListingQueryKey } from '../configs';
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import apolloClient from "../../../../../../../../../../apollo-client";
import { QueryFormField } from "../../../../../../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../../../../../../shared/utils/constants";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import { CancelButton } from "../../../../../../../../../shared/components/atoms/button-cancel";
import { Loader } from "../../../../../../../../../shared/components/atoms/loader";
import { processGraphQLErrors } from "../../../../../../../../../shared/utils";
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { Selector } from "../../../../../../../../../shared/components/atoms/selector";
import { IntegrationTypes } from "../../../../../../integrations";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();

const props = defineProps<{ productType: any | null }>();

const productTypeId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId?.toString() || '';
const salesChannelId = route.query.salesChannelId?.toString() || '';
const isWizard = route.query.wizard === '1';

const localInstancePath = computed(() => {
  const id = props.productType?.localInstance?.id;
  return id ? { name: 'properties.rule.show', params: { id } } : null;
});
const localInstanceName = computed(() => props.productType?.localInstance?.value || '');

const marketplaceField = computed<QueryFormField>(() => ({
  type: FieldType.Query,
  name: 'marketplace',
  label: t('integrations.show.propertySelectValues.labels.marketplace'),
  labelBy: 'name',
  valueBy: 'id',
  query: salesChannelViewsQuerySelector,
  dataKey: 'salesChannelViews',
  isEdge: true,
  multiple: false,
  filterable: true,
  queryVariables: { filters: { salesChannel: { id: { exact: salesChannelId } } } },
}));

type NormalizedSuggestion = {
  code: string;
  displayName: string;
  secondary?: string;
  raw: Record<string, any>;
};

const productName = ref('');
const marketplace = ref(salesChannelId);
const suggestions = ref<NormalizedSuggestion[]>([]);
const allProductTypes = ref<NormalizedSuggestion[]>([]);
const selectedCode = ref<string>('');
const selectedName = ref<string>('');
const selectedSuggestion = ref<NormalizedSuggestion | null>(null);
const categoryTreeId = ref<string | null>(null);
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

const listingQuery = computed(() => getListingQuery(type.value));
const listingQueryKey = computed(() => getListingQueryKey(type.value));
const isAmazon = computed(() => type.value === IntegrationTypes.Amazon);
const integrationTitle = computed(() => t(`integrations.show.${type.value}.title`));

const selectSuggestion = (suggestion: NormalizedSuggestion | null) => {
  selectedSuggestion.value = suggestion;
  selectedCode.value = suggestion?.code || '';
  selectedName.value = suggestion?.displayName || '';
};

const handleEmptySuggestions = (list: NormalizedSuggestion[]) => {
  if (!list.length) {
    errors.value.__all__ = t('integrations.show.productRules.errors.noSuggestions');
  }
};

const runSuggestion = async (name: string | null): Promise<NormalizedSuggestion[]> => {
  const { data } = await apolloClient.mutate({
    mutation: isAmazon.value ? suggestAmazonProductTypeMutation : suggestEbayCategoryMutation,
    variables: {
      name,
      marketplace: { id: marketplace.value },
    },
  });

  if (isAmazon.value) {
    categoryTreeId.value = null;
    const productTypes = data?.suggestAmazonProductType?.productTypes || [];
    return productTypes.map((entry: any) => ({
      code: entry.name,
      displayName: entry.displayName,
      secondary: entry.name,
      raw: entry,
    }));
  }

  const payload = data?.suggestEbayCategory || {};
  categoryTreeId.value = payload?.categoryTreeId ?? null;
  const categories = payload?.categories || [];
  return categories.map((entry: any) => ({
    code: entry.categoryId,
    displayName: entry.categoryName,
    secondary: entry.categoryPath,
    raw: entry,
  }));
};

const fetchSuggestions = async () => {
  errors.value = {};
  selectSuggestion(null);
  if (!productName.value) {
    errors.value.name = t('shared.validationErrors.required');
  }
  if (!marketplace.value) {
    errors.value.marketplace = t('shared.validationErrors.required');
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

const fetchAllProductTypes = async () => {
  errors.value = {};
  selectSuggestion(null);
  if (!marketplace.value) {
    errors.value.marketplace = t('shared.validationErrors.required');
  }
  if (Object.keys(errors.value).length) {
    return;
  }

  loadingSuggestions.value = true;
  try {
    const result = await runSuggestion(null);
    allProductTypes.value = result;
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

const save = async () => {
  if (!selectedCode.value) return;
  saving.value = true;
  try {
    if (isAmazon.value) {
      await apolloClient.mutate({
        mutation: updateAmazonProductTypeMutation,
        variables: {
          data: {
            id: productTypeId.value,
            productTypeCode: selectedCode.value,
            name: selectedName.value,
            imported: true,
          },
        },
      });
    } else {
      const raw = selectedSuggestion.value?.raw || {};
      const input: Record<string, unknown> = {
        id: productTypeId.value,
        imported: true,
      };

      if (raw.categoryId || selectedSuggestion.value?.code) {
        input.categoryId = raw.categoryId ?? selectedSuggestion.value?.code;
      }
      if (categoryTreeId.value) {
        input.categoryTreeId = categoryTreeId.value;
      }
      if (raw.categoryPath) {
        input.categoryPath = raw.categoryPath;
      }
      if (raw.categoryName || selectedSuggestion.value?.displayName) {
        input.name = raw.categoryName ?? selectedSuggestion.value?.displayName;
      }
      if (selectedName.value || raw.categoryName) {
        input.translatedName = selectedName.value || raw.categoryName;
      }

      await apolloClient.mutate({
        mutation: updateEbayProductTypeMutation,
        variables: { data: input },
      });
    }
    Toast.success(t('shared.success'));

    if (!isWizard) {
      router.push({ name: 'integrations.integrations.show', params: { type: type.value, id: integrationId }, query: { tab: 'productRules' } });
      return;
    }

    const { nextId, last } = await fetchNextUnmapped();
    if (nextId) {
      router.push({ name: 'integrations.amazonProductTypes.edit', params: { type: type.value, id: nextId }, query: { integrationId, salesChannelId, wizard: '1' } });
    } else if (last) {
      router.push({ name: 'integrations.integrations.show', params: { type: type.value, id: integrationId }, query: { tab: 'productRules' } });
    } else {
      router.push({ name: 'integrations.integrations.show', params: { type: type.value, id: integrationId }, query: { tab: 'productRules' } });
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
      <Breadcrumbs :links="[{ path: { name: 'integrations.integrations.list' }, name: t('integrations.title') }, { path: { name: 'integrations.integrations.show', params: {id: integrationId, type: type}, query: {tab: 'productRules'} }, name: integrationTitle }, { name: t('integrations.show.mapProductType') }]" />
    </template>
    <template #content>
      <div class="space-y-10 divide-y divide-gray-900/10 mt-4">
        <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <Loader :loading="loadingSuggestions" />
            <div class="px-4 py-6 sm:p-8 space-y-6">
              <div v-if="localInstanceName">
                <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('integrations.show.productRules.labels.productRule') }}</label>
                <Link v-if="localInstancePath" :path="localInstancePath">{{ localInstanceName }}</Link>
                <span v-else>{{ localInstanceName }}</span>
              </div>
              <div v-if="selectedName">
                <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('integrations.show.productRules.labels.selectedProductType') }}</label>
                <p class="mt-1 text-sm">{{ selectedName }}</p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 md:gap-6 md:divide-x">
                <div class="space-y-4">
                  <h3 class="font-semibold text-lg">{{ t('integrations.show.productRules.titles.suggestUsingName') }}</h3>
                  <div>
                    <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('integrations.show.productRules.labels.productName') }}</label>
                    <TextInput v-model="productName" class="w-full" />
                    <div v-if="errors.name" class="text-danger text-small blink-animation ml-1 mb-1">
                      <Icon size="sm" name="exclamation-circle" />
                      <span class="ml-1">{{ errors.name }}</span>
                    </div>
                    <p class="mt-1 text-sm leading-6 text-gray-400">{{ t('integrations.show.productRules.help.productName') }}</p>
                  </div>
                  <div>
                    <label class="font-semibold block text-sm leading-6 text-gray-900">{{ marketplaceField.label }}</label>
                    <FieldQuery :field="marketplaceField" v-model="marketplace" />
                    <div v-if="errors.marketplace" class="text-danger text-small blink-animation ml-1 mb-1">
                      <Icon size="sm" name="exclamation-circle" />
                      <span class="ml-1">{{ errors.marketplace }}</span>
                    </div>
                  </div>
                  <div>
                    <Button type="button" class="btn btn-secondary" :loading="loadingSuggestions" :disabled="loadingSuggestions" @click="fetchSuggestions">{{ t('shared.button.search') }}</Button>
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
                  <h3 class="font-semibold text-lg">{{ t('integrations.show.productRules.titles.searchInAll') }}</h3>
                  <div>
                    <label class="font-semibold block text-sm leading-6 text-gray-900">{{ marketplaceField.label }}</label>
                    <FieldQuery :field="marketplaceField" v-model="marketplace" />
                    <div v-if="errors.marketplace" class="text-danger text-small blink-animation ml-1 mb-1">
                      <Icon size="sm" name="exclamation-circle" />
                      <span class="ml-1">{{ errors.marketplace }}</span>
                    </div>
                  </div>
                  <div>
                    <Button type="button" class="btn btn-secondary" :loading="loadingSuggestions" :disabled="loadingSuggestions" @click="fetchAllProductTypes">{{ t('shared.button.search') }}</Button>
                  </div>
                  <Selector
                    class="max-h-10"
                    v-if="allProductTypes.length"
                    v-model="selectedCode"
                    :options="allProductTypes"
                    label-by="displayName"
                    value-by="code"
                    filterable
                    @update:model-value="val => selectSuggestion(allProductTypes.find(p => p.code === val) || null)"
                  />
                </div>
              </div>
            </div>
            <hr />
            <div class="flex items-center justify-end gap-x-3 px-4 py-4 sm:px-8">
              <Link :path="{ name: 'integrations.integrations.show', params: { type: type, id: integrationId }, query: { tab: 'productRules' } }">
                <CancelButton>
                  {{ t('shared.button.back') }}
                </CancelButton>
              </Link>
              <Button type="button" class="btn btn-primary" :loading="saving" :disabled="saving" @click="save">{{ t('shared.button.save') }}</Button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </GeneralTemplate>
</template>
