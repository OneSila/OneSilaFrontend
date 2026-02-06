import {
  CreateOnTheFly,
  FormConfig,
  FormField,
  FormType,
  QueryFormField
} from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType, InspectorStatus, InspectorStatusType, ProductType, Url } from '../../../shared/utils/constants.js'
import { OrderType, SearchConfig, SearchFilter } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import { productsQuery, productsQuerySelector, productsSkusQuerySelector } from "../../../shared/api/queries/products.js"
import { currenciesQuerySelector } from "../../../shared/api/queries/currencies.js";
import { vatRatesQuerySelector } from "../../../shared/api/queries/vatRates.js";
import { createVatRateMutation } from "../../../shared/api/mutations/vatRates.js";
import { baseFormConfigConstructor as baseVatRateConfigConstructor } from '../../settings/vat-rates/configs'
import { Badge, Icon } from "../../../shared/components/organisms/general-show/showConfig";
import { propertiesQuerySelector, propertySelectValuesQuerySelector } from "../../../shared/api/queries/properties.js";
import { amazonChannelsQuerySelector, salesChannelsQuerySelector, salesChannelViewsQuerySelector } from "../../../shared/api/queries/salesChannels.js";
import { amazonBrowseNodesQuerySelector } from "../../../shared/api/queries/amazonProducts.js";
import { ebayCategoriesQuerySelector } from "../../../shared/api/queries/ebayCategories.js";
import { sheinCategoriesQuerySelector } from "../../../shared/api/queries/sheinCategories.js";
import { companyContentViewsQuery } from "../../../shared/api/queries/contentViews.js";
import { deleteProductsMutation } from "../../../shared/api/mutations/products.js";
import { salesPriceListsQuerySelector } from "../../../shared/api/queries/salesPrices.js";

export const vatRateOnTheFlyConfig = (t: Function):CreateOnTheFly => ({
  config: {
    ...baseVatRateConfigConstructor(
      t,
      FormType.CREATE,
      createVatRateMutation,
      'createVatRate'
    ) as FormConfig
  }
})
export const getProductTypeOptions = (t) => [
  { name: t('products.products.labels.type.choices.variation'), code: ProductType.Simple },
  { name: t('products.products.labels.type.choices.bundle'), code: ProductType.Bundle },
  { name: t('products.products.labels.type.choices.configurable'), code: ProductType.Configurable },
  { name: t('products.products.labels.type.choices.alias'), code: ProductType.Alias },
];

export const getInspectorErrors = (t) => [
  { code: "101", name: t(`dashboard.cards.products.inspector.101.title`) },
  { code: "102", name: t(`dashboard.cards.products.inspector.102.title`) },
  { code: "104", name: t(`dashboard.cards.products.inspector.104.title`) },
  { code: "105", name: t(`dashboard.cards.products.inspector.105.title`) },
  { code: "106", name: t(`dashboard.cards.products.inspector.106.title`) },
  { code: "109", name: t(`dashboard.cards.products.inspector.109.title`) },
  { code: "110", name: t(`dashboard.cards.products.inspector.110.title`) },
  { code: "111", name: t(`dashboard.cards.products.inspector.111.title`) },
  { code: "112", name: t(`dashboard.cards.products.inspector.112.title`) },
  // { code: "114", name: t(`dashboard.cards.products.inspector.114.title`) },
  { code: "116", name: t(`dashboard.cards.products.inspector.116.title`) },
  { code: "117", name: t(`dashboard.cards.products.inspector.117.title`) },
  // { code: "118", name: t(`dashboard.cards.products.inspector.118.title`) },
  { code: "120", name: t(`dashboard.cards.products.inspector.120.title`) },
  { code: "121", name: t(`dashboard.cards.products.inspector.121.title`) },
  { code: "123", name: t(`dashboard.cards.products.inspector.123.title`) },
  { code: "124", name: t(`dashboard.cards.products.inspector.124.title`) },
  // { code: "125", name: t(`dashboard.cards.products.inspector.125.title`) },
  // { code: "126", name: t(`dashboard.cards.products.inspector.126.title`) },
];


export const getProductTypeBadgeMap = (t) => ({
  [ProductType.Configurable]: { text: t('products.products.labels.type.choices.configurable'), color: 'blue' },
  [ProductType.Bundle]: { text: t('products.products.labels.type.choices.bundle'), color: 'purple' },
  [ProductType.Simple]: { text: t('products.products.labels.type.choices.variation'), color: 'yellow' },
  [ProductType.Alias]: { text: t('products.products.labels.type.choices.alias'), color: 'green' },
});

export const getInspectorStatusOptions = (t) => [
  { name: '🟢', code: InspectorStatus.GREEN },
  { name: '🟠', code: InspectorStatus.ORANGE },
  { name: '🔴', code: InspectorStatus.RED },
];

export const getInspectorStatusBadgeMap = (t?: Function): Record<string, Badge> => {
  const translate = (key: string) => (t ? t(key) : key);
  const defaultBadge: Badge = { text: '🔴', color: 'none', hoverText: translate('shared.colors.red') };

  const badgeMap: Record<InspectorStatusType, Badge> = {
    [InspectorStatus.GREEN]: { text: '🟢', color: 'none', hoverText: translate('shared.colors.green') },
    [InspectorStatus.ORANGE]: { text: '🟠', color: 'none', hoverText: translate('shared.colors.orange') },
    [InspectorStatus.RED]: defaultBadge,
  };

  return {
    ...badgeMap,
    default: defaultBadge,
  };
};

export const getInspectorStatusIconMap = (t?: Function): Record<string, Icon> => {
  const translate = (key: string) => (t ? t(key) : key);
  const defaultIcon: Icon = { name: 'circle-xmark', color: 'red', hoverText: translate('shared.colors.red') };

  const iconMap: Record<InspectorStatusType, Icon> = {
    [InspectorStatus.GREEN]: { name: 'circle-check', color: 'green', hoverText: translate('shared.colors.green') },
    [InspectorStatus.ORANGE]: { name: 'circle-exclamation', color: 'orange', hoverText: translate('shared.colors.orange') },
    [InspectorStatus.RED]: defaultIcon,
  };

  return {
    ...iconMap,
    default: defaultIcon,
  };
};


const getTypeField = (type, t): FormField | null => {
  if (type == FormType.CREATE) {
    return {
      type: FieldType.Choice,
      name: 'type',
      labelBy: 'name',
      valueBy: 'code',
      label: t('products.products.labels.type.title'),
      filterable: false,
      options: getProductTypeOptions(t)
    };
  }
  return null;
}

export const getVatRateField = (t): QueryFormField => {
    return {
      type: FieldType.Query,
      name: 'vatRate',
      label: t('products.products.labels.vatRate'),
      labelBy: 'name',
      valueBy: 'id',
        query: vatRatesQuerySelector,
      dataKey: 'vatRates',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
      placeholder: t('products.products.placeholders.vatRate'),
      createOnFlyConfig: vatRateOnTheFlyConfig(t)
    }
}
const getFields = (type, t): FormField[] => {
  const fields = [
    getTypeField(type, t),
    {
      type: FieldType.Text,
      name: 'sku',
      label: t('shared.labels.sku'),
      placeholder: t('shared.placeholders.sku'),
    },
    {
      type: FieldType.Checkbox,
      name: 'active',
      label: t('shared.labels.active'),
      default: true,
      uncheckedValue: "false"
    },
    {
      type: FieldType.Query,
      name: 'vatRate',
      label: t('products.products.labels.vatRate'),
      labelBy: 'name',
      valueBy: 'id',
        query: vatRatesQuerySelector,
      dataKey: 'vatRates',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
      createOnFlyConfig: vatRateOnTheFlyConfig(t)
    },
    {
      type: FieldType.Checkbox,
      name: 'allowBackorder',
      label: t('products.products.labels.allowBackorder'),
      default: false,
      uncheckedValue: "false"
    },
  ].filter(field => field !== null);
  return fields as FormField[];
}

export const baseFormConfigConstructor = (
  t: Function,
  type: FormType,
  mutation: any,
  mutationKey: string,
  submitAndContinueUrl: Url
): FormConfig => ({
 cols: 1,
  type: type,
  mutation: mutation,
  mutationKey: mutationKey,
  addDelete: false,
  addCancel: false,
  submitUrl: { name: 'products.products.list' },
  submitAndContinueUrl: submitAndContinueUrl,
  fields: getFields(type, t),
});

export const searchConfigConstructor = (t: Function, hasAmazon: boolean = false): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    {
      type: FieldType.Text,
      name: 'sku',
      label: t('products.products.filters.labels.sku'),
      placeholder: t('products.products.filters.placeholders.sku'),
      addLookup: true,
    },
    {
      type: FieldType.Query,
      name: 'vatRate',
      query: vatRatesQuerySelector,
      label: t('products.products.filters.labels.vatRate'),
      labelBy: "name",
      valueBy: "id",
      dataKey: "vatRates",
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: true,
      lookupKeys: ['id']
    },
    {
      type: FieldType.Choice,
      name: 'type',
      labelBy: 'name',
      valueBy: 'code',
      label: t('products.products.filters.labels.type'),
      filterable: false,
      addLookup: true,
      options: getProductTypeOptions(t)
    },
    {
      type: FieldType.Choice,
      name: 'exceptType',
      labelBy: 'name',
      valueBy: 'code',
      label: t('products.products.filters.labels.excludeType'),
      filterable: false,
      addLookup: true,
      isNot: true,
      filterKey: 'type',
      options: getProductTypeOptions(t)
    },
    {
      type: FieldType.Boolean,
      addLookup: true,
      strict: true,
      name: 'active',
      label: t('products.products.filters.labels.active')
    },
    {
      type: FieldType.Boolean,
      addLookup: true,
      strict: true,
      name: 'allowBackorder',
      label: t('products.products.filters.labels.backorder')
    },
    {
      type: FieldType.Boolean,
      strict: true,
      name: 'hasAliasProducts',
      label: t('products.products.filters.labels.hasAliasProducts'),
    },
    {
      type: FieldType.Query,
      name: 'aliasParentProduct',
      query: productsQuerySelector,
      label: t('products.products.filters.labels.aliasParentProduct'),
      labelBy: "name",
      valueBy: "id",
      dataKey: "products",
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: true,
      lookupKeys: ['id'],
      placeholder: t('products.products.filters.placeholders.aliasParentProduct'),
    },
    {
      type: FieldType.Query,
      name: 'skus',
      query: productsSkusQuerySelector,
      label: t('products.products.filters.labels.skus'),
      labelBy: "sku",
      valueBy: "sku",
      dataKey: "products",
      filterable: true,
      multiple: true,
      isEdge: true,
      addLookup: true,
      lookupType: 'inList',
      filterKey: 'sku',
      placeholder: t('products.products.filters.placeholders.skus'),
      helpText: t('products.products.filters.help.skus'),
    },
    {
      type: FieldType.Query,
      name: 'excludeSkus',
      query: productsSkusQuerySelector,
      label: t('products.products.filters.labels.excludeSkus'),
      labelBy: "sku",
      valueBy: "sku",
      dataKey: "products",
      filterable: true,
      multiple: true,
      isEdge: true,
      addLookup: true,
      lookupType: 'inList',
      filterKey: 'sku',
      isNot: true,
      placeholder: t('products.products.filters.placeholders.excludeSkus'),
      helpText: t('products.products.filters.help.excludeSkus'),
    },
    {
      type: FieldType.Query,
      name: 'hasPricesForCurrency',
      query: currenciesQuerySelector,
      label: t('products.products.filters.labels.hasPrices'),
      labelBy: "isoCode",
      valueBy: "id",
      dataKey: "currencies",
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
      placeholder: t('products.products.filters.placeholders.hasPrices'),
    },
    {
      type: FieldType.Query,
      name: 'missingPricesForCurrency',
      query: currenciesQuerySelector,
      label: t('products.products.filters.labels.missingPrices'),
      labelBy: "isoCode",
      valueBy: "id",
      dataKey: "currencies",
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
      placeholder: t('products.products.filters.placeholders.missingPrices'),
    },
    {
      type: FieldType.Query,
      name: 'hasPriceList',
      query: salesPriceListsQuerySelector,
      label: t('products.products.filters.labels.priceList'),
      labelBy: "name",
      valueBy: "id",
      dataKey: "salesPriceLists",
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
      placeholder: t('products.products.filters.placeholders.priceList'),
    },
    {
      type: FieldType.Query,
      name: 'missingPriceList',
      query: salesPriceListsQuerySelector,
      label: t('products.products.filters.labels.missingPriceList'),
      labelBy: "name",
      valueBy: "id",
      dataKey: "salesPriceLists",
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
      placeholder: t('products.products.filters.placeholders.missingPriceList'),
    },
    {
      type: FieldType.RangeDate,
      name: 'createdAtRange',
      label: t('products.products.filters.labels.createdDateRange'),
    },
    {
      type: FieldType.RangeDate,
      name: 'updatedAtRange',
      label: t('products.products.filters.labels.updatedDateRange'),
    },
    {
      type: FieldType.Boolean,
      strict: true,
      name: 'hasEanCodes',
      label: t('products.products.filters.labels.hasEanCodes'),
    },
    {
      type: FieldType.Boolean,
      strict: true,
      name: 'inspector',
      lookupKeys: ['hasMissingInformation'],
      label: t('products.products.filters.labels.missingRequiredInformation'),
      helpText: t('products.products.filters.help.missingRequiredInformation'),
      addLookup: true,
    },
    {
      type: FieldType.Boolean,
      strict: true,
      name: 'missingInformation',
      lookupKeys: ['hasAnyMissingInformation'],
      filterKey: 'inspector',
      label: t('products.products.filters.labels.missingInformation'),
      helpText: t('products.products.filters.help.missingInformation'),
      addLookup: true,
    },
    {
      type: FieldType.Choice,
      name: 'inspectorNotSuccessfullyCodeError',
      labelBy: 'name',
      valueBy: 'code',
      label: t('products.products.filters.labels.inspectorError'),
      filterable: true,
      addLookup: false,
      options: getInspectorErrors(t)
    },
    {
      type: FieldType.Choice,
      name: 'excludeInspectorNotSuccessfullyCodeError',
      labelBy: 'name',
      valueBy: 'code',
      label: t('products.products.filters.labels.excludeInspectorError'),
      filterable: true,
      addLookup: false,
      isNot: true,
      filterKey: 'inspectorNotSuccessfullyCodeError',
      options: getInspectorErrors(t)
    },
    {
      type: FieldType.Query,
      name: 'assignedToSalesChannelViewId',
      query: salesChannelViewsQuerySelector,
      label: t('products.products.filters.labels.assignedToStore'),
      labelBy: 'name',
      valueBy: 'id',
      dataKey: 'salesChannelViews',
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
      helpText: t('products.products.filters.help.assignedToStore'),
    },
    {
      type: FieldType.Query,
      name: 'notAssignedToSalesChannelViewId',
      query: salesChannelViewsQuerySelector,
      label: t('products.products.filters.labels.notAssignedToStore'),
      labelBy: 'name',
      valueBy: 'id',
      dataKey: 'salesChannelViews',
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
      helpText: t('products.products.filters.help.notAssignedToStore'),
    },
    {
      type: FieldType.Query,
      name: 'presentOnStoreSalesChannelId',
      query: salesChannelsQuerySelector,
      label: t('products.products.filters.labels.presentOnStore'),
      labelBy: 'hostname',
      valueBy: 'id',
      dataKey: 'salesChannels',
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
      placeholder: t('products.products.filters.placeholders.presentOnStore'),
      helpText: t('products.products.filters.help.presentOnStore'),
    },
    {
      type: FieldType.Query,
      name: 'notPresentOnStoreSalesChannelId',
      query: salesChannelsQuerySelector,
      label: t('products.products.filters.labels.notPresentOnStore'),
      labelBy: 'hostname',
      valueBy: 'id',
      dataKey: 'salesChannels',
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
      placeholder: t('products.products.filters.placeholders.notPresentOnStore'),
      helpText: t('products.products.filters.help.notPresentOnStore'),
    },
    {
      type: FieldType.Query,
      name: 'amazonBrowserNodeId',
      query: amazonBrowseNodesQuerySelector,
      label: t('products.products.filters.labels.amazonBrowseNode'),
      labelBy: 'name',
      valueBy: 'id',
      dataKey: 'amazonBrowseNodes',
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
      placeholder: t('products.products.filters.placeholders.amazonBrowseNode'),
      helpText: t('products.products.filters.help.amazonBrowseNode'),
      queryVariables: { filter: { hasChildren: { exact: false } } },
    },
    {
      type: FieldType.Query,
      name: 'excludeAmazonBrowserNodeId',
      query: amazonBrowseNodesQuerySelector,
      label: t('products.products.filters.labels.excludeAmazonBrowseNode'),
      labelBy: 'name',
      valueBy: 'id',
      dataKey: 'amazonBrowseNodes',
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
      placeholder: t('products.products.filters.placeholders.excludeAmazonBrowseNode'),
      helpText: t('products.products.filters.help.excludeAmazonBrowseNode'),
      queryVariables: { filter: { hasChildren: { exact: false } } },
    },
    {
      type: FieldType.Query,
      name: 'ebayProductCategoryId',
      query: ebayCategoriesQuerySelector,
      label: t('products.products.filters.labels.ebayProductCategory'),
      labelBy: 'fullName',
      valueBy: 'id',
      dataKey: 'ebayCategories',
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
      placeholder: t('products.products.filters.placeholders.ebayProductCategory'),
      helpText: t('products.products.filters.help.ebayProductCategory'),
      queryVariables: { filter: { hasChildren: { exact: false } } },
    },
    {
      type: FieldType.Query,
      name: 'excludeEbayProductCategoryId',
      query: ebayCategoriesQuerySelector,
      label: t('products.products.filters.labels.excludeEbayProductCategory'),
      labelBy: 'fullName',
      valueBy: 'id',
      dataKey: 'ebayCategories',
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
      placeholder: t('products.products.filters.placeholders.excludeEbayProductCategory'),
      helpText: t('products.products.filters.help.excludeEbayProductCategory'),
      queryVariables: { filter: { hasChildren: { exact: false } } },
    },
    {
      type: FieldType.Query,
      name: 'sheinProductCategoryId',
      query: sheinCategoriesQuerySelector,
      label: t('products.products.filters.labels.sheinProductCategory'),
      labelBy: 'name',
      valueBy: 'id',
      dataKey: 'sheinCategories',
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
      placeholder: t('products.products.filters.placeholders.sheinProductCategory'),
      helpText: t('products.products.filters.help.sheinProductCategory'),
      queryVariables: { filter: { isLeaf: { exact: true } } },
    },
    {
      type: FieldType.Query,
      name: 'excludeSheinProductCategoryId',
      query: sheinCategoriesQuerySelector,
      label: t('products.products.filters.labels.excludeSheinProductCategory'),
      labelBy: 'name',
      valueBy: 'id',
      dataKey: 'sheinCategories',
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
      placeholder: t('products.products.filters.placeholders.excludeSheinProductCategory'),
      helpText: t('products.products.filters.help.excludeSheinProductCategory'),
      queryVariables: { filter: { isLeaf: { exact: true } } },
    },
    {
      type: FieldType.Query,
      name: 'valueSelectIds',
      query: propertySelectValuesQuerySelector,
      label: t('products.products.filters.labels.attributeValue'),
      labelBy: "fullValueName",
      valueBy: "id",
      dataKey: "propertySelectValues",
      filterable: true,
      multiple: true,
      isEdge: true,
      addLookup: false,
    },
    {
      type: FieldType.Query,
      name: 'notValueSelectId',
      query: propertySelectValuesQuerySelector,
      label: t('products.products.filters.labels.excludeAttributeValue'),
      labelBy: "fullValueName",
      valueBy: "id",
      dataKey: "propertySelectValues",
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
      filterKey: 'valueSelectId',
      isNot: true,
    },
    {
      type: FieldType.Query,
      name: 'hasAttribute',
      query: propertiesQuerySelector,
      label: t('products.products.filters.labels.hasAttribute'),
      labelBy: "name",
      valueBy: "id",
      dataKey: "properties",
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
      filterKey: 'propertyId',
      placeholder: t('products.products.filters.placeholders.hasAttribute'),
      helpText: t('products.products.filters.help.hasAttribute'),
    },
    {
      type: FieldType.Query,
      name: 'missingAttribute',
      query: propertiesQuerySelector,
      label: t('products.products.filters.labels.missingAttribute'),
      labelBy: "name",
      valueBy: "id",
      dataKey: "properties",
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
      filterKey: 'propertyId',
      isNot: true,
      placeholder: t('products.products.filters.placeholders.missingAttribute'),
      helpText: t('products.products.filters.help.missingAttribute'),
    },
    {
      type: FieldType.Query,
      name: 'hasTitleInSalesChannel',
      query: companyContentViewsQuery,
      labelBy: 'name',
      valueBy: 'key',
      label: t('products.products.filters.labels.hasTitleInSalesChannel'),
      dataKey: 'companyContentViews',
      filterable: true,
      multiple: false,
      isEdge: false,
      addLookup: false,
      skipFilterParam: true,
      filterKey: 'contentFieldInView',
      lookupKeys: ['contentViewKey'],
      fixedFilter: { field: 'NAME' },
      placeholder: t('products.products.filters.placeholders.hasTitleInSalesChannel'),
    },
    {
      type: FieldType.Query,
      name: 'missingTitleInSalesChannel',
      query: companyContentViewsQuery,
      labelBy: 'name',
      valueBy: 'key',
      label: t('products.products.filters.labels.missingTitleInSalesChannel'),
      dataKey: 'companyContentViews',
      filterable: true,
      multiple: false,
      isEdge: false,
      addLookup: false,
      skipFilterParam: true,
      filterKey: 'contentFieldInView',
      lookupKeys: ['contentViewKey'],
      fixedFilter: { field: 'NAME' },
      isNot: true,
      placeholder: t('products.products.filters.placeholders.missingTitleInSalesChannel'),
    },
    {
      type: FieldType.Query,
      name: 'hasSubtitleInSalesChannel',
      query: companyContentViewsQuery,
      labelBy: 'name',
      valueBy: 'key',
      label: t('products.products.filters.labels.hasSubtitleInSalesChannel'),
      dataKey: 'companyContentViews',
      filterable: true,
      multiple: false,
      isEdge: false,
      addLookup: false,
      skipFilterParam: true,
      filterKey: 'contentFieldInView',
      lookupKeys: ['contentViewKey'],
      fixedFilter: { field: 'SUBTITLE' },
      placeholder: t('products.products.filters.placeholders.hasSubtitleInSalesChannel'),
    },
    {
      type: FieldType.Query,
      name: 'missingSubtitleInSalesChannel',
      query: companyContentViewsQuery,
      labelBy: 'name',
      valueBy: 'key',
      label: t('products.products.filters.labels.missingSubtitleInSalesChannel'),
      dataKey: 'companyContentViews',
      filterable: true,
      multiple: false,
      isEdge: false,
      addLookup: false,
      skipFilterParam: true,
      filterKey: 'contentFieldInView',
      lookupKeys: ['contentViewKey'],
      fixedFilter: { field: 'SUBTITLE' },
      isNot: true,
      placeholder: t('products.products.filters.placeholders.missingSubtitleInSalesChannel'),
    },
    {
      type: FieldType.Query,
      name: 'hasDescriptionInSalesChannel',
      query: companyContentViewsQuery,
      labelBy: 'name',
      valueBy: 'key',
      label: t('products.products.filters.labels.hasDescriptionInSalesChannel'),
      dataKey: 'companyContentViews',
      filterable: true,
      multiple: false,
      isEdge: false,
      addLookup: false,
      skipFilterParam: true,
      filterKey: 'contentFieldInView',
      lookupKeys: ['contentViewKey'],
      fixedFilter: { field: 'DESCRIPTION' },
      placeholder: t('products.products.filters.placeholders.hasDescriptionInSalesChannel'),
    },
    {
      type: FieldType.Query,
      name: 'missingDescriptionInSalesChannel',
      query: companyContentViewsQuery,
      labelBy: 'name',
      valueBy: 'key',
      label: t('products.products.filters.labels.missingDescriptionInSalesChannel'),
      dataKey: 'companyContentViews',
      filterable: true,
      multiple: false,
      isEdge: false,
      addLookup: false,
      skipFilterParam: true,
      filterKey: 'contentFieldInView',
      lookupKeys: ['contentViewKey'],
      fixedFilter: { field: 'DESCRIPTION' },
      isNot: true,
      placeholder: t('products.products.filters.placeholders.missingDescriptionInSalesChannel'),
    },
    {
      type: FieldType.Query,
      name: 'hasShortDescriptionInSalesChannel',
      query: companyContentViewsQuery,
      labelBy: 'name',
      valueBy: 'key',
      label: t('products.products.filters.labels.hasShortDescriptionInSalesChannel'),
      dataKey: 'companyContentViews',
      filterable: true,
      multiple: false,
      isEdge: false,
      addLookup: false,
      skipFilterParam: true,
      filterKey: 'contentFieldInView',
      lookupKeys: ['contentViewKey'],
      fixedFilter: { field: 'SHORT_DESCRIPTION' },
      placeholder: t('products.products.filters.placeholders.hasShortDescriptionInSalesChannel'),
    },
    {
      type: FieldType.Query,
      name: 'missingShortDescriptionInSalesChannel',
      query: companyContentViewsQuery,
      labelBy: 'name',
      valueBy: 'key',
      label: t('products.products.filters.labels.missingShortDescriptionInSalesChannel'),
      dataKey: 'companyContentViews',
      filterable: true,
      multiple: false,
      isEdge: false,
      addLookup: false,
      skipFilterParam: true,
      filterKey: 'contentFieldInView',
      lookupKeys: ['contentViewKey'],
      fixedFilter: { field: 'SHORT_DESCRIPTION' },
      isNot: true,
      placeholder: t('products.products.filters.placeholders.missingShortDescriptionInSalesChannel'),
    },
    {
      type: FieldType.Query,
      name: 'hasUrlKeyInSalesChannel',
      query: companyContentViewsQuery,
      labelBy: 'name',
      valueBy: 'key',
      label: t('products.products.filters.labels.hasUrlKeyInSalesChannel'),
      dataKey: 'companyContentViews',
      filterable: true,
      multiple: false,
      isEdge: false,
      addLookup: false,
      skipFilterParam: true,
      filterKey: 'contentFieldInView',
      lookupKeys: ['contentViewKey'],
      fixedFilter: { field: 'URL_KEY' },
      placeholder: t('products.products.filters.placeholders.hasUrlKeyInSalesChannel'),
    },
    {
      type: FieldType.Query,
      name: 'missingUrlKeyInSalesChannel',
      query: companyContentViewsQuery,
      labelBy: 'name',
      valueBy: 'key',
      label: t('products.products.filters.labels.missingUrlKeyInSalesChannel'),
      dataKey: 'companyContentViews',
      filterable: true,
      multiple: false,
      isEdge: false,
      addLookup: false,
      skipFilterParam: true,
      filterKey: 'contentFieldInView',
      lookupKeys: ['contentViewKey'],
      fixedFilter: { field: 'URL_KEY' },
      isNot: true,
      placeholder: t('products.products.filters.placeholders.missingUrlKeyInSalesChannel'),
    },
    {
      type: FieldType.Query,
      name: 'hasBulletPointsInSalesChannel',
      query: companyContentViewsQuery,
      labelBy: 'name',
      valueBy: 'key',
      label: t('products.products.filters.labels.hasBulletPointsInSalesChannel'),
      dataKey: 'companyContentViews',
      filterable: true,
      multiple: false,
      isEdge: false,
      addLookup: false,
      skipFilterParam: true,
      filterKey: 'contentFieldInView',
      lookupKeys: ['contentViewKey'],
      fixedFilter: { field: 'BULLET_POINTS' },
      placeholder: t('products.products.filters.placeholders.hasBulletPointsInSalesChannel'),
    },
    {
      type: FieldType.Query,
      name: 'missingBulletPointsInSalesChannel',
      query: companyContentViewsQuery,
      labelBy: 'name',
      valueBy: 'key',
      label: t('products.products.filters.labels.missingBulletPointsInSalesChannel'),
      dataKey: 'companyContentViews',
      filterable: true,
      multiple: false,
      isEdge: false,
      addLookup: false,
      skipFilterParam: true,
      filterKey: 'contentFieldInView',
      lookupKeys: ['contentViewKey'],
      fixedFilter: { field: 'BULLET_POINTS' },
      isNot: true,
      placeholder: t('products.products.filters.placeholders.missingBulletPointsInSalesChannel'),
    },
    {
      type: FieldType.Text,
      name: 'language',
      label: t('products.products.filters.labels.language'),
      placeholder: t('products.products.filters.placeholders.language'),
    },
    {
      type: FieldType.Integration,
      name: 'hasImagesInSalesChannel',
      query: salesChannelsQuerySelector,
      dataKey: 'salesChannels',
      label: t('products.products.filters.labels.hasImagesInSalesChannel'),
      placeholder: t('products.products.filters.placeholders.hasImagesInSalesChannel'),
      filterable: true,
      multiple: false,
      isEdge: true,
      addDefault: true,
      addLookup: false,
    },
    {
      type: FieldType.Integration,
      name: 'missingImagesInSalesChannel',
      query: salesChannelsQuerySelector,
      dataKey: 'salesChannels',
      label: t('products.products.filters.labels.missingImagesInSalesChannel'),
      placeholder: t('products.products.filters.placeholders.missingImagesInSalesChannel'),
      filterable: true,
      multiple: false,
      isEdge: true,
      addDefault: true,
      addLookup: false,
    },
    {
      type: FieldType.Integration,
      name: 'hasDocumentsInSalesChannel',
      query: salesChannelsQuerySelector,
      dataKey: 'salesChannels',
      label: t('products.products.filters.labels.hasDocumentsInSalesChannel'),
      placeholder: t('products.products.filters.placeholders.hasDocumentsInSalesChannel'),
      filterable: true,
      multiple: false,
      isEdge: true,
      addDefault: true,
      addLookup: false,
    },
    {
      type: FieldType.Integration,
      name: 'missingDocumentsInSalesChannel',
      query: salesChannelsQuerySelector,
      dataKey: 'salesChannels',
      label: t('products.products.filters.labels.missingDocumentsInSalesChannel'),
      placeholder: t('products.products.filters.placeholders.missingDocumentsInSalesChannel'),
      filterable: true,
      multiple: false,
      isEdge: true,
      addDefault: true,
      addLookup: false,
    },
    {
      type: FieldType.Integration,
      name: 'hasVideosInSalesChannel',
      query: salesChannelsQuerySelector,
      dataKey: 'salesChannels',
      label: t('products.products.filters.labels.hasVideosInSalesChannel'),
      placeholder: t('products.products.filters.placeholders.hasVideosInSalesChannel'),
      filterable: true,
      multiple: false,
      isEdge: true,
      addDefault: true,
      addLookup: false,
    },
    {
      type: FieldType.Integration,
      name: 'missingVideosInSalesChannel',
      query: salesChannelsQuerySelector,
      dataKey: 'salesChannels',
      label: t('products.products.filters.labels.missingVideosInSalesChannel'),
      placeholder: t('products.products.filters.placeholders.missingVideosInSalesChannel'),
      filterable: true,
      multiple: false,
      isEdge: true,
      addDefault: true,
      addLookup: false,
    },
  ],
  filterSections: [
    {
      title: t('products.products.filters.sections.general.title'),
      helpText: t('products.products.filters.sections.general.help'),
      filters: [
        'sku',
        'vatRate',
        'type',
        'exceptType',
        'active',
        'allowBackorder',
        'hasAliasProducts',
        'aliasParentProduct',
        'skus',
        'excludeSkus',
        'hasPricesForCurrency',
        'missingPricesForCurrency',
        'hasPriceList',
        'missingPriceList',
        'createdAtRange',
        'updatedAtRange',
        'hasEanCodes',
      ],
    },
    {
      title: t('products.products.filters.sections.contentQuality.title'),
      helpText: t('products.products.filters.sections.contentQuality.help'),
      filters: [
        'inspector',
        'missingInformation',
        'inspectorNotSuccessfullyCodeError',
        'excludeInspectorNotSuccessfullyCodeError',
      ],
    },
    {
      title: t('products.products.filters.sections.integrations.title'),
      helpText: t('products.products.filters.sections.integrations.help'),
      filters: [
        'assignedToSalesChannelViewId',
        'notAssignedToSalesChannelViewId',
        'presentOnStoreSalesChannelId',
        'notPresentOnStoreSalesChannelId',
        'amazonBrowserNodeId',
        'excludeAmazonBrowserNodeId',
        'ebayProductCategoryId',
        'excludeEbayProductCategoryId',
        'sheinProductCategoryId',
        'excludeSheinProductCategoryId',
      ],
    },
    {
      title: t('products.products.filters.sections.properties.title'),
      helpText: t('products.products.filters.sections.properties.help'),
      filters: [
        'valueSelectIds',
        'notValueSelectId',
        'hasAttribute',
        'missingAttribute',
      ],
    },
    {
      title: t('products.products.filters.sections.content.title'),
      helpText: t('products.products.filters.sections.content.help'),
      filters: [
        'hasTitleInSalesChannel',
        'missingTitleInSalesChannel',
        'hasSubtitleInSalesChannel',
        'missingSubtitleInSalesChannel',
        'hasDescriptionInSalesChannel',
        'missingDescriptionInSalesChannel',
        'hasShortDescriptionInSalesChannel',
        'missingShortDescriptionInSalesChannel',
        'hasUrlKeyInSalesChannel',
        'missingUrlKeyInSalesChannel',
        'hasBulletPointsInSalesChannel',
        'missingBulletPointsInSalesChannel',
      ],
    },
    {
      title: t('products.products.filters.sections.media.title'),
      helpText: t('products.products.filters.sections.media.help'),
      filters: [
        'hasImagesInSalesChannel',
        'missingImagesInSalesChannel',
        'hasDocumentsInSalesChannel',
        'missingDocumentsInSalesChannel',
        'hasVideosInSalesChannel',
        'missingVideosInSalesChannel',
      ],
    },
  ],
  orders: [
    {
      name: 'name',
      label: t('shared.labels.name'),
      type: OrderType.ASC
    },
    {
      name: 'name',
      label: t('shared.labels.name'),
      type: OrderType.DESC
    },
    {
      name: 'sku',
      label: t('shared.labels.sku'),
      type: OrderType.ASC
    },
    {
      name: 'sku',
      label: t('shared.labels.sku'),
      type: OrderType.DESC
    },
    {
      name: 'active',
      label: t('shared.labels.active'),
      type: OrderType.ASC
    },
    {
      name: 'active',
      label: t('shared.labels.active'),
      type: OrderType.DESC
    },
    {
      name: 'createdAt',
      label: t('shared.sort.oldest'),
      type: OrderType.ASC
    },
    {
      name: 'createdAt',
      label: t('shared.sort.newest'),
      type: OrderType.DESC
    },
    {
      name: 'updatedAt',
      label: t('shared.labels.updatedAt'),
      type: OrderType.ASC
    },
    {
      name: 'updatedAt',
      label: t('shared.labels.updatedAt'),
      type: OrderType.DESC
    },
  ]
});

export const listingConfigConstructor = (t: Function, isMainPage: boolean = false): ListingConfig => ({
  headers: [t('shared.labels.name'), t('shared.labels.sku'), t('products.products.labels.inspectorStatus'), t('products.products.labels.type.title'), t('shared.labels.active')],
  fields: [
    {
      type: FieldType.Text,
      name: 'name',
      addImage: true,
      imageField: 'thumbnailUrl'
    },
    {
      type: FieldType.Text,
      name: 'sku'
    },
    {
      name: 'percentageInspectorStatus',
      type: FieldType.InspectorProgress,
    },
    {
      type: FieldType.Badge,
      name: 'type',
      badgeMap: getProductTypeBadgeMap(t)
    },
    {
      type: FieldType.Boolean,
      name: 'active'
    },
  ],
  identifierKey: 'id',
  addActions: false,
  showUrlName: 'products.products.show',
  addShow: true,
  addPagination: true,
  addBulkEdit: isMainPage,
  bulkEditUrl: isMainPage ? { name: 'products.products.edit' } : undefined,
  isMainPage: isMainPage,
  defaultGridIcon: 'box',
  addGridView: true,
  addBulkDelete: isMainPage,
  bulkDeleteMutation: deleteProductsMutation,
  bulkDeleteSuccessAlert: t('products.products.alert.toast.bulkDeleteSuccess'),
  bulkDeleteErrorAlert: t('products.products.alert.toast.bulkDeleteError')
});

export const listingQueryKey = 'products';
export const listingQuery = productsQuery;


export interface VatRate {
  id: string;
  name: string;
  rate: number;
}


export interface Inspector {
  id: string;
  hasMissingInformation: boolean;
}

export interface SalesChannelViewAssignProduct {
  id: string;
  name: string;
}

export interface SalesChannelView {
  id: string;
  name: string;
  active: boolean;
}

export interface RemoteProduct {
  id: string;
  hasErrors: boolean;
}

export interface SalesChannelViewAssign {
  id: string;
  remoteUrl: string;
  remoteProductPercentage: number;
  integrationType: string;
  product: SalesChannelViewAssignProduct;
  salesChannelView: SalesChannelView;
  remoteProduct: RemoteProduct;
}

export interface ProductProperty {
  id: string;
  property: {
    id: string;
    name: string;
    type: string;
    isProductType: boolean;
  };
  valueSelect?: {
    id: string;
    value: string;
    productpropertiesruleSet?: { id: string }[];
  } | null;
  valueMultiSelect?: {
    id: string;
    value: string;
  }[] | null;
  valueBoolean?: boolean | null;
  valueInt?: number | null;
  valueFloat?: number | null;
  valueDate?: string | null;
  valueDatetime?: string | null;

}


export interface Product {
  id: string;
  proxyId?: string;
  sku: string;
  active: boolean;
  hasParents: boolean;
  type: string;
  aliasProducts: ProductWithAliasFields[];
  aliasParentProduct: ProductWithAliasFields;
  inspector: Inspector;
  vatRate?: VatRate;
  allowBackorder: boolean;
  saleschannelviewassignSet: SalesChannelViewAssign[];
  productpropertySet: ProductProperty[];
}

export interface ProductWithAliasFields extends Product {
  name: string;
  thumbnailUrl?: string;
  inspectorStatus: number;
  percentageInspectorStatus?: {
    percentage: number;
    inspectorStatus: number;
    blocks: { code: string | number; completed: boolean }[];
  };
}


export interface Select {
  id: string | null;
  value?: string;
}

export interface  ProductPropertyTranslation {
  id?:  string | null;
  valueText?: string;
  valueDescription?: string;
  language: string | null;
}

export interface ProductPropertyValue {
  id?: string;
  property: { id: string, name: string, type: string; isProductType: boolean; requireType?: string },
  valueBoolean?: boolean | null;
  valueInt?: number | null;
  valueFloat?: number | null;
  valueDate?: string | null;
  valueDateTime?: string | null;
  valueSelect?: Select | null;
  valueMultiSelect?: Select[] | null
  translation: ProductPropertyTranslation
}
