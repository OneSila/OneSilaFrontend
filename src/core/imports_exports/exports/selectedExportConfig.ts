import { productPropertiesRulesListingQuery } from '../../../shared/api/queries/properties.js';
import { eanCodesQuery } from '../../../shared/api/queries/eanCodes.js';
import { imageQuery, fileQuery, videoQuery } from '../../../shared/api/queries/media.js';
import { productsQuerySelector } from '../../../shared/api/queries/products.js';
import { propertiesQuerySelector, propertySelectValuesQuerySelector } from '../../../shared/api/queries/properties.js';
import { salesPriceListsQuerySelector } from '../../../shared/api/queries/salesPrices.js';
import { getFileName } from '../../media/files/media';
import { EXPORT_KINDS, type ExportKind } from '../configs';

export const SELECTED_EXPORT_LIMIT = 1000;

type SelectedExportPreviewConfig = {
  query: any;
  queryKey: string;
  getFilter: (ids: string[]) => Record<string, any>;
  getLabel: (node: any) => string;
  getMeta?: (node: any) => string | null;
};

const PREVIEW_CONFIGS: Partial<Record<ExportKind, SelectedExportPreviewConfig>> = {
  products: {
    query: productsQuerySelector,
    queryKey: 'products',
    getFilter: (ids) => ({ id: { inList: ids } }),
    getLabel: (node) => node?.name || node?.id || '-',
  },
  properties: {
    query: propertiesQuerySelector,
    queryKey: 'properties',
    getFilter: (ids) => ({ id: { inList: ids } }),
    getLabel: (node) => node?.name || node?.id || '-',
    getMeta: (node) => node?.type || null,
  },
  property_select_values: {
    query: propertySelectValuesQuerySelector,
    queryKey: 'propertySelectValues',
    getFilter: (ids) => ({ id: { inList: ids } }),
    getLabel: (node) => node?.fullValueName || node?.id || '-',
  },
  images: {
    query: imageQuery,
    queryKey: 'images',
    getFilter: (ids) => ({ id: { inList: ids } }),
    getLabel: (node) => getFileName(node),
  },
  documents: {
    query: fileQuery,
    queryKey: 'files',
    getFilter: (ids) => ({ id: { inList: ids } }),
    getLabel: (node) => getFileName(node),
    getMeta: (node) => node?.documentType?.name || null,
  },
  videos: {
    query: videoQuery,
    queryKey: 'videos',
    getFilter: (ids) => ({ id: { inList: ids } }),
    getLabel: (node) => getFileName(node),
  },
  price_lists: {
    query: salesPriceListsQuerySelector,
    queryKey: 'salesPriceLists',
    getFilter: (ids) => ({ id: { inList: ids } }),
    getLabel: (node) => node?.name || node?.id || '-',
  },
  rules: {
    query: productPropertiesRulesListingQuery,
    queryKey: 'productPropertiesRules',
    getFilter: (ids) => ({ id: { inList: ids } }),
    getLabel: (node) => node?.productType?.value || node?.value || node?.id || '-',
    getMeta: (node) => node?.value || null,
  },
  ean_codes: {
    query: eanCodesQuery,
    queryKey: 'eanCodes',
    getFilter: (ids) => ({ id: { inList: ids } }),
    getLabel: (node) => node?.eanCode || node?.id || '-',
    getMeta: (node) => node?.product?.sku || null,
  },
};

export const normalizeSelectedExportKind = (value: unknown): ExportKind | null => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') {
    return null;
  }

  return EXPORT_KINDS.includes(raw as ExportKind) ? raw as ExportKind : null;
};

export const parseSelectedExportIds = (value: unknown, max = SELECTED_EXPORT_LIMIT) => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') {
    return [];
  }

  const seen = new Set<string>();

  return raw
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0)
    .filter((id) => {
      if (seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    })
    .slice(0, max);
};

export const getSelectedExportPreviewConfig = (kind: string) =>
  PREVIEW_CONFIGS[kind as ExportKind] || null;
