import {CreateOnTheFly, FormConfig, FormField, FormType, QueryFormField} from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType, ProductType, Url } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import { productsQuery } from "../../../shared/api/queries/products.js"
import { vatRatesQuery } from "../../../shared/api/queries/vatRates.js";
import { createVatRateMutation } from "../../../shared/api/mutations/vatRates.js";
import { baseFormConfigConstructor as baseVatRateConfigConstructor } from '../../settings/vat-rates/configs'

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
  { name: t('products.products.labels.type.choices.dropship'), code: ProductType.Dropship },
  { name: t('products.products.labels.type.choices.manufacturable'), code: ProductType.Manufacturable },
  { name: t('products.products.labels.type.choices.configurable'), code: ProductType.Configurable },
  { name: t('products.products.labels.type.choices.supplier'), code: ProductType.Supplier },
];

export const getProductTypeBadgeMap = (t) => ({
  [ProductType.Configurable]: { text: t('products.products.labels.type.choices.configurable'), color: 'blue' },
  [ProductType.Bundle]: { text: t('products.products.labels.type.choices.bundle'), color: 'green' },
  [ProductType.Simple]: { text: t('products.products.labels.type.choices.variation'), color: 'yellow' },
  [ProductType.Dropship]: { text: t('products.products.labels.type.choices.dropship'), color: 'primary' },
  [ProductType.Manufacturable]: { text: t('products.products.labels.type.choices.manufacturable'), color: 'red' },
  [ProductType.Supplier]: { text: t('products.products.labels.type.choices.supplier'), color: 'purple' },
});

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
      query: vatRatesQuery,
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
      query: vatRatesQuery,
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

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
     {
      type: FieldType.Query,
      name: 'vatRate',
      query: vatRatesQuery,
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
      type: FieldType.Boolean,
      strict: true,
      name: 'forSale',
      label: t('products.products.labels.forSale')
    },
    {
      type: FieldType.Boolean,
      strict: true,
      name: 'inspector',
      lookupKeys: ['hasMissingInformation'],
      label: t('products.products.inspector.labels.missingInfo'),
      addLookup: true,
      lookupType: 'none'
    },
  ],
  orders: []
});

export const listingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [t('shared.labels.name'), t('products.products.labels.type.title'), t('shared.labels.active'), t('products.products.labels.allowBackorder')],
  fields: [
    {
      type: FieldType.Text,
      name: 'name',
      addImage: true,
      imageField: 'thumbnailUrl'
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
    {
      type: FieldType.Boolean,
      name: 'allowBackorder'
    },
  ],
  identifierKey: 'id',
  addActions: false,
  showUrlName: 'products.products.show',
  addShow: true,
  addPagination: true,
});

export const listingQueryKey = 'products';
export const listingQuery = productsQuery;


export interface VatRate {
  id: string;
  name: string;
  rate: number;
}

export interface BaseProduct {
  id: string;
  name: string;
  active: boolean;
  type: string;
  thumbnailUrl: string;
}

export interface Inspector {
  id: string;
}

export interface Product {
  id: string;
  proxyId?: string;
  sku: string;
  active: boolean;
  forSale: boolean;
  type: string;
  inspector: Inspector;
  vatRate?: VatRate;
  allowBackorder: boolean;
  productionTime?: number;
  inventoryPhysical?: number;
  inventorySalable?: number;
  inventoryReserved?: number;
  inventoryAwaitInventory?: number;
  baseProducts?: BaseProduct[]
}

export interface Select {
  id: string | null;
  value?: string;
}

export interface  ProductPropertyTranslation {
  id?: string;
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