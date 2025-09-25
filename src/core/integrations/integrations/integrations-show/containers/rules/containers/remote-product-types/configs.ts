import { IntegrationTypes } from "../../../../../integrations";
import { FieldType } from "../../../../../../../../shared/utils/constants";
import {
  amazonProductTypesQuery,
  ebayChannelViewsQuery,
  ebayProductTypesQuery,
  getAmazonProductTypeQuery,
  getEbayProductTypeQuery,
} from "../../../../../../../../shared/api/queries/salesChannels.js";
import { productPropertiesRulesListingQuery } from "../../../../../../../../shared/api/queries/properties.js";
import {
  createAmazonProductTypesFromLocalRulesMutation,
  createEbayProductTypesFromLocalRulesMutation,
  suggestAmazonProductTypeMutation,
  suggestEbayCategoryMutation,
  updateAmazonProductTypeMutation,
  updateEbayProductTypeMutation,
} from "../../../../../../../../shared/api/mutations/salesChannels.js";
import { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import { FormConfig, FormType } from "../../../../../../../../shared/components/organisms/general-form/formConfig";
import { SearchConfig, SearchFilter } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";
import type {
  AdditionalButtonConfig,
  ImportedRemoteProductTypeConfig,
  MappedRemoteProductTypeConfig,
  NormalizedSuggestion,
} from './configTypes';

const amazonProductTypeFormConfig = (
  t: Function,
  type: string,
  productTypeId: string,
  integrationId: string,
  defaultRuleId: string | null = null
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updateAmazonProductTypeMutation,
  mutationKey: "updateAmazonProductType",
  query: getAmazonProductTypeQuery,
  queryVariables: { id: productTypeId },
  queryDataKey: "amazonProductType",
  submitUrl: {
    name: 'integrations.integrations.show',
    params: { type, id: integrationId },
    query: { tab: 'productRules' },
  },
  fields: [
    { type: FieldType.Hidden, name: 'id', value: productTypeId },
    {
      type: FieldType.Text,
      label: t('integrations.show.productRules.labels.productTypeCode'),
      name: 'productTypeCode',
      disabled: true,
      help: t('integrations.show.productRules.help.productTypeCode'),
    },
    {
      type: FieldType.Text,
      label: t('shared.labels.name'),
      name: 'name',
      help: t('integrations.show.productRules.help.name'),
    },
    {
      type: FieldType.Query,
      name: 'localInstance',
      label: t('integrations.show.productRules.labels.productRule'),
      help: t('integrations.show.productRules.help.productRule'),
      labelBy: 'value',
      valueBy: 'id',
      query: productPropertiesRulesListingQuery,
      dataKey: 'productPropertiesRules',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
      ...(defaultRuleId ? { default: defaultRuleId } : {}),
    },
  ],
});

const ebayProductTypeFormConfig = (
  t: Function,
  type: string,
  productTypeId: string,
  integrationId: string
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updateEbayProductTypeMutation,
  mutationKey: "updateEbayProductType",
  query: getEbayProductTypeQuery,
  queryVariables: { id: productTypeId },
  queryDataKey: "ebayProductType",
  submitUrl: {
    name: 'integrations.integrations.show',
    params: { type, id: integrationId },
    query: { tab: 'productRules' },
  },
  fields: [
    { type: FieldType.Hidden, name: 'id', value: productTypeId },
    {
      type: FieldType.Text,
      label: t('shared.labels.name'),
      name: 'name',
      disabled: true,
    },
    {
      type: FieldType.Text,
      label: t('integrations.show.ebay.productRules.labels.translatedName'),
      name: 'translatedName',
      help: t('integrations.show.ebay.productRules.help.translatedName'),
    },
    {
      type: FieldType.Query,
      name: 'localInstance',
      label: t('integrations.show.productRules.labels.productRule'),
      help: t('integrations.show.ebay.productRules.help.productRule'),
      labelBy: 'value',
      valueBy: 'id',
      query: productPropertiesRulesListingQuery,
      dataKey: 'productPropertiesRules',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
    },
  ],
});

export const productTypeEditFormConfigConstructor = (
  t: Function,
  integrationType: string,
  productTypeId: string,
  integrationId: string,
  defaultRuleId: string | null = null
): FormConfig => {
  if (integrationType === IntegrationTypes.Ebay) {
    return ebayProductTypeFormConfig(t, integrationType, productTypeId, integrationId);
  }

  return amazonProductTypeFormConfig(t, integrationType, productTypeId, integrationId, defaultRuleId);
};

export const productTypesSearchConfigConstructor = (
  t: Function,
  integrationType: string,
  salesChannelId: string,
): SearchConfig => {
  const filters: SearchFilter[] = [
    { type: FieldType.Boolean, name: 'mappedLocally', label: t('integrations.show.mapping.mappedLocally'), strict: true },
    { type: FieldType.Boolean, name: 'mappedRemotely', label: t('integrations.show.mapping.mappedRemotely'), strict: true },
  ];

  if (integrationType === IntegrationTypes.Ebay) {
    filters.push({
      type: FieldType.Query,
      name: 'marketplace',
      label: t('integrations.show.propertySelectValues.labels.marketplace'),
      labelBy: 'name',
      valueBy: 'id',
      query: ebayChannelViewsQuery,
      dataKey: 'ebaySalesChannelViews',
      filterable: true,
      isEdge: true,
      addLookup: true,
      lookupKeys: ['id'],
      queryVariables: { filters: { salesChannel: { id: { exact: salesChannelId } } } },
    });
  }

  return {
    search: true,
    orderKey: 'sort',
    filters,
    orders: [],
  };
};

const amazonProductTypesListingConfig = (
  t: Function,
  specificIntegrationId: string,
  salesChannelId: string
): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('integrations.show.productRules.labels.productTypeCode'),
    t('integrations.show.mapping.mappedLocally'),
    t('integrations.show.mapping.mappedRemotely'),
    t('properties.rule.title'),
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'productTypeCode', type: FieldType.Text },
    { name: 'mappedLocally', type: FieldType.Boolean },
    { name: 'mappedRemotely', type: FieldType.Boolean },
    {
      name: 'localInstance',
      type: FieldType.NestedText,
      keys: ['productType', 'value'],
      showLabel: true,
      clickable: true,
      clickIdentifiers: [{ id: ['id'] }],
      clickUrl: { name: 'properties.rule.show' },
    },
  ],
  identifierKey: 'id',
  urlQueryParams: { integrationId: specificIntegrationId, salesChannelId: salesChannelId },
  addActions: true,
  addEdit: true,
  addShow: true,
  editUrlName: 'integrations.remoteProductTypes.edit',
  showUrlName: 'integrations.remoteProductTypes.edit',
  addDelete: false,
  addPagination: true,
});

const ebayProductTypesListingConfig = (
  t: Function,
  specificIntegrationId: string,
  salesChannelId: string,
): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('integrations.show.mapping.mappedLocally'),
    t('integrations.show.mapping.mappedRemotely'),
    t('properties.rule.title'),
    t('integrations.show.propertySelectValues.labels.marketplace'),
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'mappedLocally', type: FieldType.Boolean },
    { name: 'mappedRemotely', type: FieldType.Boolean },
    {
      name: 'localInstance',
      type: FieldType.NestedText,
      keys: ['productType', 'value'],
      showLabel: true,
      clickable: true,
      clickIdentifiers: [{ id: ['id'] }],
      clickUrl: { name: 'properties.rule.show' },
    },
    {
      name: 'marketplace',
      type: FieldType.NestedText,
      keys: ['name'],
      showLabel: true,
    },
  ],
  identifierKey: 'id',
  urlQueryParams: { integrationId: specificIntegrationId, salesChannelId: salesChannelId },
  addActions: true,
  addEdit: true,
  addShow: true,
  editUrlName: 'integrations.remoteProductTypes.edit',
  showUrlName: 'integrations.remoteProductTypes.edit',
  addDelete: false,
  addPagination: true,
});

export const productTypesListingConfigConstructor = (
  t: Function,
  integrationType: string,
  specificIntegrationId: string,
  salesChannelId: string
): ListingConfig =>
  integrationType === IntegrationTypes.Ebay
    ? ebayProductTypesListingConfig(t, specificIntegrationId, salesChannelId)
    : amazonProductTypesListingConfig(t, specificIntegrationId, salesChannelId);

export const getListingQueryKey = (integrationType: string): string =>
  integrationType === IntegrationTypes.Ebay ? 'ebayProductTypes' : 'amazonProductTypes';

export const getListingQuery = (integrationType: string) =>
  integrationType === IntegrationTypes.Ebay ? ebayProductTypesQuery : amazonProductTypesQuery;

export const getProductTypeQuery = (integrationType: string) =>
  integrationType === IntegrationTypes.Ebay ? getEbayProductTypeQuery : getAmazonProductTypeQuery;

export const getProductTypeQueryDataKey = (integrationType: string): string =>
  integrationType === IntegrationTypes.Ebay ? 'ebayProductType' : 'amazonProductType';

export const getUpdateProductTypeMutation = (integrationType: string) =>
  integrationType === IntegrationTypes.Ebay ? updateEbayProductTypeMutation : updateAmazonProductTypeMutation;

export const getCreateProductTypesFromLocalRulesMutation = (integrationType: string) =>
  integrationType === IntegrationTypes.Ebay
    ? createEbayProductTypesFromLocalRulesMutation
    : createAmazonProductTypesFromLocalRulesMutation;

export const listingQueryKey = getListingQueryKey(IntegrationTypes.Amazon);
export const listingQuery = getListingQuery(IntegrationTypes.Amazon);

const getIntegrationTitle = (t: (key: string, ...args: any[]) => string, type: string) =>
  t(`integrations.show.${type}.title`);

const commonSuggestionVariables = ({ name, marketplace }: { name: string | null; marketplace: string }) => ({
  name,
  marketplace: { id: marketplace },
});

const shouldShowProductTypeButton = ({ state }: { state: { propertyProductTypeId: string | null } }) =>
  Boolean(state.propertyProductTypeId);

const buildProductTypeAdditionalButtonConfig = (
  integrationType: string,
  getRuleValue: (formData: Record<string, any>) => string | undefined = (formData) => formData?.name,
) =>
  ({
    productTypeId,
    integrationId,
    salesChannelId,
    isWizard,
    formData,
    state,
  }: {
    productTypeId: string;
    integrationId: string;
    salesChannelId: string;
    isWizard: boolean;
    formData: Record<string, any>;
    state: { propertyProductTypeId: string | null };
  }): AdditionalButtonConfig | null => {
    if (!state.propertyProductTypeId) {
      return null;
    }

    const remoteRuleIdParts = [productTypeId, integrationId, salesChannelId, integrationType, isWizard ? '1' : '0'];
    const remoteRuleId = remoteRuleIdParts.map((part) => part ?? '').join('__');
    const value = getRuleValue(formData);

    const query: Record<string, string> = {
      propertyId: state.propertyProductTypeId,
      isRule: '1',
      remoteRuleId,
    };

    if (value) {
      query.value = value;
    }

    return {
      route: {
        name: 'properties.values.create',
        query,
      },
      labelKey: 'integrations.show.generateProductType',
    };
  };

export const amazonImportedRemoteProductTypeConfig: ImportedRemoteProductTypeConfig = {
  integrationType: IntegrationTypes.Amazon,
  listingQuery: getListingQuery(IntegrationTypes.Amazon),
  listingQueryKey: getListingQueryKey(IntegrationTypes.Amazon),
  suggestMutation: suggestAmazonProductTypeMutation,
  getSuggestionVariables: commonSuggestionVariables,
  mapSuggestions: (data: Record<string, any>, _state): NormalizedSuggestion[] => {
    const productTypes = data?.suggestAmazonProductType?.productTypes || [];
    return productTypes.map((entry: any) => ({
      code: entry.name,
      displayName: entry.displayName,
      secondary: entry.name,
      raw: entry,
    }));
  },
  createState: () => ({}),
  buildSaveInput: ({ productTypeId, selectedCode, selectedName }) => {
    if (!selectedCode) {
      return null;
    }

    return {
      mutation: updateAmazonProductTypeMutation,
      variables: {
        data: {
          id: productTypeId,
          productTypeCode: selectedCode,
          name: selectedName,
          imported: true,
        },
      },
    };
  },
  getIntegrationTitle,
  editRouteName: 'integrations.remoteProductTypes.edit',
};

type EbayImportedState = { categoryTreeId: string | null };

export const ebayImportedRemoteProductTypeConfig: ImportedRemoteProductTypeConfig<EbayImportedState> = {
  integrationType: IntegrationTypes.Ebay,
  listingQuery: getListingQuery(IntegrationTypes.Ebay),
  listingQueryKey: getListingQueryKey(IntegrationTypes.Ebay),
  suggestMutation: suggestEbayCategoryMutation,
  getSuggestionVariables: commonSuggestionVariables,
  mapSuggestions: (data: Record<string, any>, state: EbayImportedState): NormalizedSuggestion[] => {
    const payload = data?.suggestEbayCategory || {};
    state.categoryTreeId = payload?.categoryTreeId ?? null;
    const categories = payload?.categories || [];
    return categories.map((entry: any) => ({
      code: entry.categoryId,
      displayName: entry.categoryName,
      secondary: entry.categoryPath,
      raw: entry,
    }));
  },
  createState: () => ({ categoryTreeId: null }),
  buildSaveInput: ({ productTypeId, selectedSuggestion, selectedCode, selectedName, state }) => {
    if (!selectedSuggestion && !selectedCode) {
      return null;
    }

    const raw = selectedSuggestion?.raw || {};
    const input: Record<string, unknown> = {
      id: productTypeId,
      imported: true,
    };

    if (raw.categoryId || selectedCode) {
      input.categoryId = raw.categoryId ?? selectedCode;
    }
    if (state.categoryTreeId) {
      input.categoryTreeId = state.categoryTreeId;
    }
    if (raw.categoryPath) {
      input.categoryPath = raw.categoryPath;
    }
    if (raw.categoryName || selectedSuggestion?.displayName) {
      input.name = raw.categoryName ?? selectedSuggestion?.displayName;
    }
    if (selectedName || raw.categoryName) {
      input.translatedName = selectedName || raw.categoryName;
    }

    return {
      mutation: updateEbayProductTypeMutation,
      variables: { data: input },
    };
  },
  getIntegrationTitle,
  editRouteName: 'integrations.remoteProductTypes.edit',
};

type RemoteProductTypeState = { propertyProductTypeId: string | null };

export const amazonMappedRemoteProductTypeConfig: MappedRemoteProductTypeConfig<RemoteProductTypeState> = {
  integrationType: IntegrationTypes.Amazon,
  listingQuery: getListingQuery(IntegrationTypes.Amazon),
  listingQueryKey: getListingQueryKey(IntegrationTypes.Amazon),
  productTypeQueryDataKey: getProductTypeQueryDataKey(IntegrationTypes.Amazon),
  getIntegrationTitle,
  editRouteName: 'integrations.remoteProductTypes.edit',
  createState: () => ({ propertyProductTypeId: null }),
  extractItems: (data) => data?.amazonproducttypeitemSet || [],
  getItemName: (item) => item?.remoteProperty?.name || '',
  getItemCode: (item) => item?.remoteProperty?.code || '',
  isItemMappedLocally: (item) => Boolean(item?.remoteProperty?.mappedLocally),
  getPropertyRoute: (item, { type, integrationId, salesChannelId }) => {
    const property = item?.remoteProperty;
    if (!property?.id) {
      return null;
    }

    return {
      name: 'integrations.remoteProperties.edit',
      params: { type, id: property.id },
      query: { integrationId, salesChannelId },
    };
  },
  shouldShowAdditionalButton: shouldShowProductTypeButton,
  getAdditionalButtonConfig: buildProductTypeAdditionalButtonConfig(IntegrationTypes.Amazon),
};

export const ebayMappedRemoteProductTypeConfig: MappedRemoteProductTypeConfig<RemoteProductTypeState> = {
  integrationType: IntegrationTypes.Ebay,
  listingQuery: getListingQuery(IntegrationTypes.Ebay),
  listingQueryKey: getListingQueryKey(IntegrationTypes.Ebay),
  productTypeQueryDataKey: getProductTypeQueryDataKey(IntegrationTypes.Ebay),
  getIntegrationTitle,
  editRouteName: 'integrations.remoteProductTypes.edit',
  createState: () => ({ propertyProductTypeId: null }),
  extractItems: (data) => data?.items || [],
  getItemName: (item) => {
    const property = item?.ebayProperty;
    if (!property) {
      return '';
    }
    return property.localizedName || property.translatedName || '';
  },
  isItemMappedLocally: (item) => Boolean(item?.ebayProperty?.mappedLocally),
  getPropertyRoute: (item, { type, integrationId, salesChannelId }) => {
    const property = item?.ebayProperty;
    if (!property?.id) {
      return null;
    }

    return null;
  },
  shouldShowAdditionalButton: shouldShowProductTypeButton,
  getAdditionalButtonConfig: buildProductTypeAdditionalButtonConfig(IntegrationTypes.Ebay, (formData) =>
    formData?.translatedName || formData?.name,
  ),
};
