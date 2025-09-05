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
import { productsQuery } from "../../../shared/api/queries/products.js"
import { vatRatesQuerySelector } from "../../../shared/api/queries/vatRates.js";
import { createVatRateMutation } from "../../../shared/api/mutations/vatRates.js";
import { baseFormConfigConstructor as baseVatRateConfigConstructor } from '../../settings/vat-rates/configs'
import { Badge, Icon } from "../../../shared/components/organisms/general-show/showConfig";
import { propertySelectValuesQuerySelector } from "../../../shared/api/queries/properties.js";
import { amazonChannelsQuerySelector, salesChannelViewsQuerySelector } from "../../../shared/api/queries/salesChannels.js";
import { deleteProductsMutation } from "../../../shared/api/mutations/products.js";

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
  { code: "103", name: t(`dashboard.cards.products.inspector.103.title`) },
  { code: "104", name: t(`dashboard.cards.products.inspector.104.title`) },
  { code: "105", name: t(`dashboard.cards.products.inspector.105.title`) },
  { code: "106", name: t(`dashboard.cards.products.inspector.106.title`) },
  { code: "107", name: t(`dashboard.cards.products.inspector.107.title`) },
  { code: "108", name: t(`dashboard.cards.products.inspector.108.title`) },
  { code: "109", name: t(`dashboard.cards.products.inspector.109.title`) },
  { code: "110", name: t(`dashboard.cards.products.inspector.110.title`) },
  { code: "111", name: t(`dashboard.cards.products.inspector.111.title`) },
  { code: "112", name: t(`dashboard.cards.products.inspector.112.title`) },
  { code: "113", name: t(`dashboard.cards.products.inspector.113.title`) },
  { code: "114", name: t(`dashboard.cards.products.inspector.114.title`) },
  { code: "115", name: t(`dashboard.cards.products.inspector.115.title`) },
  { code: "116", name: t(`dashboard.cards.products.inspector.116.title`) },
  { code: "117", name: t(`dashboard.cards.products.inspector.117.title`) },
  // { code: "118", name: t(`dashboard.cards.products.inspector.118.title`) },
  { code: "119", name: t(`dashboard.cards.products.inspector.119.title`) },
  { code: "120", name: t(`dashboard.cards.products.inspector.120.title`) },
  { code: "121", name: t(`dashboard.cards.products.inspector.121.title`) },
  { code: "122", name: t(`dashboard.cards.products.inspector.122.title`) },
  { code: "123", name: t(`dashboard.cards.products.inspector.123.title`) },
  { code: "124", name: t(`dashboard.cards.products.inspector.124.title`) },
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
      label: t('shared.labels.sku'),
      placeholder: t('shared.placeholders.sku'),
      addLookup: true,
    },
     {
      type: FieldType.Query,
      name: 'vatRate',
        query: vatRatesQuerySelector,
      label: t('products.products.labels.vatRate'),
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
      type: FieldType.Query,
      name: 'valueSelectId',
      query: propertySelectValuesQuerySelector,
      label: t('products.eanCodes.labels.attributeValue'),
      labelBy: "fullValueName",
      valueBy: "id",
      dataKey: "propertySelectValues",
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
    },
    {
      type: FieldType.Query,
      name: 'assignedToSalesChannelViewId',
      query: salesChannelViewsQuerySelector,
      label: t('integrations.salesChannel.labels.assignedToSalesChannelView'),
      labelBy: 'name',
      valueBy: 'id',
      dataKey: 'salesChannelViews',
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
    },
    {
      type: FieldType.Query,
      name: 'notAssignedToSalesChannelViewId',
      query: salesChannelViewsQuerySelector,
      label: t('integrations.salesChannel.labels.notAssignedToSalesChannelView'),
      labelBy: 'name',
      valueBy: 'id',
      dataKey: 'salesChannelViews',
      filterable: true,
      multiple: false,
      isEdge: true,
      addLookup: false,
    },
    ...(
      hasAmazon
        ? [{
            type: FieldType.Query,
            name: 'amazonProductsWithIssuesForSalesChannel',
            query: amazonChannelsQuerySelector,
            label: t('integrations.salesChannel.amazon.labels.productsWithIssuesForSalesChannel'),
            labelBy: 'hostname',
            valueBy: 'id',
            dataKey: 'amazonChannels',
            filterable: true,
            multiple: false,
            isEdge: true,
            addLookup: false,
          } as SearchFilter]
        : []
    ),
    {
      type: FieldType.Choice,
      name: 'type',
      labelBy: 'name',
      valueBy: 'code',
      label: t('products.products.labels.type.title'),
      filterable: false,
      addLookup: true,
      options: getProductTypeOptions(t)
    },
    {
      type: FieldType.Choice,
      name: 'inspectorNotSuccessfullyCodeError',
      labelBy: 'name',
      valueBy: 'code',
      label: t('products.products.labels.inspectorErrors'),
      filterable: true,
      addLookup: false,
      options: getInspectorErrors(t)
    },
    {
      type: FieldType.Boolean,
      addLookup: true,
      strict: true,
      name: 'active',
      label: t('shared.labels.active')
    },
    {
      type: FieldType.Boolean,
      strict: true,
      name: 'inspector',
      lookupKeys: ['hasMissingInformation'],
      label: t('products.products.inspector.labels.missingInfo'),
      addLookup: true,
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
      label: t('shared.labels.createdAt'),
      type: OrderType.ASC
    },
    {
      name: 'createdAt',
      label: t('shared.labels.createdAt'),
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
  addBulkEdit: false,
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