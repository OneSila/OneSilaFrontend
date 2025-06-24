import { IntegrationTypes } from '../../../../../../integrations/integrations/integrations';

export interface ContentFieldRules {
  name: boolean;
  shortDescription: boolean;
  description: boolean;
  urlKey: boolean;
  bulletPoints: boolean;
}

const baseRules: ContentFieldRules = {
  name: true,
  shortDescription: true,
  description: true,
  urlKey: true,
  bulletPoints: false,
};

export const FIELD_RULES: Record<string, ContentFieldRules> = {
  [IntegrationTypes.Magento]: { ...baseRules },
  [IntegrationTypes.Woocommerce]: { ...baseRules },
  [IntegrationTypes.Shopify]: { ...baseRules, shortDescription: false },
  [IntegrationTypes.Amazon]: { ...baseRules, shortDescription: false, urlKey: false, bulletPoints: true },
  default: { ...baseRules },
};

export function getContentFieldRules(type?: string): ContentFieldRules {
  if (!type) return FIELD_RULES.default;
  return FIELD_RULES[type] || FIELD_RULES.default;
}
