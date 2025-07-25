<script setup lang="ts">
import {ref, computed} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';
import {Breadcrumbs} from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import {TextInput} from "../../../../../../../../../shared/components/atoms/input-text";
import {Button} from "../../../../../../../../../shared/components/atoms/button";
import {FieldQuery} from "../../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import {salesChannelViewsQuery} from "../../../../../../../../../shared/api/queries/salesChannels.js";
import {suggestAmazonProductTypeMutation, updateAmazonProductTypeMutation} from "../../../../../../../../../shared/api/mutations/salesChannels.js";
import {listingQuery} from '../configs';
import {Link} from "../../../../../../../../../shared/components/atoms/link";
import apolloClient from "../../../../../../../../../../apollo-client";
import {QueryFormField} from "../../../../../../../../../shared/components/organisms/general-form/formConfig";
import {FieldType} from "../../../../../../../../../shared/utils/constants";
import {Toast} from "../../../../../../../../../shared/modules/toast";
import {CancelButton} from "../../../../../../../../../shared/components/atoms/button-cancel";
import { Loader } from "../../../../../../../../../shared/components/atoms/loader";
import { processGraphQLErrors } from "../../../../../../../../../shared/utils";
import {Icon} from "../../../../../../../../../shared/components/atoms/icon";
import {Selector} from "../../../../../../../../../shared/components/atoms/selector";

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

const marketplaceField: QueryFormField = {
  type: FieldType.Query,
  name: 'marketplace',
  label: t('integrations.show.propertySelectValues.labels.marketplace'),
  labelBy: 'name',
  valueBy: 'id',
  query: salesChannelViewsQuery,
  dataKey: 'salesChannelViews',
  isEdge: true,
  multiple: false,
  filterable: true,
  queryVariables: {filters: { salesChannel: { id: { exact: salesChannelId } } } }
};

const productName = ref('');
const marketplace = ref('');
const suggestions = ref<any[]>([]);
const allProductTypes = ref<any[]>([]);
const selectedCode = ref<string>('');
const selectedName = ref('');
const saving = ref(false);
const loadingSuggestions = ref(false);
const errors = ref<Record<string, string>>({});
const nextWizardId = ref<string | null>(null);

const fetchSuggestions = async () => {
  errors.value = {};
  if (!productName.value) {
    errors.value.name = t('shared.validationErrors.required');
  }
  if (!marketplace.value) {
    errors.value.marketplace = t('shared.validationErrors.required');
  }
  if (Object.keys(errors.value).length) return;

  loadingSuggestions.value = true;
  try {
    const { data } = await apolloClient.mutate({
      mutation: suggestAmazonProductTypeMutation,
      variables: {
        name: productName.value,
        marketplace: { id: marketplace.value }
      }
    });
    suggestions.value = data?.suggestAmazonProductType?.productTypes || [];
    if (!suggestions.value.length) {
      errors.value.__all__ = t('integrations.show.productRules.errors.noSuggestions');
    }
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
  if (!marketplace.value) {
    errors.value.marketplace = t('shared.validationErrors.required');
  }
  if (Object.keys(errors.value).length) return;

  loadingSuggestions.value = true;
  try {
    const { data } = await apolloClient.mutate({
      mutation: suggestAmazonProductTypeMutation,
      variables: {
        name: null,
        marketplace: { id: marketplace.value }
      }
    });

    console.log(data?.suggestAmazonProductType?.productTypes)
    allProductTypes.value = data?.suggestAmazonProductType?.productTypes || [];
    if (!allProductTypes.value.length) {
      errors.value.__all__ = t('integrations.show.productRules.errors.noSuggestions');
    }
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
  const {data} = await apolloClient.query({
    query: listingQuery,
    variables: {
      first: 2,
      filter: {
        salesChannel: {id: {exact: salesChannelId}},
        mappedLocally: false,
      },
    },
    fetchPolicy: 'network-only',
  });
  const edges = data?.amazonProductTypes?.edges || [];
  let nextId: string | null = null;
  for (const edge of edges) {
    if (edge.node.id !== productTypeId.value) {
      nextId = edge.node.id;
      break;
    }
  }
  const last = edges.length === 1 && edges[0].node.id === productTypeId.value;
  return {nextId, last};
};

const save = async () => {
  if (!selectedCode.value) return;
  saving.value = true;
  try {
    await apolloClient.mutate({
      mutation: updateAmazonProductTypeMutation,
      variables: { data: { id: productTypeId.value, productTypeCode: selectedCode.value, name: selectedName.value, imported: true } }
    });
    Toast.success(t('shared.success'));

    if (!isWizard) {
      router.push({ name: 'integrations.integrations.show', params: { type: type.value, id: integrationId }, query: { tab: 'productRules' } });
      return;
    }

    const {nextId, last} = await fetchNextUnmapped();
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
      <Breadcrumbs :links="[{ path: { name: 'integrations.integrations.list' }, name: t('integrations.title') }, { path: { name: 'integrations.integrations.show', params: {id: integrationId, type: type}, query: {tab: 'productRules'} }, name: t('integrations.show.amazon.title') }, { name: t('integrations.show.mapProductType') }]" />
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
                    <div v-for="s in suggestions" :key="s.name" class="p-4 border rounded cursor-pointer" :class="{ 'border-primary': selectedCode === s.name }" @click="selectedCode = s.name; selectedName = s.displayName">
                      <strong>{{ s.displayName }}</strong>
                      <p class="text-sm text-gray-500">{{ s.name }}</p>
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
                    class="max-h-10 "
                    v-if="allProductTypes.length"
                    v-model="selectedCode"
                    :options="allProductTypes"
                    label-by="displayName"
                    value-by="name"
                    filterable
                    @update:model-value="val => { selectedCode = val; const item = allProductTypes.find(p => p.name === val); selectedName = item ? item.displayName : '' }"
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
