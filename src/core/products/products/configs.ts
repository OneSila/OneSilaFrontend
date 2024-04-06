import {CreateOnTheFly, FormConfig, FormField, FormType, QueryFormField} from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType, ProductType, Url } from '../../../shared/utils/constants.js'
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import { productsQuery } from "../../../shared/api/queries/products.js"
import { vatRatesQuery } from "../../../shared/api/queries/vatRates.js";
import { createVatRateMutation } from "../../../shared/api/mutations/vatRates.js";
import { baseFormConfigConstructor as baseVatRateConfigConstructor } from '../../settings/vat-rates/configs'
import {companiesQuery} from "../../../shared/api/queries/contacts";

const vatRateOnTheFlyConfig = (t: Function):CreateOnTheFly => ({
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
  { name: t('products.products.labels.type.choices.umbrella'), code: ProductType.Umbrella },
  { name: t('products.products.labels.type.choices.bundle'), code: ProductType.Bundle },
  { name: t('products.products.labels.type.choices.variation'), code: ProductType.Variation },
];

export const getProductTypeBadgeMap = (t) => ({
  [ProductType.Umbrella]: { text: t('products.products.labels.type.choices.umbrella'), color: 'blue' },
  [ProductType.Bundle]: { text: t('products.products.labels.type.choices.bundle'), color: 'green' },
  [ProductType.Variation]: { text: t('products.products.labels.type.choices.variation'), color: 'indigo' },
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
      label: t('products.products.labels.sku'),
      placeholder: t('shared.placeholders.sku'),
    },
    {
      type: FieldType.Checkbox,
      name: 'active',
      label: t('shared.labels.active'),
      default: false,
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
      name: 'alwaysOnStock',
      label: t('products.products.labels.alwaysOnStock'),
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
      addExactLookup: true,
      exactLookupKeys: ['id']
    },
    {
      type: FieldType.Choice,
      name: 'type',
      labelBy: 'name',
      valueBy: 'code',
      label: t('products.products.labels.type.title'),
      filterable: false,
      addExactLookup: true,
      options: getProductTypeOptions(t)
    }
  ],
  orders: []
});

export const listingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [t('products.products.labels.type.title'), t('products.products.labels.sku'), t('shared.labels.active'), t('products.products.labels.alwaysOnStock')],
  fields: [
    {
      type: FieldType.Text,
      name: 'type'
    },
      {
      type: FieldType.Text,
      name: 'sku'
    },
          {
      type: FieldType.Boolean,
      name: 'active'
    },
          {
      type: FieldType.Boolean,
      name: 'alwaysOnStock'
    },
  ],
  identifierKey: 'id',
  addActions: true,
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

export interface Product {
  id: string;
  proxyId?: string;
  sku: string;
  active: boolean;
  type: string;
  vatRate: VatRate;
  alwaysOnStock: boolean;
}