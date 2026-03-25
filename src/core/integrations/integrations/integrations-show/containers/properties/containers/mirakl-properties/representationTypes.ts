export const MIRAKL_REPRESENTATION_TYPE_PROPERTY = 'property';
export const MIRAKL_REPRESENTATION_TYPE_UNIT = 'unit';
export const MIRAKL_REPRESENTATION_TYPE_DEFAULT_VALUE = 'default_value';
export const MIRAKL_REPRESENTATION_TYPE_CONDITION = 'condition';
export const MIRAKL_REPRESENTATION_TYPE_LOGISTIC_CLASS = 'logistic_class';

export const MIRAKL_REPRESENTATION_TYPE_CHOICES = [
  MIRAKL_REPRESENTATION_TYPE_PROPERTY,
  MIRAKL_REPRESENTATION_TYPE_UNIT,
  MIRAKL_REPRESENTATION_TYPE_DEFAULT_VALUE,
  'product_title',
  'product_subtitle',
  'product_description',
  'product_short_description',
  'product_bullet_point',
  'product_sku',
  'product_internal_id',
  'product_category',
  'product_configurable_sku',
  'product_configurable_id',
  'product_active',
  'product_url_key',
  'product_ean',
  'thumbnail_image',
  'image',
  'image_color',
  'video',
  'price',
  'discounted_price',
  'stock',
  'vat_rate',
  'allow_backorder',
  MIRAKL_REPRESENTATION_TYPE_CONDITION,
  MIRAKL_REPRESENTATION_TYPE_LOGISTIC_CLASS,
] as const;

export const getMiraklRepresentationTypeOptions = (t: Function) =>
  MIRAKL_REPRESENTATION_TYPE_CHOICES.map((code) => ({
    code,
    name: t(`integrations.show.mirakl.representationTypes.options.${code}`),
  }));

export const MIRAKL_PRODUCT_REPRESENTATION_TYPES = [
  'product_title',
  'product_subtitle',
  'product_description',
  'product_short_description',
  'product_bullet_point',
  'product_sku',
  'product_internal_id',
  'product_category',
  'product_configurable_sku',
  'product_configurable_id',
  'product_active',
  'product_url_key',
  'product_ean',
] as const;

export const MIRAKL_MEDIA_REPRESENTATION_TYPES = [
  'thumbnail_image',
  'image',
  'image_color',
  'video',
  'document',
] as const;

export const MIRAKL_COMMERCIAL_REPRESENTATION_TYPES = [
  'price',
  'discounted_price',
  'stock',
  'vat_rate',
  'allow_backorder',
  'condition',
  'logistic_class',
] as const;

export const getMiraklRepresentationTypeGroup = (representationType?: string | null) => {
  if (!representationType) {
    return 'special';
  }

  if (MIRAKL_PRODUCT_REPRESENTATION_TYPES.includes(representationType as any)) {
    return 'product';
  }

  if (MIRAKL_MEDIA_REPRESENTATION_TYPES.includes(representationType as any)) {
    return 'media';
  }

  if (MIRAKL_COMMERCIAL_REPRESENTATION_TYPES.includes(representationType as any)) {
    return 'commercial';
  }

  return 'special';
};

export const usesMiraklLocalPropertyMapping = (representationType?: string | null) =>
  [
    MIRAKL_REPRESENTATION_TYPE_PROPERTY,
    MIRAKL_REPRESENTATION_TYPE_CONDITION,
    MIRAKL_REPRESENTATION_TYPE_LOGISTIC_CLASS,
    'product_active',
    'allow_backorder',
  ].includes(representationType || '');

export const usesMiraklDefaultValueInput = (representationType?: string | null) =>
  representationType === MIRAKL_REPRESENTATION_TYPE_DEFAULT_VALUE;

export const usesMiraklUnitSelection = (representationType?: string | null) =>
  representationType === MIRAKL_REPRESENTATION_TYPE_UNIT;

export const usesMiraklLanguageSelection = (representationType?: string | null) =>
  [
    MIRAKL_REPRESENTATION_TYPE_PROPERTY,
    'product_title',
    'product_subtitle',
    'product_description',
    'product_short_description',
    'product_bullet_point',
  ].includes(representationType || '');

export const usesMiraklBooleanCurrentType = (representationType?: string | null) =>
  ['product_active', 'allow_backorder'].includes(representationType || '');
