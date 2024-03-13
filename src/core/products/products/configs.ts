import {FormConfig, FormField, FormType} from '../../../shared/components/organisms/general-form/formConfig';
import {FieldType, ProductType, Url} from '../../../shared/utils/constants.js'
import {SearchConfig} from "../../../shared/components/organisms/general-search/searchConfig";
import {ListingConfig} from "../../../shared/components/organisms/general-listing/listingConfig";
import {productsQuery} from "../../../shared/api/queries/products.js"
import {taxesQuery} from "../../../shared/api/queries/taxes";

export const getProductTypeOptions = (t) => [
  { name: t('products.products.labels.type.choices.umbrella'), code: ProductType.Umbrella },
  { name: t('products.products.labels.type.choices.bundle'), code: ProductType.Bundle },
  { name: t('products.products.labels.type.choices.variation'), code: ProductType.Variation },
];

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
      name: 'taxRate',
      label: t('products.products.labels.taxRate'),
      labelBy: 'name',
      valueBy: 'id',
      query: taxesQuery,
      dataKey: 'taxes',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
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
  filters: [],
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


export interface TaxRate {
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
  taxRate: TaxRate;
  alwaysOnStock: boolean;
}