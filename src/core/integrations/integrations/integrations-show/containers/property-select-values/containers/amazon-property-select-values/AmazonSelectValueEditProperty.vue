<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { FieldType, PropertyTypes } from '../../../../../../../../shared/utils/constants';
import RemoteSelectValueEditProperty from '../remote-property-select-values/components/RemoteSelectValueEditProperty.vue';
import type { RemoteSelectValueEditPropertyConfig } from '../remote-property-select-values/types';
import { amazonPropertySelectValueEditFormConfigConstructor, amazonPropertySelectValuesSearchConfigConstructor, listingQuery } from './configs';
import { getAmazonPropertySelectValueQuery, getAmazonPropertyQuery } from '../../../../../../../../shared/api/queries/salesChannels.js';
import { propertySelectValuesQuery } from '../../../../../../../../shared/api/queries/properties.js';
import { checkPropertySelectValueForDuplicatesMutation } from '../../../../../../../../shared/api/mutations/properties.js';
import { Link } from '../../../../../../../../shared/components/atoms/link';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import { extractPrefixedQueryParams } from '../../../../../../../../shared/components/molecules/filter-manager/filterQueryUtils';
import { buildFilterVariablesFromRouteQuery } from '../../../../../../../../shared/components/molecules/filter-manager/filterQueryUtils';

const { t } = useI18n();

const config: RemoteSelectValueEditPropertyConfig = {
  createFormConfig: ({ t, ctx }) => amazonPropertySelectValueEditFormConfigConstructor(t, ctx.type, ctx.valueId, ctx.integrationId),
  formDefaults: ctx => ({
    id: ctx.valueId,
    amazonProperty: '',
    marketplace: '',
    remoteValue: '',
    remoteName: '',
    translatedRemoteName: '',
    boolValue: null,
    localInstance: {
      id: ctx.routeQuery?.createPropertySelectValueId ? ctx.routeQuery.createPropertySelectValueId.toString() : null,
    },
  }),
  propertyFieldKey: 'amazonProperty',
  marketplaceFieldKey: 'marketplace',
  localInstanceFieldKey: 'localInstance',
  valueQuery: getAmazonPropertySelectValueQuery,
  valueDataKey: 'amazonPropertySelectValue',
  mapValueData: valueData => ({
    form: {
      amazonProperty: valueData?.amazonProperty?.name || '',
      marketplace: valueData?.marketplace?.name || '',
      remoteValue: valueData?.remoteValue || '',
      remoteName: valueData?.remoteName || '',
      translatedRemoteName: valueData?.translatedRemoteName || '',
      boolValue: valueData?.boolValue ?? null,
    },
    propertyId: valueData?.amazonProperty?.id || null,
    propertyName: valueData?.amazonProperty?.name || '',
    propertyType: valueData?.amazonProperty?.type || null,
    propertyOriginalType: valueData?.amazonProperty?.originalType || null,
    localPropertyType: valueData?.amazonProperty?.localInstance?.type || null,
    marketplaceId: valueData?.marketplace?.id || null,
    marketplaceName: valueData?.marketplace?.name || '',
    localInstanceId: valueData?.localInstance?.id || null,
  }),
  propertyLabelKey: 'integrations.show.propertySelectValues.labels.amazonProperty',
  integrationTitleKey: 'integrations.show.amazon.title',
  marketplaceLabelKey: 'integrations.show.propertySelectValues.labels.marketplace',
  marketplaceEditPath: ctx =>
    ctx.marketplaceId
      ? { name: 'integrations.stores.edit', params: { type: ctx.type, id: ctx.marketplaceId }, query: { integrationId: ctx.integrationId } }
      : null,
  propertyEditPath: ctx =>
    ctx.propertyId
      ? { name: 'integrations.remoteProperties.edit', params: { type: ctx.type, id: ctx.propertyId }, query: { integrationId: ctx.integrationId, salesChannelId: ctx.salesChannelId } }
      : null,
  remoteFields: [
    {
      key: 'remoteValue',
      labelKey: 'integrations.show.propertySelectValues.labels.remoteValue',
      helpKey: 'integrations.show.propertySelectValues.help.remoteValue',
      disabled: true,
      includeInSubmit: false,
    },
    {
      key: 'remoteName',
      labelKey: 'integrations.show.propertySelectValues.labels.remoteName',
      helpKey: 'integrations.show.propertySelectValues.help.remoteName',
    },
    {
      key: 'translatedRemoteName',
      labelKey: 'integrations.show.propertySelectValues.labels.translatedRemoteName',
      helpKey: 'integrations.show.propertySelectValues.help.translatedRemoteName',
    },
  ],
  propertyQuery: getAmazonPropertyQuery,
  propertyQueryDataKey: 'amazonProperty',
  mapPropertyData: propertyData => ({
    mapped: propertyData?.mappedLocally ?? true,
    localPropertyId: propertyData?.localInstance?.id || null,
    localPropertyName: propertyData?.localInstance?.name || '',
    localPropertyType: propertyData?.localInstance?.type || null,
    propertyType: propertyData?.type || null,
    propertyOriginalType: propertyData?.originalType || null,
  }),
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
  buildLocalInstanceField: ({ localPropertyId, t }) => ({
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
  localPropertyLabelKey: 'integrations.show.propertySelectValues.labels.localProperty',
  localPropertyHelpKey: 'integrations.show.propertySelectValues.help.selectValueAmazon',
  localPropertyEditPath: ctx =>
    ctx.localPropertyId ? { name: 'properties.properties.edit', params: { id: ctx.localPropertyId } } : null,
  notMappedBanner: {
    titleKey: 'integrations.show.propertySelectValues.notMappedBanner.title',
    contentKey: 'integrations.show.propertySelectValues.notMappedBanner.content',
    linkPath: ctx => ({
      name: 'integrations.remoteProperties.edit',
      params: { type: ctx.type, id: ctx.propertyId! },
      query: {
        integrationId: ctx.integrationId,
        salesChannelId: ctx.salesChannelId,
        amazonCreateValue: ctx.valueId,
      },
    }),
  },
  recommendations: {
    mutation: checkPropertySelectValueForDuplicatesMutation,
    watchKeys: ['remoteName', 'translatedRemoteName'],
    getSearchValue: form => form.translatedRemoteName || form.remoteName,
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
  generateValuePath: ctx =>
    ctx.localPropertyId
      ? {
          name: 'properties.values.create',
          query: {
            propertyId: ctx.localPropertyId,
            remoteSelectValueId: `${ctx.valueId}__${ctx.integrationId}__${ctx.salesChannelId}__${ctx.isWizard ? '1' : '0'}`,
            remoteSelectValueType: ctx.type,
            value: ctx.form.translatedRemoteName || ctx.form.remoteName,
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
        ...(buildFilterVariablesFromRouteQuery(amazonPropertySelectValuesSearchConfigConstructor(t, ctx.salesChannelId), ctx.routeQuery, { prefix: 'next__', excludeKeys: ['mappedLocally'] }) || {}),
      },
      order: { marketplace: { isDefault: 'DESC' } },
    }),
    extractEdges: data => data?.amazonPropertySelectValues?.edges || [],
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
