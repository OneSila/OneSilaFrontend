<script setup lang="ts">
import { onMounted, ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import { TextInput } from "../../../../../../../../../shared/components/atoms/input-text";
import { Label } from "../../../../../../../../../shared/components/atoms/label";
import { Flex, FlexCell } from "../../../../../../../../../shared/components/layouts/flex";
import { FieldQuery } from "../../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import { SubmitButtons } from "../../../../../../../../../shared/components/organisms/general-form/containers/submit-buttons";
import { FormConfig, getEnhancedConfig, FormConfigDefaultTranslations, QueryFormField } from "../../../../../../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../../../../../../shared/utils/constants";
import { propertySelectValuesQuery } from "../../../../../../../../../shared/api/queries/properties.js";
import { useRoute } from "vue-router";
import { amazonPropertySelectValueEditFormConfigConstructor, listingQuery } from "../configs";
import { getAmazonPropertySelectValueQuery, getAmazonPropertyQuery } from "../../../../../../../../../shared/api/queries/salesChannels";
import apolloClient from "../../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { LocalLoader } from "../../../../../../../../../shared/components/atoms/local-loader";
import { checkPropertySelectValueForDuplicatesMutation } from "../../../../../../../../../shared/api/mutations/properties.js";
import debounce from 'lodash.debounce';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const valueId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId ? route.query.integrationId.toString() : '';
const salesChannelId = route.query.salesChannelId ? route.query.salesChannelId.toString() : '';
const isWizard = route.query.wizard === '1';
const nextWizardId = ref<string | null>(null);

const amazonPropertyId = ref<string | null>(null);
const amazonPropertyName = ref('');
const marketplaceId = ref<string | null>(null);
const localPropertyId = ref<string | null>(null);
const localPropertyName = ref('');
const propertyMapped = ref(true);

const formConfig: FormConfig = amazonPropertySelectValueEditFormConfigConstructor(t, type.value, valueId.value, integrationId);
const defaultTranslations: FormConfigDefaultTranslations = {
  submitLabel: t('shared.button.save'),
  cancelLabel: t('shared.button.back'),
  submitAndContinueLabel: t('shared.button.saveAndContinue'),
  deleteLabel: t('shared.button.delete'),
  showLabel: t('shared.button.show'),
};
const enhancedConfig = ref<FormConfig>(getEnhancedConfig(formConfig, defaultTranslations));

const form = reactive({
  id: valueId.value,
  amazonProperty: '',
  marketplace: '',
  remoteValue: '',
  remoteName: '',
  translatedRemoteName: '',
  localInstance: { id: route.query.createPropertySelectValueId ? route.query.createPropertySelectValueId.toString() : null },
});

const updatableForm = computed(() => ({
  id: form.id,
  remoteName: form.remoteName,
  translatedRemoteName: form.translatedRemoteName,
  localInstance: { id: form.localInstance.id },
}));

const localInstanceField = ref<QueryFormField | null>(null);

const recommendations = ref<{ id: string; value: string }[]>([]);
const loadingRecommendations = ref(false);

const amazonPropertyEditPath = computed(() =>
  amazonPropertyId.value
    ? {
        name: 'integrations.amazonProperties.edit',
        params: { type: type.value, id: amazonPropertyId.value },
        query: { integrationId, salesChannelId }
      }
    : null
);

const marketplaceEditPath = computed(() =>
  marketplaceId.value
    ? {
        name: 'integrations.stores.edit',
        params: { type: type.value, id: marketplaceId.value },
        query: { integrationId }
      }
    : null
);

const localPropertyEditPath = computed(() =>
  localPropertyId.value
    ? { name: 'properties.properties.edit', params: { id: localPropertyId.value } }
    : null
);

const generateValuePath = computed(() =>
  localPropertyId.value
    ? {
        name: 'properties.values.create',
        query: {
          propertyId: localPropertyId.value,
          amazonSelectValueId: `${valueId.value}__${integrationId}__${salesChannelId}__${isWizard ? '1' : '0'}`,
          value: form.translatedRemoteName || form.remoteName,
        },
      }
    : null
);

const fetchRecommendations = async () => {
  if (!localPropertyId.value) return;
  const searchValue = form.translatedRemoteName || form.remoteName;
  if (!searchValue) {
    recommendations.value = [];
    return;
  }
  try {
    loadingRecommendations.value = true;
    const { data } = await apolloClient.mutate({
      mutation: checkPropertySelectValueForDuplicatesMutation,
      variables: { property: { id: localPropertyId.value }, value: searchValue },
    });
    if (data && data.checkPropertySelectValueForDuplicates && data.checkPropertySelectValueForDuplicates.duplicateFound) {
      recommendations.value = data.checkPropertySelectValueForDuplicates.duplicates.map((p: any) => ({
        id: p.id,
        value: p.value || p.id,
      }));
    } else {
      recommendations.value = [];
    }
  } finally {
    loadingRecommendations.value = false;
  }
};

const debouncedFetchRecommendations = debounce(fetchRecommendations, 500);

watch(() => [form.remoteName, form.translatedRemoteName], () => {
  debouncedFetchRecommendations();
});

watch(localPropertyId, () => {
  debouncedFetchRecommendations();
});

onMounted(async () => {
  const { data } = await apolloClient.query({
    query: getAmazonPropertySelectValueQuery,
    variables: { id: valueId.value },
    fetchPolicy: 'network-only'
  });

  const valueData = data?.amazonPropertySelectValue;
  amazonPropertyId.value = valueData?.amazonProperty?.id || null;
  amazonPropertyName.value = valueData?.amazonProperty?.name || '';
  marketplaceId.value = valueData?.marketplace?.id || null;

  form.amazonProperty = amazonPropertyName.value;
  form.marketplace = valueData?.marketplace?.name || '';
  form.remoteValue = valueData?.remoteValue || '';
  form.remoteName = valueData?.remoteName || '';
  form.translatedRemoteName = valueData?.translatedRemoteName || '';

  if (valueData?.localInstance?.id) {
      form.localInstance.id = valueData?.localInstance?.id;

  }

  if (amazonPropertyId.value) {
    const { data: propData } = await apolloClient.query({
      query: getAmazonPropertyQuery,
      variables: { id: amazonPropertyId.value },
      fetchPolicy: 'network-only'
    });
    propertyMapped.value = propData?.amazonProperty?.mappedLocally ?? true;
    localPropertyId.value = propData?.amazonProperty?.localInstance?.id || null;
    localPropertyName.value = propData?.amazonProperty?.localInstance?.name || '';
    if (localPropertyId.value) {

     localInstanceField.value = {
        type: FieldType.Query,
        name: 'localInstance',
        label: t('properties.values.title'),
        labelBy: 'value',
        valueBy: 'id',
        query: propertySelectValuesQuery,
        queryVariables: { filter: { property: { id: { exact: localPropertyId.value } } } },
        dataKey: 'propertySelectValues',
        isEdge: true,
        multiple: false,
        filterable: true,
        formMapIdentifier: 'id',
        dropdownPosition: 'bottom'
      }
    }
  }

  await fetchRecommendations();

  if (!isWizard) return;

  const { nextId, last } = await fetchNextUnmapped();
  nextWizardId.value = nextId;

  enhancedConfig.value.addSubmitAndContinue = false;
  enhancedConfig.value.cancelUrl = {
    name: 'integrations.integrations.show',
    params: { type: type.value, id: integrationId },
    query: { tab: 'propertySelectValues' }
  };

  if (nextId) {
    enhancedConfig.value.submitUrl = {
      name: 'integrations.amazonPropertySelectValues.edit',
      params: { type: type.value, id: nextId },
      query: { integrationId, salesChannelId, wizard: '1' },
    };
    enhancedConfig.value.submitLabel = t('integrations.show.mapping.saveAndMapNext');
  } else if (last) {
    enhancedConfig.value.submitUrl = {
      name: 'integrations.integrations.show',
      params: { type: type.value, id: integrationId },
      query: { tab: 'propertySelectValues' }
    };
  } else {
    Toast.success(t('integrations.show.mapping.allMappedSuccess'));
    router.push({ name: 'integrations.integrations.show', params: { type: type.value, id: integrationId }, query: { tab: 'propertySelectValues' } });
  }
});

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


  const edges = data?.amazonPropertySelectValues?.edges || [];
  let nextId: string | null = null;
  for (const edge of edges) {
    if (edge.node.id !== valueId.value) {
      nextId = edge.node.id;
      break;
    }
  }
  const last = edges.length === 1 && edges[0].node.id === valueId.value;
  return { nextId, last };
};

</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.integrations.show', params: {id: integrationId, type: type}, query: {tab: 'propertySelectValues'} }, name: t('integrations.show.amazon.title') },
          { name: t('integrations.show.mapSelectValue') }
        ]" />
    </template>
    <template v-slot:content>
      <div class="space-y-10 divide-y divide-gray-900/10 mt-4">
        <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div class="px-4 py-6 sm:p-8">
              <div class="grid max-w grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                <div class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('integrations.show.propertySelectValues.labels.amazonProperty') }}</Label>
                    </FlexCell>
                    <FlexCell>
                      <Link v-if="amazonPropertyEditPath" :path="amazonPropertyEditPath">{{ form.amazonProperty }}</Link>
                      <span v-else>{{ form.amazonProperty }}</span>
                    </FlexCell>
                  </Flex>
                </div>
                <div v-if="localPropertyName" class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('integrations.show.propertySelectValues.labels.localProperty') }}</Label>
                    </FlexCell>
                    <FlexCell>
                      <Link v-if="localPropertyEditPath" :path="localPropertyEditPath">{{ localPropertyName }}</Link>
                      <span v-else>{{ localPropertyName }}</span>
                    </FlexCell>
                  </Flex>
                </div>
                <div class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('integrations.show.propertySelectValues.labels.marketplace') }}</Label>
                    </FlexCell>
                    <FlexCell>
                      <Link v-if="marketplaceEditPath" :path="marketplaceEditPath">{{ form.marketplace }}</Link>
                      <span v-else>{{ form.marketplace }}</span>
                    </FlexCell>
                  </Flex>
                </div>
                <div class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('integrations.show.propertySelectValues.labels.remoteValue') }}</Label>
                    </FlexCell>
                    <FlexCell>
                      <TextInput v-model="form.remoteValue" disabled class="w-full" />
                    </FlexCell>
                    <FlexCell>
                      <p class="mt-1 text-sm leading-6 text-gray-400">{{ t('integrations.show.propertySelectValues.help.remoteValue') }}</p>
                    </FlexCell>
                  </Flex>
                </div>
                <div class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('shared.labels.name') }}</Label>
                    </FlexCell>
                    <FlexCell>
                      <TextInput v-model="form.remoteName" class="w-full" />
                    </FlexCell>
                    <FlexCell>
                      <p class="mt-1 text-sm leading-6 text-gray-400">{{ t('integrations.show.propertySelectValues.help.remoteName') }}</p>
                    </FlexCell>
                  </Flex>
                </div>
                <div class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('integrations.show.propertySelectValues.labels.translatedRemoteName') }}</Label>
                    </FlexCell>
                    <FlexCell>
                      <TextInput v-model="form.translatedRemoteName" class="w-full" />
                    </FlexCell>
                    <FlexCell>
                      <p class="mt-1 text-sm leading-6 text-gray-400">{{ t('integrations.show.propertySelectValues.help.translatedRemoteName') }}</p>
                    </FlexCell>
                  </Flex>
                </div>
                <div v-if="!propertyMapped" class="col-span-full p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                  <span class="font-medium flex items-center gap-1">
                    ⚠️ {{ t('integrations.show.propertySelectValues.notMappedBanner.title') }}
                  </span>
                  <Link :path="{ name: 'integrations.amazonProperties.edit', params: { type: type, id: amazonPropertyId }, query: { integrationId, salesChannelId, amazonCreateValue: valueId } }" class="underline">
                    {{ t('integrations.show.propertySelectValues.notMappedBanner.content') }}
                  </Link>
                </div>
                <div v-else class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('properties.values.title') }}</Label>
                    </FlexCell>
                    <FlexCell>
                      <FieldQuery v-if="localInstanceField" :field="localInstanceField as QueryFormField" v-model="form.localInstance.id" @update:modelValue="form.localInstance.id = $event" />
                    </FlexCell>
                    <FlexCell>
                      <p class="mt-1 text-sm leading-6 text-gray-400">{{ t('integrations.show.propertySelectValues.help.selectValue') }}</p>
                    </FlexCell>
                  </Flex>
                  <div class="mt-4 border border-gray-300 bg-gray-50 rounded p-4">
                    <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-2">{{ t('integrations.show.propertySelectValues.recommendation.title') }}</Label>
                    <div v-if="loadingRecommendations" class="flex items-center gap-2">
                      <LocalLoader :loading="true" />
                      <span class="text-sm text-gray-500">{{ t('integrations.show.propertySelectValues.recommendation.searching') }}</span>
                    </div>
                    <div v-else>
                      <div v-if="recommendations.length" class="flex flex-wrap gap-2">
                        <button
                          v-for="item in recommendations"
                          :key="item.id"
                          type="button"
                          class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm hover:bg-purple-200"
                          @click="form.localInstance.id = item.id"
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
              <SubmitButtons :config="enhancedConfig" :form="updatableForm" >
                <template v-slot:additional-button>
                  <Link v-if="generateValuePath" :path="generateValuePath">
                    <Button type="button" class="btn btn-info">
                      {{ t('integrations.show.generatePropertySelectValue') }}
                    </Button>
                  </Link>
                </template>
              </SubmitButtons>
            </div>
          </div>
        </div>
      </template>
    </GeneralTemplate>
</template>
