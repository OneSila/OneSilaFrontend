import { IntegrationTypes } from "../../../../../integrations";
import { FieldType } from "../../../../../../../../shared/utils/constants";
import {
  amazonProductTypesQuery,
  ebayProductTypesQuery,
  getAmazonProductTypeQuery,
  getEbayProductTypeQuery,
} from "../../../../../../../../shared/api/queries/salesChannels.js";
import { productPropertiesRulesListingQuery } from "../../../../../../../../shared/api/queries/properties.js";
import {
  createAmazonProductTypesFromLocalRulesMutation,
  createEbayProductTypesFromLocalRulesMutation,
  updateAmazonProductTypeMutation,
  updateEbayProductTypeMutation,
} from "../../../../../../../../shared/api/mutations/salesChannels.js";
import { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import { FormConfig, FormType } from "../../../../../../../../shared/components/organisms/general-form/formConfig";
import { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";

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
  _integrationType: string
): SearchConfig => ({
  search: true,
  orderKey: 'sort',
  filters: [
    { type: FieldType.Boolean, name: 'mappedLocally', label: t('integrations.show.mapping.mappedLocally'), strict: true },
    { type: FieldType.Boolean, name: 'mappedRemotely', label: t('integrations.show.mapping.mappedRemotely'), strict: true },
  ],
  orders: [],
});

const amazonProductTypesListingConfig = (
  t: Function,
  specificIntegrationId: string
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
  urlQueryParams: { integrationId: specificIntegrationId },
  addActions: true,
  addEdit: true,
  addShow: true,
  editUrlName: 'integrations.amazonProductTypes.edit',
  showUrlName: 'integrations.amazonProductTypes.edit',
  addDelete: false,
  addPagination: true,
});

const ebayProductTypesListingConfig = (
  t: Function,
  specificIntegrationId: string
): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('integrations.show.mapping.mappedLocally'),
    t('integrations.show.mapping.mappedRemotely'),
    t('properties.rule.title'),
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
  ],
  identifierKey: 'id',
  urlQueryParams: { integrationId: specificIntegrationId },
  addActions: true,
  addEdit: true,
  addShow: true,
  editUrlName: 'integrations.amazonProductTypes.edit',
  showUrlName: 'integrations.amazonProductTypes.edit',
  addDelete: false,
  addPagination: true,
});

export const productTypesListingConfigConstructor = (
  t: Function,
  integrationType: string,
  specificIntegrationId: string
): ListingConfig =>
  integrationType === IntegrationTypes.Ebay
    ? ebayProductTypesListingConfig(t, specificIntegrationId)
    : amazonProductTypesListingConfig(t, specificIntegrationId);

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
