export const PUBLIC_ROUTES = ['auth.login', 'auth.register', 'auth.register.company', 'auth.recover', 'auth.recover.token', 'auth.accept.invite.token'];
export  const DEFAULT_LANGUAGE = {"code": "en", "name": "English"}

export  interface Url {
  name: string;
  params?: Record<string, any>;
  query?: Record<string, any>;
}

export enum FieldType {
  Boolean = "Boolean",
  Text = "Text",
  Choice = "Choice",
  Query = "Query",
  Date = "Date",
  RangeDate = "RangeDate",
  Slider = "Slider",
  Checkbox = "Checkbox",
  Hidden = "Hidden",
  ProxyChoice = "ProxyChoice",
  Image = "Image",
  NestedText = "NestedText",
  Array = "Array",
  Textarea = "Textarea",
  Phone = "Phone",
  Email = "Email",
  Website = "Website",
  Icon = "Icon",
  Badge = "Badge",
  InspectorProgress = "InspectorProgress",
  InlineItems = "InlineItems",
  IndividualFile = "IndividualFile", // not from the media app but adding individually
}

export enum ConfigTypes {
  REQUIRED_IN_CONFIGURATOR = 'REQUIRED_IN_CONFIGURATOR',
  OPTIONAL_IN_CONFIGURATOR = 'OPTIONAL_IN_CONFIGURATOR',
  REQUIRED = 'REQUIRED',
  OPTIONAL = 'OPTIONAL'
}

export const InspectorStatus = {
  GREEN: 1,
  ORANGE: 2,
  RED: 3,
};

export type InspectorStatusType = typeof InspectorStatus[keyof typeof InspectorStatus];

export const OrderStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING_PROCESSING',
  PENDING_INVENTORY: 'AWAIT_INVENTORY',
  TO_PICK: 'TOPICK',
  TO_SHIP: 'TO_SHIP',
  TO_ORDER: 'TO_ORDER',
  PENDING_SHIPPING_APPROVAL: 'PENDING_SHIPPING_APPROVAL',
  DONE: 'SHIPPED',
  CANCELLED: 'CANCELLED',
  HOLD: 'HOLD',
  EXCHANGED: 'EXCHANGED',
  REFUNDED: 'REFUNDED',
  LOST: 'LOST',
  MERGED: 'MERGED',
  DAMAGED: 'DAMAGED',
  VOID: 'VOID',
  ORDERED: 'ORDERED', // from this one to the bottom are purchase order statuses
  CONFIRMED: 'CONFIRMED',
  PENDING_DELIVERY: 'PENDING_DELIVERY',
  DELIVERED: 'DELIVERED',
};

export const PurchaseOrderOpenStatuses = [
  OrderStatus.ORDERED,
  OrderStatus.CONFIRMED,
  OrderStatus.PENDING_DELIVERY,
];

export const ReasonForSale = {
  SALE: 'SALE',
  RETURNGOODS: 'RETURN',
  DOCUMENTS: 'DOCUMENTS',
  SAMPLE: 'SAMPLE',
  GIFT: 'GIFT',
};

export const UNPROCESSED_ORDER = [OrderStatus.PENDING];
export const DONE__ORDER = [
  OrderStatus.DONE, OrderStatus.CANCELLED, OrderStatus.HOLD,
  OrderStatus.EXCHANGED, OrderStatus.REFUNDED, OrderStatus.LOST,
  OrderStatus.MERGED, OrderStatus.DAMAGED
];
export const HELD_ORDER = [OrderStatus.HOLD, OrderStatus.PENDING_INVENTORY];

export const PRODUCT_SIMPLE = 'SIMPLE'
export const PRODUCT_BUNDLE = 'BUNDLE'
export const PRODUCT_CONFIGURABLE = 'CONFIGURABLE'
export const PRODUCT_ALIAS = 'ALIAS'

export const ProductType = {
  Simple: PRODUCT_SIMPLE,
  Bundle: PRODUCT_BUNDLE,
  Configurable: PRODUCT_CONFIGURABLE,
  Alias: PRODUCT_ALIAS,
};

export const variationTypes = [PRODUCT_SIMPLE, PRODUCT_BUNDLE, PRODUCT_ALIAS]
export const baseProductTypes = [PRODUCT_SIMPLE]

export const OnboardingStatus = {
  ADD_COMPANY: 'ADD_COMPANY',
  ADD_CURRENCY: 'ADD_CURRENCY',
  CONFIRM_VAT_RATE: 'CONFIRM_VAT_RATE',
  CREATE_INVENTORY_LOCATION: 'CREATE_INVENTORY_LOCATION',
  GENERATE_DEMO_DATA: 'GENERATE_DEMO_DATA',
  DASHBOARD_CARDS_PRESENTATION: 'DASHBOARD_CARDS_PRESENTATION',
  COMPLETE_DASHBOARD_CARDS: 'COMPLETE_DASHBOARD_CARDS',
  DONE: 'DONE',
};

export const PropertyTypes = {
  INT: 'INT',
  FLOAT: 'FLOAT',
  TEXT: 'TEXT',
  DESCRIPTION: 'DESCRIPTION',
  BOOLEAN: 'BOOLEAN',
  DATE: 'DATE',
  DATETIME: 'DATETIME',
  SELECT: 'SELECT',
  MULTISELECT: 'MULTISELECT',
};

export const flagMapping: { [key: string]: string } = {
  'en': '🇬🇧', // English (UK)
  'fr': '🇫🇷', // French
  'nl': '🇳🇱', // Dutch
  'de': '🇩🇪', // German
  'it': '🇮🇹', // Italian
  'es': '🇪🇸', // Spanish
  'pt': '🇵🇹', // Portuguese
  'pl': '🇵🇱', // Polish
  'ro': '🇷🇴', // Romanian
  'bg': '🇧🇬', // Bulgarian
  'hr': '🇭🇷', // Croatian
  'cs': '🇨🇿', // Czech
  'da': '🇩🇰', // Danish
  'et': '🇪🇪', // Estonian
  'fi': '🇫🇮', // Finnish
  'el': '🇬🇷', // Greek
  'hu': '🇭🇺', // Hungarian
  'lv': '🇱🇻', // Latvian
  'lt': '🇱🇹', // Lithuanian
  'sk': '🇸🇰', // Slovak
  'sl': '🇸🇮', // Slovenian
  'sv': '🇸🇪', // Swedish
  'th': '🇹🇭', // Thai
  'ja': '🇯🇵', // Japanese
  'zh-hans': '🇨🇳', // Simplified Chinese
  'hi': '🇮🇳', // Hindi
  'pt-br': '🇧🇷', // Portuguese (Brazil)
  'ru': '🇷🇺', // Russian
  'af': '🇿🇦', // Afrikaans (South Africa)
  'ar': '🇸🇦', // Arabic (Saudi Arabia as default)
  'he': '🇮🇱', // Hebrew
  'tr': '🇹🇷', // Turkish
  'id': '🇮🇩', // Indonesian
  'ko': '🇰🇷', // Korean
  'ms': '🇲🇾', // Malay
  'vi': '🇻🇳', // Vietnamese
  'fa': '🇮🇷', // Persian (Iran)
  'ur': '🇵🇰', // Urdu (Pakistan)
};


export const LeadTimeUnit = {
  HOUR: 1,
  DAY: 2,
  WEEK: 3,
  MONTH: 4
};

export const INVENTORY_MOVEMENTS_MODEL_CODES = {
  PURCHASE_ORDER: 'purchase',
  INVENTORY_LOCATION: 'location',
  ORDER_RETURN: 'return',
  PACKAGE: 'package',
};

export const PackageType = {
  BOX: 'BOX',
  PALLET: 'PALLET',
};

export const PackageStatus = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  PACKED: 'PACKED',
  DISPATCHED: 'DISPATCHED',
};

export enum PackagingMode {
  MANUAL = 'manual',
  VIRTUAL = 'virtual',
}

export const getPropertyTypeOptions = (t) => [
  { name: t('properties.properties.types.int'), code: PropertyTypes.INT },
  { name: t('properties.properties.types.float'), code: PropertyTypes.FLOAT },
  { name: t('properties.properties.types.text'), code: PropertyTypes.TEXT },
  { name: t('properties.properties.types.description'), code: PropertyTypes.DESCRIPTION },
  { name: t('properties.properties.types.boolean'), code: PropertyTypes.BOOLEAN },
  { name: t('properties.properties.types.date'), code: PropertyTypes.DATE },
  { name: t('properties.properties.types.datetime'), code: PropertyTypes.DATETIME },
  { name: t('properties.properties.types.select'), code: PropertyTypes.SELECT },
  { name: t('properties.properties.types.multiselect'), code: PropertyTypes.MULTISELECT }
];