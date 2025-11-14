<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { FieldType } from '../../../../../../../../shared/utils/constants';
import RemoteSelectValueEditProperty from '../remote-property-select-values/components/RemoteSelectValueEditProperty.vue';
import type { RemoteSelectValueEditPropertyConfig } from '../remote-property-select-values/types';
import { sheinPropertySelectValueEditFormConfigConstructor, listingQuery } from './configs';
import { getSheinPropertySelectValueQuery, sheinPropertiesQuery } from '../../../../../../../../shared/api/queries/salesChannels.js';
import { propertySelectValuesQuery } from '../../../../../../../../shared/api/queries/properties.js';
import { checkPropertySelectValueForDuplicatesMutation } from '../../../../../../../../shared/api/mutations/properties.js';
import { Link } from '../../../../../../../../shared/components/atoms/link';
import { Button } from '../../../../../../../../shared/components/atoms/button';

const { t } = useI18n();

const config: RemoteSelectValueEditPropertyConfig = {
  createFormConfig: ({ t, ctx }) => sheinPropertySelectValueEditFormConfigConstructor(t, ctx.type, ctx.valueId, ctx.integrationId),
  formDefaults: ctx => ({
    id: ctx.valueId,
    remoteProperty: '',
    value: '',
    valueEn: '',
    localInstance: {
      id: ctx.routeQuery?.createPropertySelectValueId ? ctx.routeQuery.createPropertySelectValueId.toString() : null,
    },
  }),
  propertyFieldKey: 'remoteProperty',
  localInstanceFieldKey: 'localInstance',
  valueQuery: getSheinPropertySelectValueQuery,
  valueDataKey: 'sheinPropertySelectValue',
  mapValueData: valueData => ({
    form: {
      remoteProperty: valueData?.remoteProperty?.name || '',
      value: valueData?.value || '',
      valueEn: valueData?.valueEn || '',
    },
    propertyId: valueData?.remoteProperty?.id || null,
    propertyName: valueData?.remoteProperty?.name || '',
    localInstanceId: valueData?.localInstance?.id || null,
  }),
  propertyLabelKey: 'integrations.show.propertySelectValues.labels.sheinProperty',
  integrationTitleKey: 'integrations.show.shein.title',
  propertyEditPath: ctx =>
    ctx.propertyId
      ? {
          name: 'integrations.remoteProperties.edit',
          params: { type: ctx.type, id: ctx.propertyId },
          query: { integrationId: ctx.integrationId, salesChannelId: ctx.salesChannelId },
        }
      : null,
  remoteFields: [
    {
      key: 'value',
      labelKey: 'integrations.show.propertySelectValues.labels.localizedValue',
      helpKey: 'integrations.show.propertySelectValues.help.localizedValue',
      disabled: true,
      includeInSubmit: false,
    },
    {
      key: 'valueEn',
      labelKey: 'integrations.show.propertySelectValues.labels.translatedValue',
      helpKey: 'integrations.show.propertySelectValues.help.translatedValue',
    },
  ],
  propertyQuery: sheinPropertiesQuery,
  propertyQueryDataKey: 'sheinProperties',
  propertyQueryVariables: ({ propertyId }) => ({
    first: 1,
    filter: { id: { exact: propertyId } },
  }),
  mapPropertyData: propertyData => {
    const node = propertyData?.edges?.[0]?.node;
    return {
      mapped: node?.mappedLocally ?? true,
      localPropertyId: node?.localInstance?.id || null,
      localPropertyName: node?.localInstance?.name || '',
    };
  },
  localPropertyLabelKey: 'integrations.show.propertySelectValues.labels.localProperty',
  localPropertyHelpKey: 'integrations.show.propertySelectValues.help.selectValueShein',
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
  notMappedBanner: {
    titleKey: 'integrations.show.propertySelectValues.notMappedBannerShein.title',
    contentKey: 'integrations.show.propertySelectValues.notMappedBannerShein.content',
    linkPath: ctx => ({
      name: 'integrations.remoteProperties.edit',
      params: { type: ctx.type, id: ctx.propertyId! },
      query: {
        integrationId: ctx.integrationId,
        salesChannelId: ctx.salesChannelId,
      },
    }),
  },
  recommendations: {
    mutation: checkPropertySelectValueForDuplicatesMutation,
    watchKeys: ['valueEn', 'value'],
    getSearchValue: form => form.valueEn || form.value,
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
  listRoute: ctx => ({
    name: 'integrations.integrations.show',
    params: { type: ctx.type, id: ctx.integrationId },
    query: { tab: 'propertySelectValues' },
  }),
  generateValuePath: ctx =>
    ctx.localPropertyId
      ? {
          name: 'properties.values.create',
          query: {
            propertyId: ctx.localPropertyId,
            remoteSelectValueId: `${ctx.valueId}__${ctx.integrationId}__${ctx.salesChannelId}__${ctx.isWizard ? '1' : '0'}`,
            remoteSelectValueType: ctx.type,
            value: ctx.form.valueEn || ctx.form.value,
          },
        }
      : null,
  wizard: {
    query: listingQuery,
    variables: ctx => ({
      first: 2,
      filter: {
        salesChannel: { id: { exact: ctx.salesChannelId } },
        mappedLocally: false,
      },
    }),
    extractEdges: data => data?.sheinPropertySelectValues?.edges || [],
  },
  wizardSubmitLabelKey: 'integrations.show.mapping.saveAndMapNext',
};
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
  </RemoteSelectValueEditProperty>
</template>
