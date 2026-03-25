<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { FieldType, PropertyTypes } from '../../../../../../../../shared/utils/constants';
import RemoteSelectValueEditProperty from '../remote-property-select-values/components/RemoteSelectValueEditProperty.vue';
import type { RemoteSelectValueEditPropertyConfig } from '../remote-property-select-values/types';
import { miraklPropertySelectValueEditFormConfigConstructor, miraklPropertySelectValuesSearchConfigConstructor, listingQuery } from './configs';
import { getMiraklPropertySelectValueQuery, miraklPropertiesQuery } from '../../../../../../../../shared/api/queries/salesChannels.js';
import { propertySelectValuesQuery } from '../../../../../../../../shared/api/queries/properties.js';
import { checkPropertySelectValueForDuplicatesMutation } from '../../../../../../../../shared/api/mutations/properties.js';
import { Link } from '../../../../../../../../shared/components/atoms/link';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import { Accordion } from '../../../../../../../../shared/components/atoms/accordion';
import { buildFilterVariablesFromRouteQuery, extractPrefixedQueryParams } from '../../../../../../../../shared/components/molecules/filter-manager/filterQueryUtils';

const { t } = useI18n();

const normalizeTranslations = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item: any) => item && typeof item === 'object')
    .map((item: any) => ({
      locale: item.locale || item.language || '',
      value: item.value || '',
    }))
    .filter((item) => item.locale || item.value);
};

const formatJson = (value: unknown) => {
  if (value == null || value === '' || (Array.isArray(value) && !value.length)) {
    return '—';
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch (_error) {
    return String(value);
  }
};

const config: RemoteSelectValueEditPropertyConfig = {
  createFormConfig: ({ t, ctx }) => miraklPropertySelectValueEditFormConfigConstructor(t, ctx.type, ctx.valueId, ctx.integrationId),
  formDefaults: ctx => ({
    id: ctx.valueId,
    remoteProperty: '',
    boolValue: null,
    label: '',
    localInstance: {
      id: ctx.routeQuery?.createPropertySelectValueId ? ctx.routeQuery.createPropertySelectValueId.toString() : null,
    },
  }),
  propertyFieldKey: 'remoteProperty',
  localInstanceFieldKey: 'localInstance',
  valueQuery: getMiraklPropertySelectValueQuery,
  valueDataKey: 'miraklPropertySelectValue',
  mapValueData: valueData => ({
    form: {
      remoteProperty: valueData?.remoteProperty?.name || '',
      boolValue: valueData?.boolValue ?? null,
      code: valueData?.code || '',
      value: valueData?.value || '',
      label: valueData?.label || '',
      valueListCode: valueData?.valueListCode || '',
      valueListLabel: valueData?.valueListLabel || '',
      labelTranslations: valueData?.labelTranslations || [],
      valueLabelTranslations: valueData?.valueLabelTranslations || [],
      rawData: valueData?.rawData || {},
    },
    propertyId: valueData?.remoteProperty?.id || null,
    propertyName: valueData?.remoteProperty?.name || '',
    propertyType: valueData?.remoteProperty?.type || null,
    propertyOriginalType: valueData?.remoteProperty?.originalType || null,
    localPropertyType: valueData?.remoteProperty?.localInstance?.type || null,
    localInstanceId: valueData?.localInstance?.id || null,
  }),
  propertyLabelKey: 'integrations.show.propertySelectValues.labels.remoteProperty',
  integrationTitleKey: 'integrations.show.mirakl.title',
  propertyEditPath: ctx =>
    ctx.propertyId
      ? {
          name: 'integrations.remoteProperties.edit',
          params: { type: ctx.type, id: ctx.propertyId },
          query: { integrationId: ctx.integrationId },
        }
      : null,
  remoteFields: [
    {
      key: 'code',
      labelKey: 'integrations.show.properties.labels.code',
      disabled: true,
      includeInSubmit: false,
    },
    {
      key: 'value',
      labelKey: 'integrations.show.mirakl.selectValues.labels.value',
      disabled: true,
      includeInSubmit: false,
    },
    {
      key: 'label',
      labelKey: 'integrations.show.propertySelectValues.labels.localizedValue',
      helpKey: 'integrations.show.propertySelectValues.help.localizedValue',
      disabled: true,
      includeInSubmit: false,
    },
    {
      key: 'valueListCode',
      labelKey: 'integrations.show.mirakl.properties.labels.valueListCode',
      disabled: true,
      includeInSubmit: false,
    },
    {
      key: 'valueListLabel',
      labelKey: 'integrations.show.mirakl.properties.labels.valueListLabel',
      disabled: true,
      includeInSubmit: false,
    },
  ],
  propertyQuery: miraklPropertiesQuery,
  propertyQueryDataKey: 'miraklProperties',
  propertyQueryVariables: ({ propertyId }) => ({
    first: 1,
    filter: {
      id: { exact: propertyId },
      showProperty: true,
    },
  }),
  mapPropertyData: propertyData => {
    const node = propertyData?.edges?.[0]?.node;
    return {
      mapped: node?.mappedLocally ?? true,
      localPropertyId: node?.localInstance?.id || null,
      localPropertyName: node?.localInstance?.name || '',
      localPropertyType: node?.localInstance?.type || null,
      propertyType: node?.type || null,
      propertyOriginalType: node?.originalType || null,
    };
  },
  boolValueField: {
    labelKey: 'integrations.show.propertySelectValues.labels.boolValue',
    helpKey: 'integrations.show.propertySelectValues.help.boolValue',
    placeholderKey: 'integrations.show.propertySelectValues.placeholders.boolValue',
    shouldShow: ctx => {
      const localType = ctx.localPropertyType || ctx.propertyType || '';
      return [PropertyTypes.SELECT, PropertyTypes.MULTISELECT].includes(ctx.propertyOriginalType || '') &&
        localType === PropertyTypes.BOOLEAN;
    },
  },
  localPropertyLabelKey: 'integrations.show.propertySelectValues.labels.localProperty',
  localPropertyHelpKey: 'integrations.show.propertySelectValues.help.selectValue',
  localPropertyEditPath: ctx =>
    ctx.localPropertyId ? { name: 'properties.properties.edit', params: { id: ctx.localPropertyId } } : null,
  buildLocalInstanceField: ({ localPropertyId }) => ({
    type: FieldType.Query,
    name: 'localInstance',
    label: t('properties.values.title'),
    labelBy: 'value',
    valueBy: 'id',
    query: propertySelectValuesQuery,
    queryVariables: { filter: { property: { id: { exact: localPropertyId } } } },
    dataKey: 'propertySelectValues',
    isEdge: true,
    multiple: false,
    filterable: true,
    formMapIdentifier: 'id',
    dropdownPosition: 'bottom',
  }),
  recommendations: {
    mutation: checkPropertySelectValueForDuplicatesMutation,
    watchKeys: ['label', 'value'],
    getSearchValue: form => form.label || form.value,
    variables: ({ localPropertyId, searchValue }) => ({ property: { id: localPropertyId }, value: searchValue }),
    mapResult: (data, currentId) => {
      const response = data?.checkPropertySelectValueForDuplicates;
      if (!response?.duplicateFound) {
        return [];
      }
      return (response.duplicates || [])
        .filter((item: any) => item.id !== currentId)
        .map((item: any) => ({ id: item.id, value: item.value || item.id }));
    },
  },
  notMappedBanner: {
    titleKey: 'integrations.show.propertySelectValues.notMappedBanner.title',
    contentKey: 'integrations.show.propertySelectValues.notMappedBanner.content',
    linkPath: ctx => ({
      name: 'integrations.remoteProperties.edit',
      params: { type: ctx.type, id: ctx.propertyId! },
      query: {
        integrationId: ctx.integrationId,
      },
    }),
  },
  generateValuePath: ctx =>
    ctx.localPropertyId
      ? {
          name: 'properties.values.create',
          query: {
            propertyId: ctx.localPropertyId,
            remoteSelectValueId: `${ctx.valueId}__${ctx.integrationId}__${ctx.salesChannelId}__${ctx.isWizard ? '1' : '0'}`,
            remoteSelectValueType: ctx.type,
            value: ctx.form.label || ctx.form.value,
            ...extractPrefixedQueryParams(ctx.routeQuery || {}, 'next__'),
          },
        }
      : null,
  listRoute: ctx => ({
    name: 'integrations.integrations.show',
    params: { type: ctx.type, id: ctx.integrationId },
    query: { tab: 'propertySelectValues' },
  }),
  wizard: {
    query: listingQuery,
    variables: ctx => ({
      first: 2,
      filter: {
        salesChannel: { id: { exact: ctx.salesChannelId } },
        mappedLocally: false,
        ...(buildFilterVariablesFromRouteQuery(miraklPropertySelectValuesSearchConfigConstructor(t), ctx.routeQuery, { prefix: 'next__', excludeKeys: ['mappedLocally'] }) || {}),
      },
    }),
    extractEdges: data => data?.miraklPropertySelectValues?.edges || [],
  },
  wizardSubmitLabelKey: 'integrations.show.mapping.saveAndMapNext',
};

const getLabelTranslations = (form: Record<string, any>) => normalizeTranslations(form.labelTranslations);
const getValueLabelTranslations = (form: Record<string, any>) => normalizeTranslations(form.valueLabelTranslations);
const hasMetadata = computed(() => true);
const rawDataAccordionItems = computed(() => ([
  { name: 'rawData', label: t('integrations.show.mirakl.properties.labels.rawData'), icon: 'cog' },
]));
</script>

<template>
  <RemoteSelectValueEditProperty :config="config">
    <template #additional-button="{ generateValuePath }">
      <Link v-if="generateValuePath" :path="generateValuePath">
        <Button type="button" class="btn btn-info">
          {{ t('integrations.show.generatePropertySelectValue') }}
        </Button>
      </Link>
    </template>
    <template #additional-fields="{ form }">
      <div v-if="hasMetadata" class="space-y-4">
        <div class="border border-gray-300 bg-gray-50 rounded p-4">
          <h3 class="font-semibold text-sm leading-6 text-gray-900 mb-3">
            {{ t('integrations.show.mirakl.properties.sections.translations') }}
          </h3>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p class="text-sm font-medium text-gray-900 mb-2">
                {{ t('integrations.show.mirakl.properties.labels.labelTranslations') }}
              </p>
              <ul v-if="getLabelTranslations(form).length" class="space-y-2">
                <li
                  v-for="(item, index) in getLabelTranslations(form)"
                  :key="`${item.locale}-${index}`"
                  class="flex items-center gap-2 text-sm text-gray-700"
                >
                  <span>{{ item.value || '—' }}</span>
                  <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {{ item.locale || '—' }}
                  </span>
                </li>
              </ul>
              <p v-else class="text-sm text-gray-500">—</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 mb-2">
                {{ t('integrations.show.mirakl.selectValues.labels.valueLabelTranslations') }}
              </p>
              <ul v-if="getValueLabelTranslations(form).length" class="space-y-2">
                <li
                  v-for="(item, index) in getValueLabelTranslations(form)"
                  :key="`${item.locale}-${index}`"
                  class="flex items-center gap-2 text-sm text-gray-700"
                >
                  <span>{{ item.value || '—' }}</span>
                  <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {{ item.locale || '—' }}
                  </span>
                </li>
              </ul>
              <p v-else class="text-sm text-gray-500">—</p>
            </div>
          </div>
        </div>

        <Accordion :items="rawDataAccordionItems">
          <template #rawData>
            <pre class="whitespace-pre-wrap break-words text-xs text-gray-700">{{ formatJson(form.rawData) }}</pre>
          </template>
        </Accordion>
      </div>
    </template>
  </RemoteSelectValueEditProperty>
</template>
