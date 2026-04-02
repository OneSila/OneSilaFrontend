import { FieldType } from '../../shared/utils/constants';
import type { ListingConfig } from '../../shared/components/organisms/general-listing/listingConfig';
import type { SearchConfig } from '../../shared/components/organisms/general-search/searchConfig';
import { companyLanguagesQuery } from '../../shared/api/queries/languages.js';
import { mappedImportsQuery, exportsQuery, importBrokenRecordsQuery } from '../../shared/api/queries/importsExports.js';
import {
  deleteExportMutation,
  deleteExportsMutation,
  deleteMappedImportMutation,
  deleteMappedImportsMutation,
} from '../../shared/api/mutations/importsExports.js';

export const MAPPED_IMPORT_TYPES = [
  'property',
  'property_select_value',
  'property_rule',
  'product',
  'ean_code',
] as const;

export const EXPORT_TYPES = ['json_feed', 'json', 'csv', 'excel'] as const;

export const EXPORT_KINDS = [
  'products',
  'product_properties',
  'properties',
  'property_select_values',
  'images',
  'documents',
  'videos',
  'sales_prices',
  'price_lists',
  'price_list_prices',
  'rules',
  'ean_codes',
] as const;

export type MappedImportType = typeof MAPPED_IMPORT_TYPES[number];
export type ExportType = typeof EXPORT_TYPES[number];
export type ExportKind = typeof EXPORT_KINDS[number];

export const VISIBLE_EXPORT_KINDS: ExportKind[] = [
  'products',
  'properties',
  'property_select_values',
  'images',
  'documents',
  'videos',
  'sales_prices',
  'price_lists',
  'price_list_prices',
  'rules',
  'ean_codes',
];

export const EXPORT_KIND_COLUMNS: Record<ExportKind, string[]> = {
  products: [
    'name',
    'sku',
    'type',
    'active',
    'vat_rate',
    'ean_code',
    'allow_backorder',
    'product_type',
    'translations',
    'sales_channels',
    'properties',
    'images',
    'documents',
    'prices',
    'sales_pricelist_items',
    'variations',
    'bundle_variations',
    'alias_variations',
    'configurator_select_values',
    'configurable_products_skus',
    'bundle_products_skus',
    'alias_products_skus',
  ],
  product_properties: ['product_data', 'product_sku', 'properties'],
  properties: [
    'id',
    'name',
    'internal_name',
    'type',
    'is_public_information',
    'add_to_filters',
    'has_image',
    'is_product_type',
    'translations',
    'property_select_values',
  ],
  property_select_values: ['id', 'value', 'property_data', 'translations'],
  images: ['image_url', 'video_url', 'document_url', 'type', 'title', 'description', 'product_data', 'product_sku', 'sort_order', 'is_main_image', 'document_type', 'document_language', 'thumbnail_image', 'is_document_image'],
  documents: ['image_url', 'video_url', 'document_url', 'type', 'title', 'description', 'product_data', 'product_sku', 'sort_order', 'is_main_image', 'document_type', 'document_language', 'thumbnail_image', 'is_document_image'],
  videos: ['image_url', 'video_url', 'document_url', 'type', 'title', 'description', 'product_data', 'product_sku', 'sort_order', 'is_main_image', 'document_type', 'document_language', 'thumbnail_image', 'is_document_image'],
  sales_prices: ['rrp', 'price', 'currency', 'product_data', 'product_sku'],
  price_lists: ['name', 'start_date', 'end_date', 'currency', 'vat_included', 'auto_update_prices', 'auto_add_products', 'price_change_pcnt', 'discount_pcnt', 'notes', 'sales_pricelist_items'],
  price_list_prices: ['price_auto', 'discount_auto', 'price_override', 'discount_override', 'product_data', 'product_sku', 'salespricelist_data', 'salespricelist_name'],
  rules: ['value', 'require_ean_code', 'items'],
  ean_codes: ['ean_code', 'product_sku'],
};

export const EXPORT_KIND_DEFAULT_COLUMNS: Record<ExportKind, string[]> = {
  products: ['name', 'sku', 'type', 'active', 'vat_rate', 'ean_code', 'allow_backorder', 'product_type', 'translations', 'sales_channels'],
  product_properties: ['product_data', 'properties'],
  properties: ['name', 'internal_name', 'type', 'is_public_information', 'add_to_filters', 'has_image', 'is_product_type', 'translations'],
  property_select_values: ['value', 'property_data', 'translations'],
  images: ['image_url', 'video_url', 'document_url', 'type', 'title', 'description', 'product_data', 'product_sku', 'sort_order', 'is_main_image', 'document_type', 'document_language', 'thumbnail_image', 'is_document_image'],
  documents: ['image_url', 'video_url', 'document_url', 'type', 'title', 'description', 'product_data', 'product_sku', 'sort_order', 'is_main_image', 'document_type', 'document_language', 'thumbnail_image', 'is_document_image'],
  videos: ['image_url', 'video_url', 'document_url', 'type', 'title', 'description', 'product_data', 'product_sku', 'sort_order', 'is_main_image', 'document_type', 'document_language', 'thumbnail_image', 'is_document_image'],
  sales_prices: ['rrp', 'price', 'currency', 'product_data'],
  price_lists: ['name', 'start_date', 'end_date', 'currency', 'vat_included', 'auto_update_prices', 'auto_add_products', 'price_change_pcnt', 'discount_pcnt', 'notes'],
  price_list_prices: ['price_auto', 'discount_auto', 'price_override', 'discount_override', 'product_data', 'salespricelist_data'],
  rules: ['value', 'require_ean_code', 'items'],
  ean_codes: ['ean_code', 'product_sku'],
};

export const EXPORT_KIND_PARAMETERS: Record<ExportKind, string[]> = {
  products: ['salesChannel', 'activeOnly', 'flat', 'ids', 'productPropertiesAddValueIds'],
  product_properties: ['ids', 'salesChannel', 'addTranslations', 'valuesAreIds', 'addValueIds'],
  properties: ['ids', 'propertySelectValuesAddValueIds'],
  property_select_values: ['ids', 'addValueIds', 'valuesAreIds'],
  images: ['ids', 'salesChannel', 'addProductSku', 'addTitle', 'addDescription'],
  documents: ['ids', 'salesChannel', 'addProductSku', 'addTitle', 'addDescription'],
  videos: ['ids', 'salesChannel', 'addProductSku', 'addTitle', 'addDescription'],
  sales_prices: ['ids', 'addProductSku'],
  price_lists: ['ids'],
  price_list_prices: ['ids', 'salespricelist', 'addProductSku'],
  rules: ['ids', 'salesChannel'],
  ean_codes: ['ids'],
};

export const MAPPED_IMPORT_LISTING_QUERY = mappedImportsQuery;
export const MAPPED_IMPORT_LISTING_QUERY_KEY = 'mappedImports';
export const EXPORTS_LISTING_QUERY = exportsQuery;
export const EXPORTS_LISTING_QUERY_KEY = 'exports';
export const IMPORT_BROKEN_RECORDS_QUERY = importBrokenRecordsQuery;
export const IMPORT_BROKEN_RECORDS_QUERY_KEY = 'importBrokenRecords';

const statusText = (t: Function, value: string) => {
  const key = `importsExports.statuses.${value}`;
  const translated = t(key);
  return translated === key ? value.replace(/_/g, ' ') : translated;
};

export const getStatusBadgeMap = (t: Function) => ({
  NEW: { text: statusText(t, 'NEW'), color: 'gray' },
  new: { text: statusText(t, 'NEW'), color: 'gray' },
  PENDING: { text: statusText(t, 'PENDING'), color: 'orange' },
  pending: { text: statusText(t, 'PENDING'), color: 'orange' },
  RUNNING: { text: statusText(t, 'RUNNING'), color: 'orange' },
  running: { text: statusText(t, 'RUNNING'), color: 'orange' },
  PROCESSING: { text: statusText(t, 'PROCESSING'), color: 'orange' },
  processing: { text: statusText(t, 'PROCESSING'), color: 'orange' },
  FAILED: { text: statusText(t, 'FAILED'), color: 'red' },
  failed: { text: statusText(t, 'FAILED'), color: 'red' },
  ERROR: { text: statusText(t, 'ERROR'), color: 'red' },
  error: { text: statusText(t, 'ERROR'), color: 'red' },
  SUCCESS: { text: statusText(t, 'SUCCESS'), color: 'green' },
  success: { text: statusText(t, 'SUCCESS'), color: 'green' },
  COMPLETED: { text: statusText(t, 'COMPLETED'), color: 'green' },
  completed: { text: statusText(t, 'COMPLETED'), color: 'green' },
  PARTIAL: { text: statusText(t, 'PARTIAL'), color: 'orange' },
  partial: { text: statusText(t, 'PARTIAL'), color: 'orange' },
  CANCELLED: { text: statusText(t, 'CANCELLED'), color: 'gray' },
  cancelled: { text: statusText(t, 'CANCELLED'), color: 'gray' },
});

export const getPercentageColorBadgeMap = (t: Function) => ({
  RED: { text: t('importsExports.progressColors.red'), color: 'red' },
  ORANGE: { text: t('importsExports.progressColors.orange'), color: 'orange' },
  GREEN: { text: t('importsExports.progressColors.green'), color: 'green' },
});

export const getMappedImportTypeOptions = (t: Function) =>
  MAPPED_IMPORT_TYPES.map((value) => ({
    value,
    label: t(`importsExports.mappedImports.types.${value}`),
  }));

export const getExportTypeOptions = (t: Function) =>
  EXPORT_TYPES.map((value) => ({
    value,
    label: t(`importsExports.exports.types.${value}`),
  }));

export const getExportKindOptions = (t: Function) =>
  VISIBLE_EXPORT_KINDS.map((value) => ({
    value,
    label: t(`importsExports.exports.kinds.${value}`),
  }));

export const getExportKindOptionsWithCurrent = (t: Function, currentValue?: string | null) => {
  const options = getExportKindOptions(t);
  if (!currentValue || options.some((option) => option.value === currentValue)) {
    return options;
  }

  return [
    ...options,
    { value: currentValue, label: t(`importsExports.exports.kinds.${currentValue}`) },
  ];
};

export const getLanguageLabel = (
  languages: Array<{ code: string; name?: string; nameLocal?: string; nameTranslated?: string }>,
  code?: string | null,
) => {
  if (!code) {
    return null;
  }

  const match = languages.find((language) => language.code === code);
  if (!match) {
    return code;
  }

  return match.nameTranslated || match.nameLocal || match.name || match.code;
};

export const getLanguageOptions = (
  languages: Array<{ code: string; name?: string; nameLocal?: string; nameTranslated?: string }>,
  includeEmpty = false,
  emptyLabel = 'None',
) => {
  const options = languages.map((language) => ({
    value: language.code,
    label: language.nameTranslated || language.nameLocal || language.name || language.code,
  }));

  if (!includeEmpty) {
    return options;
  }

  return [{ value: null, label: emptyLabel }, ...options];
};

export const mappedImportsSearchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: 'sort',
  filters: [
    {
      type: FieldType.Choice,
      name: 'status',
      label: t('shared.labels.status'),
      options: Object.keys(getStatusBadgeMap(t)).filter((value) => value === value.toUpperCase()).map((value) => ({
        label: statusText(t, value),
        value,
      })),
      labelBy: 'label',
      valueBy: 'value',
      filterable: true,
      multiple: true,
      removable: true,
    },
    {
      type: FieldType.Choice,
      name: 'type',
      label: t('shared.labels.type'),
      options: getMappedImportTypeOptions(t),
      labelBy: 'label',
      valueBy: 'value',
      filterable: true,
      multiple: true,
      removable: true,
    },
    {
      type: FieldType.Query,
      name: 'language',
      label: t('shared.labels.language'),
      query: companyLanguagesQuery,
      dataKey: 'companyLanguages',
      labelBy: 'name',
      valueBy: 'code',
      filterable: true,
      addLookup: true,
      multiple: true,
      removable: true,
    },
    { type: FieldType.Boolean, name: 'isPeriodic', label: t('importsExports.fields.isPeriodic'), strict: true, addLookup: true },
    { type: FieldType.Boolean, name: 'createOnly', label: t('importsExports.fields.createOnly'), strict: true, addLookup: true },
    { type: FieldType.Boolean, name: 'updateOnly', label: t('importsExports.fields.updateOnly'), strict: true, addLookup: true },
    { type: FieldType.Boolean, name: 'overrideOnly', label: t('importsExports.fields.overrideOnly'), strict: true, addLookup: true },
    { type: FieldType.Boolean, name: 'skipBrokenRecords', label: t('importsExports.fields.skipBrokenRecords'), strict: true, addLookup: true },
  ],
  orders: [],
});

export const exportsSearchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: 'sort',
  filters: [
    {
      type: FieldType.Choice,
      name: 'status',
      label: t('shared.labels.status'),
      options: Object.keys(getStatusBadgeMap(t)).filter((value) => value === value.toUpperCase()).map((value) => ({
        label: statusText(t, value),
        value,
      })),
      labelBy: 'label',
      valueBy: 'value',
      filterable: true,
      multiple: true,
      removable: true,
    },
    {
      type: FieldType.Choice,
      name: 'kind',
      label: t('importsExports.fields.kind'),
      options: getExportKindOptions(t),
      labelBy: 'label',
      valueBy: 'value',
      filterable: true,
      multiple: true,
      removable: true,
    },
    {
      type: FieldType.Choice,
      name: 'type',
      label: t('shared.labels.type'),
      options: getExportTypeOptions(t),
      labelBy: 'label',
      valueBy: 'value',
      filterable: true,
      multiple: true,
      removable: true,
    },
    {
      type: FieldType.Query,
      name: 'language',
      label: t('shared.labels.language'),
      query: companyLanguagesQuery,
      dataKey: 'companyLanguages',
      labelBy: 'name',
      valueBy: 'code',
      filterable: true,
      addLookup: true,
      multiple: true,
      removable: true,
    },
    { type: FieldType.Boolean, name: 'isPeriodic', label: t('importsExports.fields.isPeriodic'), strict: true, addLookup: true },
  ],
  orders: [],
});

export const mappedImportsListingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('shared.labels.type'),
    t('importsExports.fields.progressState'),
    t('importsExports.fields.isPeriodic'),
    t('importsExports.fields.createOnly'),
    t('importsExports.fields.updateOnly'),
    t('importsExports.fields.overrideOnly'),
    t('importsExports.fields.skipBrokenRecords'),
    t('importsExports.fields.totalRecords'),
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'type', type: FieldType.Text, accessor: (node) => t(`importsExports.mappedImports.types.${node.type}`) },
    { name: 'percentageColor', type: FieldType.Badge, badgeMap: getPercentageColorBadgeMap(t) },
    { name: 'isPeriodic', type: FieldType.Boolean },
    { name: 'createOnly', type: FieldType.Boolean },
    { name: 'updateOnly', type: FieldType.Boolean },
    { name: 'overrideOnly', type: FieldType.Boolean },
    { name: 'skipBrokenRecords', type: FieldType.Boolean },
    { name: 'totalRecords', type: FieldType.Text },
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'importsExports.mappedImports.edit',
  showUrlName: 'importsExports.mappedImports.show',
  addShow: true,
  addDelete: true,
  addPagination: true,
  addBulkDelete: true,
  isMainPage: true,
  deleteMutation: deleteMappedImportMutation,
  bulkDeleteMutation: deleteMappedImportsMutation,
  bulkDeleteSuccessAlert: t('importsExports.mappedImports.alerts.bulkDeleteSuccess'),
  bulkDeleteErrorAlert: t('importsExports.mappedImports.alerts.bulkDeleteError'),
});

export const exportsListingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('importsExports.fields.kind'),
    t('shared.labels.type'),
    t('importsExports.fields.progressState'),
    t('importsExports.fields.isPeriodic'),
    t('importsExports.fields.totalRecords'),
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'kind', type: FieldType.Text, accessor: (node) => t(`importsExports.exports.kinds.${node.kind}`) },
    { name: 'type', type: FieldType.Text, accessor: (node) => t(`importsExports.exports.types.${node.type}`) },
    { name: 'percentageColor', type: FieldType.Badge, badgeMap: getPercentageColorBadgeMap(t) },
    { name: 'isPeriodic', type: FieldType.Boolean },
    { name: 'totalRecords', type: FieldType.Text },
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'importsExports.exports.edit',
  showUrlName: 'importsExports.exports.show',
  addShow: true,
  addDelete: true,
  addPagination: true,
  addBulkDelete: true,
  isMainPage: true,
  deleteMutation: deleteExportMutation,
  bulkDeleteMutation: deleteExportsMutation,
  bulkDeleteSuccessAlert: t('importsExports.exports.alerts.bulkDeleteSuccess'),
  bulkDeleteErrorAlert: t('importsExports.exports.alerts.bulkDeleteError'),
});

export const brokenRecordsSearchConfigConstructor = (_t: Function): SearchConfig => ({
  search: false,
  orderKey: 'sort',
  filters: [],
  orders: [],
});

export const brokenRecordsListingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [
    t('importsExports.mappedImports.brokenRecords.error'),
    t('shared.labels.createdAt'),
  ],
  fields: [
    {
      name: 'record',
      type: FieldType.Text,
      accessor: (node) => node.record?.error || node.record?.message || '-',
      shortenAfter: 120,
    },
    { name: 'createdAt', type: FieldType.Date },
  ],
  identifierKey: 'id',
  addActions: true,
  addShow: false,
  addEdit: false,
  addDelete: false,
  addPagination: true,
});
