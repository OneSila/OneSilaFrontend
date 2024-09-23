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
  Badge = "Badge",
}

export enum ConfigTypes {
  REQUIRED_IN_CONFIGURATOR = 'REQUIRED_IN_CONFIGURATOR',
  OPTIONAL_IN_CONFIGURATOR = 'OPTIONAL_IN_CONFIGURATOR',
  REQUIRED = 'REQUIRED',
  OPTIONAL = 'OPTIONAL'
}

export const OrderStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING_PROCESSING',
  PENDING_INVENTORY: 'AWAIT_INVENTORY',
  TO_PICK: 'TOPICK',
  TO_SHIP: 'TO_SHIP',
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
export const PRODUCT_MANUFACTURABLE = 'MANUFACTURABLE'
export const PRODUCT_DROPSHIP = 'DROPSHIP'
export const PRODUCT_SUPPLIER = 'SUPPLIER'

export const ProductType = {
  Simple: PRODUCT_SIMPLE,
  Bundle: PRODUCT_BUNDLE,
  Configurable: PRODUCT_CONFIGURABLE,
  Manufacturable: PRODUCT_MANUFACTURABLE,
  Dropship: PRODUCT_DROPSHIP,
  Supplier: PRODUCT_SUPPLIER,
};

export const variationTypes = [PRODUCT_SIMPLE, PRODUCT_BUNDLE, PRODUCT_MANUFACTURABLE, PRODUCT_DROPSHIP]
export const billOfMaterialsTypes = [PRODUCT_SIMPLE, PRODUCT_MANUFACTURABLE]
export const baseProductTypes = [PRODUCT_SIMPLE, PRODUCT_DROPSHIP]

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
  'en': '🇬🇧',
  'nl': '🇳🇱'
};

export const LeadTimeUnit = {
  HOUR: 1,
  DAY: 2,
  WEEK: 3,
  MONTH: 4
};