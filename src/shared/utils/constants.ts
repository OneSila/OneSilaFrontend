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

export const OrderStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  PENDING_INVENTORY: 'PENDING_INVENTORY',
  TO_PICK: 'TOPICK',
  TO_SHIP: 'TOSHIP',
  DONE: 'DONE',
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
export const PRODUCT_UMBRELLA = 'UMBRELLA'
export const PRODUCT_MANUFACTURABLE = 'MANUFACTURABLE'
export const PRODUCT_DROPSHIP = 'DROPSHIP'
export const PRODUCT_SUPPLIER = 'SUPPLIER'

export const ProductType = {
  Simple: PRODUCT_SIMPLE,
  Bundle: PRODUCT_BUNDLE,
  Umbrella: PRODUCT_UMBRELLA,
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