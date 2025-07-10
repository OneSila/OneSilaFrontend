export enum IntegrationTypes {
  Magento = 'magento',
  Shopify = 'shopify',
  Woocommerce = 'woocommerce',
  Amazon = 'amazon',
  None = 'none',
}

export enum AmazonRegions {
  NORTH_AMERICA = 'NA',
  EUROPE = 'EU',
  FAR_EAST = 'FE',
}

export enum AmazonCountries {
  CANADA = 'CA',
  UNITED_STATES = 'US',
  MEXICO = 'MX',
  BRAZIL = 'BR',
  IRELAND = 'IE',
  SPAIN = 'ES',
  UNITED_KINGDOM = 'GB',
  FRANCE = 'FR',
  BELGIUM = 'BE',
  NETHERLANDS = 'NL',
  GERMANY = 'DE',
  ITALY = 'IT',
  SWEDEN = 'SE',
  SOUTH_AFRICA = 'ZA',
  POLAND = 'PL',
  EGYPT = 'EG',
  TURKEY = 'TR',
  SAUDI_ARABIA = 'SA',
  UNITED_ARAB_EMIRATES = 'AE',
  INDIA = 'IN',
  SINGAPORE = 'SG',
  AUSTRALIA = 'AU',
  JAPAN = 'JP',
}

export enum AuthenticationMethod {
  TOKEN = 'TOK',
  PASSWORD = 'PAS'
}

/**
 * General information for any integration.
 */
export interface IntegrationGeneralInfo {
  hostname: string;
  active: boolean;
  verifySsl: boolean;
  requestsPerMinute: number;
  maxRetries: number;
}

/**
 * Base information for a sales channel.
 */
export interface SalesChannelInfo {
  useConfigurableName: boolean;
  syncContents: boolean;
  syncEanCodes: boolean;
  syncPrices: boolean;
  importOrders: boolean;
}

/**
 * A generic wrapper interface for integration-specific channel info.
 * This allows different integrations (e.g. Magento, Shopify) to extend it.
 */
export interface SpecificChannelInfo {
  // For now, this is empty. Later, common fields can be added here or you can use a union type.
}

/**
 * Magento-specific channel info that extends the generic SpecificChannelInfo.
 */
export interface MagentoChannelInfo extends SpecificChannelInfo {
  hostApiUsername?: string | null;
  hostApiKey: string;
  authenticationMethod: string;
}

export interface ShopifyChannelInfo extends SpecificChannelInfo {
  vendorProperty: { id: string | null };
  hmac?: string;
  host?: string;
  timestamp?: string;
  isExternalInstall?: boolean;
}

export interface AmazonChannelInfo extends SpecificChannelInfo {
  region: string | null;
  country: string | null;
  listingOwner: boolean;
}


/**
 * The complete integration create wizard form.
 * Instead of directly extending a specific channel interface,
 * we include a property that holds the integration-specific info.
 */
export interface IntegrationCreateWizardForm {
  generalInfo: IntegrationGeneralInfo;
  salesChannelInfo: SalesChannelInfo;
}

export function getMagentoDefaultFields(): MagentoChannelInfo {
  return {
    hostApiUsername: null,
    hostApiKey: "",
    authenticationMethod: AuthenticationMethod.TOKEN,
  };
}

export function getShopifyDefaultFields(): ShopifyChannelInfo {
  return {
    vendorProperty: { id: null },
  };
}

export function getAmazonDefaultFields(): AmazonChannelInfo {
  return {
    region: null,
    country: null,
    listingOwner: false,
  };
}

export const getDefaultFields = (type: IntegrationTypes) => {
  switch (type) {
    case IntegrationTypes.Magento:
      return getMagentoDefaultFields();
    case IntegrationTypes.Shopify:
      return getShopifyDefaultFields();
    case IntegrationTypes.Amazon:
      return getAmazonDefaultFields();
    default:
      return {};
  }
};
