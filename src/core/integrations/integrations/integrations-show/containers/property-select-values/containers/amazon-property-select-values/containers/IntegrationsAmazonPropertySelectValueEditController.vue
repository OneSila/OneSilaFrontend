<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, RouterLink } from 'vue-router';
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
import { selectValueOnTheFlyConfig } from "../../../../../../../../properties/property-select-values/configs";
import apolloClient from "../../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../../shared/modules/toast";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const valueId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId ? route.query.integrationId.toString() : '';
const salesChannelId = route.query.salesChannelId ? route.query.salesChannelId.toString() : '';
const isWizard = route.query.wizard === '1';

const amazonPropertyId = ref<string | null>(null);
const localPropertyId = ref<string | null>(null);
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
  localInstance: { id: null as string | null },
});

const localInstanceField = ref<QueryFormField>({
  type: FieldType.Query,
  name: 'localInstance',
  label: t('properties.values.title'),
  labelBy: 'value',
  valueBy: 'id',
  query: propertySelectValuesQuery,
  dataKey: 'propertySelectValues',
  isEdge: true,
  multiple: false,
  filterable: true,
  formMapIdentifier: 'id',
});

onMounted(async () => {
  const { data } = await apolloClient.query({
    query: getAmazonPropertySelectValueQuery,
    variables: { id: valueId.value },
    fetchPolicy: 'network-only'
  });

  const valueData = data?.amazonPropertySelectValue;
  amazonPropertyId.value = valueData?.amazonProperty?.id || null;

  form.amazonProperty = valueData?.amazonProperty?.name || '';
  form.marketplace = valueData?.marketplace?.name || '';
  form.remoteValue = valueData?.remoteValue || '';
  form.remoteName = valueData?.remoteName || '';
  form.localInstance.id = valueData?.localInstance?.id || null;

  if (amazonPropertyId.value) {
    const { data: propData } = await apolloClient.query({
      query: getAmazonPropertyQuery,
      variables: { id: amazonPropertyId.value },
      fetchPolicy: 'network-only'
    });
    propertyMapped.value = propData?.amazonProperty?.mappedLocally ?? true;
    localPropertyId.value = propData?.amazonProperty?.localInstance?.id || null;
    if (localPropertyId.value) {
      localInstanceField.value.queryVariables = { filter: { property: { id: { exact: localPropertyId.value } } } };
      localInstanceField.value.createOnFlyConfig = selectValueOnTheFlyConfig(t, localPropertyId.value);
    }
  }
});

const fetchNextUnmapped = async () => {
  const { data } = await apolloClient.query({
    query: listingQuery,
    variables: {
      first: 1,
      filter: {
        salesChannel: { id: { exact: salesChannelId } },
        mappedLocally: { exact: false },
        amazonProperty: { mappedLocally: { exact: true } },
      },
    },
    fetchPolicy: 'network-only',
  });
  const edges = data?.amazonPropertySelectValues?.edges || [];
  return edges.length > 0 ? edges[0].node.id : null;
};

const handleSubmit = async () => {
  if (!isWizard) return;
  const nextId = await fetchNextUnmapped();
  if (nextId) {
    router.replace({
      name: 'integrations.amazonPropertySelectValues.edit',
      params: { type: type.value, id: nextId },
      query: { integrationId, salesChannelId, wizard: '1' },
    });
  } else {
    Toast.success(t('integrations.show.mapping.allMappedSuccess'));
    router.push({ name: 'integrations.integrations.show', params: { type: type.value, id: integrationId }, query: { tab: 'propertySelectValues' } });
  }
};
</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.integrations.show', params: {id: integrationId, type: type}, query: {tab: 'propertySelectValues'} }, name: t('integrations.show.amazon.title') }
        ]" />
    </template>
    <template v-slot:content>
      <div v-if="!propertyMapped" class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
        <span class="font-medium flex items-center gap-1">
          ⚠️ {{ t('integrations.show.propertySelectValues.notMappedBanner.title') }}
        </span>
        <RouterLink :to="{ name: 'integrations.amazonProperties.edit', params: { type: type, id: amazonPropertyId }, query: { integrationId } }" class="underline">
          {{ t('integrations.show.propertySelectValues.notMappedBanner.content') }}
        </RouterLink>
      </div>
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
                      <TextInput v-model="form.amazonProperty" disabled class="w-full" />
                    </FlexCell>
                  </Flex>
                </div>
                <div class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('integrations.show.propertySelectValues.labels.marketplace') }}</Label>
                    </FlexCell>
                    <FlexCell>
                      <TextInput v-model="form.marketplace" disabled class="w-full" />
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
                  </Flex>
                </div>
                <div class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('properties.values.title') }}</Label>
                    </FlexCell>
                    <FlexCell>
                      <FieldQuery :field="localInstanceField as QueryFormField" v-model="form.localInstance.id" @update:modelValue="form.localInstance.id = $event" />
                    </FlexCell>
                  </Flex>
                </div>
              </div>
            </div>
            <SubmitButtons :config="enhancedConfig" :form="form" @submit="handleSubmit" />
          </div>
        </div>
      </div>
    </template>
  </GeneralTemplate>
</template>
